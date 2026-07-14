"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { detectPlatform, type Platform } from "@/lib/detect-platform";
import { trackCta } from "@/lib/track-cta";

// Mirrors hero-ctas.tsx (those constants live in another client module's scope)
const APP_STORE_URL = "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=org.dopplervpn.android";
const WINDOWS_X64_URL = "/api/windows/download/latest-x64";

/**
 * Persistent download bar for mobile — slides in once the visitor scrolls
 * past the hero so a CTA is always one tap away on the long homepage.
 */
export function MobileStickyCta() {
  const t = useTranslations("hero");
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [show, setShow] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShow(window.scrollY > window.innerHeight * 0.8);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const config = {
    ios: { href: APP_STORE_URL, label: t("downloadIos"), external: true },
    android: { href: GOOGLE_PLAY_URL, label: t("downloadAndroid"), external: true },
    mac: { href: APP_STORE_URL, label: t("downloadMac"), external: true },
    windows: { href: WINDOWS_X64_URL, label: t("downloadWindows"), external: false },
    desktop: { href: "/downloads", label: t("downloadApp"), external: false },
  }[platform];

  const variant =
    platform === "android" ? "android-play" : platform === "windows" ? "windows-x64" : undefined;
  const onClick = () => trackCta("sticky-mobile", platform, variant);

  const primaryClass =
    "flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-accent-teal text-white hover:bg-accent-teal/90 rounded-xl transition-colors text-sm font-semibold";

  return (
    <div
      className={`lg:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-out ${
        show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
      aria-hidden={!show}
    >
      <div className="mx-auto max-w-md flex items-center gap-2 rounded-2xl border border-overlay/10 bg-bg-primary/90 backdrop-blur-md shadow-lg shadow-black/25 p-2">
        {config.external ? (
          <a
            href={config.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
            className={primaryClass}
            tabIndex={show ? 0 : -1}
          >
            {config.label}
          </a>
        ) : platform === "windows" ? (
          <a href={config.href} download onClick={onClick} className={primaryClass} tabIndex={show ? 0 : -1}>
            {config.label}
          </a>
        ) : (
          <Link href="/downloads" onClick={onClick} className={primaryClass} tabIndex={show ? 0 : -1}>
            {config.label}
          </Link>
        )}
        <a
          href="#pricing"
          className="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-overlay/15 text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
          tabIndex={show ? 0 : -1}
        >
          {t("seePrices")}
        </a>
      </div>
    </div>
  );
}
