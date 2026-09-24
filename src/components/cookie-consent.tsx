"use client";

import { useState, useEffect, useCallback, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface CookieConsentState {
  essential: boolean;
  analytics: boolean;
  /**
   * Advertising measurement: the Meta Pixel and Google's ad_* consent signals.
   * Absent on choices stored before the category existed, which reads as
   * `false` — an old "Accept All" never covered advertising.
   */
  marketing?: boolean;
  /** ISO 8601 time the visitor made this choice. */
  timestamp: string;
  /**
   * Which consent text and category set the choice was given against. Absent
   * on records written before versioning, which reads as 1. Bump
   * CONSENT_VERSION whenever a category is added or a purpose or third party
   * changes, and every visitor is asked again.
   */
  version?: number;
}

const STORAGE_KEY = "cookie-consent";

/**
 * 1: essential + analytics (no version field stored).
 * 2: + marketing (Meta Pixel, Google ad_* signals), purposes and third
 *    parties named on the first layer, Reject All on the first layer.
 */
const CONSENT_VERSION = 2;

/** A choice older than this lapses and the visitor is asked again. */
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

function readRaw(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentState | null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function isExpired(state: CookieConsentState): boolean {
  const at = Date.parse(state.timestamp);
  return !Number.isFinite(at) || Date.now() - at > CONSENT_MAX_AGE_MS;
}

/**
 * The choice consumers act on. A lapsed choice (older than 12 months, or with
 * an unreadable timestamp) is no longer valid consent, so it reads as "not
 * chosen" and every tag stays off until the visitor chooses again. A choice
 * from an older CONSENT_VERSION is still honoured for the categories it
 * covered — the banner re-asks, but nothing the visitor agreed to is revoked
 * behind their back, and a missing `marketing` still reads as false.
 */
function getStoredConsent(): CookieConsentState | null {
  const stored = readRaw();
  if (!stored || isExpired(stored)) return null;
  return stored;
}

function needsPrompt(): boolean {
  const stored = readRaw();
  if (!stored || isExpired(stored)) return true;
  return (stored.version ?? 1) < CONSENT_VERSION;
}

function storeConsent(analytics: boolean, marketing: boolean) {
  const state: CookieConsentState = {
    essential: true,
    analytics,
    marketing,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage blocked (private mode, site data disabled): the choice holds
    // for this page view only, and the banner will ask again next time.
  }
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

/**
 * The stored choice as plain flags, for code outside React — checkout sends it
 * with the order so the payment webhook knows what the buyer consented to.
 */
export function readConsentFlags(): { analytics: boolean; marketing: boolean } {
  const stored = getStoredConsent();
  return { analytics: stored?.analytics ?? false, marketing: stored?.marketing ?? false };
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event("cookie-open-preferences"));
}

/*
 * EU consent UI rules this component is held to (GDPR Art. 4(11)/7, ePrivacy
 * Art. 5(3), EDPB Guidelines 03/2022, EDPB cookie-banner taskforce report
 * 2023, CNIL guidance):
 *  - Reject All and Accept All sit on the first layer with identical styling.
 *    Do not make one filled and the other an outline or a text link.
 *  - No close button, no consent by scrolling, and Escape never consents: it
 *    only steps back out of the preferences layer.
 *  - Optional categories start OFF. The toggles only show a previous choice
 *    when the visitor reopens preferences from the footer.
 *  - The first layer names the purposes and the third parties, and links the
 *    privacy policy.
 *  - No cookie wall: the banner sits at the bottom and the page stays usable.
 *  - Withdrawal: the footer's "Cookie Settings" (cookie-settings-button.tsx)
 *    reopens the preferences layer on every page.
 */

// Reject, Accept and Save share one recipe (DESIGN.md primary CTA) so none of
// them is visually weaker than another.
const CHOICE_BTN =
  "inline-flex items-center justify-center px-5 py-3 rounded-lg text-sm font-medium bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-teal";
const SECONDARY_BTN =
  "inline-flex items-center justify-center px-5 py-3 rounded-lg text-sm font-medium border border-overlay/20 text-text-primary hover:border-overlay/40 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-teal";

function ConsentSwitch({
  checked,
  onChange,
  labelId,
  descriptionId,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  labelId: string;
  descriptionId: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-teal ${
        checked ? "bg-accent-teal" : "bg-overlay/20"
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "ltr:translate-x-6 rtl:-translate-x-6" : "ltr:translate-x-1 rtl:-translate-x-1"
        }`}
      />
    </button>
  );
}

export function CookieConsent() {
  const [mode, setMode] = useState<"hidden" | "banner" | "preferences">("hidden");
  // Where Escape from the preferences layer returns to: the banner if the
  // visitor has not chosen yet, otherwise nothing (their choice stands).
  const [returnTo, setReturnTo] = useState<"hidden" | "banner">("banner");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const t = useTranslations("cookie");

  const ids = useId();
  const bannerTitleId = `${ids}-banner-title`;
  const bannerTextId = `${ids}-banner-text`;
  const dialogTitleId = `${ids}-dialog-title`;
  const dialogIntroId = `${ids}-dialog-intro`;

  const dialogRef = useRef<HTMLDivElement>(null);
  const dialogTitleRef = useRef<HTMLHeadingElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // No choice yet, a choice given against an older consent version (which
    // covers pre-Marketing records), or a choice older than 12 months.
    if (needsPrompt()) {
      const timer = setTimeout(() => setMode("banner"), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const existing = getStoredConsent();
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      setAnalyticsEnabled(existing?.analytics ?? false);
      setMarketingEnabled(existing?.marketing ?? false);
      setReturnTo(needsPrompt() ? "banner" : "hidden");
      setMode("preferences");
    };
    window.addEventListener("cookie-open-preferences", handler);
    return () => window.removeEventListener("cookie-open-preferences", handler);
  }, []);

  const close = useCallback(() => {
    setMode("hidden");
    const el = restoreFocusRef.current;
    restoreFocusRef.current = null;
    if (el && document.contains(el)) el.focus();
  }, []);

  const acceptAll = useCallback(() => {
    storeConsent(true, true);
    close();
  }, [close]);

  const rejectAll = useCallback(() => {
    storeConsent(false, false);
    close();
  }, [close]);

  const savePreferences = useCallback(() => {
    storeConsent(analyticsEnabled, marketingEnabled);
    close();
  }, [analyticsEnabled, marketingEnabled, close]);

  const openPreferencesFromBanner = useCallback(() => {
    restoreFocusRef.current = null;
    // No prior choice: every optional category starts off. A re-prompt after a
    // version bump shows what the visitor chose last time, never more.
    const existing = getStoredConsent();
    setAnalyticsEnabled(existing?.analytics ?? false);
    setMarketingEnabled(existing?.marketing ?? false);
    setReturnTo("banner");
    setMode("preferences");
  }, []);

  // Preferences dialog: move focus in, trap Tab, Escape steps back out without
  // recording anything.
  useEffect(() => {
    if (mode !== "preferences") return;
    dialogTitleRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (returnTo === "banner") setMode("banner");
        else close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialogTitleRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mode, returnTo, close]);

  if (mode === "hidden") return null;

  const privacyLink = (
    <Link
      href="/privacy"
      className="text-accent-teal underline underline-offset-2 hover:text-accent-teal/80"
    >
      {t("privacyLink")}
    </Link>
  );

  if (mode === "preferences") {
    const categories = [
      {
        key: "analytics",
        title: t("analyticsTitle"),
        description: t("analyticsDescription"),
        checked: analyticsEnabled,
        onChange: setAnalyticsEnabled,
      },
      {
        key: "marketing",
        title: t("marketingTitle"),
        description: t("marketingDescription"),
        checked: marketingEnabled,
        onChange: setMarketingEnabled,
      },
    ];

    return (
      <div className="overlay-dim fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-describedby={dialogIntroId}
          className="overlay-surface-muted w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-overlay/10 bg-bg-secondary p-6 shadow-2xl"
        >
          <h2
            id={dialogTitleId}
            ref={dialogTitleRef}
            tabIndex={-1}
            className="text-lg font-semibold text-text-primary mb-2 outline-none"
          >
            {t("preferencesTitle")}
          </h2>
          <p id={dialogIntroId} className="text-sm text-text-muted leading-relaxed mb-2">
            {t("preferencesIntro")} {privacyLink}
          </p>

          {/* Essential: always on, not a control */}
          <div className="flex items-center justify-between gap-4 py-3 border-b border-overlay/10">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{t("essentialTitle")}</p>
              <p className="text-xs text-text-muted mt-0.5">{t("essentialDescription")}</p>
            </div>
            <span className="text-xs font-medium text-accent-teal shrink-0">{t("alwaysOn")}</span>
          </div>

          {categories.map((c) => {
            const labelId = `${ids}-${c.key}-label`;
            const descId = `${ids}-${c.key}-desc`;
            return (
              <div
                key={c.key}
                className="flex items-center justify-between gap-4 py-3 border-b border-overlay/10"
              >
                <div className="flex-1 min-w-0">
                  <p id={labelId} className="text-sm font-medium text-text-primary">
                    {c.title}
                  </p>
                  <p id={descId} className="text-xs text-text-muted mt-0.5">
                    {c.description}
                  </p>
                </div>
                <ConsentSwitch
                  checked={c.checked}
                  onChange={c.onChange}
                  labelId={labelId}
                  descriptionId={descId}
                />
              </div>
            );
          })}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <button type="button" onClick={rejectAll} className={CHOICE_BTN}>
              {t("rejectAll")}
            </button>
            <button type="button" onClick={savePreferences} className={CHOICE_BTN}>
              {t("savePreferences")}
            </button>
            <button type="button" onClick={acceptAll} className={CHOICE_BTN}>
              {t("acceptAll")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Banner (first layer). Non-modal: the page stays usable behind it.
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 slide-in-from-bottom">
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={bannerTitleId}
        aria-describedby={bannerTextId}
        className="overlay-surface-muted mx-auto max-w-4xl max-h-[70dvh] overflow-y-auto rounded-2xl border border-overlay/10 bg-bg-secondary p-5 sm:p-6 shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h2 id={bannerTitleId} className="text-sm font-semibold text-text-primary mb-1">
              {t("bannerTitle")}
            </h2>
            <p id={bannerTextId} className="text-sm text-text-muted leading-relaxed">
              {t("message")} {privacyLink}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <button type="button" onClick={rejectAll} className={CHOICE_BTN}>
              {t("rejectAll")}
            </button>
            <button type="button" onClick={acceptAll} className={CHOICE_BTN}>
              {t("acceptAll")}
            </button>
            <button
              type="button"
              onClick={openPreferencesFromBanner}
              className={`${SECONDARY_BTN} col-span-2 sm:col-span-1 sm:order-first`}
            >
              {t("managePreferences")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
