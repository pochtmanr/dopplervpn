import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

// delete-request mints the token with crypto.randomUUID(), so anything that
// isn't a UUID can be rejected before it reaches the database.
const TOKEN_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    // This route is unauthenticated and destructive: a valid token deletes the
    // account outright. A v4 UUID is not realistically guessable, so the
    // exposure is not token brute-force — it is that every unfiltered POST was
    // costing a function invocation and a Supabase lookup, with nothing
    // bounding the rate. Note this limiter is per-instance and best-effort
    // (see lib/rate-limit.ts); the Vercel WAF rule on this path is what
    // actually holds against a distributed caller.
    const rl = rateLimit(req, {
      limit: 10,
      windowMs: 60 * 60 * 1000,
      prefix: 'account-delete-confirm',
    });
    if (rl) return rl;

    const { token } = await req.json();

    if (!token || typeof token !== 'string' || !TOKEN_REGEX.test(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    // Find account with this deletion token
    const { data: account, error: lookupError } = await supabase
      .from('accounts')
      .select('id, account_id, deletion_token_expires_at')
      .eq('deletion_token', token)
      .single();

    if (lookupError || !account) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Check expiry
    const expiresAt = new Date(account.deletion_token_expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
    }

    // Call delete_account RPC
    const { error: deleteError } = await supabase.rpc('delete_account', {
      p_account_id: account.account_id,
    });

    if (deleteError) {
      console.error('[delete-confirm] RPC error:', deleteError);
      return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
    }

    // Clear the token (account may already be deleted, so ignore errors)
    await supabase
      .from('accounts')
      .update({ deletion_token: null, deletion_token_expires_at: null })
      .eq('id', account.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[delete-confirm] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
