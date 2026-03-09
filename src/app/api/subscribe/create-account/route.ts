import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

function generateAccountId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 for clarity
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `VPN-${seg()}-${seg()}-${seg()}`;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createUntypedAdminClient();

    // Find ALL accounts with this email (handles multiple matches)
    const { data: matches, error: lookupError } = await supabase
      .from('accounts')
      .select('account_id, contact_verified, subscription_tier, created_at')
      .eq('contact_method', 'email')
      .eq('contact_value', normalizedEmail)
      .order('contact_verified', { ascending: false })  // verified first
      .order('created_at', { ascending: true });         // oldest first among ties

    if (!lookupError && matches && matches.length > 0) {
      // Prefer: verified > unverified, then oldest (original) account
      const best = matches[0];
      return NextResponse.json({ accountId: best.account_id, existing: true });
    }

    // Create new account with unique ID (retry on collision)
    let accountId: string = '';
    let attempts = 0;
    while (attempts < 5) {
      accountId = generateAccountId();
      const { error: insertError } = await supabase.from('accounts').insert({
        account_id: accountId,
        subscription_tier: 'free',
        contact_method: 'email',
        contact_value: normalizedEmail,
        contact_verified: false,
      });
      if (!insertError) break;
      attempts++;
      if (attempts >= 5) {
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
      }
    }

    return NextResponse.json({ accountId, existing: false });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
