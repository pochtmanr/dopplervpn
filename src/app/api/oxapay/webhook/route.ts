import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature, type OxaPayWebhookPayload } from '@/lib/oxapay';

// Days credited on a successful web payment.
// Web checkout cannot replicate the 3-day RevenueCat trial available on
// iOS/Android, so every web plan includes bonus days on top of the base
// subscription length: 30+7 / 180+14 / 365+30.
const PLAN_DAYS: Record<string, number> = {
  monthly: 37,
  '6month': 194,
  yearly: 395,
};

const PLAN_LABELS: Record<string, string> = {
  monthly: 'Doppler VPN Pro — 1 Month',
  '6month': 'Doppler VPN Pro — 6 Months',
  yearly: 'Doppler VPN Pro — 1 Year',
};

function log(stage: string, data: Record<string, unknown>) {
  console.log(`[oxapay-webhook] ${stage}`, JSON.stringify(data));
}

// OxaPay requires an HTTP 200 response with body "ok" or it will retry.
function okResponse() {
  return new NextResponse('ok', { status: 200 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmacHeader = req.headers.get('hmac') || req.headers.get('HMAC') || '';

  log('received', { bytes: rawBody.length, hasHmac: !!hmacHeader });

  if (!hmacHeader) {
    log('reject_missing_hmac', {});
    return NextResponse.json({ error: 'Missing HMAC header' }, { status: 400 });
  }

  if (!verifyWebhookSignature(rawBody, hmacHeader)) {
    log('reject_bad_signature', {});
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: OxaPayWebhookPayload;
  try {
    event = JSON.parse(rawBody) as OxaPayWebhookPayload;
  } catch {
    log('reject_invalid_json', {});
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  log('parsed', {
    type: event.type,
    status: event.status,
    track_id: event.track_id,
    order_id: event.order_id,
  });

  // Ignore non-invoice (e.g. payout) callbacks
  if (event.type && event.type !== 'invoice') {
    return okResponse();
  }

  const status = String(event.status || '').toLowerCase();
  const orderId = event.order_id;

  if (!orderId) {
    log('reject_missing_order_id', {});
    return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
  }

  const supabase = createUntypedAdminClient();

  // Terminal non-success states — mark the pending row as failed so the
  // success page stops polling and shows a clear error.
  if (status === 'expired' || status === 'failed' || status === 'cancelled') {
    const { error: updErr } = await supabase
      .from('vpn_invoices')
      .update({ status: 'failed' })
      .eq('provider_payment_id', orderId)
      .eq('provider', 'oxapay')
      .eq('status', 'pending');
    if (updErr) log('failed_update_error', { orderId, err: updErr.message });
    log('payment_failed', { orderId, status });
    return okResponse();
  }

  // Not final yet — OxaPay sends "Paying" / "Confirming" during processing.
  // Acknowledge so OxaPay stops retrying, but do not credit the account.
  if (status !== 'paid') {
    log('not_paid_yet', { orderId, status });
    return okResponse();
  }

  try {
    // Look up the pending invoice row created at /api/oxapay/create-invoice.
    // If it doesn't exist (e.g. pre-insert failed), we can still recover the
    // accountId + planId from the callback — but currently we depend on the
    // row for planId since OxaPay does not echo it back.
    const { data: invoice, error: invoiceErr } = await supabase
      .from('vpn_invoices')
      .select('id, status, plan, amount, currency')
      .eq('provider_payment_id', orderId)
      .eq('provider', 'oxapay')
      .maybeSingle();

    if (invoiceErr) {
      log('invoice_lookup_error', { orderId, err: invoiceErr.message });
      return NextResponse.json({ error: 'Invoice lookup failed' }, { status: 500 });
    }

    if (!invoice) {
      log('invoice_not_found', { orderId });
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Idempotency: already paid → just ack.
    if (invoice.status === 'paid') {
      log('idempotent_skip', { orderId });
      return okResponse();
    }

    // plan format: `${planId}:${accountId}`
    const [planId, accountId] = String(invoice.plan).split(':');
    if (!planId || !accountId) {
      log('invoice_plan_malformed', { orderId, plan: invoice.plan });
      return NextResponse.json({ error: 'Invoice plan malformed' }, { status: 400 });
    }

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, subscription_expires_at')
      .eq('account_id', accountId)
      .single();

    if (accountError || !account) {
      console.error('[oxapay-webhook] account_not_found', accountId, accountError);
      return NextResponse.json({ error: 'Account not found' }, { status: 400 });
    }

    const days = PLAN_DAYS[planId] || 30;
    const currentExpiry = account.subscription_expires_at
      ? new Date(account.subscription_expires_at)
      : null;
    const effectiveStart =
      currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
    const newExpiry = new Date(effectiveStart);
    newExpiry.setDate(newExpiry.getDate() + days);

    const { error: updateErr } = await supabase
      .from('accounts')
      .update({
        subscription_tier: 'pro',
        subscription_expires_at: newExpiry.toISOString(),
        subscription_store: 'oxapay',
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    if (updateErr) {
      console.error('[oxapay-webhook] account_update_failed', accountId, updateErr);
      throw new Error(`Account update failed: ${updateErr.message}`);
    }

    log('account_upgraded', { accountId, newExpiry: newExpiry.toISOString() });

    // Flip the pre-inserted invoice row to paid. Note: OxaPay sends amount
    // as decimal — convert back to minor units to match the Revolut convention.
    const paidAmountMinor = event.amount != null
      ? Math.round(Number(event.amount) * 100)
      : invoice.amount;

    const { error: flipErr } = await supabase
      .from('vpn_invoices')
      .update({
        status: 'paid',
        amount: paidAmountMinor,
        currency: event.currency || invoice.currency || 'USD',
      })
      .eq('id', invoice.id);
    if (flipErr) {
      console.error('[oxapay-webhook] invoice_flip_failed', orderId, flipErr);
    }

    // Best-effort receipt email (never blocks the 200 response).
    if (event.email && process.env.RECEIPT_EMAILS_ENABLED === 'true') {
      try {
        const { sendReceiptEmail } = await import('@/lib/email');
        await sendReceiptEmail({
          to: event.email,
          accountId,
          planId,
          planLabel: PLAN_LABELS[planId] || `Doppler VPN Pro — ${planId}`,
          amount: paidAmountMinor,
          currency: event.currency || 'USD',
          startsAt: effectiveStart,
          expiresAt: newExpiry,
          orderId,
          paymentMethod: 'crypto',
          locale: 'en',
        });
        log('receipt_sent', { orderId });
      } catch (emailErr) {
        console.error('[oxapay-webhook] receipt_email_failed', emailErr);
      }
    }

    log('done', { orderId, accountId });
  } catch (err) {
    console.error('[oxapay-webhook] processing_error', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return okResponse();
}
