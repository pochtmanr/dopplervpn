import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const TOKEN_REGEX = /^[a-f0-9]{48}$/;

/**
 * Resolve a checkout token minted by /api/checkout/init.
 *
 * GET /api/checkout/resolve?t=<token>
 *
 * Returns `{ accountId, plan }` on success.
 *
 * Tokens are not single-use: the checkout page resolves on every render
 * (including manual reloads after a transient WebView error), so a single
 * checkout session can resolve the token several times. Replay protection
 * comes from the 10-minute TTL and the fact that the token never leaves
 * the WebView (it isn't exposed to the user's browser address bar).
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000, prefix: 'checkout-resolve' });
  if (rl) return rl;

  const token = req.nextUrl.searchParams.get('t') || '';
  if (!TOKEN_REGEX.test(token)) {
    return NextResponse.json({ error: 'invalid-token' }, { status: 400 });
  }

  const supabase = createUntypedAdminClient();

  const { data: row, error } = await supabase
    .from('checkout_tokens')
    .select('account_id, plan, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (error) {
    console.error('[checkout-resolve] lookup_failed', error);
    return NextResponse.json({ error: 'lookup-failed' }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 });
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    void supabase.from('checkout_tokens').delete().eq('token', token);
    return NextResponse.json({ error: 'expired' }, { status: 410 });
  }

  return NextResponse.json({
    accountId: row.account_id,
    plan: row.plan,
  });
}
