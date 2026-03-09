import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: NextRequest) {
  try {
    const { account_id, device_id, server_id } = await req.json();

    if (!account_id || !server_id) {
      return NextResponse.json({ error: 'account_id and server_id required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // 1. Verify account exists and get subscription tier
    // Support both UUID (id) and code (account_id like VPN-XXXX-XXXX-XXXX)
    const isCode = account_id.startsWith('VPN-') || account_id.includes('-');
    const lookupField = isCode ? 'account_id' : 'id';
    const { data: account, error: accErr } = await supabase
      .from('accounts')
      .select('id, account_id, subscription_tier, subscription_expires_at, max_devices')
      .eq(lookupField, account_id)
      .single();

    if (accErr || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Use the account_id (code) for vpn_user_configs since that's what the app stores
    const accountCode = account.account_id;

    // 2. Check for existing active config for this account + server
    const { data: existing } = await supabase
      .from('vpn_user_configs')
      .select('*')
      .eq('account_id', accountCode)
      .eq('server_id', server_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existing?.length) {
      const cfg = existing[0];
      // Check if expired
      if (cfg.expires_at && new Date(cfg.expires_at) > new Date()) {
        // Return existing config
        return NextResponse.json({
          config: cfg.config_data,
          public_key: cfg.public_key,
          expires_at: cfg.expires_at,
          tier: cfg.tier,
          existing: true,
        });
      }
      // Expired — deactivate and create new
      await supabase
        .from('vpn_user_configs')
        .update({ is_active: false })
        .eq('id', cfg.id);
    }

    // 3. Check device limit
    const { count } = await supabase
      .from('vpn_user_configs')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountCode)
      .eq('is_active', true);

    if ((count ?? 0) >= (account.max_devices || 10)) {
      return NextResponse.json({ error: 'Device limit reached' }, { status: 403 });
    }

    // 4. Get server details
    const { data: server, error: srvErr } = await supabase
      .from('vpn_servers')
      .select('*')
      .eq('id', server_id)
      .eq('is_active', true)
      .single();

    if (srvErr || !server) {
      return NextResponse.json({ error: 'Server not found or inactive' }, { status: 404 });
    }

    // 5. Parse server config to get WG API URL
    let serverConfig: Record<string, string>;
    try {
      serverConfig = JSON.parse(server.config_data || '{}');
    } catch {
      return NextResponse.json({ error: 'Invalid server configuration' }, { status: 500 });
    }

    const wgApiUrl = serverConfig.wg_api_url;
    const wgApiKey = serverConfig.wg_api_key;

    if (!wgApiUrl || !wgApiKey) {
      console.error('Server missing wg_api_url or wg_api_key in config_data:', server.id);
      return NextResponse.json({ error: 'Server not properly configured' }, { status: 500 });
    }

    // 6. Call WG API to create peer
    const wgRes = await fetch(`${wgApiUrl}/create`, {
      method: 'POST',
      headers: { 'x-api-key': wgApiKey },
    });

    if (!wgRes.ok) {
      const errText = await wgRes.text();
      console.error('WG API error:', errText);
      return NextResponse.json({ error: 'Failed to create VPN peer' }, { status: 502 });
    }

    const peerRaw = await wgRes.json();

    // Handle two WG API response formats:
    // Format A (Germany/Russia): { private_key, public_key, client_ip, server_pubkey, endpoint, dns }
    // Format B (USA/UK/CH): { status, config } where config is a full WireGuard config string
    let peer: { private_key: string; public_key: string; client_ip: string; server_pubkey: string; endpoint: string; dns: string };
    let wgConfig: string;

    if (peerRaw.config && typeof peerRaw.config === 'string') {
      // Format B — parse the config string
      wgConfig = peerRaw.config.trim();
      const lines = wgConfig.split('\n');
      const getValue = (key: string) => {
        const line = lines.find(l => l.trim().startsWith(key));
        return line ? line.split('=').slice(1).join('=').trim() : '';
      };
      peer = {
        private_key: getValue('PrivateKey'),
        public_key: '', // not returned in this format, generate from config
        client_ip: getValue('Address').replace('/24', '').replace('/32', ''),
        server_pubkey: getValue('PublicKey'),
        endpoint: getValue('Endpoint'),
        dns: getValue('DNS'),
      };
      // Ensure MTU and PersistentKeepalive are present
      if (!wgConfig.includes('MTU')) {
        wgConfig = wgConfig.replace('[Peer]', 'MTU = 1420\n\n[Peer]');
      }
      if (!wgConfig.includes('AllowedIPs = 0.0.0.0/0, ::/0')) {
        wgConfig = wgConfig.replace('AllowedIPs = 0.0.0.0/0, ::/0', 'AllowedIPs = 0.0.0.0/0, ::/0');
      }
    } else {
      // Format A — individual fields
      peer = peerRaw as typeof peer;
      wgConfig = `[Interface]
PrivateKey = ${peer.private_key}
Address = ${peer.client_ip}/32
DNS = ${peer.dns || '1.1.1.1, 1.0.0.1'}
MTU = 1420

[Peer]
PublicKey = ${peer.server_pubkey}
Endpoint = ${peer.endpoint}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`;
    }

    // 8. Determine expiry — check subscription_expires_at to catch lapsed subscriptions
    const isSubscriptionExpired = account.subscription_expires_at &&
      new Date(account.subscription_expires_at) < new Date();
    const tier = isSubscriptionExpired ? 'free' : (account.subscription_tier || 'free');
    const now = new Date();
    const expiresAt = tier === 'free'
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000)       // 24 hours
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // 9. Save to vpn_user_configs
    const { error: insertErr } = await supabase
      .from('vpn_user_configs')
      .insert({
        account_id: accountCode,
        server_id,
        device_id: device_id || null,
        public_key: peer.public_key,
        config_data: wgConfig,
        tier,
        is_active: true,
        expires_at: expiresAt.toISOString(),
      });

    if (insertErr) {
      console.error('DB insert error:', insertErr);
      // Try to clean up the WG peer
      try {
        await fetch(`${wgApiUrl}/delete`, {
          method: 'POST',
          headers: { 'x-api-key': wgApiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_key: peer.public_key }),
        });
      } catch {}
      return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }

    // 10. Return config to app
    return NextResponse.json({
      config: wgConfig,
      public_key: peer.public_key,
      client_ip: peer.client_ip,
      server_pubkey: peer.server_pubkey,
      endpoint: peer.endpoint,
      dns: peer.dns,
      expires_at: expiresAt.toISOString(),
      tier,
      existing: false,
    });

  } catch (err) {
    console.error('VPN connect error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
