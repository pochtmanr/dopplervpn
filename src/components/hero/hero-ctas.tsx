"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import type { Platform } from "@/lib/detect-platform";
export type { Platform };

const APP_STORE_URL =
  "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=org.dopplervpn.android";
const ANDROID_APK = "/downloads/doppler-vpn-v1.2.0.apk";

interface HeroCTAsProps {
  platform: Platform;
}

export function HeroCTAs({ platform }: HeroCTAsProps) {
  const t = useTranslations("hero");

  const downloadConfig = {
    ios: { href: APP_STORE_URL, label: t("downloadIos"), external: true },
    android: { href: GOOGLE_PLAY_URL, label: t("downloadAndroid"), external: true },
    desktop: { href: "/downloads" as const, label: t("downloadApp"), external: false },
  }[platform];

  const downloadBtn = downloadConfig.external ? (
    <a
      href={downloadConfig.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 px-5 py-3 w-full sm:w-auto text-center bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 rounded-lg transition-colors text-sm font-medium"
    >
      {downloadConfig.label}
    </a>
  ) : (
    <Link
      href="/downloads"
      className="inline-flex items-center justify-center gap-2 px-5 py-3 w-full sm:w-auto text-center bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 rounded-lg transition-colors text-sm font-medium"
    >
      {downloadConfig.label}
    </Link>
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full">
      {downloadBtn}
      {platform === "android" && (
        <a
          href={ANDROID_APK}
          download
          className="inline-flex items-center justify-center gap-2 px-5 py-3 w-full sm:w-auto text-center border border-overlay/20 text-text-muted hover:text-text-primary hover:border-overlay/40 rounded-lg transition-colors text-sm font-medium"
        >
          {t("getAndroid")}
        </a>
      )}
      <a
        href="#pricing"
        className="inline-flex items-center justify-center gap-2 px-5 py-3 w-full sm:w-auto text-center border border-overlay/20 text-text-muted hover:text-text-primary hover:border-overlay/40 rounded-lg transition-colors text-sm font-medium"
      >
        {t("seePrices")}
      </a>
    </div>
  );
}
