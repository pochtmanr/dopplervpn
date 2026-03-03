"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminLoader } from "@/components/admin/admin-loader";
import { VpnStats } from "@/components/admin/vpn-stats";

interface ServerInfo {
  id: string;
  name: string;
  country_code: string;
}

interface VpnUserRow {
  id: string;
  backend_username: string;
  backend_type: string;
  platform: string;
  protocol: string;
  status: string;
  server_id: string;
  server_name: string;
  server_country_code: string;
  used_traffic_bytes: number;
  data_limit_bytes: number | null;
  expires_at: string | null;
  last_online_at: string | null;
  account_id: string | null;
  created_at: string;
}

function countryFlag(code: string): string {
  const base = code.slice(0, 2).toUpperCase();
  if (base.length < 2 || !/^[A-Z]{2}$/.test(base)) return code;
  return String.fromCodePoint(
    ...Array.from(base).map((c) => c.codePointAt(0)! - 0x41 + 0x1f1e6),
  );
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatDate(ts: string | null): string {
  if (!ts) return "Never";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusColors: Record<string, string> = {
  active: "text-green-400",
  disabled: "text-red-400",
  expired: "text-yellow-400",
  limited: "text-orange-400",
  on_hold: "text-text-muted",
};

const deviceBadgeStyles: Record<string, string> = {
  telegram: "bg-sky-400/15 text-sky-400",
  ios: "bg-blue-400/15 text-blue-400",
  android: "bg-green-400/15 text-green-400",
  desktop: "bg-purple-400/15 text-purple-400",
  unknown: "bg-gray-400/15 text-gray-400",
};

const deviceLabels: Record<string, string> = {
  ios: "iOS",
  android: "Android",
  telegram: "Telegram",
  desktop: "Desktop",
  unknown: "Unknown",
};

function detectPlatform(u: VpnUserRow): string {
  if (u.platform !== "unknown") return u.platform;
  if (u.backend_username.startsWith("tg_")) return "telegram";
  if (u.backend_username.startsWith("ios_")) return "ios";
  return "unknown";
}

function DeviceBadge({ user }: { user: VpnUserRow }) {
  const device = detectPlatform(user);
  const label = deviceLabels[device] || device;
  const style = deviceBadgeStyles[device] || deviceBadgeStyles.unknown;
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium ${style}`}>
      {label}
    </span>
  );
}

function extractDisplayName(username: string): { primary: string; subtitle: string | null } {
  const tgMatch = username.match(/^tg_(\d+)_\d+$/);
  if (tgMatch) {
    return { primary: tgMatch[1], subtitle: username };
  }
  return { primary: username, subtitle: null };
}

type SortKey = "username" | "server" | "device" | "status" | "traffic" | "expires" | "last_online" | null;
type SortDir = "asc" | "desc";

const statusOrder: Record<string, number> = {
  active: 0,
  limited: 1,
  expired: 2,
  disabled: 3,
  on_hold: 4,
};

function sortUsers(users: VpnUserRow[], key: SortKey, dir: SortDir): VpnUserRow[] {
  if (!key) return users;
  const sorted = [...users].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case "username":
        cmp = a.backend_username.localeCompare(b.backend_username);
        break;
      case "server":
        cmp = (a.server_name || "").localeCompare(b.server_name || "");
        break;
      case "device": {
        const pa = detectPlatform(a);
        const pb = detectPlatform(b);
        cmp = pa.localeCompare(pb);
        break;
      }
      case "status":
        cmp = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
        break;
      case "traffic":
        cmp = (a.used_traffic_bytes || 0) - (b.used_traffic_bytes || 0);
        break;
      case "expires": {
        const ta = a.expires_at ? new Date(a.expires_at).getTime() : 0;
        const tb = b.expires_at ? new Date(b.expires_at).getTime() : 0;
        cmp = ta - tb;
        break;
      }
      case "last_online": {
        const la = a.last_online_at ? new Date(a.last_online_at).getTime() : 0;
        const lb = b.last_online_at ? new Date(b.last_online_at).getTime() : 0;
        cmp = la - lb;
        break;
      }
    }
    return dir === "asc" ? cmp : -cmp;
  });
  return sorted;
}

export default function VpnUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [users, setUsers] = useState<VpnUserRow[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const serverId = searchParams.get("server_id") || "";
  const platform = searchParams.get("platform") || "";
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 50;

  // Fetch server list for filter dropdown
  useEffect(() => {
    fetch("/api/admin/vpn/servers")
      .then((r) => r.json())
      .then((json) => setServers(json.servers || []))
      .catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      if (serverId) params.set("server_id", serverId);
      if (platform) params.set("platform", platform);
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      params.set("offset", String((page - 1) * limit));
      params.set("limit", String(limit));

      const res = await fetch(`/api/admin/vpn/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      setUsers(json.users || []);
      setUsersTotal(json.total || 0);
      setUsersError("");
    } catch {
      setUsersError("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, [serverId, platform, status, search, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin-dvpn/vpn-users?${params}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) {
      params.set("page", String(p));
    } else {
      params.delete("page");
    }
    router.push(`/admin-dvpn/vpn-users?${params}`);
  }

  function clearFilters() {
    router.push("/admin-dvpn/vpn-users");
  }

  async function handleDelete(user: VpnUserRow) {
    if (
      !confirm(
        `Delete "${user.backend_username}" from ${user.server_name}? This removes the user from Supabase.`
      )
    )
      return;
    setDeleting(user.id);
    try {
      const res = await fetch(`/api/admin/vpn/users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchUsers();
    } catch {
      setUsersError("Failed to delete user");
    } finally {
      setDeleting(null);
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "traffic" ? "desc" : "asc");
    }
  }

  const sortedUsers = sortUsers(users, sortKey, sortDir);
  const totalPages = Math.ceil(usersTotal / limit);
  const hasUserFilters = serverId || platform || status || search;

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-text-muted/30 ml-1">&#8597;</span>;
    return <span className="text-accent-teal ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">
            VPN Users
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {usersTotal} user{usersTotal !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-3 py-2 text-xs border border-overlay/10 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 cursor-pointer transition-colors self-start sm:self-auto"
        >
          Refresh
        </button>
      </div>

      {usersError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {usersError}
        </div>
      )}

      {/* VPN Stats Dashboard */}
      <VpnStats />

      {/* Filters */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 mb-6">
        <select
          value={serverId}
          onChange={(e) => updateFilter("server_id", e.target.value)}
          className="px-3 py-2 bg-bg-secondary border border-overlay/10 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-teal cursor-pointer"
        >
          <option value="">All Servers</option>
          {servers.map((srv) => (
            <option key={srv.id} value={srv.id}>
              {srv.country_code} — {srv.name}
            </option>
          ))}
        </select>

        <select
          value={platform}
          onChange={(e) => updateFilter("platform", e.target.value)}
          className="px-3 py-2 bg-bg-secondary border border-overlay/10 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-teal cursor-pointer"
        >
          <option value="">All Devices</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          <option value="telegram">Telegram</option>
          <option value="desktop">Desktop</option>
          <option value="unknown">Unknown</option>
        </select>

        <select
          value={status}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="px-3 py-2 bg-bg-secondary border border-overlay/10 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-teal cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="expired">Expired</option>
          <option value="limited">Limited</option>
        </select>

        <input
          type="text"
          placeholder="Search username..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              updateFilter(
                "search",
                (e.target as HTMLInputElement).value
              );
          }}
          className="col-span-2 sm:col-span-1 px-3 py-2 bg-bg-secondary border border-overlay/10 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-teal sm:w-48"
        />

        {hasUserFilters && (
          <button
            onClick={clearFilters}
            className="col-span-2 sm:col-span-1 px-3 py-2 text-xs text-text-muted hover:text-text-primary border border-overlay/10 rounded-lg hover:bg-overlay/5 transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Users table - desktop */}
      <div className="hidden md:block bg-bg-secondary border border-overlay/10 rounded-lg overflow-hidden">
        {usersLoading ? (
          <AdminLoader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-overlay/10 text-text-muted text-left">
                  <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => toggleSort("username")}>
                    Username<SortIcon col="username" />
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => toggleSort("server")}>
                    Server<SortIcon col="server" />
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => toggleSort("device")}>
                    Device<SortIcon col="device" />
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => toggleSort("status")}>
                    Status<SortIcon col="status" />
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => toggleSort("traffic")}>
                    Traffic<SortIcon col="traffic" />
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => toggleSort("expires")}>
                    Expires<SortIcon col="expires" />
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => toggleSort("last_online")}>
                    Last Online<SortIcon col="last_online" />
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((u) => {
                  const { primary, subtitle } = extractDisplayName(u.backend_username);
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-overlay/5 hover:bg-overlay/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <span className="text-text-primary font-medium">
                          {primary}
                        </span>
                        {subtitle && (
                          <span className="block text-[11px] text-text-muted">
                            {subtitle}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        <span className="mr-1">
                          {countryFlag(u.server_country_code)}
                        </span>
                        {u.server_name}
                      </td>
                      <td className="px-4 py-3">
                        <DeviceBadge user={u} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs ${statusColors[u.status] || "text-text-muted"}`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {formatBytes(u.used_traffic_bytes)}
                        {u.data_limit_bytes
                          ? ` / ${formatBytes(u.data_limit_bytes)}`
                          : ""}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {formatDate(u.expires_at)}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {formatDate(u.last_online_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={deleting === u.id}
                          className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deleting === u.id ? "..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {sortedUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-text-muted"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Users cards - mobile */}
      <div className="md:hidden space-y-3">
        {usersLoading ? (
          <AdminLoader />
        ) : sortedUsers.length === 0 ? (
          <p className="text-center text-text-muted py-8">No users found</p>
        ) : (
          sortedUsers.map((u) => {
            const { primary, subtitle } = extractDisplayName(u.backend_username);
            return (
              <div
                key={u.id}
                className="bg-bg-secondary border border-overlay/10 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <span className="text-text-primary font-medium text-sm">
                      {primary}
                    </span>
                    {subtitle && (
                      <span className="block text-[11px] text-text-muted truncate">
                        {subtitle}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs ${statusColors[u.status] || "text-text-muted"}`}
                  >
                    {u.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted items-center">
                  <span>
                    {countryFlag(u.server_country_code)} {u.server_name}
                  </span>
                  <DeviceBadge user={u} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                  <span>
                    Traffic: {formatBytes(u.used_traffic_bytes)}
                    {u.data_limit_bytes ? ` / ${formatBytes(u.data_limit_bytes)}` : ""}
                  </span>
                  <span>Expires: {formatDate(u.expires_at)}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-text-muted">
                    Last online: {formatDate(u.last_online_at)}
                  </span>
                  <button
                    onClick={() => handleDelete(u)}
                    disabled={deleting === u.id}
                    className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deleting === u.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-text-muted">
            Showing {(page - 1) * limit + 1}-
            {Math.min(page * limit, usersTotal)} of {usersTotal}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs border border-overlay/10 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs border border-overlay/10 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 disabled:opacity-30 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
