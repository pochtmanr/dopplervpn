import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createUntypedAdminClient } from "@/lib/supabase/admin";
import { loadMarzbanServers, createMarzbanClient } from "@/lib/marzban";

export async function POST() {
  const { admin, adminClient, error } = await requireAdmin();
  if (!admin) return NextResponse.json({ error }, { status: 401 });

  try {
    const marzbanServers = await loadMarzbanServers(adminClient);
    const results: Array<{ server: string; synced: number; errors: number }> = [];

    for (const ms of marzbanServers) {
      let synced = 0;
      let errors = 0;

      try {
        const client = createMarzbanClient(ms);

        // Fetch all users from this Marzban instance (paginate)
        let offset = 0;
        const limit = 100;
        let allUsers: Array<{
          username: string;
          status: string;
          used_traffic: number;
          data_limit: number | null;
          expire: number | null;
          online_at: string | null;
          created_at: string;
          proxies?: Record<string, unknown>;
        }> = [];

        while (true) {
          const page = await client.getUsers(offset, limit);
          if (!page?.users?.length) break;
          allUsers = allUsers.concat(page.users);
          if (page.users.length < limit) break;
          offset += limit;
        }

        // Upsert each user into vpn_users
        for (const user of allUsers) {
          const proxies = user.proxies ? Object.keys(user.proxies) : [];
          const protocol = proxies.includes("vless")
            ? "vless"
            : proxies.includes("shadowsocks")
              ? "shadowsocks"
              : proxies.includes("trojan")
                ? "trojan"
                : "vless";

          const row = {
            server_id: ms.serverId,
            backend_username: user.username,
            backend_type: "marzban" as const,
            platform: user.username.startsWith("tg_")
              ? "telegram" as const
              : user.username.startsWith("ios_")
                ? "ios" as const
                : "unknown" as const,
            protocol,
            status: user.status || "active",
            used_traffic_bytes: user.used_traffic || 0,
            data_limit_bytes: user.data_limit || null,
            expires_at: user.expire ? new Date(user.expire * 1000).toISOString() : null,
            last_online_at: user.online_at || null,
            updated_at: new Date().toISOString(),
          };

          const untypedClient = createUntypedAdminClient();
          const { error: upsertErr } = await untypedClient.from("vpn_users")
            .upsert(row, { onConflict: "server_id,backend_username,backend_type" });

          if (upsertErr) {
            console.error(`Sync error for ${user.username}@${ms.label}:`, upsertErr.message);
            errors++;
          } else {
            synced++;
          }
        }
      } catch (e) {
        console.error(`Failed to sync ${ms.label}:`, (e as Error).message);
        errors++;
      }

      results.push({ server: ms.label, synced, errors });
    }

    return NextResponse.json({ results });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
