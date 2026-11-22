/**
 * Keeps credentials out of third-party analytics.
 *
 * `account_id` is a bearer credential (see CLAUDE.md, Known issues), `h` is a
 * one-time sign-in token and `order_id` ties a payment to it. All three ride in
 * query strings (/checkout/success, /account?h=…), so any URL handed to GA goes
 * through `sanitizeAnalyticsUrl` first. (The Meta Pixel reads document.location
 * itself; keeping account_id out of the URL is the real fix there.)
 */
const SENSITIVE_PARAMS = ['h', 'account_id', 'order_id'] as const;

/** Drops the sensitive params. Absolute URLs stay absolute, paths stay paths. */
export function sanitizeAnalyticsUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url, 'https://placeholder.invalid');
  } catch {
    return url;
  }
  let changed = false;
  for (const key of SENSITIVE_PARAMS) {
    if (parsed.searchParams.has(key)) {
      parsed.searchParams.delete(key);
      changed = true;
    }
  }
  if (!changed) return url;
  const absolute = /^[a-z][a-z\d+.-]*:/i.test(url);
  return absolute ? parsed.toString() : parsed.pathname + parsed.search + parsed.hash;
}
