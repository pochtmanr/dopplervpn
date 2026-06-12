import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function hasActiveSubscription(tier: string | null, expiresAt: string | null): boolean {
  if (!tier || tier === 'free') return false;
  if (expiresAt && new Date(expiresAt) < new Date()) return false;
  return true;
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 3, windowMs: 3600_000, prefix: 'account-delete' });
  if (rl) return rl;

  try {
    const { account_id } = await req.json();

    if (!account_id || !ACCOUNT_ID_REGEX.test(account_id)) {
      return NextResponse.json({ error: 'Invalid account ID format' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    const { data: account } = await supabase
      .from('accounts')
      .select('account_id, subscription_tier, subscription_expires_at')
      .eq('account_id', account_id)
      .single();

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Paid accounts must go through support — direct deletion would forfeit remaining time
    if (hasActiveSubscription(account.subscription_tier, account.subscription_expires_at)) {
      return NextResponse.json({ error: 'active_subscription' }, { status: 403 });
    }

    const { error: deleteError } = await supabase.rpc('delete_account', {
      p_account_id: account.account_id,
    });

    if (deleteError) {
      console.error('[account-delete] RPC error:', deleteError);
      return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[account-delete] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
