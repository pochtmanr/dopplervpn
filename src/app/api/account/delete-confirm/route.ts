import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    // Find account with this deletion token
    const { data: account, error: lookupError } = await supabase
      .from('accounts')
      .select('id, account_id, deletion_token_expires_at')
      .eq('deletion_token', token)
      .single();

    if (lookupError || !account) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Check expiry
    const expiresAt = new Date(account.deletion_token_expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
    }

    // Call delete_account RPC
    const { error: deleteError } = await supabase.rpc('delete_account', {
      p_account_id: account.account_id,
    });

    if (deleteError) {
      console.error('[delete-confirm] RPC error:', deleteError);
      return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
    }

    // Clear the token (account may already be deleted, so ignore errors)
    await supabase
      .from('accounts')
      .update({ deletion_token: null, deletion_token_expires_at: null })
      .eq('id', account.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[delete-confirm] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
