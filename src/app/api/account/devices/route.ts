import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/**
 * Read-only list of the devices registered to an account, for the web dashboard.
 *
 * `device_id` is deliberately left out of the response: the dashboard has no use
 * for it, and together with the account id it is what `remove_device` takes.
 * There is no remove route on the web — the account id is a bearer credential
 * and removing a session here would not revoke that device's token.
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'account-devices' });
  if (rl) return rl;

  try {
    const accountId = req.nextUrl.searchParams.get('account_id');
    if (!accountId || !ACCOUNT_ID_REGEX.test(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, max_devices')
      .eq('account_id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const { data: rows, error: devicesError } = await supabase
      .from('device_sessions')
      .select('device_name, device_type, is_main, last_active_at, created_at')
      .eq('account_id', account.id)
      .order('is_main', { ascending: false })
      .order('last_active_at', { ascending: false, nullsFirst: false });

    if (devicesError) {
      console.error('Account devices error:', devicesError);
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }

    return NextResponse.json({
      maxDevices: account.max_devices || 10,
      devices: (rows ?? []).map((d) => ({
        name: d.device_name,
        type: d.device_type,
        isMain: !!d.is_main,
        lastActiveAt: d.last_active_at,
        createdAt: d.created_at,
      })),
    });
  } catch (error) {
    console.error('Account devices error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
