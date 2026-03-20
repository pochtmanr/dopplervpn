"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLoader } from "@/components/admin/admin-loader";

interface DashboardData {
  accounts: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    tierBreakdown: Record<string, number>;
  };
  subscriptions: { active: number };
  telegram: {
    total: number;
    bySource: Record<string, number>;
    channelMembers: number;
    activeUsers24h: number;
    totalMessages: number;
  };
  devices: {
    total: number;
    byType: Record<string, number>;
  };
  recentSignups: Array<{
    id: string;
    account_code: string;
    subscription_tier: string;
    created_at: string;
    telegram_links: Array<{
      username: string | null;
      first_name: string | null;
      bot_source: string | null;
      last_active_at: string | null;
      is_channel_member: boolean;
    }> | null;
  }>;
  escalations: Array<{
    id: string;
    telegram_user_id: string;
    content: string;
    template_key: string | null;
    created_at: string;
  }>;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-bg-secondary border border-overlay/10 rounded-xl p-4 sm:p-5 flex items-start gap-4 ${
        onClick
          ? "cursor-pointer hover:border-accent-teal/30 hover:bg-overlay/5 active:scale-[0.98] transition-all"
          : ""
      }`}
      onClick={onClick}
    >
      <div className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-text-muted text-xs sm:text-sm">{label}</p>
        <p className="text-xl sm:text-2xl font-semibold text-text-primary leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-text-muted text-xs mt-1 truncate">{sub}</p>}
      </div>
      {onClick && (
        <svg className="w-4 h-4 text-text-muted shrink-0 mt-1 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </div>
  );
}

function formatRelative(iso: string | null) {
  if (!iso) return "\u2014";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const r = await fetch("/api/admin/dashboard");
        if (!r.ok) throw new Error("Failed to load dashboard");
        const json = await r.json();
        setData(json);
      } catch (e) {
        setError((e as Error).message);
      }
    }
    loadDashboard();
  }, []);

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!data) {
    return <AdminLoader />;
  }

  const paidCount = Object.entries(data.accounts.tierBreakdown)
    .filter(([tier]) => tier !== "free")
    .reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">Dashboard</h1>

      {/* Top row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Users"
          value={data.accounts.total}
          sub={`+${data.accounts.today} today \u00B7 +${data.accounts.thisWeek} this week`}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
          onClick={() => router.push("/admin-dvpn/accounts")}
        />
        <StatCard
          label="Paid Subscribers"
          value={paidCount}
          sub={`${data.subscriptions.active} active`}
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          }
          onClick={() => router.push("/admin-dvpn/accounts")}
        />
        <StatCard
          label="Telegram Users"
          value={data.telegram.total}
          sub={Object.entries(data.telegram.bySource).map(([k, v]) => `${k}: ${v}`).join(" \u00B7 ")}
          iconBg="bg-sky-500/10"
          iconColor="text-sky-400"
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          }
        />
        <StatCard
          label="Channel Members"
          value={data.telegram.channelMembers}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
            </svg>
          }
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Active (24h)"
          value={data.telegram.activeUsers24h}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
        />
        <StatCard
          label="Support Escalations"
          value={data.escalations.length}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          }
          onClick={() => router.push("/admin-dvpn/messages")}
        />
        <StatCard
          label="VPN Servers"
          value="View"
          sub="Infrastructure & health"
          iconBg="bg-accent-teal/10"
          iconColor="text-accent-teal"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
            </svg>
          }
          onClick={() => router.push("/admin-dvpn/vpn-servers")}
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <a
          href="https://app.revenuecat.com/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-bg-secondary border border-overlay/10 rounded-xl p-4 flex items-center gap-4 hover:border-accent-teal/30 hover:bg-overlay/5 active:scale-[0.98] transition-all group"
        >
          <div className="shrink-0 w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">RevenueCat</p>
            <p className="text-xs text-text-muted">Revenue & subscriptions</p>
          </div>
          <svg className="w-4 h-4 text-text-muted group-hover:text-accent-teal transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>

        <a
          href="https://vercel.com/romans-projects-ed45aa5a/dopplerland"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-bg-secondary border border-overlay/10 rounded-xl p-4 flex items-center gap-4 hover:border-accent-teal/30 hover:bg-overlay/5 active:scale-[0.98] transition-all group"
        >
          <div className="shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-text-primary">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L24 22H0L12 1Z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">Vercel</p>
            <p className="text-xs text-text-muted">Deployments & logs</p>
          </div>
          <svg className="w-4 h-4 text-text-muted group-hover:text-accent-teal transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>

        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-bg-secondary border border-overlay/10 rounded-xl p-4 flex items-center gap-4 hover:border-accent-teal/30 hover:bg-overlay/5 active:scale-[0.98] transition-all group"
        >
          <div className="shrink-0 w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary">Search Console</p>
            <p className="text-xs text-text-muted">SEO & indexing</p>
          </div>
          <svg className="w-4 h-4 text-text-muted group-hover:text-accent-teal transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>

      {/* Device stats */}
      {data.devices.total > 0 && (
        <div className="bg-bg-secondary border border-overlay/10 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <h2 className="text-sm font-medium text-text-muted">Device Sessions ({data.devices.total})</h2>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-text-primary">
            {Object.entries(data.devices.byType).map(([type, count]) => (
              <span key={type}>{type}: {count}</span>
            ))}
          </div>
        </div>
      )}

      {/* Escalations */}
      {data.escalations.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-3">Support Escalations</h2>

          {/* Desktop table */}
          <div className="hidden sm:block bg-bg-secondary border border-overlay/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-overlay/10 text-text-muted text-left">
                    <th className="px-4 py-3 font-medium">User ID</th>
                    <th className="px-4 py-3 font-medium">Content</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.escalations.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-overlay/5 text-text-primary cursor-pointer hover:bg-overlay/[0.02]"
                      onClick={() => router.push(`/admin-dvpn/messages/${e.telegram_user_id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs">{e.telegram_user_id}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{e.content}</td>
                      <td className="px-4 py-3 text-text-muted">{e.template_key || "message"}</td>
                      <td className="px-4 py-3 text-text-muted">{formatRelative(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-2">
            {data.escalations.map((e) => (
              <div
                key={e.id}
                className="bg-bg-secondary border border-overlay/10 rounded-lg p-3 cursor-pointer hover:bg-overlay/5 active:scale-[0.98] transition-all"
                onClick={() => router.push(`/admin-dvpn/messages/${e.telegram_user_id}`)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                    </div>
                    <p className="text-sm text-text-primary truncate">{e.content}</p>
                  </div>
                  <span className="text-xs text-text-muted shrink-0">{formatRelative(e.created_at)}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 ml-10 text-xs text-text-muted">
                  <span className="font-mono">{e.telegram_user_id}</span>
                  {e.template_key && <span>{e.template_key}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
