"use client";

import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { localeConfig, getFlagUrl } from "@/lib/languages";
import { trackGetPro } from "@/lib/track-cta";
import { ThemeToggle } from "./theme-toggle";

export function MobileNav({ logo }: { logo: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  // See the matching comment in desktop-nav.tsx: this grid holds 44 flag
  // <img> tags, and the drawer around it is always mounted (it animates with
  // opacity/translate), so the collapsed `grid-rows-[0fr]` wrapper is not a
  // reliable guarantee the browser skips the fetches. Defer until first open.
  const [langEverOpened, setLangEverOpened] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Tri-state, not a boolean — see the matching comment in desktop-nav.tsx:
  // null is "not resolved yet", so the CTA never asserts a logged-out
  // destination before localStorage has actually been read.
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    setHasAccount(!!localStorage.getItem("doppler_account_id"));
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setLangOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  const switchLocale = useCallback(
    (newLocale: string) => {
      router.replace(pathname, { locale: newLocale });
      close();
    },
    [router, pathname, close]
  );

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => closeButtonRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (langOpen) setLangEverOpened(true);
  }, [langOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  const currentLang = localeConfig[locale] || localeConfig.en;

  // Same stacked-label trick as desktop-nav.tsx: one grid cell holds both
  // labels, so the pill never resizes when the account state resolves.
  const ctaClass =
    "cta-key cta-key-sm grid place-items-center mx-2 mt-1 px-4 py-2 text-sm font-semibold rounded-full text-white";
  const ctaLabels = (
    <>
      <span
        className={`col-start-1 row-start-1 ${hasAccount === true ? "" : "invisible"}`}
      >
        {t("account")}
      </span>
      <span
        className={`col-start-1 row-start-1 ${hasAccount === false ? "" : "invisible"}`}
      >
        {t("getPro")}
      </span>
    </>
  );

  const overlay = (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      data-open={isOpen || undefined}
      inert={!isOpen}
      className="mnav fixed inset-0 z-[60] md:hidden"
    >
      <div
        className="mnav-backdrop absolute inset-0 bg-black/60"
        onClick={close}
        aria-hidden="true"
      />

      {/* Placed exactly over the navbar pill (navbar.tsx header offsets +
          desktop-nav.tsx bar row), so opening reads as the bar itself
          expanding. Geometry changes there must be mirrored here. */}
      <div className="mnav-panel absolute inset-x-4 sm:inset-x-6 top-[max(1rem,env(safe-area-inset-top))] bg-bg-primary">
        {/* Top row — identical to the closed bar, hamburger becomes close */}
        <div className="flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4">
          <div className="flex shrink-0" onClick={close}>
            {logo}
          </div>
          <button
            ref={closeButtonRef}
            onClick={close}
            className="p-2 -me-2 text-text-primary hover:text-text-muted transition-colors rounded-full"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mnav-body border-t border-overlay/10">
          {/* Nav links — same text size as desktop */}
          <div className="px-2 py-2 space-y-0.5">
            <Link
              href="/#pricing"
              onClick={close}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-colors"
            >
              {t("pricing")}
            </Link>
            <Link
              href="/downloads"
              onClick={close}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-colors"
            >
              {t("downloads")}
            </Link>
            <Link
              href="/support"
              prefetch={false}
              onClick={close}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-colors"
            >
              {t("support")}
            </Link>
            {hasAccount === null ? (
              <span aria-hidden="true" className={`${ctaClass} animate-pulse`}>
                {ctaLabels}
              </span>
            ) : (
              <Link
                href={hasAccount ? "/account" : "/signup"}
                prefetch={false}
                onClick={() => { if (!hasAccount) trackGetPro("nav-mobile"); close(); }}
                className={ctaClass}
              >
                {ctaLabels}
              </Link>
            )}
          </div>

          {/* Language + theme row */}
          <div className="px-2 py-2 border-t border-overlay/10">
            {/* Language accordion */}
            <button
              onClick={() => setLangOpen((prev) => !prev)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-primary hover:bg-overlay/5 transition-colors"
              aria-expanded={langOpen}
              aria-controls="mobile-language-list"
            >
              <span className="flex items-center gap-2">
                <img
                  src={getFlagUrl(currentLang.countryCode)}
                  alt=""
                  width={20}
                  height={20}
                  decoding="async"
                  className="w-5 h-5 rounded-full object-cover"
                />
                {currentLang.name}
              </span>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expandable language grid */}
            <div
              id="mobile-language-list"
              className={`grid transition-[grid-template-rows] duration-[180ms] ease-out ${
                langOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="grid grid-cols-2 gap-1 mt-1 px-1 pb-1 max-h-[50vh] overflow-y-auto">
                  {langEverOpened && routing.locales.map((loc) => {
                    const config = localeConfig[loc] || { label: loc, countryCode: "", name: loc };
                    const isActive = locale === loc;
                    return (
                      <button
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-150 min-w-0 ${
                          isActive
                            ? "bg-accent-teal/15 text-accent-teal ring-1 ring-accent-teal/20"
                            : "text-text-muted hover:text-text-primary hover:bg-overlay/5"
                        }`}
                        aria-current={isActive ? "true" : undefined}
                        aria-label={`Switch to ${config.name}`}
                      >
                        {config.countryCode && (
                          <img
                            src={getFlagUrl(config.countryCode)}
                            alt=""
                            width={20}
                            height={20}
                            loading="lazy"
                            decoding="async"
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                        )}
                        <span className="font-medium truncate">{config.name}</span>
                        {isActive && (
                          <svg className="w-3.5 h-3.5 ms-auto shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Theme toggle */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-medium text-text-muted">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        ref={hamburgerRef}
        onClick={() => setIsOpen(true)}
        className="p-2 -me-2 text-text-primary hover:text-text-muted transition-colors"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Portal overlay to body */}
      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
