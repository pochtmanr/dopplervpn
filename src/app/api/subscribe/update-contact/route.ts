import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { accountId, contactMethod, contactValue } = await req.json();

    if (!accountId || !ACCOUNT_ID_REGEX.test(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    if (!contactMethod || !contactValue) {
      return NextResponse.json({ error: 'Missing contact fields' }, { status: 400 });
    }

    if (contactMethod === 'email' && !EMAIL_REGEX.test(contactValue)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

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
