"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trackCta, type CtaLocation } from "@/lib/track-cta";
import type { Platform } from "@/lib/detect-platform";
export type { Platform };

const APP_STORE_URL =
  "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=org.dopplervpn.android";
const WINDOWS_X64_URL = "/api/windows/download/latest-x64";

interface HeroCTAsProps {
  platform: Platform;
  /** false until the platform is detected; the primary button is hidden until then. */
  ready?: boolean;
  /** Analytics location. Homepage hero stays `"hero"`. */
  location?: CtaLocation;
  /** Secondary button href. Hash links stay `<a>`; anything else is an i18n `Link`. */
  secondaryHref?: string;
  secondaryLabel?: string;
  /** Homepage is start-aligned on lg; centered pages pass true. */
  centered?: boolean;
}

export function HeroCTAs({
  platform,
  ready = true,
  location = "hero",
  secondaryHref = "#pricing",
  secondaryLabel,
  centered = false,
}: HeroCTAsProps) {
  const t = useTranslations("hero");

  const downloadConfig = {
    ios: { href: APP_STORE_URL, label: t("downloadIos"), external: true, download: false, icon: <AppleIcon /> },
    android: { href: GOOGLE_PLAY_URL, label: t("downloadAndroid"), external: true, download: false, icon: <PlayIcon /> },
    mac: { href: APP_STORE_URL, label: t("downloadMac"), external: true, download: false, icon: <AppleIcon /> },
    windows: { href: WINDOWS_X64_URL, label: t("downloadWindows"), external: false, download: true, icon: <WindowsIcon /> },
    desktop: { href: "/downloads" as const, label: t("downloadApp"), external: false, download: false, icon: <DownloadIcon /> },
  }[platform];

  const primaryVariant =
    platform === "android" ? "android-play" : platform === "windows" ? "windows-x64" : undefined;
  const handlePrimaryClick = () => trackCta(location, platform, primaryVariant);

  /* `cta-key` (globals.css) is the keycap: cap gradient, inset bevel, hard
     skirt and a real press on :active. No `bg-*` utility here — the gradient
     is the background, and a utility would paint over it. */
  const primaryClass =
    `cta-key inline-flex items-center justify-center gap-2 px-5 py-3 w-full sm:w-auto text-center text-white rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary ${ready ? "hero-cta-in" : "opacity-0"}`;

  /* Filled, but flat on purpose: the deck the key sits on. No bevel, no travel. */
  const secondaryClass =
    "cta-flat inline-flex items-center justify-center gap-2 px-5 py-3 w-full sm:w-auto text-center rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary";

  const downloadBtn = downloadConfig.external ? (
    <a
      href={downloadConfig.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handlePrimaryClick}
      className={primaryClass}
    >
      {downloadConfig.icon}
      {downloadConfig.label}
    </a>
  ) : downloadConfig.download ? (
    <a
      href={downloadConfig.href}
      download
      onClick={handlePrimaryClick}
      className={primaryClass}
    >
      {downloadConfig.icon}
      {downloadConfig.label}
    </a>
  ) : (
    <Link
      href="/downloads"
      onClick={handlePrimaryClick}
      className={primaryClass}
    >
      {downloadConfig.icon}
      {downloadConfig.label}
    </Link>
  );

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-3 w-full ${centered ? "justify-center" : "justify-center lg:justify-start"}`}>
      {downloadBtn}
      {secondaryHref.startsWith("#") ? (
        <a href={secondaryHref} className={secondaryClass}>
          {secondaryLabel ?? t("seePrices")}
        </a>
      ) : (
        <Link href={secondaryHref} className={secondaryClass}>
          {secondaryLabel ?? t("seePrices")}
        </Link>
      )}
    </div>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .08V5.67L20 3zM3 13l6 .09v6.81l-6-1.15V13zm7 .18l10 .08V21l-10-1.76V13.18z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}
