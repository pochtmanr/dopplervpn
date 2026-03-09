"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type Platform = "ios" | "android" | "desktop";

interface HeroCTAsProps {
  platform: Platform;
}

export function HeroCTAs({ platform: _platform }: HeroCTAsProps) {
  const t = useTranslations("hero");

  return (
    <div className="flex flex-row items-center justify-center lg:justify-start gap-3">
      <Link
        href="/downloads"
        className="inline-flex items-center gap-2 px-5 py-3 bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 rounded-lg transition-colors text-sm font-medium"
      >
        {t("downloadApp")}
      </Link>
      <a
        href="#pricing"
        className="inline-flex items-center gap-2 px-5 py-3 border border-overlay/20 text-text-muted hover:text-text-primary hover:border-overlay/40 rounded-lg transition-colors text-sm font-medium"
      >
        {t("seePrices")}
      </a>
    </div>
  );
}
