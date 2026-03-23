"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { detectPlatform, type Platform } from "@/lib/detect-platform";
import { trackCta } from "@/lib/track-cta";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=org.dopplervpn.android";

export function BlogInlineCta() {
  const t = useTranslations("blog.inlineCta");
  const [platform, setPlatform] = useState<Platform>("desktop");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const config = {
    ios: { href: APP_STORE_URL, label: t("downloadIos"), icon: <AppleIcon /> },
    android: { href: GOOGLE_PLAY_URL, label: t("downloadAndroid"), icon: <PlayIcon /> },
    desktop: { href: "/downloads", label: t("downloadDesktop"), icon: <DownloadIcon /> },
  }[platform];

  const handleClick = () => {
    trackCta("blog-inline", platform);
  };

  return (
    <div className="not-prose my-10 rounded-xl border-s-4 border-accent-teal bg-accent-teal/5 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-text-primary mb-1">
            {t("headline")}
          </p>
          <p className="text-sm text-text-muted">
            {t("subtext")}
          </p>
        </div>
        <a
          href={config.href}
          target={platform === "desktop" ? undefined : "_blank"}
          rel={platform === "desktop" ? undefined : "noopener noreferrer"}
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent-teal text-bg-primary hover:bg-accent-teal/90 transition-colors text-sm font-medium whitespace-nowrap flex-shrink-0"
        >
          {config.icon}
          {config.label}
        </a>
      </div>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}
