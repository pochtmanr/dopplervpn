import { randomInt } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { sendVerificationCodeEmail } from '@/lib/email';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_TTL_SECONDS = CODE_TTL_MS / 1000;
const MAX_CODES_PER_WINDOW = 3;

/**
 * POST /api/doppler/send-code
 *
 * Issues a 6-digit account-linking code and mails it. Replaces the dead
 * `http://72.61.87.54/api/doppler` service the mobile clients were still
 * pointed at. Mirrors the Telegram bot's flow
 * (doppler-bot/src/handlers/email-verify.ts) against the same
 * `verification_codes` table.
 *
 * Request:  { account_id, method, contact_value }
 * Response: { success: true, expires_in: 600 }
 *
 * Status-code contract — deliberate, do not "fix" to conventional REST:
 * shipped iOS builds surface any non-2xx body verbatim to the user
 * (VerificationService.request throws serverError(code, rawBody)), so a 400
 * would render as `Server error (400): {"error":"..."}`. User-actionable
 * failures therefore return HTTP 200 with an `{error}` body, which the client
 * unwraps into a clean message. Only rate limiting (429, which the client maps
 * to `tooManyAttempts` by status) and genuine internal faults (500) are non-2xx.
 */
export async function POST(req: NextRequest) {
  // Coarse per-IP guard; the per-account limit below is the real one.
  const rl = rateLimit(req, { limit: 6, windowMs: 60_000, prefix: 'doppler-send-code' });
  if (rl) return rl;

  try {
    const { account_id: accountId, method, contact_value: contactValue } = await req.json();

    if (!accountId || typeof accountId !== 'string' || !ACCOUNT_ID_REGEX.test(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID.' });
    }

    // Telegram linking runs through the bot deep link, not this endpoint —
    // there is no delivery channel for a code here.
    if (method !== 'email') {
      return NextResponse.json({ error: 'Only email verification is supported here.' });
    }

    if (!contactValue || typeof contactValue !== 'string') {
      return NextResponse.json({ error: 'Missing email address.' });
    }

    const email = contactValue.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('[doppler/send-code] SMTP not configured');
      return NextResponse.json({ error: 'Verification is temporarily unavailable.' }, { status: 500 });
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

    // Same takeover guard as /api/subscribe/update-contact: a verified contact
    // is the account's recovery channel, so it cannot be silently reassigned.
    if (account.contact_verified) {
      return NextResponse.json({
        error: 'This account already has a verified contact. Contact support to change it.',
      });
    }

    // Per-account limit: max 3 codes per 10 minutes.
    const { count, error: countError } = await supabase
      .from('verification_codes')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .gte('created_at', new Date(Date.now() - CODE_TTL_MS).toISOString());

    if (countError) {
      console.error('[doppler/send-code] Rate-limit lookup failed:', countError);
      return NextResponse.json({ error: 'Verification is temporarily unavailable.' }, { status: 500 });
    }

    if ((count ?? 0) >= MAX_CODES_PER_WINDOW) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // CSPRNG, not Math.random(). This code is a bearer credential: it links a
    // contact to an account, and that contact then becomes the account's recovery
    // channel. V8's Math.random() is xorshift128+, whose state is recoverable from
    // a handful of observed outputs — an attacker requesting codes for their own
    // account could predict the next one issued to somebody else's.
    // Zero-padded, so the full 000000-999999 space is used; every consumer treats
    // the code as a string (verify-code's /^\d{6}$/, the text column, and the iOS
    // OTP field, which never converts to Int).
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

    const { error: insertError } = await supabase.from('verification_codes').insert({
      account_id: accountId,
      method: 'email',
      contact_value: email,
      code,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error('[doppler/send-code] Failed to store code:', insertError);
      return NextResponse.json({ error: 'Verification is temporarily unavailable.' }, { status: 500 });
    }

    try {
      await sendVerificationCodeEmail({ to: email, code });
    } catch (mailError) {
      console.error('[doppler/send-code] Failed to send mail:', mailError);
      // Burn the code so an undelivered one cannot linger as a valid secret.
      await supabase
        .from('verification_codes')
        .update({ expires_at: new Date().toISOString() })
        .eq('account_id', accountId)
        .eq('code', code)
        .is('verified_at', null);

      return NextResponse.json({ error: 'Could not send the email. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, expires_in: CODE_TTL_SECONDS });
  } catch (error) {
    console.error('[doppler/send-code] error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
