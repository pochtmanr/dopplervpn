"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CARD_HAIRLINE, CARD_SURFACE } from "@/components/ui/card-recipes";
import type { IpInfo } from "@/app/api/ip/route";

type Status = "loading" | "loaded" | "error";
/** undefined = still asking, null = this family has no route from the browser. */
type Family = string | null | undefined;
type Notice = "first" | "changed" | "unchanged";

const LAST_IP_KEY = "doppler:last-ip";

/**
 * ipify's single-stack hosts: api4 has only an A record and api6 only AAAA, so
 * each answers with the address of that family or fails. /api/ip alone only
 * ever sees whichever family the browser happened to pick.
 * Allowed by the route-scoped CSP in next.config.ts.
 */
async function familyIp(host: "api4" | "api6"): Promise<string | null> {
  try {
    const res = await fetch(`https://${host}.ipify.org?format=json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return ((await res.json()) as { ip?: string }).ip ?? null;
  } catch {
    return null;
  }
}

function readLastIp(): string | null {
  try {
    return localStorage.getItem(LAST_IP_KEY);
  } catch {
    return null;
  }
}

function writeLastIp(ip: string) {
  try {
    localStorage.setItem(LAST_IP_KEY, ip);
  } catch {
    // Private mode or blocked storage: the notice just stays "first check".
  }
}

export function IpCheckerWidget() {
  const t = useTranslations("toolsIpChecker.widget");
  const locale = useLocale();
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [v4, setV4] = useState<Family>(undefined);
  const [v6, setV6] = useState<Family>(undefined);
  const [notice, setNotice] = useState<{ kind: Notice; previous?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Each run gets an id; a slower answer from an earlier run (ipify can take
  // 3s, e.g. while a VPN is coming up) must not overwrite a newer one.
  const runId = useRef(0);
  const run = useCallback(async () => {
    const id = ++runId.current;
    const current = () => id === runId.current;
    setStatus((s) => (s === "error" ? "loading" : s));
    setV4(undefined);
    setV6(undefined);
    familyIp("api4").then((ip) => current() && setV4(ip));
    familyIp("api6").then((ip) => current() && setV6(ip));
    try {
      const res = await fetch("/api/ip?details=1", {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error("non-2xx");
      const data: IpInfo = await res.json();
      if (!current()) return;
      const previous = readLastIp();
      setNotice(
        !previous
          ? { kind: "first" }
          : previous === data.ip
            ? { kind: "unchanged" }
            : { kind: "changed", previous },
      );
      writeLastIp(data.ip);
      setInfo(data);
      setStatus("loaded");
    } catch {
      if (current()) setStatus("error");
    }
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  async function handleRefresh() {
    setRefreshing(true);
    await run();
    setRefreshing(false);
  }

  useEffect(() => {
    run();
  }, [run]);

  async function handleCopy() {
    if (!info?.ip) return;
    try {
      await navigator.clipboard.writeText(info.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can fail in non-HTTPS contexts; silent fallback is fine.
    }
  }

  const countryName = useMemo(() => {
    if (!info?.country) return null;
    try {
      return new Intl.DisplayNames([locale], { type: "region" }).of(info.country) ?? info.country;
    } catch {
      return info.country;
    }
  }, [info?.country, locale]);

  const place = [info?.city, info?.region].filter(Boolean).join(", ");
  const loading = status === "loading";
  const busy = loading || v4 === undefined || v6 === undefined;

  if (status === "error") {
    return (
      <div className={`${CARD_SURFACE} items-center p-8 sm:p-12 text-center`}>
        <div className={CARD_HAIRLINE} />
        <p className="text-text-muted max-w-md">{t("error")}</p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="cta-key mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
        >
          <RefreshIcon spinning={refreshing} />
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className={CARD_SURFACE}>
      <div className={CARD_HAIRLINE} />
      <div className="grid lg:grid-cols-5">
        {/* Address */}
        <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10 flex flex-col">
          <div className="flex items-center gap-3">
            <span className="text-xs md:text-sm uppercase tracking-wider text-text-tertiary">
              {t("yourIp")}
            </span>
            {info && (
              <span className="rounded-full border border-accent-teal/25 bg-accent-teal/10 px-2.5 py-0.5 font-mono text-[11px] text-accent-teal-light">
                IPv{info.version}
              </span>
            )}
          </div>

          <div
            className={`mt-3 min-h-[3rem] sm:min-h-[3.75rem] font-mono text-3xl sm:text-5xl font-medium text-text-primary break-all leading-tight transition-opacity ${
              refreshing ? "opacity-50" : ""
            }`}
            aria-live="polite"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="sr-only">{t("loading")}</span>
                <span className="block h-10 sm:h-12 w-4/5 max-w-sm rounded-lg bg-overlay/[0.06] animate-pulse" />
              </>
            ) : (
              <bdi dir="ltr">{info?.ip}</bdi>
            )}
          </div>

          <div className="mt-3 min-h-6 flex items-center gap-2 text-text-muted">
            {loading ? (
              <span className="block h-4 w-48 rounded bg-overlay/[0.06] animate-pulse" />
            ) : countryName ? (
              <>
                <PinIcon />
                <span className="font-mono text-xs rounded border border-overlay/10 px-1.5 py-0.5 text-text-tertiary">
                  {info?.country}
                </span>
                <span>
                  {place ? `${place} · ` : ""}
                  {countryName}
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={loading || !info?.ip}
              className="cta-flat inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? t("copied") : t("copy")}
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="cta-key inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
            >
              <RefreshIcon spinning={refreshing} />
              {refreshing ? t("refreshing") : t("refresh")}
            </button>
          </div>

          <div className="mt-auto pt-6">
            <p
              className={`min-h-10 flex gap-2.5 border-t border-dashed border-overlay/10 pt-4 text-sm leading-snug ${
                notice?.kind === "changed" ? "text-accent-teal-light" : "text-text-muted"
              }`}
            >
              {notice && (
                <>
                  <span aria-hidden="true" className="font-mono text-accent-teal-light">
                    {notice.kind === "changed" ? "✓" : "▸"}
                  </span>
                  <span>
                    {notice.kind === "changed"
                      ? t("changed", {
                          // LRI…PDI: an IPv6 address would reorder inside RTL text.
                          previous: `\u2066${notice.previous ?? ""}\u2069`,
                        })
                      : notice.kind === "unchanged"
                        ? t("unchanged")
                        : t("firstCheck")}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Receipt */}
        <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-s border-overlay/5 bg-bg-secondary/30 p-6 sm:p-8 lg:p-10">
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
              whois
            </span>
            <span className="h-px flex-1 border-t border-dashed border-overlay/20" />
          </div>
          <h2 className="sr-only">{t("details")}</h2>

          <dl className="mt-4 divide-y divide-dashed divide-overlay/10 text-sm">
            <Row label={t("isp")} value={info?.isp} loading={loading} unknown={t("unknown")} />
            <Row label={t("asn")} value={info?.asn} loading={loading} unknown={t("unknown")} />
            <Row label={t("timezone")} value={info?.timezone} loading={loading} unknown={t("unknown")} />
            <Row
              label={t("coordinates")}
              value={
                info?.latitude != null && info?.longitude != null
                  ? `${info.latitude.toFixed(2)}, ${info.longitude.toFixed(2)}`
                  : null
              }
              loading={loading}
              unknown={t("unknown")}
            />
            <Row label={t("ipv4")} value={v4} loading={v4 === undefined} unknown={t("notAvailable")} />
            <Row label={t("ipv6")} value={v6} loading={v6 === undefined} unknown={t("notAvailable")} stack={!!v6} />
          </dl>

          {v6 === null && <p className="mt-3 text-xs text-text-tertiary">{t("ipv6Hint")}</p>}

          <p className="mt-5 font-mono text-xs text-text-tertiary" aria-hidden="true">
            <span className="text-accent-teal-light">{busy ? "…" : "✓"}</span> lookup{" "}
            {busy ? "running" : "complete"}
            <span className="terminal-cursor ms-1 text-accent-teal-light">▌</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  loading,
  unknown,
  stack = false,
}: {
  label: string;
  value: string | null | undefined;
  loading: boolean;
  unknown: string;
  /** Label above value — for an IPv6 address, which would wrap mid-group beside its label. */
  stack?: boolean;
}) {
  return (
    <div
      className={
        stack
          ? "flex flex-col items-start gap-1 py-2.5"
          : "flex items-baseline justify-between gap-4 py-2.5"
      }
    >
      <dt className="shrink-0 text-text-muted">{label}</dt>
      <dd
        className={`min-w-0 font-mono text-text-primary break-all ${stack ? "text-[13px]" : "text-end"}`}
      >
        {loading ? (
          <span className="inline-block h-3.5 w-24 rounded bg-overlay/[0.06] animate-pulse align-middle" />
        ) : value ? (
          // Isolated so an IPv6 address or "lat, lon" keeps its order in RTL.
          <bdi dir="ltr">{value}</bdi>
        ) : (
          <span className="text-text-tertiary">{unknown}</span>
        )}
      </dd>
    </div>
  );
}

const iconProps = {
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.75,
  stroke: "currentColor",
  "aria-hidden": true,
} as const;

function CopyIcon() {
  return (
    <svg className="w-4 h-4" {...iconProps}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-accent-teal" {...iconProps} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg className={`w-4 h-4 ${spinning ? "motion-safe:animate-spin" : ""}`} {...iconProps} strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 text-accent-teal" {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}
