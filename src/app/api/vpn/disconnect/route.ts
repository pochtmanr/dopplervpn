import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { requireAppApiKey } from '@/lib/api-auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 20, windowMs: 60_000, prefix: 'vpn-disconnect' });
  if (rl) return rl;

  if (!requireAppApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { account_id, public_key, config_id } = await req.json();

    if (!account_id || (!public_key && !config_id)) {
      return NextResponse.json({ error: 'account_id and (public_key or config_id) required' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    let query = supabase
      .from('vpn_user_configs')
      .select('*, vpn_servers!inner(id, ip_address, config_data)')
      .eq('account_id', account_id)
      .eq('is_active', true);

    if (config_id) {
      query = query.eq('id', config_id);
    } else {
      query = query.eq('public_key', public_key);
    }

    const { data: configs, error: findErr } = await query.limit(1);

    if (findErr || !configs?.length) {
      return NextResponse.json({ error: 'Active config not found' }, { status: 404 });
    }

    const cfg = configs[0];
    const server = cfg.vpn_servers;

    let serverConfig: Record<string, string>;
    try {
      serverConfig = JSON.parse(server.config_data || '{}');
    } catch {
      serverConfig = {};
    }

    const wgApiUrl = serverConfig.wg_api_url;
    const wgApiKey = serverConfig.wg_api_key;

    if (!wgApiUrl || !wgApiKey) {
      console.error('Server missing wg_api_url or wg_api_key:', server.id);
      return NextResponse.json({ error: 'Server not properly configured' }, { status: 500 });
    }

    // Call WG API to delete peer
    try {
      const wgRes = await fetch(`${wgApiUrl}/delete`, {
        method: 'POST',
        headers: {
          'x-api-key': wgApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_key: cfg.public_key }),
      });

      if (!wgRes.ok) {
        console.error('WG API delete error:', await wgRes.text());
      }
    } catch (err) {
      console.error('WG API delete failed:', err);
    }

    // Deactivate in DB
    const { error: updateErr } = await supabase
      .from('vpn_user_configs')
      .update({ is_active: false })
      .eq('id', cfg.id);

    if (updateErr) {
      console.error('DB update error:', updateErr);
      return NextResponse.json({ error: 'Failed to deactivate config' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, public_key: cfg.public_key });

  } catch (err) {
    console.error('VPN disconnect error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
