"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

interface CookieConsentState {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
}

const STORAGE_KEY = "cookie-consent";

function getStoredConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsentState;
  } catch {
    return null;
  }
}

function storeConsent(state: CookieConsentState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("cookie-consent-change"));
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);

  useEffect(() => {
    setConsent(getStoredConsent());

    const handler = () => setConsent(getStoredConsent());
    window.addEventListener("cookie-consent-change", handler);
    return () => window.removeEventListener("cookie-consent-change", handler);
  }, []);

  return consent;
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event("cookie-open-preferences"));
}

export function CookieConsent() {
  const [mode, setMode] = useState<"hidden" | "banner" | "preferences">("hidden");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const t = useTranslations("cookie");

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) {
      const timer = setTimeout(() => setMode("banner"), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const existing = getStoredConsent();
      setAnalyticsEnabled(existing?.analytics ?? false);
      setMode("preferences");
    };
    window.addEventListener("cookie-open-preferences", handler);
    return () => window.removeEventListener("cookie-open-preferences", handler);
  }, []);

  const acceptAll = useCallback(() => {
    storeConsent({ essential: true, analytics: true, timestamp: new Date().toISOString() });
    setMode("hidden");
  }, []);

  const essentialOnly = useCallback(() => {
    storeConsent({ essential: true, analytics: false, timestamp: new Date().toISOString() });
    setMode("hidden");
  }, []);

  const savePreferences = useCallback(() => {
    storeConsent({
      essential: true,
      analytics: analyticsEnabled,
      timestamp: new Date().toISOString(),
    });
    setMode("hidden");
  }, [analyticsEnabled]);

  if (mode === "hidden") return null;

  if (mode === "preferences") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-2xl border border-overlay/10 bg-bg-secondary/95 backdrop-blur-lg p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {t("preferencesTitle")}
          </h2>

          {/* Essential */}
          <div className="flex items-center justify-between py-3 border-b border-overlay/10">
            <div className="flex-1 min-w-0 ltr:pr-4 rtl:pl-4">
              <p className="text-sm font-medium text-text-primary">{t("essentialTitle")}</p>
              <p className="text-xs text-text-muted mt-0.5">{t("essentialDescription")}</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent-teal cursor-not-allowed opacity-70 shrink-0">
              <span className="inline-block h-4 w-4 rounded-full bg-white ltr:translate-x-6 rtl:-translate-x-6 transition-transform" />
            </div>
          </div>

          {/* Analytics */}
          <div className="flex items-center justify-between py-3 border-b border-overlay/10">
            <div className="flex-1 min-w-0 ltr:pr-4 rtl:pl-4">
              <p className="text-sm font-medium text-text-primary">{t("analyticsTitle")}</p>
              <p className="text-xs text-text-muted mt-0.5">{t("analyticsDescription")}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={analyticsEnabled}
              onClick={() => setAnalyticsEnabled((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                analyticsEnabled ? "bg-accent-teal" : "bg-overlay/20"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  analyticsEnabled ? "ltr:translate-x-6 rtl:-translate-x-6" : "ltr:translate-x-1 rtl:-translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={essentialOnly}
              className="px-4 py-2 text-sm text-text-muted hover:text-text-primary border border-overlay/10 rounded-xl transition-colors cursor-pointer"
            >
              {t("essentialOnlyBtn")}
            </button>
            <button
              onClick={savePreferences}
              className="px-5 py-2 text-sm font-semibold bg-accent-teal text-bg-primary rounded-xl hover:bg-accent-teal/90 transition-colors cursor-pointer"
            >
              {t("savePreferences")}
            </button>
            <button
              onClick={acceptAll}
              className="px-5 py-2 text-sm font-semibold bg-accent-teal text-bg-primary rounded-xl hover:bg-accent-teal/90 transition-colors cursor-pointer ltr:ml-auto rtl:mr-auto"
            >
              {t("acceptAll")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Banner mode
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-4xl rounded-2xl border border-overlay/10 bg-bg-secondary/95 backdrop-blur-lg p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-muted leading-relaxed">
              {t("message")}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={essentialOnly}
              className="px-4 py-2 text-sm text-text-muted hover:text-text-primary border border-overlay/10 rounded-xl transition-colors cursor-pointer"
            >
              {t("essentialOnlyBtn")}
            </button>
            <button
              onClick={() => setMode("preferences")}
              className="px-4 py-2 text-sm text-text-muted hover:text-text-primary border border-overlay/10 rounded-xl transition-colors cursor-pointer"
            >
              {t("managePreferences")}
            </button>
            <button
              onClick={acceptAll}
              className="px-5 py-2 text-sm font-semibold bg-accent-teal text-bg-primary rounded-xl hover:bg-accent-teal/90 transition-colors cursor-pointer"
            >
              {t("acceptAll")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
