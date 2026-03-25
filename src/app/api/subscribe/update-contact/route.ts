import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_METHODS = ['email', 'telegram'] as const;

export async function POST(req: NextRequest) {
  // Strict rate limit: 3 updates per minute per IP
  const rl = rateLimit(req, { limit: 3, windowMs: 60_000, prefix: 'subscribe-update-contact' });
  if (rl) return rl;

  try {
    const { accountId, contactMethod, contactValue } = await req.json();

    if (!accountId || !ACCOUNT_ID_REGEX.test(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    if (!contactMethod || !VALID_METHODS.includes(contactMethod as (typeof VALID_METHODS)[number])) {
      return NextResponse.json({ error: 'contactMethod must be "email" or "telegram"' }, { status: 400 });
    }

    if (!contactValue || typeof contactValue !== 'string') {
      return NextResponse.json({ error: 'Missing contactValue' }, { status: 400 });
    }

    if (contactMethod === 'email' && !EMAIL_REGEX.test(contactValue)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    // Verify account exists and check if contact is already verified
    const { data: account, error: lookupError } = await supabase
      .from('accounts')
      .select('id, contact_verified')
      .eq('account_id', accountId)
      .single();

    if (lookupError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Prevent overwriting a verified contact — that would be an account takeover vector
    if (account.contact_verified) {
      return NextResponse.json(
        { error: 'Contact already verified — contact support to change it' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('accounts')
      .update({
        contact_method: contactMethod,
        contact_value: contactValue.toLowerCase().trim(),
        contact_verified: false,
      })
      .eq('account_id', accountId);

    if (error) {
      console.error('Update contact error:', error);
      return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
