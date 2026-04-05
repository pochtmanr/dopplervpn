import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  '6month': 180,
  yearly: 365,
};

function verifySignature(rawBody: string, signatureHeader: string, timestamp: string): boolean {
  const secret = process.env.REVOLUT_WEBHOOK_SECRET;
  if (!secret) throw new Error('REVOLUT_WEBHOOK_SECRET is not configured');

  // Revolut sends: Revolut-Signature: v1=<hmac_hex>[,v1=<hmac_hex>...]
  // Timestamp comes from separate Revolut-Request-Timestamp header
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

  if (!signatureHeader || !timestamp) {
    return NextResponse.json({ error: 'Missing signature or timestamp header' }, { status: 400 });
  }

  // Reject events older than 5 minutes to prevent replay attacks
  const eventTime = new Date(timestamp).getTime();
  if (Number.isNaN(eventTime) || Math.abs(Date.now() - eventTime) > 5 * 60 * 1000) {
    return NextResponse.json({ error: 'Timestamp out of tolerance' }, { status: 400 });
  }

  try {
    if (!verifySignature(rawBody, signatureHeader, timestamp)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch (err) {
    console.error('Revolut webhook signature error:', err);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createUntypedAdminClient();

  try {
    switch (event.event) {
      case 'ORDER_COMPLETED': {
        const order = event.order || event.data;
        const orderId = order?.id;
        const metadata = order?.metadata as Record<string, string> | undefined;
        const accountId = metadata?.account_id;
        const planId = metadata?.plan_id || 'monthly';
        const customerEmail = metadata?.email;

        if (!accountId) {
          console.error('Revolut webhook: missing account_id in metadata', orderId);
          return NextResponse.json({ error: 'Missing account_id' }, { status: 400 });
        }

        // Idempotency: check if order already processed
        const { data: existingInvoice } = await supabase
          .from('vpn_invoices')
          .select('id')
          .eq('provider_payment_id', orderId)
          .maybeSingle();

        if (existingInvoice) {
          return NextResponse.json({ received: true, deduplicated: true });
        }

        // Look up account
        const { data: account, error: accountError } = await supabase
          .from('accounts')
          .select('id, subscription_expires_at')
          .eq('account_id', accountId)
          .single();

        if (accountError || !account) {
          console.error('Revolut webhook: account not found for', accountId);
          return NextResponse.json({ error: 'Account not found' }, { status: 400 });
        }

        const days = PLAN_DAYS[planId] || 30;

        // Calculate new expiry (extend if currently active)
        const currentExpiry = account.subscription_expires_at
          ? new Date(account.subscription_expires_at)
          : null;
        const effectiveStart =
          currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
        const newExpiry = new Date(effectiveStart);
        newExpiry.setDate(newExpiry.getDate() + days);

        // Update account
        const { error: updateErr } = await supabase
          .from('accounts')
          .update({
            subscription_tier: 'pro',
            subscription_expires_at: newExpiry.toISOString(),
            subscription_store: 'revolut',
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id);

        if (updateErr) throw new Error(`Account update failed: ${updateErr.message}`);

        // Log invoice
        await supabase.from('vpn_invoices').insert({
          telegram_user_id: 0,
          plan: planId,
          amount: order?.amount ?? 0,
          currency: order?.currency || 'USD',
          status: 'paid',
          provider: 'revolut',
          provider_payment_id: orderId,
          notes: `web_subscribe:${accountId}`,
        });

        // Send welcome email
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
            console.error('Welcome email failed:', emailErr);
          }
        }

        // Record promo redemption if applicable
        if (metadata?.promo_id) {
          try {
            await supabase.rpc('increment_promo_redemptions', { p_promo_id: metadata.promo_id });

            await supabase.from('promo_redemptions').insert({
              promo_code_id: metadata.promo_id,
              account_id: accountId,
              redeemed_at: new Date().toISOString(),
            });

            console.log(`[PROMO] Redeemed ${metadata.promo_code} for account ${accountId}`);
          } catch (promoErr) {
            console.error('[PROMO] Redemption recording failed (payment still succeeded):', promoErr);
          }
        }

        const paymentAmount = order?.amount ?? 0;
        console.log(
          `Revolut: account ${accountId} upgraded to pro until ${newExpiry.toISOString()}`,
        );
        console.log(
          `[TAX-SPLIT] Payment ${orderId}: $${(paymentAmount / 100).toFixed(2)} received. Manual action: transfer $${(paymentAmount * 0.25 / 100).toFixed(2)} (25%) to Tax Reserve pocket in Revolut.`,
        );
        break;
      }

      case 'ORDER_PAYMENT_FAILED': {
        const order = event.order || event.data;
        const metadata = order?.metadata as Record<string, string> | undefined;
        const accountId = metadata?.account_id;
        if (accountId) {
          console.warn(`Revolut: payment failed for ${accountId}, order ${order?.id}`);
        }
        break;
      }

      default:
        console.log('Revolut webhook: unhandled event', event.event);
    }
  } catch (error) {
    console.error('Revolut webhook processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
