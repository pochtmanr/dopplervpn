import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { createInvoice } from '@/lib/oxapay';
import { rateLimit } from '@/lib/rate-limit';
import { routing } from '@/i18n/routing';
import { readClickIdCookie } from '@/lib/click-id';
import { parseConsentFlags, readCheckoutAttribution } from '@/lib/attribution';
import { resolveSiteUrl } from '@/lib/site-url';
import { resolvePromoCharge } from '@/lib/promo-checkout';
import {
  ACCOUNT_ID_REGEX,
  CHECKOUT_PLANS as PLAN_AMOUNTS,
  insertPendingOxapayInvoice,
  markOxapayInvoiceAbandoned,
} from '@/lib/oxapay-orders';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'oxapay-create' });
  if (rl) return rl;

  try {
    const {
      account_id: rawAccountId,
      plan_id: planId,
      email,
      locale: rawLocale,
      promo_code,
      promo_id,
      consent,
    } = await req.json();

    const locale = typeof rawLocale === 'string' && (routing.locales as readonly string[]).includes(rawLocale)
      ? rawLocale
      : 'en';

    const plan = PLAN_AMOUNTS[planId];
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

    const hasAccountId = rawAccountId && ACCOUNT_ID_REGEX.test(rawAccountId);
    const hasEmail = email && EMAIL_REGEX.test(email);

    if (!hasAccountId && !hasEmail) {
      return NextResponse.json(
        { error: 'Either a valid account ID or email is required' },
        { status: 400 },
      );
    }

    const supabase = createUntypedAdminClient();

    // Verify the account exists (mirrors Revolut flow — email-only flow not yet
    // supported for crypto; crypto checkout is launched from the app with an
    // account id, so we require it here).
    if (!hasAccountId) {
      return NextResponse.json(
        { error: 'Crypto checkout requires an account ID (open checkout from the app)' },
        { status: 400 },
      );
    }

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('account_id', rawAccountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const promoCharge = await resolvePromoCharge(supabase, {
      promoCode: promo_code,
      promoId: promo_id,
      planId,
      accountId: rawAccountId,
      listCents: plan.amount,
    });

    const orderId = crypto.randomUUID();
    const site = resolveSiteUrl(req);

    const returnUrl = new URL(`${site}/${locale}/checkout/success`);
    returnUrl.searchParams.set('provider', 'oxapay');
    returnUrl.searchParams.set('order_id', orderId);
    returnUrl.searchParams.set('plan', planId);
    returnUrl.searchParams.set('account_id', rawAccountId);

    // The pending row goes in FIRST: it is the webhook's only record of the
    // plan and account, so a payment without it could never be credited.
    // plan format mirrors the Revolut flow: `${planId}:${accountId}`.
    await insertPendingOxapayInvoice(supabase, {
      orderId,
      planId,
      accountId: rawAccountId,
      amountMinor: promoCharge.amount,
      promoId: promoCharge.promoId,
      promoCode: promoCharge.promoCode,
      // Paid-campaign attribution. The webhook is a server-to-server call with no
      // cookies, so the click id has to be stashed here to survive to confirmation.
      clickId: readClickIdCookie(req),
      // Channel + analytics ids for the webhook's server-side purchase report
      // (lib/purchase-events.ts). Same reason as click_id.
      attribution: readCheckoutAttribution(
        req,
        parseConsentFlags(consent),
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      ) as unknown as Record<string, unknown>,
    });

    let invoice;
    try {
      invoice = await createInvoice({
        amount: promoCharge.amount / 100,
        currency: 'USD',
        orderId,
        callbackUrl: `${site}/api/oxapay/webhook`,
        returnUrl: returnUrl.toString(),
        description: `${plan.name} for ${rawAccountId}`,
        email: hasEmail ? email : undefined,
        lifetimeMinutes: 60,
      });
    } catch (err) {
      await markOxapayInvoiceAbandoned(supabase, orderId);
      throw err;
    }

    return NextResponse.json({
      order_id: orderId,
      track_id: invoice.track_id,
      payment_url: invoice.payment_url,
      expired_at: invoice.expired_at,
    });
  } catch (error: unknown) {
    console.error('OxaPay create-invoice error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
