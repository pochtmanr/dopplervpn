/**
 * Meta Pixel (fbevents.js) plumbing — the browser half of Meta tracking.
 *
 * Mirrors `lib/ga.ts`: `META_PIXEL_ID` is only set in Production on Vercel, so
 * previews and local dev never pollute the pixel, and every helper no-ops when
 * it is empty or when an ad blocker has killed `window.fbq`.
 *
 * CONSENT: the bootstrap in `components/analytics/meta-pixel.tsx` defines only
 * a queueing stub. The library itself is loaded by `loadMetaPixel()` only once
 * the visitor grants the Marketing category; until then every call just sits
 * in the stub's queue and nothing leaves the browser. That is why call sites
 * can fire unconditionally. `fbq('consent', …)` is only ever sent to a loaded
 * library (withdrawal mid-page) — see `MetaConsent`.
 *
 * The server half (Conversions API, purchases only) is `lib/meta-capi.ts`. A
 * browser `Purchase` and a server `Purchase` for the same order carry the same
 * event id (the order id), which is what lets Meta deduplicate them.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

export type FbqParams = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown };
  }
}

function callFbq(...args: unknown[]): void {
  if (!META_PIXEL_ID) return;
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq(...args);
}

function compact(params: FbqParams): FbqParams {
  const out: FbqParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = value;
  }
  return out;
}

/** Standard event (`Lead`, `InitiateCheckout`, `Purchase`, …). */
export function fbqTrack(name: string, params: FbqParams = {}, eventId?: string): void {
  if (eventId) callFbq("track", name, compact(params), { eventID: eventId });
  else callFbq("track", name, compact(params));
}

/** Non-standard event — usable for custom conversions, not for optimisation. */
export function fbqTrackCustom(name: string, params: FbqParams = {}): void {
  callFbq("trackCustom", name, compact(params));
}

const FBEVENTS_SRC = "https://connect.facebook.net/en_US/fbevents.js";

/** fbevents.js has replaced the stub (it installs `callMethod`). */
export function metaPixelLoaded(): boolean {
  return typeof window !== "undefined" && typeof window.fbq?.callMethod === "function";
}

/** Inject fbevents.js once. Call only after Marketing consent is granted. */
export function loadMetaPixel(): void {
  if (!META_PIXEL_ID || typeof document === "undefined") return;
  if (document.querySelector(`script[src="${FBEVENTS_SRC}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = FBEVENTS_SRC;
  document.head.appendChild(script);
}

export function fbqConsent(granted: boolean): void {
  callFbq("consent", granted ? "grant" : "revoke");
}

/** Manual PageView — the bootstrap does not send one, see `MetaConsent`. */
export function fbqPageView(): void {
  callFbq("track", "PageView");
}
