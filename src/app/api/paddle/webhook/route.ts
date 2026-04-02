import { NextRequest, NextResponse } from 'next/server';
import { EventName } from '@paddle/paddle-node-sdk';
import { getPaddle, getPaddleWebhookSecret } from '@/lib/paddle';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

/**
 * Map Paddle billing period to days for subscription expiry calculation.
 */
function billingPeriodToDays(interval: string, frequency: number): number {
  switch (interval) {
    case 'month': return frequency * 30;
    case 'year': return frequency * 365;
    case 'week': return frequency * 7;
    case 'day': return frequency;
    default: return 30;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('paddle-signature') || '';

  if (!signature) {
    return NextResponse.json({ error: 'Missing paddle-signature header' }, { status: 400 });
  }

  const paddle = getPaddle();
  const webhookSecret = getPaddleWebhookSecret();

  let eventData;
  try {
    eventData = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
  } catch (err) {
    console.error('Paddle webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createUntypedAdminClient();

  try {
    switch (eventData.eventType) {
      case EventName.TransactionCompleted: {
        const txn = eventData.data;
        const customData = txn.customData as Record<string, string> | null;
        const accountId = customData?.account_id;

        if (!accountId) {
          console.error('Paddle webhook: missing account_id in customData', txn.id);
          return NextResponse.json({ error: 'Missing account_id in customData' }, { status: 400 });
        }

        // Idempotency check — skip if this transaction was already processed
        const { data: existingInvoice } = await supabase
          .from('vpn_invoices')
          .select('id')
          .eq('provider_payment_id', txn.id)
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
          console.error('Paddle webhook: account not found for', accountId, accountError);
          return NextResponse.json({ error: 'Account not found' }, { status: 400 });
        }

        // Determine days from the first subscription item's billing cycle
        let days = 30; // default
        const items = txn.items;
        if (items && items.length > 0) {
          const price = items[0].price;
          if (price?.billingCycle) {
            days = billingPeriodToDays(
              price.billingCycle.interval,
              price.billingCycle.frequency,
            );
          }
        }

        // Calculate new expiry (extend if currently active)
        const currentExpiry = account.subscription_expires_at
          ? new Date(account.subscription_expires_at)
          : null;
        const effectiveStart = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
        const newExpiry = new Date(effectiveStart);
        newExpiry.setDate(newExpiry.getDate() + days);

        // Update account subscription
        const { error: updateErr } = await supabase
          .from('accounts')
          .update({
            subscription_tier: 'pro',
            subscription_expires_at: newExpiry.toISOString(),
            subscription_store: 'paddle',
            updated_at: new Date().toISOString(),
          })
          .eq('id', account.id);

        if (updateErr) throw new Error(`Account update failed: ${updateErr.message}`);

        // Log invoice
        await supabase.from('vpn_invoices').insert({
          telegram_user_id: 0,
          plan: customData?.plan_id || 'monthly',
          amount: txn.details?.totals?.total ? Number(txn.details.totals.total) : 0,
          currency: txn.currencyCode || 'USD',
          status: 'paid',
          provider: 'paddle',
          provider_payment_id: txn.id,
          notes: `web_subscribe:${accountId}`,
        });

        // Send welcome email if we have the customer's email
        const customerEmail = customData?.email;
        if (customerEmail) {
          try {
            const { sendWelcomeEmail } = await import('@/lib/email');
            await sendWelcomeEmail({
              to: customerEmail,
              accountId,
              planName: `Doppler Pro — ${customData?.plan_id || 'monthly'}`,
              expiresAt: newExpiry.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            });
          } catch (emailErr) {
            console.error('Welcome email failed:', emailErr);
          }
        }

        console.log(`Paddle: account ${accountId} upgraded to pro until ${newExpiry.toISOString()}`);
        break;
      }

      case EventName.SubscriptionCreated: {
        const sub = eventData.data;
        const customData = sub.customData as Record<string, string> | null;
        const accountId = customData?.account_id;

        if (!accountId) {
          console.log('Paddle subscription.created: no account_id in customData');
          break;
        }

        // Update subscription store
        await supabase
          .from('accounts')
          .update({
            subscription_tier: 'pro',
            subscription_store: 'paddle',
            updated_at: new Date().toISOString(),
          })
          .eq('account_id', accountId);

        console.log(`Paddle: subscription created for ${accountId}`);
        break;
      }

      case EventName.SubscriptionUpdated: {
        const sub = eventData.data;
        const customData = sub.customData as Record<string, string> | null;
        const accountId = customData?.account_id;

        if (!accountId) break;

        // Update expiry if nextBilledAt is available
        if (sub.nextBilledAt) {
          await supabase
            .from('accounts')
            .update({
              subscription_expires_at: sub.nextBilledAt,
              updated_at: new Date().toISOString(),
            })
            .eq('account_id', accountId);
        }

        console.log(`Paddle: subscription updated for ${accountId}`);
        break;
      }

      case EventName.SubscriptionCanceled: {
        const sub = eventData.data;
        const customData = sub.customData as Record<string, string> | null;
        const accountId = customData?.account_id;

        if (!accountId) break;

        // Don't immediately downgrade — let the current period expire
        // The subscription_expires_at already tracks when access ends
        console.log(`Paddle: subscription canceled for ${accountId}, will expire at current period end`);
        break;
      }

      case EventName.TransactionPaymentFailed: {
        const txn = eventData.data;
        const customData = txn.customData as Record<string, string> | null;
        const accountId = customData?.account_id;

        if (accountId) {
          console.warn(`Paddle: payment failed for ${accountId}, transaction ${txn.id}`);
        }
        break;
      }

      default:
        console.log('Paddle webhook: unhandled event', eventData.eventType);
    }
  } catch (error) {
    console.error('Paddle webhook processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
