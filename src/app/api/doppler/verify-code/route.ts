import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const CODE_REGEX = /^\d{6}$/;

/** Guesses allowed against a single batch of outstanding codes before it is burnt. */
const MAX_ATTEMPTS = 5;

interface CodeRow {
  id: string;
  code: string;
  contact_value: string;
  attempts: number | null;
}

/**
 * POST /api/doppler/verify-code
 *
 * Checks a 6-digit code and, on success, marks the contact verified.
 *
 * Request:  { account_id, code }
 * Response: { success: true, account_id }
 *
 * Error strings are load-bearing: shipped iOS builds classify failures by
 * substring (VerificationService.verifyCode) — "invalid"/"incorrect" →
 * invalidCode, "expired" → codeExpired, "too many" → tooManyAttempts. Keep
 * those words in the messages below and keep them mutually exclusive.
 *
 * See send-code/route.ts for why user-actionable failures are HTTP 200.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'doppler-verify-code' });
  if (rl) return rl;

  try {
    const { account_id: accountId, code: rawCode } = await req.json();

    if (!accountId || typeof accountId !== 'string' || !ACCOUNT_ID_REGEX.test(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID.' });
    }

    const code = typeof rawCode === 'string' ? rawCode.trim() : '';
    if (!CODE_REGEX.test(code)) {
      return NextResponse.json({ error: 'Invalid code. Enter the 6 digits from the email.' });
    }

    const supabase = createUntypedAdminClient();

    const { data: account, error: lookupError } = await supabase
      .from('accounts')
      .select('id, contact_verified')
      .eq('account_id', accountId)
      .single();

    if (lookupError || !account) {
      return NextResponse.json({ error: 'Account not found.' });
    }

    const nowIso = new Date().toISOString();

    // Every code still in play for this account (at most 3 — see send-code's
    // per-account limit). Matching across the batch rather than the newest row
    // alone means a user who requested twice can still use the first code.
    const { data: outstanding, error: outstandingError } = await supabase
      .from('verification_codes')
      .select('id, code, contact_value, attempts')
      .eq('account_id', accountId)
      .eq('method', 'email')
      .is('verified_at', null)
      .gt('expires_at', nowIso)
      .order('created_at', { ascending: false });

    if (outstandingError) {
      console.error('[doppler/verify-code] Lookup failed:', outstandingError);
      return NextResponse.json({ error: 'Verification is temporarily unavailable.' }, { status: 500 });
    }

    const rows = (outstanding ?? []) as CodeRow[];

    if (rows.length === 0) {
      // Distinguish "you waited too long" from "that was never a code".
      const { data: staleRow } = await supabase
        .from('verification_codes')
        .select('id')
        .eq('account_id', accountId)
        .eq('code', code)
        .lte('expires_at', nowIso)
        .limit(1)
        .maybeSingle();

      return staleRow
        ? NextResponse.json({ error: 'Code expired. Please request a new one.' })
        : NextResponse.json({ error: 'Invalid code. Please try again.' });
    }

    // Attempts are tracked per row but spent as a batch, so requesting a fresh
    // code cannot be used to buy another MAX_ATTEMPTS guesses at the old one.
    const spent = rows.reduce((sum, row) => sum + (row.attempts ?? 0), 0);
    if (spent >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 });
    }

    const match = rows.find((row) => row.code === code);

    if (!match) {
      const newest = rows[0];
      await supabase
        .from('verification_codes')
        .update({ attempts: (newest.attempts ?? 0) + 1 })
        .eq('id', newest.id);

      return NextResponse.json({ error: 'Invalid code. Please try again.' });
    }

    const { error: markError } = await supabase
      .from('verification_codes')
      .update({ verified_at: nowIso })
      .eq('id', match.id)
      .is('verified_at', null);

    if (markError) {
      console.error('[doppler/verify-code] Failed to mark verified:', markError);
      return NextResponse.json({ error: 'Verification is temporarily unavailable.' }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        contact_method: 'email',
        contact_value: match.contact_value,
        contact_verified: true,
        updated_at: nowIso,
      })
      .eq('id', account.id);

    if (updateError) {
      console.error('[doppler/verify-code] Failed to link contact:', updateError);
      return NextResponse.json({ error: 'Verification is temporarily unavailable.' }, { status: 500 });
    }

    // Retire any sibling codes — the contact is linked, they serve no purpose.
    await supabase
      .from('verification_codes')
      .update({ expires_at: nowIso })
      .eq('account_id', accountId)
      .is('verified_at', null)
      .gt('expires_at', nowIso);

    return NextResponse.json({ success: true, account_id: accountId });
  } catch (error) {
    console.error('[doppler/verify-code] error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
