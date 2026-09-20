import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { generateAccountId } from '@/lib/account-id';
import { sendAccountIdEmail } from '@/lib/email';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** How many times to retry on an account_id primary-key collision. */
const MAX_INSERT_ATTEMPTS = 5;

/**
 * Insert a fresh account, retrying past the astronomically unlikely ID
 * collision. Returns null if every attempt failed.
 */
async function insertAccount(
  supabase: ReturnType<typeof createUntypedAdminClient>,
  extra: Record<string, unknown>,
): Promise<string | null> {
  for (let attempt = 0; attempt < MAX_INSERT_ATTEMPTS; attempt++) {
    const accountId = generateAccountId();
    const { error } = await supabase
      .from('accounts')
      .insert({ account_id: accountId, subscription_tier: 'free', ...extra });
    if (!error) return accountId;
  }
  return null;
}

/**
 * POST /api/subscribe/create-account
 *
 * Creates an account. With no body, the account is fully anonymous. With an
 * `email`, the address is attached so the ID can be recovered later.
 *
 * **This endpoint never reveals the ID of an account that already exists.**
 * The account ID is a bearer credential — `/api/account/devices`,
 * `/api/subscribe/account-info`, `/api/account/delete` and `/api/checkout/init`
 * all authorise on knowledge of it alone. Returning it to anyone who guessed
 * the email address turned this route into an account-takeover oracle, and it
 * is reachable unauthenticated from the public MCP endpoint
 * (`/api/agents/[transport]`) as the `create_account` tool. So on collision we
 * mail the ID to the address on file and tell the caller nothing but
 * `existing: true` — the same shape `/api/support/restore-account` uses.
 */
export async function POST(req: NextRequest) {
  // Rate limit: 5 account creations per minute per IP
  const rl = rateLimit(req, { limit: 5, windowMs: 60_000, prefix: 'create-account' });
  if (rl) return rl;

  try {
    let body: { email?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Empty body = anonymous account creation
    }

    const { email } = body;
    const supabase = createUntypedAdminClient();

    if (email && EMAIL_REGEX.test(email)) {
      const normalizedEmail = email.toLowerCase().trim();

      const { data: matches, error: lookupError } = await supabase
        .from('accounts')
        .select('account_id, contact_verified, subscription_tier, created_at')
        .eq('contact_method', 'email')
        .eq('contact_value', normalizedEmail)
        .order('contact_verified', { ascending: false })
        .order('created_at', { ascending: true });

      if (!lookupError && matches && matches.length > 0) {
        const best = matches[0];
        // Ownership of the mailbox is the only proof we accept, so the ID goes
        // to the mailbox and not into this response. A send failure must not
        // change the response either — a different reply on failure would leak
        // that the address has an account.
        try {
          await sendAccountIdEmail({ to: normalizedEmail, accountId: best.account_id });
        } catch (emailError) {
          console.error(
            '[create-account] SMTP send failed:',
            emailError instanceof Error ? emailError.message : emailError,
          );
        }
        return NextResponse.json({
          existing: true,
          message: "An account already exists for this email. We've sent the Account ID to it.",
        });
      }

      const accountId = await insertAccount(supabase, {
        contact_method: 'email',
        contact_value: normalizedEmail,
        contact_verified: false,
      });
      if (!accountId) {
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
      }
      return NextResponse.json({ accountId, existing: false });
    }

    const accountId = await insertAccount(supabase, {});
    if (!accountId) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    return NextResponse.json({ accountId, existing: false });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
