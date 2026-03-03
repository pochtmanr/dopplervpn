"use client";

import { Fragment, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminLoader } from "@/components/admin/admin-loader";

interface AccountRow {
  id: string;
  account_id: string;
  subscription_tier: string;
  max_devices: number;
  created_at: string;
  updated_at: string;
  subscription_expires_at: string | null;
  contact_method: string | null;
  contact_value: string | null;
  language: string | null;
  device_count: number;
  config_count: number;
  active_config_count: number;
}

interface AccountConfig {
  id: number;
  server_id: string | null;
  server_name: string;
  server_country_code: string;
  device_id: string;
  is_active: boolean;
  tier: string;
  expires_at: string | null;
  created_at: string;
  marzban_username: string | null;
}

interface DeviceSession {
  id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  last_active_at: string | null;
  is_main: boolean;
  vpn_connected: boolean;
  created_at: string;
}

interface Stats {
  total_accounts: number;
  pro_subscribers: number;
  with_contact: number;
  active_configs: number;
}

function countryFlag(code: string): string {
  const base = code.slice(0, 2).toUpperCase();
  if (base.length < 2 || !/^[A-Z]{2}$/.test(base)) return code;
  return String.fromCodePoint(
    ...Array.from(base).map((c) => c.codePointAt(0)! - 0x41 + 0x1f1e6),
  );
}

