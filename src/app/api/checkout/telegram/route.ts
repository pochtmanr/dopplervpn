import { randomUUID, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { createOrder } from '@/lib/revolut';
import { createWhiteLabel } from '@/lib/oxapay';
import { resolvePromoCharge } from '@/lib/promo-checkout';
import { resolveSiteUrl } from '@/lib/site-url';
import { routing } from '@/i18n/routing';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

const PLAN_AMOUNTS: Record<string, { amount: number; name: string }> = {
  monthly: { amount: 699, name: 'Doppler VPN Pro — Monthly' },
  '6month': { amount: 2999, name: 'Doppler VPN Pro — 6 Months' },
  yearly: { amount: 3999, name: 'Doppler VPN Pro — Yearly' },
};

const COINS: Record<string, { payCurrency: string; network?: string }> = {
  usdt_trc20: { payCurrency: 'USDT', network: 'TRC20' },
  usdc_trc20: { payCurrency: 'USDC', network: 'TRC20' },
  btc: { payCurrency: 'BTC' },
  eth: { payCurrency: 'ETH' },
  ton: { payCurrency: 'TON' },
};

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
    const method = body?.method === 'crypto' ? 'crypto' : body?.method === 'card' ? 'card' : null;
    const planId = typeof body?.plan_id === 'string' ? body.plan_id : '';
    const rawAccountId = typeof body?.account_id === 'string' ? body.account_id.toUpperCase() : '';
    const rawLocale = typeof body?.locale === 'string' ? body.locale : 'en';
    const locale = (routing.locales as readonly string[]).includes(rawLocale) ? rawLocale : 'en';
    const promoCode = typeof body?.promo_code === 'string' ? body.promo_code : null;
    const promoId = typeof body?.promo_id === 'string' ? body.promo_id : null;

    if (!method) return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
    const plan = PLAN_AMOUNTS[planId];
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    if (!ACCOUNT_ID_REGEX.test(rawAccountId)) {
      return NextResponse.json({ error: 'Invalid account' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('account_id', rawAccountId)
      .maybeSingle();
    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const promoCharge = await resolvePromoCharge(supabase, {
      promoCode,
      promoId,
      planId,
      accountId: rawAccountId,
      listCents: plan.amount,
    });

    if (method === 'card') {
      const order = await createOrder(promoCharge.amount, 'USD', plan.name, {
        account_id: rawAccountId,
        plan_id: planId,
        locale,
        source: 'miniapp',
        ...(promoCharge.promoId
          ? { promo_id: promoCharge.promoId, promo_code: promoCharge.promoCode! }
          : {}),
      });
      const env = process.env.REVOLUT_ENVIRONMENT;
      const mode = env === 'production' || env === 'prod' ? 'prod' : 'sandbox';
      return NextResponse.json({
        method: 'card',
        order_id: order.id,
        order_token: order.token,
        mode,
        amount: promoCharge.amount,
      });
    }

    const coinId = typeof body?.coin === 'string' ? body.coin : '';
    const coin = COINS[coinId];
    if (!coin) return NextResponse.json({ error: 'Invalid coin' }, { status: 400 });

    const orderId = randomUUID();
    const site = resolveSiteUrl(req);
    const payment = await createWhiteLabel({
      amount: promoCharge.amount / 100,
      currency: 'USD',
      payCurrency: coin.payCurrency,
      network: coin.network,
      orderId,
      callbackUrl: `${site}/api/oxapay/webhook`,
      description: `${plan.name} for ${rawAccountId}`,
      lifetimeMinutes: 60,
    });

    const { error: insertErr } = await supabase.from('vpn_invoices').insert({
      telegram_user_id: 0,
      plan: `${planId}:${rawAccountId}`,
      amount: promoCharge.amount,
      currency: 'USD',
      status: 'pending',
      provider: 'oxapay',
      provider_payment_id: orderId,
      promo_id: promoCharge.promoId,
      promo_code: promoCharge.promoCode,
    });
    if (insertErr) {
      console.error('[checkout-telegram] pending_invoice_insert_failed', insertErr);
    }

    return NextResponse.json({
      method: 'crypto',
      order_id: orderId,
      address: payment.address,
      pay_amount: payment.pay_amount,
      pay_currency: payment.pay_currency,
      network: payment.network,
      memo: payment.memo,
      qr_code: payment.qr_code,
      expired_at: payment.expired_at,
      amount: promoCharge.amount,
    });
  } catch (error: unknown) {
    console.error('[checkout-telegram]', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
