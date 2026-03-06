"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type Platform = "ios" | "android" | "desktop";
type DesktopOS = "mac" | "windows" | "unknown";

function detectDesktopOS(): DesktopOS {
  const ua = navigator.userAgent.toLowerCase();
  if (/macintosh|mac os/.test(ua)) return "mac";
  if (/windows/.test(ua)) return "windows";
  return "unknown";
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
    </svg>
  );
}

interface HeroCTAsProps {
  platform: Platform;
}

export function HeroCTAs({ platform }: HeroCTAsProps) {
  const t = useTranslations("hero");
  const [os, setOS] = useState<DesktopOS>("unknown");

  useEffect(() => {
    setOS(detectDesktopOS());
  }, []);

  // Primary CTA: platform-aware icon + label
  let primaryIcon: React.ReactNode;
  let primaryLabel: string;
  let targetHref: string;
  let isExternal = false;

  if (platform === "ios") {
    primaryIcon = <AppleIcon />;
    primaryLabel = t("downloadIos");
    targetHref = "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
    isExternal = true;
  } else if (platform === "android") {
    primaryIcon = <AndroidIcon />;
    primaryLabel = t("getAndroid");
    targetHref = "/guide/android";
  } else if (os === "mac") {
    primaryIcon = <AppleIcon />;
    primaryLabel = t("downloadMac");
    targetHref = "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
    isExternal = true;
  } else if (os === "windows") {
    primaryIcon = <MonitorIcon />;
    primaryLabel = t("downloadWindows");
    targetHref = "/guide/windows";
  } else {
    primaryIcon = <MonitorIcon />;
    primaryLabel = t("downloadDesktop");
    targetHref = "/downloads";
  }

  const primaryButton = isExternal ? (
    <a
      href={targetHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={primaryLabel}
      className="inline-flex items-center gap-2 px-5 py-3 bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 rounded-lg transition-colors text-sm font-medium"
    >
      {primaryIcon}
      {primaryLabel}
    </a>
  ) : (
    <Link
      href={targetHref as "/guide/android" | "/guide/windows" | "/downloads"}
      className="inline-flex items-center gap-2 px-5 py-3 bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 rounded-lg transition-colors text-sm font-medium"
    >
      {primaryIcon}
      {primaryLabel}
    </Link>
  );

  return (
    <div className="flex flex-row items-center justify-center lg:justify-start gap-3">
      {primaryButton}
      <a
        href="#pricing"
        className="inline-flex items-center gap-2 px-5 py-3 border border-overlay/20 text-text-muted hover:text-text-primary hover:border-overlay/40 rounded-lg transition-colors text-sm font-medium"
      >
        {t("seePrices")}
      </a>
    </div>
  );
}