function formatDate(ts: string | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const tierColors: Record<string, string> = {
  free: "bg-gray-400/15 text-gray-400",
  pro: "bg-blue-400/15 text-blue-400",
  premium: "bg-amber-400/15 text-amber-400",
};

function TierBadge({ tier }: { tier: string }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium uppercase ${tierColors[tier] || tierColors.free}`}>
      {tier}
    </span>
  );
}

// Maps UI sort keys to API sort_by params
const sortKeyToApi: Record<string, string> = {
  account_id: "account_id",
  tier: "subscription_tier",
  created: "created_at",
};

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats>({ total_accounts: 0, pro_subscribers: 0, with_contact: 0, active_configs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [configs, setConfigs] = useState<AccountConfig[]>([]);
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [changingTier, setChangingTier] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const tier = searchParams.get("tier") || "";
  const contactMethod = searchParams.get("contact_method") || "";
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort_by") || "";
  const sortDir = searchParams.get("sort_dir") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 50;

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (tier) params.set("tier", tier);
      if (contactMethod) params.set("contact_method", contactMethod);
      if (search) params.set("search", search);
      if (sortBy) params.set("sort_by", sortBy);
      if (sortDir) params.set("sort_dir", sortDir);
      params.set("offset", String((page - 1) * limit));
      params.set("limit", String(limit));

      const res = await fetch(`/api/admin/accounts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch accounts");
      const json = await res.json();
      setAccounts(json.accounts || []);
      setTotal(json.total || 0);
      if (json.stats) setStats(json.stats);
      setError("");
    } catch {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [tier, contactMethod, search, sortBy, sortDir, page, limit]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  async function fetchDetails(accountId: string) {
    if (expandedId === accountId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(accountId);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/admin/accounts/${accountId}/configs`);
      if (!res.ok) throw new Error("Failed to fetch details");
      const json = await res.json();
      setConfigs(json.configs || []);
      setDevices(json.devices || []);
    } catch {
      setConfigs([]);
      setDevices([]);
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleChangeTier(account: AccountRow, newTier: string) {
    if (newTier === account.subscription_tier) return;
    setChangingTier(account.id);
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_tier: newTier }),
      });
      if (!res.ok) throw new Error("Failed to update tier");
      fetchAccounts();
    } catch {
      setError("Failed to update tier");
    } finally {
      setChangingTier(null);
    }
  }

  async function handleDelete(account: AccountRow) {
    if (!confirm(`Delete account ${account.account_id}? This removes the account, all configs, and device sessions permanently.`))
      return;
    setDeleting(account.id);
    try {
      const res = await fetch(`/api/admin/accounts/${account.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      if (expandedId === account.id) setExpandedId(null);
      fetchAccounts();
    } catch {
      setError("Failed to delete account");
    } finally {
      setDeleting(null);
    }
  }

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin-dvpn/accounts?${params}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) {
      params.set("page", String(p));
    } else {
      params.delete("page");
    }
    router.push(`/admin-dvpn/accounts?${params}`);
  }

  function clearFilters() {
    router.push("/admin-dvpn/accounts");
  }

  function toggleSort(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    const apiKey = sortKeyToApi[key] || key;
    if (sortBy === apiKey) {
      params.set("sort_dir", sortDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort_by", apiKey);
      params.set("sort_dir", "asc");
    }
    params.delete("page");
    router.push(`/admin-dvpn/accounts?${params}`);
  }

  const totalPages = Math.ceil(total / limit);
  const hasFilters = tier || contactMethod || search;

  function SortIcon({ apiKey }: { apiKey: string }) {
    if (sortBy !== apiKey) return <span className="text-text-muted/30 ml-1">&#8597;</span>;
    return <span className="text-accent-teal ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">Accounts</h1>
          <p className="text-sm text-text-muted mt-1">
            {total} account{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={fetchAccounts}
          className="px-3 py-2 text-xs border border-overlay/10 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 cursor-pointer transition-colors self-start sm:self-auto"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Accounts", value: stats.total_accounts },
          { label: "Pro / Premium", value: stats.pro_subscribers },
          { label: "With Contact", value: stats.with_contact },
          { label: "Active Configs", value: stats.active_configs },
        ].map((s) => (
          <div key={s.label} className="bg-bg-secondary border border-overlay/10 rounded-lg p-4">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className="text-xl font-semibold text-text-primary mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 mb-6">
        <select
          value={tier}
          onChange={(e) => updateFilter("tier", e.target.value)}
          className="px-3 py-2 bg-bg-secondary border border-overlay/10 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-teal cursor-pointer"
        >
          <option value="">All Tiers</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
        </select>

        <select
          value={contactMethod}
          onChange={(e) => updateFilter("contact_method", e.target.value)}
          className="px-3 py-2 bg-bg-secondary border border-overlay/10 rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-teal cursor-pointer"
        >
          <option value="">All Contacts</option>
          <option value="telegram">Telegram</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="none">No Contact</option>
        </select>

        <input
          type="text"
          placeholder="Search account ID..."
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              updateFilter("search", (e.target as HTMLInputElement).value);
          }}
          className="col-span-2 sm:col-span-1 px-3 py-2 bg-bg-secondary border border-overlay/10 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-teal sm:w-56"
        />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="col-span-2 sm:col-span-1 px-3 py-2 text-xs text-text-muted hover:text-text-primary border border-overlay/10 rounded-lg hover:bg-overlay/5 transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table - desktop */}
      <div className="hidden md:block bg-bg-secondary border border-overlay/10 rounded-lg overflow-hidden">
        {loading ? (
          <AdminLoader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-overlay/10 text-text-muted text-left">
                  <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => toggleSort("account_id")}>
                    Account ID<SortIcon apiKey="account_id" />
                  </th>
                  <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => toggleSort("tier")}>
                    Tier<SortIcon apiKey="subscription_tier" />
                  </th>
                  <th className="px-4 py-3 font-medium">Devices</th>
                  <th className="px-4 py-3 font-medium cursor-pointer select-none hover:text-text-primary transition-colors" onClick={() => toggleSort("created")}>
                    Created<SortIcon apiKey="created_at" />
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <Fragment key={a.id}>
                    <tr
                      className={`border-b border-overlay/5 hover:bg-overlay/[0.02] cursor-pointer ${expandedId === a.id ? "bg-overlay/[0.03]" : ""}`}
                      onClick={() => fetchDetails(a.id)}
                    >
                      <td className="px-4 py-3">
                        <span className="text-text-primary font-mono text-xs">{a.account_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <TierBadge tier={a.subscription_tier} />
                      </td>
                      <td className="px-4 py-3 text-text-muted">{a.device_count}</td>
                      <td className="px-4 py-3 text-text-muted">{formatDate(a.created_at)}</td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={a.subscription_tier}
                          onChange={(e) => handleChangeTier(a, e.target.value)}
                          disabled={changingTier === a.id}
                          className="mr-2 px-1.5 py-0.5 bg-transparent border border-overlay/10 rounded text-[11px] text-text-muted focus:outline-none focus:border-accent-teal cursor-pointer disabled:opacity-50"
                        >
                          <option value="free">free</option>
                          <option value="pro">pro</option>
                          <option value="premium">premium</option>
                        </select>
                        <button
                          onClick={() => handleDelete(a)}
                          disabled={deleting === a.id}
                          className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deleting === a.id ? "..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                    {expandedId === a.id && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 bg-overlay/[0.02] space-y-4">
                          {detailsLoading ? (
                            <p className="text-xs text-text-muted py-2">Loading...</p>
                          ) : (
                            <>
                              {/* Devices */}
                              <div>
                                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">Devices ({devices.length})</p>
                                {devices.length === 0 ? (
                                  <p className="text-xs text-text-muted/50">No devices registered</p>
                                ) : (
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-text-muted/70 text-left">
                                        <th className="px-3 py-1.5 font-medium">Name</th>
                                        <th className="px-3 py-1.5 font-medium">Type</th>
                                        <th className="px-3 py-1.5 font-medium">VPN</th>
                                        <th className="px-3 py-1.5 font-medium">Last Active</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {devices.map((d) => (
                                        <tr key={d.id} className="border-t border-overlay/5">
                                          <td className="px-3 py-1.5 text-text-primary">
                                            {d.device_name || d.device_id.slice(0, 12)}
                                            {d.is_main && <span className="ml-1.5 text-[10px] text-accent-teal">(main)</span>}
                                          </td>
                                          <td className="px-3 py-1.5 text-text-muted">{d.device_type}</td>
                                          <td className="px-3 py-1.5">
                                            <span className={d.vpn_connected ? "text-green-400" : "text-text-muted/50"}>
                                              {d.vpn_connected ? "connected" : "off"}
                                            </span>
                                          </td>
                                          <td className="px-3 py-1.5 text-text-muted">{formatDate(d.last_active_at)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>

                              {/* VPN Configs */}
                              {configs.length > 0 && (
                                <div>
                                  <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">VPN Configs ({configs.length})</p>
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-text-muted/70 text-left">
                                        <th className="px-3 py-1.5 font-medium">Server</th>
                                        <th className="px-3 py-1.5 font-medium">Device</th>
                                        <th className="px-3 py-1.5 font-medium">Status</th>
                                        <th className="px-3 py-1.5 font-medium">Tier</th>
                                        <th className="px-3 py-1.5 font-medium">Expires</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {configs.map((c) => (
                                        <tr key={c.id} className="border-t border-overlay/5">
                                          <td className="px-3 py-1.5 text-text-muted">
                                            {countryFlag(c.server_country_code)} {c.server_name}
                                          </td>
                                          <td className="px-3 py-1.5 text-text-muted font-mono">{c.device_id?.slice(0, 12) || "—"}</td>
                                          <td className="px-3 py-1.5">
                                            <span className={c.is_active ? "text-green-400" : "text-text-muted/50"}>
                                              {c.is_active ? "active" : "inactive"}
                                            </span>
                                          </td>
                                          <td className="px-3 py-1.5">
                                            <TierBadge tier={c.tier} />
                                          </td>
                                          <td className="px-3 py-1.5 text-text-muted">{formatDate(c.expires_at)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                      No accounts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cards - mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <AdminLoader />
        ) : accounts.length === 0 ? (
          <p className="text-center text-text-muted py-8">No accounts found</p>
        ) : (
          accounts.map((a) => (
            <div
              key={a.id}
              className="bg-bg-secondary border border-overlay/10 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-mono text-xs">{a.account_id}</span>
                <TierBadge tier={a.subscription_tier} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                <span>{a.device_count} device{a.device_count !== 1 ? "s" : ""}</span>
                <span>Created: {formatDate(a.created_at)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <select
                  value={a.subscription_tier}
                  onChange={(e) => handleChangeTier(a, e.target.value)}
                  disabled={changingTier === a.id}
                  className="px-1.5 py-0.5 bg-transparent border border-overlay/10 rounded text-[11px] text-text-muted focus:outline-none focus:border-accent-teal cursor-pointer disabled:opacity-50"
                >
                  <option value="free">free</option>
                  <option value="pro">pro</option>
                  <option value="premium">premium</option>
                </select>
                <button
                  onClick={() => handleDelete(a)}
                  disabled={deleting === a.id}
                  className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deleting === a.id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-text-muted">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
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
