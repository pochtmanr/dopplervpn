import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { requireAppApiKey } from '@/lib/api-auth';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000, prefix: 'vpn-servers' });
  if (rl) return rl;

  if (!requireAppApiKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createUntypedAdminClient();

    // Only return safe fields — never expose ip_address or config_data
    const { data: servers, error } = await supabase
      .from('vpn_servers')
      .select('id, name, country, country_code, city, port, is_premium, is_active, load_percentage, latency_ms, speed_mbps')
      .eq('is_active', true)
      .order('country');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 });
    }

    return NextResponse.json({ servers });
  } catch (err) {
    console.error('Server list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
