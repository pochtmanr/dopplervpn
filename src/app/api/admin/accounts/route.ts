import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createUntypedAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { admin, adminClient, error } = await requireAdmin();
  if (!admin) return NextResponse.json({ error }, { status: 401 });

  try {
    const params = request.nextUrl.searchParams;
    const tier = params.get("tier");
    const contactMethod = params.get("contact_method");
    const search = params.get("search");
    const offset = parseInt(params.get("offset") || "0");
    const limit = Math.min(parseInt(params.get("limit") || "50"), 200);

    const untypedClient = createUntypedAdminClient();

    let query = untypedClient
      .from("accounts")
      .select(
        "id, account_id, subscription_tier, subscription_store, max_devices, created_at, updated_at, subscription_expires_at, contact_method, contact_value, language",
        { count: "exact" }
      );

    if (tier) query = query.eq("subscription_tier", tier);
    if (contactMethod === "none") {
      query = query.is("contact_method", null);
    } else if (contactMethod) {
      query = query.eq("contact_method", contactMethod);
    }
    if (search) query = query.ilike("account_id", `%${search}%`);

    // Server-side sorting
    const sortBy = params.get("sort_by") || "created_at";
    const sortDir = params.get("sort_dir") || "desc";
    const allowedSorts = ["account_id", "subscription_tier", "created_at", "subscription_expires_at"];
    const sortColumn = allowedSorts.includes(sortBy) ? sortBy : "created_at";
    query = query.order(sortColumn, { ascending: sortDir === "asc" }).range(offset, offset + limit - 1);

    const { data, count, error: qErr } = await query;
    if (qErr) throw new Error(`Failed to fetch accounts: ${qErr.message}`);

    const accounts = data || [];
    // UUIDs for device_sessions (which uses accounts.id as FK)
    const accountUuids = accounts.map((a: { id: string }) => a.id);
    // Text IDs for vpn_user_configs (which uses VPN-XXXX string)
    const accountTextIds = accounts.map((a: { account_id: string }) => a.account_id);

    // Fetch device counts per account (uses UUID)
    const { data: deviceCounts } = await untypedClient
      .rpc("get_account_device_counts", { p_account_ids: accountUuids });

    const deviceMap = new Map(
      (deviceCounts || []).map((d: { account_id: string; device_count: number }) => [d.account_id, d.device_count])
    );

    // Fetch config counts per account (uses text VPN-XXXX)
    const { data: configCounts } = await untypedClient
      .rpc("get_account_config_counts", { p_account_ids: accountTextIds });

    const configMap = new Map<string, { total: number; active: number }>(
      (configCounts || []).map((c: { account_id: string; config_count: number; active_count: number }) => [
        c.account_id,
        { total: c.config_count, active: c.active_count },
      ])
    );

    // Fetch stats
    const { count: totalAccounts } = await untypedClient
      .from("accounts")
      .select("id", { count: "exact", head: true });

    const { count: proCount } = await untypedClient
      .from("accounts")
      .select("id", { count: "exact", head: true })
      .in("subscription_tier", ["pro"]);

    const { count: withContact } = await untypedClient
      .from("accounts")
      .select("id", { count: "exact", head: true })
      .not("contact_method", "is", null);

    const { count: activeConfigs } = await untypedClient
      .from("vpn_user_configs")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    const enriched = accounts.map((a: { id: string; account_id: string }) => ({
      ...a,
      device_count: deviceMap.get(a.id) || 0,
      config_count: configMap.get(a.account_id)?.total || 0,
      active_config_count: configMap.get(a.account_id)?.active || 0,
    }));

    return NextResponse.json({
      accounts: enriched,
      total: count || 0,
      stats: {
        total_accounts: totalAccounts || 0,
        pro_subscribers: proCount || 0,
        with_contact: withContact || 0,
        active_configs: activeConfigs || 0,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
