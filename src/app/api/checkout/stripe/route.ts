import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORTED_LOCALES = ['en', 'he', 'ru', 'es', 'pt', 'fr', 'zh', 'de', 'fa', 'ar', 'hi', 'id', 'tr', 'vi', 'th', 'ms', 'ko', 'ja', 'tl', 'ur', 'sw'];

const PLANS: Record<string, { name: string; cents: number; days: number }> = {
  monthly: { name: 'Doppler VPN Pro — Monthly', cents: 699, days: 30 },
  '6month': { name: 'Doppler VPN Pro — 6 Months', cents: 2999, days: 180 },
  yearly: { name: 'Doppler VPN Pro — Yearly', cents: 3999, days: 365 },
};

function generateAccountId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `VPN-${seg()}-${seg()}-${seg()}`;
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'checkout' });
  if (rl) return rl;

  try {
    const { planId, accountId: rawAccountId, email, promoId, locale } = await req.json();

    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

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

    // SECURITY: Re-validate promo at checkout time (full validation, not just discount lookup)
    let finalCents = plan.cents;
    let promoDiscount = 0;
    if (promoId) {
      try {
        const { data: promo } = await supabase
          .from('promo_codes')
          .select('id, discount_percent, is_active, expires_at, max_redemptions, current_redemptions, applicable_plans')
          .eq('id', promoId)
          .eq('is_active', true)
          .single();

        if (promo) {
          // Check expiry
          const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
          // Check redemption limit
          const isFullyRedeemed = promo.max_redemptions && promo.current_redemptions >= promo.max_redemptions;
          // Check plan applicability
          const isApplicable = !promo.applicable_plans || promo.applicable_plans.includes(planId);

          if (!isExpired && !isFullyRedeemed && isApplicable) {
            promoDiscount = promo.discount_percent;
            finalCents = Math.round(plan.cents * (1 - promoDiscount / 100));
          }
        }
      } catch (e) {
        console.error('Promo lookup failed:', e);
      }
    }

    const baseUrl = req.nextUrl.origin;
    // Use provided locale if valid, default to 'en'
    const safeLocale = locale && SUPPORTED_LOCALES.includes(locale) ? locale : 'en';

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: email || undefined,
      automatic_tax: { enabled: true },
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: plan.name },
          unit_amount: finalCents,
          tax_behavior: 'exclusive',
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
      success_url: `${baseUrl}/${safeLocale}/account/success?session_id={CHECKOUT_SESSION_ID}&account_id=${accountId}`,
      cancel_url: `${baseUrl}/${safeLocale}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
