import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PLANS: Record<string, { name: string; cents: number; days: number }> = {
  monthly: { name: 'Doppler VPN Pro — Monthly', cents: 400, days: 30 },
  '6month': { name: 'Doppler VPN Pro — 6 Months', cents: 2000, days: 180 },
  yearly: { name: 'Doppler VPN Pro — Yearly', cents: 3500, days: 365 },
};

function generateAccountId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `VPN-${seg()}-${seg()}-${seg()}`;
}

export async function POST(req: NextRequest) {
  try {
    const { planId, accountId: rawAccountId, email, promoId } = await req.json();

    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Require either a valid accountId or a valid email
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
      // Existing flow: verify account exists
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
      // Email-based flow: find existing account or create a new one
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
        // Create new account with unique ID (retry on collision)
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
      customer_email: email || undefined,
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
        source: 'web_subscribe',
        email: email || '',
        promo_id: promoId || '',
        promo_discount: String(promoDiscount),
        original_cents: String(plan.cents),
      },
      success_url: `${baseUrl}/en/subscribe/success?session_id={CHECKOUT_SESSION_ID}&account_id=${accountId}`,
      cancel_url: `${baseUrl}/en/subscribe`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
