import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { resolveSiteUrl } from '@/lib/site-url';
import { routing } from '@/i18n/routing';
import { parseDeviceCredentials, verifyDeviceToken } from '@/lib/device-auth';
import { ACCOUNT_ID_REGEX } from '@/lib/oxapay-orders';

/**
 * Mints a one-time link that opens /{locale}/account already signed in.
 * Called by the desktop app's "Manage subscription"; authorised by the
 * install's device token. See migration 013_account_handoff_tokens.sql.
 */
const TTL_SECONDS = 300;

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'account-handoff' });
  if (rl) return rl;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }
  const creds = parseDeviceCredentials(body);
  if (!creds || !ACCOUNT_ID_REGEX.test(creds.accountId)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const rawLocale = typeof body.locale === 'string' ? body.locale : 'en';
  const locale = (routing.locales as readonly string[]).includes(rawLocale) ? rawLocale : 'en';

  const supabase = createUntypedAdminClient();
  if (!(await verifyDeviceToken(supabase, creds))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Expired rows are dead weight (redeem rejects them); sweep them here so the
  // table stays small. Best-effort: a failed purge must not block the link.
  const { error: purgeErr } = await supabase
    .from('account_handoff_tokens')
    .delete()
    .lt('expires_at', new Date().toISOString());
  if (purgeErr) console.error('[account-handoff] purge_failed', purgeErr.message);

  const token = randomBytes(24).toString('hex');
  const { error } = await supabase.from('account_handoff_tokens').insert({
    token_hash: createHash('sha256').update(token).digest('hex'),
    account_id: creds.accountId,
    expires_at: new Date(Date.now() + TTL_SECONDS * 1000).toISOString(),
  });
  if (error) {
    console.error('[account-handoff] insert_failed', error.message);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }

  return NextResponse.json({ url: `${resolveSiteUrl(req)}/${locale}/account?h=${token}` });
}
