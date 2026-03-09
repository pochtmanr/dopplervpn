"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type Platform = "ios" | "android" | "desktop";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
const ANDROID_APK = "/downloads/doppler-vpn-v1.2.0.apk";

interface HeroCTAsProps {
  platform: Platform;
}

export function HeroCTAs({ platform }: HeroCTAsProps) {
  const t = useTranslations("hero");

  const downloadConfig = {
    ios: { href: APP_STORE_URL, label: t("downloadIos"), external: true },
    android: { href: ANDROID_APK, label: t("getAndroid"), external: false },
    desktop: { href: "/downloads" as const, label: t("downloadApp"), external: false },
  }[platform];

  const downloadBtn = downloadConfig.external ? (
    <a
      href={downloadConfig.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-3 bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 rounded-lg transition-colors text-sm font-medium"
    >
      {downloadConfig.label}
    </a>
  ) : platform === "android" ? (
    <a
      href={downloadConfig.href}
      download
      className="inline-flex items-center gap-2 px-5 py-3 bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 rounded-lg transition-colors text-sm font-medium"
    >
      {downloadConfig.label}
    </a>
  ) : (
    <Link
      href="/downloads"
      className="inline-flex items-center gap-2 px-5 py-3 bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 rounded-lg transition-colors text-sm font-medium"
    >
      {downloadConfig.label}
    </Link>
  );

  return (
    <div className="flex flex-row items-center justify-center lg:justify-start gap-3">
      {downloadBtn}
      <a
        href="#pricing"
        className="inline-flex items-center gap-2 px-5 py-3 border border-overlay/20 text-text-muted hover:text-text-primary hover:border-overlay/40 rounded-lg transition-colors text-sm font-medium"
      >
        {t("seePrices")}
      </a>
    </div>
  );
}
