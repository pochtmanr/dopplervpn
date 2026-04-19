"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { localeConfig, getFlagUrl } from "@/lib/languages";
import { trackGetPro } from "@/lib/track-cta";

interface DesktopNavProps {
  logo: ReactNode;
  controls: ReactNode;
  mobile: ReactNode;
}

export function DesktopNav({ logo, controls, mobile }: DesktopNavProps) {
  const [langOpen, setLangOpen] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; right?: number; left?: number } | null>(null);
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const langBtnRef = useRef<HTMLButtonElement>(null);
  const langPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setHasAccount(!!localStorage.getItem("doppler_account_id"));
  }, []);

  // Lock navbar expanded while language panel is open
  useEffect(() => {
    const header = navRef.current?.closest("header");
    if (!header) return;
    if (langOpen) {
      header.setAttribute("data-nav-lock", "");
    } else {
      header.removeAttribute("data-nav-lock");
    }
  }, [langOpen]);

  const close = useCallback(() => setLangOpen(false), []);

  const toggleLang = useCallback(() => {
    // Calculate position BEFORE opening so the panel never flashes at (0,0)
    if (!navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const isRtl = document.documentElement.dir === "rtl";
    setPanelPos({
      top: navRect.bottom + 8,
      ...(isRtl
        ? { left: navRect.left }
        : { right: window.innerWidth - navRect.right }),
    });
    setLangOpen((prev) => !prev);
  }, []);

  const switchLocale = useCallback(
    (newLocale: string) => {
      router.replace(pathname, { locale: newLocale });
      setLangOpen(false);
    },
    [router, pathname]
  );

  // Keep panel aligned on resize/scroll while open
  useEffect(() => {
    if (!langOpen || !navRef.current) return;
    const recalc = () => {
      const navRect = navRef.current!.getBoundingClientRect();
      const isRtl = document.documentElement.dir === "rtl";
      setPanelPos({
        top: navRect.bottom + 8,
        ...(isRtl
          ? { left: navRect.left }
          : { right: window.innerWidth - navRect.right }),
      });
    };
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, { passive: true });
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc);
    };
  }, [langOpen]);

  // Click outside & Escape — check both nav and floating panel
  useEffect(() => {
    if (!langOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inNav = navRef.current?.contains(target);
      const inPanel = langPanelRef.current?.contains(target);
      if (!inNav && !inPanel) close();
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
    <>
      <nav
        ref={navRef}
        className="relative mx-auto bg-bg-primary/95 backdrop-blur-md shadow-sm shadow-overlay/5 overflow-hidden max-w-7xl rounded-full"
      >
        {/* Main bar row */}
        <div className="relative flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4 md:min-w-max">
          {logo}

          {/* Desktop links — centered */}
          <div className="hidden md:flex items-center gap-0.5 absolute inset-0 justify-center pointer-events-none transition-opacity duration-300">
            <div className="flex items-center gap-0.5 pointer-events-auto">
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
              onClick={() => { if (!hasAccount) trackGetPro("nav-desktop"); }}
              className="ml-1 px-4 py-1.5 text-sm font-semibold rounded-full bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors"
            >
              {hasAccount ? t("account") : t("getPro")}
            </Link>
            </div>
          </div>

          {/* Right side controls (desktop) — pushed to end */}
          <div className="hidden md:flex items-center gap-1.5 ms-auto transition-opacity duration-300">
            {controls}

            {/* Language trigger */}
            <button
              ref={langBtnRef}
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
              <img src={getFlagUrl(currentLang.countryCode)} alt="" className="w-5 h-5 rounded-full object-cover" />
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
          <div>
            {mobile}
          </div>
        </div>
      </nav>

      {/* Language dropdown — portaled to body so navbar overflow-hidden doesn't clip it */}
      {mounted &&
        createPortal(
          <div
            ref={langPanelRef}
            style={
              panelPos
                ? { top: panelPos.top, right: panelPos.right, left: panelPos.left }
                : undefined
            }
            className={`fixed z-[60] w-[min(calc(100vw-2rem),42rem)] transition-all duration-200 rtl:origin-top-left ltr:origin-top-right ${
              langOpen && panelPos
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div
              id="language-panel"
              role="menu"
              aria-label="Select language"
              aria-hidden={!langOpen}
              className="bg-bg-primary/95 backdrop-blur-xl shadow-lg shadow-overlay/10 rounded-2xl border border-overlay/10 p-2.5"
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
                {routing.locales.map((loc) => {
                  const config = localeConfig[loc] || {
                    label: loc,
                    countryCode: "",
                    name: loc,
                  };
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
                      {config.countryCode && (
                        <img src={getFlagUrl(config.countryCode)} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                      )}
                      <span className="font-medium truncate">{config.name}</span>
                      {isActive && (
                        <svg
                          className="w-3.5 h-3.5 ms-auto shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
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
          </div>,
          document.body
        )}
    </>
  );
}
