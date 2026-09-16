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
const STORAGE_KEY = "desktop-sticky-cta-dismissed";

/**
 * Desktop download bar — slides in once the visitor scrolls past the hero.
 * Hidden on mobile: iOS Safari tiles backdrop-filter + shadow into laggy bands,
 * and a persistent bar that cannot be dismissed is worse than no bar.
 */
export function MobileStickyCta({ sentinelId }: { sentinelId?: string } = {}) {
  const t = useTranslations("hero");
  const tBar = useTranslations("blog.stickyBar");
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [atSentinel, setAtSentinel] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setDismissed(sessionStorage.getItem(STORAGE_KEY) === "1");
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

  useEffect(() => {
    if (!sentinelId) return;
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setAtSentinel(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  const config = {
    ios: { href: APP_STORE_URL, label: t("downloadIos"), external: true },
    android: { href: GOOGLE_PLAY_URL, label: t("downloadAndroid"), external: true },
    mac: { href: APP_STORE_URL, label: t("downloadMac"), external: true },
    windows: { href: WINDOWS_X64_URL, label: t("downloadWindows"), external: false },
    desktop: { href: "/downloads", label: t("downloadApp"), external: false },
  }[platform];

  const variant =
    platform === "android" ? "android-play" : platform === "windows" ? "windows-x64" : undefined;
  const onClick = () => trackCta("sticky-desktop", platform, variant);

  const visible = show && !dismissed && !atSentinel;

  const primaryClass =
    "cta-key flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl text-sm font-semibold";

  return (
    <div
      className={`hidden lg:block fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
      aria-hidden={!visible}
    >
      <div className="overlay-surface mx-auto max-w-xl flex items-center gap-2 rounded-2xl border border-overlay/10 bg-bg-primary shadow-lg shadow-black/25 p-2">
        {config.external ? (
          <a
            href={config.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
            className={primaryClass}
            tabIndex={visible ? 0 : -1}
          >
            {config.label}
          </a>
        ) : platform === "windows" ? (
          <a href={config.href} download onClick={onClick} className={primaryClass} tabIndex={visible ? 0 : -1}>
            {config.label}
          </a>
        ) : (
          <Link href="/downloads" onClick={onClick} className={primaryClass} tabIndex={visible ? 0 : -1}>
            {config.label}
          </Link>
        )}
        <a
          href="#pricing"
          className="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-overlay/15 text-text-muted hover:text-text-primary transition-colors text-sm font-medium"
          tabIndex={visible ? 0 : -1}
        >
          {t("seePrices")}
        </a>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-3 rounded-xl text-text-muted hover:text-text-primary hover:bg-overlay/10 transition-colors"
          aria-label={tBar("dismissLabel")}
          tabIndex={visible ? 0 : -1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
