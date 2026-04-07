import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { getOrder } from '@/lib/revolut';
import crypto from 'crypto';

const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  '6month': 180,
  yearly: 365,
};

function log(stage: string, data: Record<string, unknown>) {
  console.log(`[revolut-webhook] ${stage}`, JSON.stringify(data));
}

function verifySignature(rawBody: string, signatureHeader: string, timestamp: string): boolean {
  const secret = process.env.REVOLUT_WEBHOOK_SECRET;
  if (!secret) throw new Error('REVOLUT_WEBHOOK_SECRET is not configured');

  // Revolut sends: Revolut-Signature: v1=<hmac_hex>[,v1=<hmac_hex>...]
  // Payload to sign: "v1.<timestamp>.<rawBody>"
  const signatures = signatureHeader.split(',').map((s) => s.trim());
  const payload = `v1.${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signatures.some((sig) => {
    const hash = sig.startsWith('v1=') ? sig.slice(3) : null;
    if (!hash) return false;
    try {
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get('revolut-signature') || '';
  const timestamp = req.headers.get('revolut-request-timestamp') || '';

  log('received', {
    bytes: rawBody.length,
    hasSig: !!signatureHeader,
    hasTs: !!timestamp,
    tsRaw: timestamp, // log raw value so format is visible in Vercel logs
    sigPrefix: signatureHeader.slice(0, 10),
  });

  if (!signatureHeader || !timestamp) {
    log('reject_missing_headers', {});
    return NextResponse.json({ error: 'Missing signature or timestamp header' }, { status: 400 });
  }

  // Replay-protection timestamp check. Revolut docs only say "UNIX timestamp"
  // without specifying seconds vs milliseconds, and some integrations have
  // historically seen ISO 8601 values. Detect all three by magnitude.
  //   - seconds  => ~1.7e9  (10 digits)
  //   - millis   => ~1.7e12 (13 digits)
  //   - ISO      => parsed via Date()
  let eventTime = NaN;
  const num = Number(timestamp);
  if (Number.isFinite(num) && num > 0) {
    eventTime = num < 1e12 ? num * 1000 : num;
  } else {
    eventTime = new Date(timestamp).getTime();
  }

  const skewMs = Math.abs(Date.now() - eventTime);
  // Be permissive (15 min) so clock drift / queued retries don't get rejected.
  // Signature verification is the real security boundary.
  if (!Number.isFinite(eventTime) || skewMs > 15 * 60 * 1000) {
    log('reject_timestamp_skew', { timestamp, eventTime, skewMs });
    return NextResponse.json({ error: 'Timestamp out of tolerance' }, { status: 400 });
  }

  try {
    if (!verifySignature(rawBody, signatureHeader, timestamp)) {
      log('reject_bad_signature', {});
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch (err) {
    console.error('[revolut-webhook] signature_error', err);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
  }

  let event: { event?: string; order_id?: string; merchant_order_ext_ref?: string };
  try {
    event = JSON.parse(rawBody);
  } catch {
    log('reject_invalid_json', {});
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  log('parsed', { event: event.event, order_id: event.order_id });

  const supabase = createUntypedAdminClient();

  try {
    switch (event.event) {
      case 'ORDER_COMPLETED': {
        const orderId = event.order_id;
        if (!orderId) {
          log('reject_missing_order_id', {});
          return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
        }

        // Idempotency: check if this order has already been processed
        const { data: existingInvoice } = await supabase
          .from('vpn_invoices')
          .select('id')
          .eq('provider_payment_id', orderId)
          .maybeSingle();

        if (existingInvoice) {
          log('idempotent_skip', { orderId });
          return NextResponse.json({ received: true, deduplicated: true });
        }

        // Revolut webhook only carries {event, order_id, merchant_order_ext_ref}.
        // Fetch the full order to read metadata (account_id, plan_id, email, promo).
        let order;
        try {
          order = await getOrder(orderId);
        } catch (fetchErr) {
          console.error('[revolut-webhook] order_fetch_failed', orderId, fetchErr);
          return NextResponse.json({ error: 'Order fetch failed' }, { status: 502 });
        }

        const metadata = (order?.metadata || {}) as Record<string, string>;
        const accountId = metadata.account_id;
        const planId = metadata.plan_id || 'monthly';
        const customerEmail = metadata.email;

        log('order_fetched', {
          orderId,
          state: order?.state,
          accountId,
          planId,
          amount: order?.amount,
        });

        if (!accountId) {
          console.error('[revolut-webhook] missing account_id in order metadata', orderId);
          return NextResponse.json({ error: 'Missing account_id' }, { status: 400 });
        }

        // Only process completed orders. Revolut may send the event slightly
        // before/after state transitions; treat anything other than COMPLETED as no-op.
        if (order?.state && order.state !== 'COMPLETED' && order.state !== 'completed') {
          log('not_completed_yet', { orderId, state: order.state });
          return NextResponse.json({ received: true, ignored: true, state: order.state });
        }

        // Look up account
        const { data: account, error: accountError } = await supabase
          .from('accounts')
          .select('id, subscription_expires_at')
          .eq('account_id', accountId)
          .single();

        if (accountError || !account) {
          console.error('[revolut-webhook] account_not_found', accountId, accountError);
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
            subscription_store: 'revolut',
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id);

        if (updateErr) {
          console.error('[revolut-webhook] account_update_failed', accountId, updateErr);
          throw new Error(`Account update failed: ${updateErr.message}`);
        }

        log('account_upgraded', { accountId, newExpiry: newExpiry.toISOString() });

        // Log invoice (also seals idempotency for future deliveries).
        // NOTE: vpn_invoices schema = {id, telegram_user_id, plan, amount,
        // currency, status, provider, provider_payment_id, created_at}.
        // No `notes` column — do NOT add fields without checking the schema.
        const { error: invoiceErr } = await supabase.from('vpn_invoices').insert({
          telegram_user_id: 0,
          plan: `${planId}:${accountId}`,
          amount: order?.amount ?? 0,
          currency: order?.currency || 'USD',
          status: 'paid',
          provider: 'revolut',
          provider_payment_id: orderId,
        });
        if (invoiceErr) {
          console.error('[revolut-webhook] invoice_insert_failed', orderId, invoiceErr);
        }

        // Welcome email
        if (customerEmail) {
          try {
            const { sendWelcomeEmail } = await import('@/lib/email');
            await sendWelcomeEmail({
              to: customerEmail,
              accountId,
              planName: `Doppler Pro — ${planId}`,
              expiresAt: newExpiry.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            });
          } catch (emailErr) {
            console.error('[revolut-webhook] welcome_email_failed', emailErr);
          }
        }

        // Promo redemption
        if (metadata.promo_id) {
          try {
            await supabase.rpc('increment_promo_redemptions', { p_promo_id: metadata.promo_id });
            await supabase.from('promo_redemptions').insert({
              promo_code_id: metadata.promo_id,
              account_id: accountId,
              redeemed_at: new Date().toISOString(),
            });
            log('promo_redeemed', { code: metadata.promo_code, accountId });
          } catch (promoErr) {
            console.error('[revolut-webhook] promo_redemption_failed', promoErr);
          }
        }

        const paymentAmount = order?.amount ?? 0;
        log('done', {
          orderId,
          accountId,
          tax_reserve_usd: ((paymentAmount * 0.25) / 100).toFixed(2),
        });
        break;
      }

      case 'ORDER_PAYMENT_FAILED': {
        log('payment_failed', { orderId: event.order_id });
        break;
      }

      default:
        log('unhandled_event', { event: event.event });
    }
  } catch (error) {
    console.error('[revolut-webhook] processing_error', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
