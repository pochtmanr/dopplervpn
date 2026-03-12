"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { localeConfig } from "@/lib/languages";

interface DesktopNavProps {
  logo: ReactNode;
  controls: ReactNode;
  mobile: ReactNode;
}

export function DesktopNav({ logo, controls, mobile }: DesktopNavProps) {
  const [langOpen, setLangOpen] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setHasAccount(!!localStorage.getItem("doppler_account_id"));
  }, []);

  // Close language panel when navbar goes compact
  useEffect(() => {
    const header = navRef.current?.closest("[data-compact]");
    if (header) setLangOpen(false);
  });

  const close = useCallback(() => setLangOpen(false), []);

  const toggleLang = useCallback(() => {
    setLangOpen((prev) => !prev);
  }, []);

  const switchLocale = useCallback(
    (newLocale: string) => {
      router.replace(pathname, { locale: newLocale });
      setLangOpen(false);
    },
    [router, pathname]
  );

  useEffect(() => {
    if (!langOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [langOpen, close]);

  const currentLang = localeConfig[locale] || localeConfig.en;

  return (
    <nav
      ref={navRef}
      className={`relative mx-auto bg-bg-primary/90 backdrop-blur-xl shadow-sm shadow-overlay/5 overflow-hidden transition-[max-width,border-radius] duration-300 ease-out max-w-7xl group-data-[compact]:max-w-[4.5rem] ${
        langOpen ? "rounded-2xl" : "rounded-full"
      }`}
    >
      {/* Main bar row */}
      <div className="flex items-center justify-between h-12 sm:h-14 group-data-[compact]:h-10 transition-[height] duration-300 px-3 sm:px-4 group-data-[compact]:px-2">
        {logo}

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5 transition-opacity duration-200 group-data-[compact]:opacity-0 group-data-[compact]:pointer-events-none">
          <Link
            href="/downloads"
            className="text-text-muted hover:text-text-primary transition-colors text-sm font-medium px-3 py-2"
          >
            {t("downloads")}
          </Link>

          <Link
            href="/support"
            className="text-text-muted hover:text-text-primary transition-colors text-sm font-medium px-3 py-2"
          >
            {t("support")}
          </Link>

          <Link
            href="/account"
            className="ml-1 px-4 py-1.5 text-sm font-semibold rounded-full bg-accent-teal text-bg-primary hover:bg-accent-teal/90 transition-colors"
          >
            {hasAccount ? t("account") : t("getPro")}
          </Link>
        </div>

        {/* Right side controls (desktop) */}
        <div className="hidden md:flex items-center gap-1.5 transition-opacity duration-200 group-data-[compact]:opacity-0 group-data-[compact]:pointer-events-none">
          {controls}

          {/* Language trigger */}
          <button
            onClick={toggleLang}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
              langOpen
                ? "bg-bg-secondary text-text-primary"
                : "bg-bg-secondary/50 text-text-primary hover:bg-bg-secondary"
            }`}
            aria-expanded={langOpen}
            aria-haspopup="true"
            aria-controls="language-panel"
          >
            <span className="text-base leading-none">{currentLang.flag}</span>
            <span>{currentLang.label}</span>
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${
                langOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Mobile hamburger */}
        {mobile}
      </div>

      {/* Language dropdown panel */}
      <div
        className={`grid transition-[grid-template-rows] duration-[180ms] ease-out ${
          langOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        role="menu"
      >
        <div className="overflow-hidden">
          {langOpen && (
            <div
              id="language-panel"
              aria-label="Select language"
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1.5 px-2.5 pb-2.5"
            >
              {routing.locales.map((loc) => {
                const config = localeConfig[loc] || { label: loc, flag: "", name: loc };
                const isActive = locale === loc;
                return (
                  <button
                    key={loc}
                    role="menuitem"
                    tabIndex={langOpen ? 0 : -1}
                    onClick={() => switchLocale(loc)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-150 min-w-0 ${
                      isActive
                        ? "bg-accent-teal/15 text-accent-teal ring-1 ring-accent-teal/20"
                        : "hover:bg-overlay/5 text-text-muted hover:text-text-primary"
                    }`}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`Switch to ${config.name}`}
                  >
                    <span className="text-base leading-none shrink-0">{config.flag}</span>
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
          )}
        </div>
      </div>
    </nav>
  );
}
