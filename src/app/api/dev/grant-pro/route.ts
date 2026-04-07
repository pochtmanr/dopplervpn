import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

/**
 * Dev-only: flip an account to Pro without going through a real payment.
 *
 * Guarded by `DEV_GRANT_SECRET` env var. Returns 404 in production or when
 * the secret is missing, so the route simply does not exist in prod.
 *
 * Usage:
 *   curl -X POST http://localhost:3000/api/dev/grant-pro \
 *     -H "x-dev-secret: $DEV_GRANT_SECRET" \
 *     -H "content-type: application/json" \
 *     -d '{"account_id":"VPN-XXXX-XXXX-XXXX","plan_id":"yearly"}'
 */

const PLAN_DAYS: Record<string, number> = {
  monthly: 30,
  '6month': 180,
  yearly: 365,
};

function notFound() {
  return new NextResponse('Not found', { status: 404 });
}

export async function POST(req: NextRequest) {
  const secret = process.env.DEV_GRANT_SECRET;
  if (!secret || process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    return notFound();
  }

  const provided = req.headers.get('x-dev-secret') || '';
  if (provided !== secret) {
    return notFound();
  }

  let body: { account_id?: string; plan_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const accountId = body.account_id;
  const planId = body.plan_id || 'monthly';

  if (!accountId || !/^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(accountId)) {
    return NextResponse.json({ error: 'Missing or invalid account_id' }, { status: 400 });
  }

  const days = PLAN_DAYS[planId];
  if (!days) {
    return NextResponse.json({ error: 'Invalid plan_id' }, { status: 400 });
  }

  const supabase = createUntypedAdminClient();

  const { data: account, error: lookupErr } = await supabase
    .from('accounts')
    .select('id, subscription_expires_at')
    .eq('account_id', accountId)
    .single();

  if (lookupErr || !account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const currentExpiry = account.subscription_expires_at
    ? new Date(account.subscription_expires_at)
    : null;
  const start = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
  const newExpiry = new Date(start);
  newExpiry.setDate(newExpiry.getDate() + days);

  const { error: updateErr } = await supabase
    .from('accounts')
    .update({
      subscription_tier: 'pro',
      subscription_expires_at: newExpiry.toISOString(),
      subscription_store: 'dev-grant',
      updated_at: new Date().toISOString(),
    })
    .eq('id', account.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  console.log(`[dev-grant-pro] ${accountId} -> pro until ${newExpiry.toISOString()}`);

  return NextResponse.json({
    ok: true,
    account_id: accountId,
    plan_id: planId,
    subscription_tier: 'pro',
    subscription_expires_at: newExpiry.toISOString(),
  });
}
