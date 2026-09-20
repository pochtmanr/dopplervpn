import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { sendAccountIdEmail } from '@/lib/email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Identical for found, not-found and send-failure — see below. */
const GENERIC_RESPONSE = {
  success: true,
  message: "If an account exists with this email, we've sent the Account ID.",
};

/**
 * POST /api/support/restore-account
 *
 * Front-door account recovery: mails the account ID to the address on file.
 *
 * Every path returns {@link GENERIC_RESPONSE}. Varying the reply on
 * "no such account" or on an SMTP failure would turn this into an
 * account-enumeration oracle, which matters more here than usual because the
 * account ID is the only credential there is.
 */
export async function POST(req: NextRequest) {
  // Strict rate limit: 2 restores per minute per IP (prevents email spam)
  const rl = rateLimit(req, { limit: 2, windowMs: 60_000, prefix: 'restore-account' });
  if (rl) return rl;

  try {
    const { email } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createUntypedAdminClient();

    const { data: account, error: lookupError } = await supabase
      .from('accounts')
      .select('account_id')
      .eq('contact_method', 'email')
      .eq('contact_value', normalizedEmail)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error('[restore-account] DB lookup error:', lookupError.message);
    }

    if (account) {
      try {
        await sendAccountIdEmail({ to: normalizedEmail, accountId: account.account_id });
      } catch (emailError) {
        console.error(
          '[restore-account] SMTP send failed:',
          emailError instanceof Error ? emailError.message : emailError,
        );
      }
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error('[restore-account] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
