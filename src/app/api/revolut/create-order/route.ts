import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { createOrder } from '@/lib/revolut';
import { rateLimit } from '@/lib/rate-limit';
import { routing } from '@/i18n/routing';
import { readClickIdCookie } from '@/lib/click-id';
import { attributionToMetadata, parseConsentFlags, readCheckoutAttribution } from '@/lib/attribution';
import { generateAccountId } from '@/lib/account-id';
import { resolvePromoCharge } from '@/lib/promo-checkout';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PLAN_AMOUNTS: Record<string, { amount: number; name: string; days: number }> = {
  monthly: { amount: 699, name: 'Doppler VPN Pro — Monthly', days: 30 },
  '6month': { amount: 2999, name: 'Doppler VPN Pro — 6 Months', days: 180 },
  yearly: { amount: 3999, name: 'Doppler VPN Pro — Yearly', days: 365 },
};

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'revolut-checkout' });
  if (rl) return rl;

  try {
    const { account_id: rawAccountId, plan_id: planId, email, promo_code, promo_id, locale: rawLocale, consent } = await req.json();
    const locale = typeof rawLocale === 'string' && (routing.locales as readonly string[]).includes(rawLocale)
      ? rawLocale
      : 'en';

    const plan = PLAN_AMOUNTS[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const hasAccountId = rawAccountId && ACCOUNT_ID_REGEX.test(rawAccountId);
    const hasEmail = email && EMAIL_REGEX.test(email);

    if (!hasAccountId && !hasEmail) {
      return NextResponse.json(
        { error: 'Either a valid account ID or email is required' },
        { status: 400 },
      );
    }

    const supabase = createUntypedAdminClient();
    let accountId: string;

    if (hasAccountId) {
      accountId = rawAccountId;
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('account_id', accountId)
        .single();

      if (accountError || !account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
    } else {
      const normalizedEmail = email.toLowerCase().trim();

      const { data: existing } = await supabase
        .from('accounts')
        .select('account_id')
        .eq('contact_method', 'email')
        .eq('contact_value', normalizedEmail)
        .single();

      if (existing) {
        accountId = existing.account_id;
      } else {
        accountId = '';
        let attempts = 0;
        while (attempts < 5) {
          accountId = generateAccountId();
          const { error: insertError } = await supabase.from('accounts').insert({
            account_id: accountId,
            subscription_tier: 'free',
            contact_method: 'email',
            contact_value: normalizedEmail,
            contact_verified: false,
          });
          if (!insertError) break;
          attempts++;
          if (attempts >= 5) {
            return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
          }
        }
      }
    }

    // Invalid promos stay at the list price. The same helper prices OxaPay.
    const promoCharge = await resolvePromoCharge(supabase, {
      promoCode: promo_code,
      promoId: promo_id,
      planId,
      accountId,
      listCents: plan.amount,
    });
    const finalAmount = promoCharge.amount;
    const validatedPromoId = promoCharge.promoId;
    const validatedPromoCode = promoCharge.promoCode;

    // Paid-campaign attribution. Revolut has no pending invoice row to hang this
    // on — the row is only inserted by the webhook — so the click id travels in
    // the order metadata, which the webhook reads back via getOrder().
    const clickId = readClickIdCookie(req);
    // Channel + analytics ids for the webhook's server-side purchase report
    // (lib/purchase-events.ts), split into flat `a_*` keys for Revolut.
    const attribution = readCheckoutAttribution(
      req,
      parseConsentFlags(consent),
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    );

    const order = await createOrder(
      finalAmount,
      'USD',
      plan.name,
      {
        account_id: accountId,
        plan_id: planId,
        locale,
        ...(clickId ? { click_id: clickId } : {}),
        ...attributionToMetadata(attribution),
        ...(email ? { email } : {}),
        ...(validatedPromoId ? { promo_id: validatedPromoId, promo_code: validatedPromoCode! } : {}),
      },
    );

    const publicKey = process.env.NEXT_PUBLIC_REVOLUT_PUBLIC_KEY;
    if (!publicKey) {
      return NextResponse.json({ error: 'Payment configuration missing' }, { status: 500 });
    }

    const env = process.env.REVOLUT_ENVIRONMENT;
    const mode = (env === 'production' || env === 'prod') ? 'prod' : 'sandbox';

    return NextResponse.json({
      order_token: order.token,
      order_id: order.id,
      public_key: publicKey,
      mode,
    });
  } catch (error: unknown) {
    console.error('Revolut create-order error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
