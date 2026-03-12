import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_METHODS = ['email', 'telegram'] as const;

export async function POST(req: NextRequest) {
  // Strict rate limit: 3 updates per minute per IP
  const rl = rateLimit(req, { limit: 3, windowMs: 60_000, prefix: 'support-update-contact' });
  if (rl) return rl;

  try {
    const { account_id, contact_method, contact_value } = await req.json();

    if (!account_id || !ACCOUNT_ID_REGEX.test(account_id)) {
      return NextResponse.json(
        { error: 'Invalid account ID' },
        { status: 400 }
      );
    }

    if (
      !contact_method ||
      !VALID_METHODS.includes(contact_method as (typeof VALID_METHODS)[number])
    ) {
      return NextResponse.json(
        { error: 'contact_method must be "email" or "telegram"' },
        { status: 400 }
      );
    }

    if (!contact_value || typeof contact_value !== 'string') {
      return NextResponse.json(
        { error: 'Missing contact_value' },
        { status: 400 }
      );
    }

    if (contact_method === 'email' && !EMAIL_REGEX.test(contact_value)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    // Verify account exists before updating
    const { data: account, error: lookupError } = await supabase
      .from('accounts')
      .select('id')
      .eq('account_id', account_id)
      .single();

    if (lookupError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('accounts')
      .update({
        contact_method,
        contact_value: contact_value.toLowerCase().trim(),
        contact_verified: false,
      })
      .eq('account_id', account_id);

    if (error) {
      console.error('Update contact error:', error);
      return NextResponse.json(
        { error: 'Failed to update contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
