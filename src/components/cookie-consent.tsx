"use client";

import { useState, useEffect, useCallback, useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DopplerLogo } from "@/components/layout/doppler-logo";
import { CookieIcon } from "@/components/icons/cookie";

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
  /**
   * Where the choice came from: the first-layer banner, the preferences layer,
   * or the browser's Global Privacy Control signal (recorded as Reject All
   * without asking). Absent on older records. Informational only.
   */
  source?: ConsentSource;
}

type ConsentSource = "banner" | "preferences" | "gpc";

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

/**
 * Cookies the optional tags set in the browser. Consent Mode and the pixel
 * revoke stop new collection, but identifiers already written would otherwise
 * stay behind after a withdrawal. GA4 sets `_ga` and `_ga_<stream>`; `_gid`
 * is Universal Analytics, still found on returning browsers.
 */
const ANALYTICS_COOKIES = [/^_ga$/, /^_ga_/, /^_gid$/, /^_gat/];
const MARKETING_COOKIES = [/^_fbp$/, /^_fbc$/, /^_gcl_/];

function expireCookies(patterns: RegExp[]) {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const labels = host.split(".");
  // gtag and the pixel write to the widest domain they can (".dopplervpn.org"),
  // so try the bare host, every parent domain, and no domain attribute.
  const domains: (string | null)[] = [null];
  for (let i = 0; i < labels.length - 1; i++) domains.push(`.${labels.slice(i).join(".")}`);
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0]?.trim();
    if (!name || !patterns.some((re) => re.test(name))) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

function storeConsent(analytics: boolean, marketing: boolean, source: ConsentSource) {
  const state: CookieConsentState = {
    essential: true,
    analytics,
    marketing,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
    source,
  };
  // Withdrawal must be as complete as consent: a category that is off keeps
  // nothing behind. Harmless when there was nothing to clear.
  if (!analytics) expireCookies(ANALYTICS_COOKIES);
  if (!marketing) expireCookies(MARKETING_COOKIES);
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
 *    reopens the preferences layer on every page, and turning a category off
 *    expires the cookies it left (expireCookies above).
 *  - Global Privacy Control: a browser that sends GPC and has no stored choice
 *    is recorded as Reject All and is not asked. It can still opt in from the
 *    footer.
 */

// Reject and Accept share one recipe so neither is visually weaker than the
// other. `cta-key` + `rounded-full` is the site's pill (under `plus-pills` it is
// the same flat round pill as the hero's "Download for Mac").
const CHOICE_BTN =
  "cta-key inline-flex items-center justify-center rounded-full px-4 py-2 text-[13px] font-semibold leading-5 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-teal";
const SECONDARY_BTN =
  "cta-flat inline-flex items-center justify-center rounded-full px-4 py-2 text-[13px] font-semibold leading-5 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-teal";

/** Matches `.consent-out` / `.consent-dim-out` in globals.css. */
const EXIT_MS = 200;

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
      className={`relative inline-flex h-[26px] w-[44px] items-center rounded-full transition-colors duration-200 cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-teal ${
        checked ? "bg-accent-teal" : "bg-overlay/15"
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.3),0_0_0_0.5px_rgb(0_0_0/0.06)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${
          checked ? "ltr:translate-x-[20px] rtl:-translate-x-[20px]" : "ltr:translate-x-[2px] rtl:-translate-x-[2px]"
        }`}
      />
    </button>
  );
}

