import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function maskContactValue(method: string | null, value: string | null): string | null {
  if (!method || !value) return null;
  if (method === 'email') {
    const [local, domain] = value.split('@');
    if (!domain) return '***';
    return `${local.slice(0, 2)}***@${domain}`;
  }
  if (method === 'telegram') {
    return `${value.slice(0, 2)}***`;
  }
  return '***';
}

function computeEffectiveTier(tier: string | null, expiresAt: string | null): string {
  if (!tier || tier === 'free') return 'free';
  if (expiresAt && new Date(expiresAt) < new Date()) return 'free';
  return tier;
}

export async function GET(req: NextRequest) {
  // Rate limit: 10 lookups per minute per IP
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'account-info' });
  if (rl) return rl;

  try {
    const accountId = req.nextUrl.searchParams.get('account_id');

    if (!accountId || !ACCOUNT_ID_REGEX.test(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    const { data: account, error } = await supabase
      .from('accounts')
      .select('account_id, subscription_tier, subscription_expires_at, contact_method, contact_value, contact_verified, created_at')
      .eq('account_id', accountId)
      .single();

    if (error || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const effectiveTier = computeEffectiveTier(
      account.subscription_tier,
      account.subscription_expires_at,
    );

    // Mask contact_value to avoid exposing PII to anyone who guesses an account ID
    const maskedContact = maskContactValue(account.contact_method, account.contact_value);

    return NextResponse.json({
      accountId: account.account_id,
      tier: effectiveTier,
      rawTier: account.subscription_tier,
      expiresAt: account.subscription_expires_at,
      contactMethod: account.contact_method,
      contactValue: maskedContact,
      contactVerified: account.contact_verified,
      createdAt: account.created_at,
    });
  } catch (error) {
    console.error('Account info error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
