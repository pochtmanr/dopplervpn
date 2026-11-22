import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Redeems a handoff token minted by /api/account/handoff. Single use: the row
 * is deleted in the same statement that reads it, so a second redeem of the
 * same link finds nothing.
 */
const TOKEN_REGEX = /^[0-9a-f]{48}$/;

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000, prefix: 'account-handoff-redeem' });
  if (rl) return rl;

  let token = '';
  try {
    const body = await req.json();
    token = typeof body?.token === 'string' ? body.token : '';
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }
  if (!TOKEN_REGEX.test(token)) {
    return NextResponse.json({ error: 'invalid-token' }, { status: 400 });
  }

  const supabase = createUntypedAdminClient();
  const { data, error } = await supabase
    .from('account_handoff_tokens')
    .delete()
    .eq('token_hash', createHash('sha256').update(token).digest('hex'))
    .select('account_id, expires_at')
    .maybeSingle();
  if (error) {
    console.error('[account-handoff-redeem] delete_failed', error.message);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
  if (!data || new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'expired' }, { status: 410 });
  }
  return NextResponse.json({ accountId: data.account_id });
}
