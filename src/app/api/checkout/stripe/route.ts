import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

const PLANS: Record<string, { name: string; cents: number; days: number }> = {
  monthly: { name: 'Doppler VPN Pro — Monthly', cents: 400, days: 30 },
  '6month': { name: 'Doppler VPN Pro — 6 Months', cents: 2000, days: 180 },
  yearly: { name: 'Doppler VPN Pro — Yearly', cents: 3500, days: 365 },
};

export async function POST(req: NextRequest) {
  try {
    const { planId, accountId, promoId } = await req.json();

    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!accountId || !ACCOUNT_ID_REGEX.test(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID format' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    // Verify account exists
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('account_id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Apply promo discount if provided
    let finalCents = plan.cents;
    let promoDiscount = 0;
    if (promoId) {
      try {
        const { data: promo } = await supabase
          .from('promo_codes')
          .select('discount_percent')
          .eq('id', promoId)
          .eq('is_active', true)
          .single();

        if (promo) {
          promoDiscount = promo.discount_percent;
          finalCents = Math.round(plan.cents * (1 - promoDiscount / 100));
        }
      } catch (e) {
        console.error('Promo lookup failed:', e);
      }
    }

    const baseUrl = req.nextUrl.origin;

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: plan.name },
          unit_amount: finalCents,
        },
        quantity: 1,
      }],
      metadata: {
        account_id: accountId,
        plan_id: planId,
        days: String(plan.days),
        source: 'web_checkout',
        promo_id: promoId || '',
        promo_discount: String(promoDiscount),
        original_cents: String(plan.cents),
      },
      success_url: `${baseUrl}/en/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/en/checkout?account_id=${accountId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
