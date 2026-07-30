/**
 * Paid-campaign click identifier capture.
 *
 * Ad networks append a per-click id to the landing URL they send traffic to. We
 * store it in a first-party cookie so the conversion postback (src/lib/postback.ts)
 * can echo it back later, from a different request than the one that landed.
 *
 * Imported by src/middleware.ts, so this file must stay free of `server-only` and
 * of any Node-only API — it runs on the edge runtime.
 */

/**
 * Accepted query parameters, highest priority first. Trackers differ on the macro
 * name and we don't control which one the agency configures, so accept the common
 * spellings rather than blocking the campaign on a naming round-trip.
 */
export const CLICK_ID_PARAMS = [
  "click_id",
  "clickid",
  "sub_id",
  "subid",
  "aff_click_id",
] as const;

export const CLICK_ID_COOKIE = "dp_click_id";
/** Which parameter the id arrived on — lets us confirm the agency's macro fired. */
export const CLICK_ID_SOURCE_COOKIE = "dp_click_src";

/** 90 days: long enough to cover a download-then-subscribe-later path. */
export const CLICK_ID_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

const MAX_CLICK_ID_LENGTH = 128;
const SAFE_CLICK_ID = /^[A-Za-z0-9_.-]+$/;

/**
 * Returns the value only if it is safe to store and to put back on an outbound
 * URL. Anything else is dropped — a malformed id can't be attributed anyway, and
 * this keeps injected junk out of the database and out of the postback request.
 */
export function sanitizeClickId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || value.length > MAX_CLICK_ID_LENGTH) return null;
  return SAFE_CLICK_ID.test(value) ? value : null;
}

/** The stored click id for a request, or null if this visitor is not attributed. */
export function readClickIdCookie(req: {
  cookies: { get(name: string): { value: string } | undefined };
}): string | null {
  return sanitizeClickId(req.cookies.get(CLICK_ID_COOKIE)?.value);
}

/** First accepted parameter present on the URL, or null. */
export function readClickIdParam(
  params: URLSearchParams
): { clickId: string; source: string } | null {
  for (const param of CLICK_ID_PARAMS) {
    const clickId = sanitizeClickId(params.get(param));
    if (clickId) return { clickId, source: param };
  }
  return null;
}
