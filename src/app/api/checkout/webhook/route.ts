import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  '6month': 180,
  yearly: 365,
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig!, process.env.STRIPE_CHECKOUT_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const accountId = session.metadata?.account_id;
    const planId = session.metadata?.plan_id || 'monthly';
    const days = PLAN_DAYS[planId] || 30;

    if (!accountId) {
      console.error('Webhook: missing account_id in metadata');
      return NextResponse.json({ received: true });
    }

    const supabase = createUntypedAdminClient();

    try {
      // 1. Look up account by account_id text field
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id, subscription_expires_at')
        .eq('account_id', accountId)
        .single();

      if (accountError || !account) {
        console.error('Webhook: account not found for', accountId, accountError);
        return NextResponse.json({ received: true });
      }

      // 2. Calculate new expiry (extend if currently active)
      const currentExpiry = account.subscription_expires_at
        ? new Date(account.subscription_expires_at)
        : null;
      const effectiveStart = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
      const newExpiry = new Date(effectiveStart);
      newExpiry.setDate(newExpiry.getDate() + days);

      // 3. Update account subscription
      await supabase
        .from('accounts')
        .update({
          subscription_tier: 'pro',
          subscription_expires_at: newExpiry.toISOString(),
          subscription_store: 'stripe',
          updated_at: new Date().toISOString(),
        })
        .eq('id', account.id);

      // 4. Log invoice — telegram_user_id set to 0 since this is a web checkout
      await supabase.from('vpn_invoices').insert({
        telegram_user_id: 0,
        plan: planId,
        amount: session.amount_total || 0,
        currency: 'USD',
        status: 'paid',
        provider: 'stripe',
        provider_payment_id: session.payment_intent as string,
        notes: `web_subscribe:${accountId}`,
      });

      // 5. Send welcome email if we have the customer's email
      const customerEmail = session.metadata?.email || session.customer_details?.email;
      if (customerEmail) {
        try {
          const { sendWelcomeEmail } = await import('@/lib/email');
          await sendWelcomeEmail({
            to: customerEmail,
            accountId,
            planName: `Doppler Pro — ${planId}`,
            expiresAt: newExpiry.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          });
        } catch (emailErr) {
          console.error('Welcome email failed:', emailErr);
          // Don't fail the webhook for email errors
        }
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  return NextResponse.json({ received: true });
}
