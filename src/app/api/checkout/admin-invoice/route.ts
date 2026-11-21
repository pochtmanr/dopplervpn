import { randomUUID, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { createInvoice } from '@/lib/oxapay';
import { resolvePromoCharge } from '@/lib/promo-checkout';
import { resolveSiteUrl } from '@/lib/site-url';
import { routing } from '@/i18n/routing';
import {
  ACCOUNT_ID_REGEX,
  CHECKOUT_PLANS,
  insertPendingOxapayInvoice,
  markOxapayInvoiceAbandoned,
} from '@/lib/oxapay-orders';

/**
 * Server-to-server: the admin panel asks for a hosted OxaPay invoice link for
 * one account, to send to the customer itself (Telegram or email). Same shared
 * secret as /api/checkout/telegram. The existing OxaPay webhook credits it.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// OxaPay accepts 15..2880 minutes. A sent link needs time to be read.
const MIN_LIFETIME = 15;
const MAX_LIFETIME = 2880;
const DEFAULT_LIFETIME = 1440;

function secretOk(header: string | null): boolean {
  const expected = process.env.CHECKOUT_SHARED_SECRET;
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!process.env.CHECKOUT_SHARED_SECRET) {
    return NextResponse.json({ error: 'Payment configuration missing' }, { status: 500 });
  }
  if (!secretOk(req.headers.get('x-checkout-secret'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const planId = typeof body?.plan_id === 'string' ? body.plan_id : '';
    const accountId = typeof body?.account_id === 'string' ? body.account_id.toUpperCase() : '';
    const rawLocale = typeof body?.locale === 'string' ? body.locale : 'en';
    const locale = (routing.locales as readonly string[]).includes(rawLocale) ? rawLocale : 'en';
    const promoCode = typeof body?.promo_code === 'string' && body.promo_code.trim() ? body.promo_code.trim() : null;
    const email = typeof body?.email === 'string' && EMAIL_REGEX.test(body.email) ? body.email : undefined;
    const requested = Number(body?.lifetime_minutes);
    const lifetime = Number.isFinite(requested)
      ? Math.min(MAX_LIFETIME, Math.max(MIN_LIFETIME, Math.round(requested)))
      : DEFAULT_LIFETIME;

    const plan = CHECKOUT_PLANS[planId];
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    if (!ACCOUNT_ID_REGEX.test(accountId)) {
      return NextResponse.json({ error: 'Invalid account' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('account_id', accountId)
      .maybeSingle();
    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const promoCharge = await resolvePromoCharge(supabase, {
      promoCode,
      promoId: null,
      planId,
      accountId,
      listCents: plan.amount,
    });

    const orderId = randomUUID();
    const site = resolveSiteUrl(req);
    const returnUrl = new URL(`${site}/${locale}/checkout/success`);
    returnUrl.searchParams.set('provider', 'oxapay');
    returnUrl.searchParams.set('order_id', orderId);
    returnUrl.searchParams.set('plan', planId);
    returnUrl.searchParams.set('account_id', accountId);

    await insertPendingOxapayInvoice(supabase, {
      orderId,
      planId,
      accountId,
      amountMinor: promoCharge.amount,
      promoId: promoCharge.promoId,
      promoCode: promoCharge.promoCode,
      attribution: { source: 'admin_invoice' },
    });

    let invoice;
    try {
      invoice = await createInvoice({
        amount: promoCharge.amount / 100,
        currency: 'USD',
        orderId,
        callbackUrl: `${site}/api/oxapay/webhook`,
        returnUrl: returnUrl.toString(),
        description: `${plan.name} for ${accountId}`,
        email,
        lifetimeMinutes: lifetime,
      });
    } catch (err) {
      await markOxapayInvoiceAbandoned(supabase, orderId);
      throw err;
    }

    console.log('[admin-invoice] created', JSON.stringify({ orderId, accountId, planId, amount: promoCharge.amount }));
    return NextResponse.json({
      order_id: orderId,
      track_id: invoice.track_id,
      payment_url: invoice.payment_url,
      expired_at: invoice.expired_at,
      amount: promoCharge.amount,
      plan_name: plan.name,
      promo_code: promoCharge.promoCode,
    });
  } catch (error: unknown) {
    console.error('[admin-invoice]', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
