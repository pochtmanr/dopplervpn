"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface IpInfo {
  ip: string;
  country: string | null;
  region: string | null;
  city: string | null;
  asn: string | null;
}

type Status = "loading" | "loaded" | "error";

export function IpCheckerWidget() {
  const t = useTranslations("toolsIpChecker.widget");
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  async function fetchIp() {
    try {
      const res = await fetch("/api/ip", { cache: "no-store" });
      if (!res.ok) throw new Error("non-2xx");
      const data: IpInfo = await res.json();
      setInfo(data);
      setStatus("loaded");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    fetchIp();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setStatus("loading");
    await fetchIp();
    setRefreshing(false);
  }

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

  return (
    <div className="rounded-2xl bg-bg-secondary/60 backdrop-blur-sm border border-overlay/5 p-6 sm:p-8">
      {status === "error" ? (
        <p className="text-text-muted text-center py-8">{t("error")}</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 pb-6 border-b border-overlay/5">
            <div className="min-w-0 flex-1">
              <div className="text-text-muted text-xs uppercase tracking-wider mb-2">
                {t("yourIp")}
              </div>
              <div className="font-mono text-3xl sm:text-4xl text-text-primary break-all" aria-live="polite">
                {status === "loading" ? (
                  <span className="text-text-muted">{t("loading")}</span>
                ) : (
                  info?.ip
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                disabled={status !== "loaded" || !info?.ip}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-accent-gold/15 text-accent-gold hover:bg-accent-gold/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? t("copied") : t("copy")}
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors disabled:opacity-50"
              >
                {refreshing ? t("refreshing") : t("refresh")}
              </button>
            </div>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label={t("country")} value={info?.country} unknown={t("unknown")} />
            <Field label={t("region")} value={info?.region} unknown={t("unknown")} />
            <Field label={t("city")} value={info?.city} unknown={t("unknown")} />
            <Field label={t("asn")} value={info?.asn} unknown={t("unknown")} />
          </dl>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  unknown,
}: {
  label: string;
  value: string | null | undefined;
  unknown: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-text-muted text-xs uppercase tracking-wider mb-1">{label}</dt>
      <dd className="font-mono text-sm text-text-primary truncate">{value || unknown}</dd>
    </div>
  );
}
