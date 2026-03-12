import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export async function GET(req: NextRequest) {
  // Strict rate limit: 5 lookups per minute per IP
  const rl = rateLimit(req, { limit: 5, windowMs: 60_000, prefix: 'support-account' });
  if (rl) return rl;

  try {
    const accountId = req.nextUrl.searchParams.get('account_id');

    // REMOVED: email-based lookup to prevent PII enumeration.
    // Only account_id lookup is allowed — the user must know their account ID.
    if (!accountId) {
      return NextResponse.json(
        { error: 'Provide account_id' },
        { status: 400 }
      );
    }

    if (!ACCOUNT_ID_REGEX.test(accountId)) {
      return NextResponse.json(
        { error: 'Invalid account ID format' },
        { status: 400 }
      );
    }

    const supabase = createUntypedAdminClient();

    // Only return non-sensitive fields — no contact_value (email/telegram)
    const { data: account, error } = await supabase
      .from('accounts')
      .select('account_id, subscription_tier, subscription_expires_at, contact_method, contact_verified, subscription_source, created_at')
      .eq('account_id', accountId)
      .limit(1)
      .single();

    if (error || !account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Mask contact value — only show partial info
    return NextResponse.json({ account });
  } catch (error) {
    console.error('Account lookup error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
