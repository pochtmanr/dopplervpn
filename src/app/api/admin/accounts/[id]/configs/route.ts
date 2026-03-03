import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, adminClient, error } = await requireAdmin();
  if (!admin) return NextResponse.json({ error }, { status: 401 });

  try {
    const { id } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = adminClient as any;

    // Get account_id (text) from UUID
    const { data: account } = await client
      .from("accounts")
      .select("account_id")
      .eq("id", id)
      .single();

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Get server lookup
    const { data: servers } = await client
      .from("vpn_servers")
      .select("id, name, country_code");

    const serverMap = new Map(
      (servers || []).map((s: { id: string; name: string; country_code: string }) => [s.id, s])
    );

    // Get configs for this account (uses text VPN-XXXX)
    const { data: configs } = await client
      .from("vpn_user_configs")
      .select("id, server_id, device_id, is_active, tier, expires_at, created_at, marzban_username")
      .eq("account_id", account.account_id)
      .order("created_at", { ascending: false });

    const enrichedConfigs = (configs || []).map((c: { server_id: string | null }) => {
      const srv = c.server_id ? serverMap.get(c.server_id) : null;
      return {
        ...c,
        server_name: srv?.name || "Unknown",
        server_country_code: srv?.country_code || "??",
      };
    });

    // Get device sessions for this account (uses UUID)
    const { data: devices } = await client
      .from("device_sessions")
      .select("id, device_id, device_name, device_type, last_active_at, is_main, vpn_connected, created_at")
      .eq("account_id", id)
      .order("last_active_at", { ascending: false });

    return NextResponse.json({ configs: enrichedConfigs, devices: devices || [] });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
