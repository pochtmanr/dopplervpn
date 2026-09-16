"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { IpInfo } from "@/app/api/ip/route";

type Status = "loading" | "loaded" | "error";

export interface DnsPanelLabels {
  title: string;
  yourIp: string;
  isp: string;
  asn: string;
  location: string;
  unknown: string;
  hint: string;
  error: string;
  refresh: string;
  refreshing: string;
}

/**
 * The receipt half of the DNS leak test card. It shows the visitor's public IP
 * and network — NOT their DNS resolver, which a page cannot see without a
 * wildcard zone and an authoritative nameserver of its own. It is there so the
 * resolver list the external test prints has something to be compared with.
 *
 * Labels come in as props: `toolsDnsLeak` is a server-only namespace
 * (src/i18n/client-namespaces.ts), so this component never calls useTranslations.
 */
export function DnsConnectionPanel({ labels }: { labels: DnsPanelLabels }) {
  const locale = useLocale();
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [refreshing, setRefreshing] = useState(false);

  // A slow answer from an earlier run must not overwrite a newer one.
  const runId = useRef(0);
  const run = useCallback(async () => {
    const id = ++runId.current;
    try {
      const res = await fetch("/api/ip?details=1", {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error("non-2xx");
      const data: IpInfo = await res.json();
      if (id !== runId.current) return;
      setInfo(data);
      setStatus("loaded");
    } catch {
      if (id === runId.current) setStatus("error");
    }
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  async function handleRefresh() {
    setRefreshing(true);
    setStatus((s) => (s === "error" ? "loading" : s));
    await run();
    setRefreshing(false);
  }

  const location = useMemo(() => {
    if (!info?.country) return null;
    let country = info.country;
    try {
      country = new Intl.DisplayNames([locale], { type: "region" }).of(info.country) ?? info.country;
    } catch {
      // Older engines without Intl.DisplayNames: the ISO code is still readable.
    }
    return [info.city, country].filter(Boolean).join(", ");
  }, [info?.country, info?.city, locale]);

  const loading = status === "loading";
  const failed = status === "error";

  return (
    <>
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
          whoami
        </span>
        <span className="h-px flex-1 border-t border-dashed border-overlay/20" />
      </div>
      <h3 className="mt-4 text-xs md:text-sm uppercase tracking-wider text-text-tertiary">
        {labels.title}
      </h3>

      <dl
        className={`mt-2 divide-y divide-dashed divide-overlay/10 text-sm transition-opacity ${
          refreshing ? "opacity-50" : ""
        }`}
        aria-live="polite"
        aria-busy={loading}
      >
        <Row label={labels.yourIp} value={info?.ip} loading={loading} failed={failed} unknown={labels.unknown} />
        <Row label={labels.isp} value={info?.isp} loading={loading} failed={failed} unknown={labels.unknown} />
        <Row label={labels.asn} value={info?.asn} loading={loading} failed={failed} unknown={labels.unknown} />
        <Row
          label={labels.location}
          value={location}
          loading={loading}
          failed={failed}
          unknown={labels.unknown}
          isolate={false}
        />
      </dl>

      <p className="mt-5 flex gap-2.5 border-t border-dashed border-overlay/10 pt-4 text-sm leading-snug text-text-muted">
        <span aria-hidden="true" className="font-mono text-accent-teal-light">
          ▸
        </span>
        <span>{failed ? labels.error : labels.hint}</span>
      </p>

      <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="cta-flat inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshIcon spinning={refreshing} />
          {refreshing ? labels.refreshing : labels.refresh}
        </button>
        <p className="font-mono text-xs text-text-tertiary" aria-hidden="true">
          <span className="text-accent-teal-light">{loading || refreshing ? "…" : failed ? "×" : "✓"}</span>{" "}
          {loading || refreshing ? "lookup running" : failed ? "lookup failed" : "lookup complete"}
          <span className="terminal-cursor ms-1 text-accent-teal-light">▌</span>
        </p>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  loading,
  failed,
  unknown,
  isolate = true,
}: {
  label: string;
  value: string | null | undefined;
  loading: boolean;
  failed: boolean;
  unknown: string;
  /** IPs and AS numbers keep LTR order inside RTL text; a place name should not. */
  isolate?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-text-muted">{label}</dt>
      <dd className="min-w-0 font-mono text-text-primary break-all text-end">
        {loading ? (
          <span className="inline-block h-3.5 w-24 rounded bg-overlay/[0.06] animate-pulse align-middle" />
        ) : value && !failed ? (
          isolate ? <bdi dir="ltr">{value}</bdi> : value
        ) : (
          <span className="text-text-tertiary">{unknown}</span>
        )}
      </dd>
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${spinning ? "motion-safe:animate-spin" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}
