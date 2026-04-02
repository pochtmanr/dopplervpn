import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { getPlans } from '@/lib/paddle';
import { rateLimit } from '@/lib/rate-limit';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateAccountId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `VPN-${seg()}-${seg()}-${seg()}`;
}

/**
 * POST /api/paddle/checkout
 *
 * Validates/creates the account and returns the Paddle price ID
 * so the client can open Paddle Checkout overlay directly.
 * No server-side session creation needed — Paddle.js handles checkout client-side.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'paddle-checkout' });
  if (rl) return rl;

  try {
    const { planId, accountId: rawAccountId, email } = await req.json();

    const plans = getPlans();
    const plan = plans[planId];
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

    // Return the Paddle price ID and account ID for client-side checkout
    return NextResponse.json({
      priceId: plan.priceId,
      accountId,
    });
  } catch (error: unknown) {
    console.error('Paddle checkout error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
