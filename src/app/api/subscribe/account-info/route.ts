import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export async function GET(req: NextRequest) {
  try {
    const accountId = req.nextUrl.searchParams.get('account_id');

    if (!accountId || !ACCOUNT_ID_REGEX.test(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    const { data: account, error } = await supabase
      .from('accounts')
      .select('account_id, subscription_tier, subscription_expires_at, contact_method, contact_value, contact_verified, created_at')
      .eq('account_id', accountId)
      .single();

    if (error || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Also check if this account's email/contact is linked to OTHER accounts
    // (warns user about potential duplicates)
    let linkedAccountsCount = 0;
    if (account.contact_value && account.contact_method === 'email') {
      const { count } = await supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true })
        .eq('contact_method', 'email')
        .eq('contact_value', account.contact_value);
      linkedAccountsCount = (count ?? 1) - 1; // exclude self
    }

    return NextResponse.json({
      accountId: account.account_id,
      tier: account.subscription_tier,
      expiresAt: account.subscription_expires_at,
      contactMethod: account.contact_method,
      contactValue: account.contact_value,
      contactVerified: account.contact_verified,
      createdAt: account.created_at,
      linkedAccountsCount,
    });
  } catch (error) {
    console.error('Account info error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
