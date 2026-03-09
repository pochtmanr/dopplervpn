import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: NextRequest) {
  try {
    const accountId = req.nextUrl.searchParams.get('account_id');
    const email = req.nextUrl.searchParams.get('email');

    if (!accountId && !email) {
      return NextResponse.json(
        { error: 'Provide account_id or email' },
        { status: 400 }
      );
    }

    const supabase = createUntypedAdminClient();

    const selectFields =
      'account_id, subscription_tier, subscription_expires_at, contact_method, contact_value, contact_verified, subscription_source, created_at';

    let query = supabase.from('accounts').select(selectFields);

    if (accountId) {
      if (!ACCOUNT_ID_REGEX.test(accountId)) {
        return NextResponse.json(
          { error: 'Invalid account ID format' },
          { status: 400 }
        );
      }
      query = query.eq('account_id', accountId);
    } else if (email) {
      if (!EMAIL_REGEX.test(email)) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
      }
      query = query
        .eq('contact_method', 'email')
        .eq('contact_value', email.toLowerCase().trim());
    }

    const { data: account, error } = await query.limit(1).single();

    if (error || !account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Account lookup error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
