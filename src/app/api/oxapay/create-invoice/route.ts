import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { createInvoice } from '@/lib/oxapay';
import { rateLimit } from '@/lib/rate-limit';
import { routing } from '@/i18n/routing';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Price in MINOR units (cents) so it stays in sync with the Revolut flow.
// We convert to decimal when calling OxaPay.
const PLAN_AMOUNTS: Record<string, { amount: number; name: string; days: number }> = {
  monthly: { amount: 699, name: 'Doppler VPN Pro — Monthly', days: 30 },
  '6month': { amount: 2999, name: 'Doppler VPN Pro — 6 Months', days: 180 },
  yearly: { amount: 3999, name: 'Doppler VPN Pro — Yearly', days: 365 },
};

function resolveSiteUrl(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  if (host) return `${proto}://${host}`;
  return 'https://www.dopplervpn.org';
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'oxapay-create' });
  if (rl) return rl;

  try {
    const { account_id: rawAccountId, plan_id: planId, email, locale: rawLocale } = await req.json();

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

    const orderId = crypto.randomUUID();
    const site = resolveSiteUrl(req);

    const returnUrl = new URL(`${site}/${locale}/checkout/success`);
    returnUrl.searchParams.set('provider', 'oxapay');
    returnUrl.searchParams.set('order_id', orderId);
    returnUrl.searchParams.set('plan', planId);
    returnUrl.searchParams.set('account_id', rawAccountId);

    const invoice = await createInvoice({
      amount: plan.amount / 100,
      currency: 'USD',
      orderId,
      callbackUrl: `${site}/api/oxapay/webhook`,
      returnUrl: returnUrl.toString(),
      description: `${plan.name} for ${rawAccountId}`,
      email: hasEmail ? email : undefined,
      lifetimeMinutes: 60,
    });

    // Pre-insert a pending invoice row so the success page can poll
    // meaningful state before the webhook lands. The row is keyed by our
    // internal orderId (stored in provider_payment_id) — the webhook updates
    // it to 'paid' on final confirmation.
    //
    // plan format mirrors the Revolut flow: `${planId}:${accountId}` so we
    // can recover both values from the invoice alone.
    const { error: insertErr } = await supabase.from('vpn_invoices').insert({
      telegram_user_id: 0,
      plan: `${planId}:${rawAccountId}`,
      amount: plan.amount,
      currency: 'USD',
      status: 'pending',
      provider: 'oxapay',
      provider_payment_id: orderId,
    });
    if (insertErr) {
      console.error('[oxapay-create] pending_invoice_insert_failed', insertErr);
      // Do not fail the checkout — the webhook will insert on Paid if needed.
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
