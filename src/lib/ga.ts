/**
 * GA4 (gtag.js) plumbing.
 *
 * Everything that talks to Google Analytics from the browser goes through this
 * module. Two reasons:
 *
 *  1. `GA_MEASUREMENT_ID` is only set in Production on Vercel, so previews and
 *     local dev never pollute the property. Every helper here no-ops when it is
 *     empty, which means call sites never need to guard.
 *  2. gtag.js is loaded `async` and is the first thing an ad blocker kills, so
 *     `window.gtag` may legitimately never exist. The inline bootstrap in
 *     `components/analytics/google-analytics.tsx` defines the queueing stub
 *     synchronously in <head>, so calls made before the library lands are held
 *     in `dataLayer` and replayed — but a blocked library must still be a silent
 *     no-op rather than a thrown TypeError inside a click handler.
 *
 * The Vercel Analytics layer in `lib/track-cta.ts` is unchanged and runs
 * alongside this; see that file for the event catalogue.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

/** GA4 event parameters. `items` is an array of objects, hence `unknown`. */
export type GtagParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function callGtag(...args: unknown[]): void {
  if (!GA_MEASUREMENT_ID) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag(...args);
}

/**
 * Drop keys GA4 would only store as empty strings. Unset params are cheaper
 * than empty ones: an event-scoped custom dimension reporting "(not set)" is
 * indistinguishable from one reporting "", and the 25-param-per-event cap is
 * real.
 */
function compact(params: GtagParams): GtagParams {
  const out: GtagParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = value;
  }
  return out;
}

export function gtagEvent(name: string, params: GtagParams = {}): void {
  callGtag("event", name, compact(params));
}

/**
 * Consent Mode v2 update. Only `analytics_storage` ever moves: the cookie
 * banner has exactly two categories (essential / analytics) and no advertising
 * category, so the three ad_* signals stay denied for the life of the session.
 */
export function gtagConsentUpdate(analyticsGranted: boolean): void {
  callGtag("consent", "update", {
    analytics_storage: analyticsGranted ? "granted" : "denied",
  });
}

/** Manual page_view — `send_page_view` is false, see the bootstrap component. */
export function gtagPageView(params: GtagParams): void {
  gtagEvent("page_view", params);
}