export function CookieConsent({ subprocessorsLabel }: { subprocessorsLabel?: string } = {}) {
  const [mode, setMode] = useState<"hidden" | "banner" | "preferences">("hidden");
  // True while the open layer plays its exit; it unmounts after EXIT_MS.
  const [leaving, setLeaving] = useState(false);
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
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Global Privacy Control with no valid choice on record: honour it as
    // Reject All and do not ask. A re-prompt for an older consent version is
    // left alone, so nothing the visitor chose is overwritten silently.
    const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
    if (gpc === true && !getStoredConsent()) {
      storeConsent(false, false, "gpc");
      return;
    }
    // No choice yet, a choice given against an older consent version (which
    // covers pre-Marketing records), or a choice older than 12 months. The
    // banner waits for the page to settle and then for an idle moment, so it
    // never competes with the hero's first paint.
    if (!needsPrompt()) return;
    let idle: number | undefined;
    const show = () => setMode((m) => (m === "hidden" ? "banner" : m));
    const timer = setTimeout(() => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(show, { timeout: 1200 });
      else show();
    }, 1200);
    return () => {
      clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      setLeaving(false);
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

  useEffect(() => () => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
  }, []);

  const close = useCallback(() => {
    setLeaving(true);
    exitTimerRef.current = setTimeout(() => {
      setMode("hidden");
      setLeaving(false);
      const el = restoreFocusRef.current;
      restoreFocusRef.current = null;
      if (el && document.contains(el)) el.focus();
    }, EXIT_MS);
  }, []);

  const acceptAll = useCallback(() => {
    storeConsent(true, true, mode === "preferences" ? "preferences" : "banner");
    close();
  }, [close, mode]);

  const rejectAll = useCallback(() => {
    storeConsent(false, false, mode === "preferences" ? "preferences" : "banner");
    close();
  }, [close, mode]);

  const savePreferences = useCallback(() => {
    storeConsent(analyticsEnabled, marketingEnabled, "preferences");
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
    if (mode !== "preferences" || leaving) return;
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
  }, [mode, leaving, returnTo, close]);

  if (mode === "hidden") return null;

  const linkClass =
    "text-accent-teal underline decoration-accent-teal/40 underline-offset-2 hover:decoration-accent-teal transition-colors";
  const privacyLink = (
    <Link href="/privacy" className={linkClass}>
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
      <div
        className={`overlay-dim fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-[2px] ${
          leaving ? "consent-dim-out" : "consent-dim-in"
        }`}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-describedby={dialogIntroId}
          className={`consent-card overlay-surface-muted w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[22px] bg-bg-secondary p-5 sm:p-6 ${
            leaving ? "consent-out" : "consent-dialog-in"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="consent-tint grid place-items-center w-9 h-9 rounded-full shrink-0">
              <CookieIcon />
            </span>
            <h2
              id={dialogTitleId}
              ref={dialogTitleRef}
              tabIndex={-1}
              className="text-[17px] font-semibold text-text-primary outline-none"
            >
              {t("preferencesTitle")}
            </h2>
          </div>
          <p id={dialogIntroId} className="text-[13px] text-text-muted leading-relaxed mb-4">
            {t("preferencesIntro")} {privacyLink}
            {subprocessorsLabel && (
              <>
                {" · "}
                <Link href="/subprocessors" className={linkClass}>
                  {subprocessorsLabel}
                </Link>
              </>
            )}
          </p>

          <div className="consent-tray rounded-2xl divide-y divide-overlay/[0.07]">
            {/* Essential: always on, not a control */}
            <div className="flex items-center justify-between gap-4 px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{t("essentialTitle")}</p>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{t("essentialDescription")}</p>
              </div>
              <span className="consent-tint text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0">
                {t("alwaysOn")}
              </span>
            </div>

            {categories.map((c) => {
              const labelId = `${ids}-${c.key}-label`;
              const descId = `${ids}-${c.key}-desc`;
              return (
                <div key={c.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p id={labelId} className="text-sm font-medium text-text-primary">
                      {c.title}
                    </p>
                    <p id={descId} className="text-xs text-text-muted mt-0.5 leading-relaxed">
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
          </div>

          {/* All three are the same pill: saving a custom choice is never
              harder than accepting or rejecting everything. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5">
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

  // Banner (first layer). Non-modal: the page stays usable behind it. A small
  // floating card in the bottom start corner, out of the reading column; full
  // width (with a gutter) on phones.
  return (
    <div className="fixed z-50 inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:start-5 sm:bottom-5 sm:w-[25rem] pointer-events-none">
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={bannerTitleId}
        aria-describedby={bannerTextId}
        className={`consent-card overlay-surface-muted pointer-events-auto max-h-[70dvh] overflow-y-auto rounded-[22px] bg-bg-secondary p-4 sm:p-5 ${
          leaving ? "consent-out" : "consent-in"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="consent-tint grid place-items-center w-10 h-10 rounded-full shrink-0">
            <CookieIcon className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            {/* Brand eyebrow: the name is not translated, so it needs no key. */}
            <div dir="ltr" className="flex items-center gap-1.5 text-text-tertiary rtl:justify-end">
              <DopplerLogo className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold tracking-tight leading-4">Doppler VPN</span>
            </div>
            <h2 id={bannerTitleId} className="text-[15px] font-semibold text-text-primary leading-snug">
              {t("bannerTitle")}
            </h2>
          </div>
        </div>
        <p id={bannerTextId} className="text-[13px] text-text-muted leading-relaxed mt-3">
          {t("message")} {privacyLink}
        </p>
        {/* Reject and Accept: identical, side by side, equal weight. Manage
            is the quieter flat pill beneath them. */}
        <div className="flex flex-col gap-2 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={rejectAll} className={CHOICE_BTN}>
              {t("rejectAll")}
            </button>
            <button type="button" onClick={acceptAll} className={CHOICE_BTN}>
              {t("acceptAll")}
            </button>
          </div>
          <button type="button" onClick={openPreferencesFromBanner} className={SECONDARY_BTN}>
            {t("managePreferences")}
          </button>
        </div>
      </div>
    </div>
  );
}
