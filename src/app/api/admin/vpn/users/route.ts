import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

interface VpnUserRow {
  id: string;
  backend_username: string;
  backend_type: string;
  platform: string;
  protocol: string;
  status: string;
  server_id: string;
  used_traffic_bytes: number;
  data_limit_bytes: number | null;
  expires_at: string | null;
  last_online_at: string | null;
  account_id: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const { admin, adminClient, error } = await requireAdmin();
  if (!admin) return NextResponse.json({ error }, { status: 401 });

  try {
    const params = request.nextUrl.searchParams;
    const serverId = params.get("server_id");
    const platform = params.get("platform");
    const status = params.get("status");
    const search = params.get("search");
    const offset = parseInt(params.get("offset") || "0");
    const limit = Math.min(parseInt(params.get("limit") || "50"), 200);

    // Get server lookup map (service role bypasses RLS)
    const { data: serverList } = await adminClient
      .from("vpn_servers")
      .select("id, name, country_code")
      .returns<Array<{ id: string; name: string; country_code: string }>>();

    const serverMap = new Map((serverList || []).map((s) => [s.id, s]));

    // Build filtered query — use any to bypass missing generated types for vpn_users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = adminClient
      .from("vpn_users")
      .select(
        "id, backend_username, backend_type, platform, protocol, status, server_id, used_traffic_bytes, data_limit_bytes, expires_at, last_online_at, account_id, created_at",
        { count: "exact" }
      );

    if (serverId) query = query.eq("server_id", serverId);
    if (platform) query = query.eq("platform", platform);
    if (status) query = query.eq("status", status);
    if (search) query = query.ilike("backend_username", `%${search}%`);

    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error: qErr } = await query as { data: VpnUserRow[] | null; count: number | null; error: { message: string } | null };
    if (qErr) throw new Error(`Failed to fetch users: ${qErr.message}`);

    // Merge server info
    const users = (data || []).map((row) => {
      const srv = serverMap.get(row.server_id);
      return {
        ...row,
        server_name: srv?.name || "Unknown",
        server_country_code: srv?.country_code || "??",
      };
    });

    return NextResponse.json({
      users,
      total: count || 0,
      filters: { server_id: serverId, platform, status },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
