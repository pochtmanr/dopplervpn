"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { localeConfig } from "@/lib/languages";
import { ThemeToggle } from "./theme-toggle";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
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

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  const navItems: { href: string; label: string; isPage?: boolean }[] = [
    { href: "/downloads", label: t("downloads"), isPage: true },
    { href: "/support", label: t("support"), isPage: true },
  ];

  const currentLang = localeConfig[locale] || localeConfig.en;

  const overlay = (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-200 ease-out ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-2xl"
        onClick={close}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={`relative flex flex-col items-center justify-center h-full px-6 transition-all duration-200 ease-out ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={close}
          className="absolute top-5 end-5 p-2.5 text-text-muted hover:text-text-primary transition-colors rounded-full"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Nav links */}
        <nav className="flex flex-col items-center gap-2">
          {navItems.map((item) =>
            item.isPage ? (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="text-text-primary hover:text-accent-gold transition-colors py-2.5 text-2xl font-medium tracking-tight"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={close}
                className="text-text-primary hover:text-accent-gold transition-colors py-2.5 text-2xl font-medium tracking-tight"
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        {/* Language accordion */}
        <div className="w-full max-w-sm mt-10">
          {/* Trigger */}
          <button
            onClick={() => setLangOpen((prev) => !prev)}
            className="flex items-center justify-between w-full py-3 px-4 rounded-xl bg-bg-secondary/50 text-text-primary"
            aria-expanded={langOpen}
            aria-controls="mobile-language-list"
          >
            <span className="flex items-center gap-2 text-lg font-medium">
              <span className="text-xl leading-none">{currentLang.flag}</span>
              {currentLang.name}
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
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
              <div className="relative mt-2">
                <div className="grid grid-cols-2 gap-1.5 max-h-[60vh] overflow-y-auto px-1 pb-1">
                  {routing.locales.map((loc) => {
                    const config = localeConfig[loc] || { label: loc, flag: "", name: loc };
                    const isActive = locale === loc;
                    return (
                      <button
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-base transition-colors duration-150 min-w-0 ${
                          isActive
                            ? "bg-accent-teal/15 text-accent-teal ring-1 ring-accent-teal/20"
                            : "text-text-muted hover:text-text-primary hover:bg-overlay/5"
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
              </div>
            </div>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="mt-6">
          <ThemeToggle />
        </div>

        {/* Get Pro CTA — mobile only */}
        <Link
          href="/subscribe"
          onClick={close}
          className="mt-8 inline-flex items-center justify-center px-8 py-3 rounded-xl bg-accent-teal text-bg-primary font-medium text-base hover:bg-accent-teal/90 transition-colors"
        >
          {hasAccount ? t("account") : t("getPro")}
        </Link>
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

      {/* Portal overlay to body — escapes nav's backdrop-filter containing block */}
      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
