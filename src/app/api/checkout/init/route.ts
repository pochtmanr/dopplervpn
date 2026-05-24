import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { routing } from '@/i18n/routing';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const VALID_PLANS = ['monthly', '6month', 'yearly'] as const;
const TOKEN_TTL_SECONDS = 600;

function resolveSiteUrl(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  if (host) return `${proto}://${host}`;
  return 'https://www.dopplervpn.org';
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000, prefix: 'checkout-init' });
  if (rl) return rl;

  let body: { accountId?: unknown; plan?: unknown; locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const accountId = typeof body.accountId === 'string' ? body.accountId : '';
  const plan = typeof body.plan === 'string' ? body.plan : '';
  const rawLocale = typeof body.locale === 'string' ? body.locale : 'en';
  const safeLocale = (routing.locales as readonly string[]).includes(rawLocale) ? rawLocale : 'en';

  if (!ACCOUNT_ID_REGEX.test(accountId)) {
    return NextResponse.json({ error: 'invalid-account-id' }, { status: 400 });
  }
  if (!(VALID_PLANS as readonly string[]).includes(plan)) {
    return NextResponse.json({ error: 'invalid-plan' }, { status: 400 });
  }

  const supabase = createUntypedAdminClient();

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id')
    .eq('account_id', accountId)
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: 'account-not-found' }, { status: 404 });
  }

  const token = randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);

  const { error: insertErr } = await supabase.from('checkout_tokens').insert({
    token,
    account_id: accountId,
    plan,
    expires_at: expiresAt.toISOString(),
  });

  if (insertErr) {
    console.error('[checkout-init] insert_failed', insertErr);
    return NextResponse.json({ error: 'token-persist-failed' }, { status: 500 });
  }

  const url = `${resolveSiteUrl(req)}/checkout?t=${token}&l=${safeLocale}`;

  return NextResponse.json({
    token,
    url,
    expiresAt: expiresAt.getTime(),
  });
}
