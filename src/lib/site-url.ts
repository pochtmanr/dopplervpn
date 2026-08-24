import type { NextRequest } from 'next/server';

/**
 * Absolute origin for URLs that have to survive leaving this process — a
 * checkout link opened in the app's WebView, a payment provider's return URL,
 * an update URL handed to an Android `ACTION_VIEW` intent. None of those can
 * follow a relative path.
 *
 * `NEXT_PUBLIC_SITE_URL` wins when set so preview deployments and local dev can
 * be pinned at production. Otherwise it is derived from the request, which is
 * what makes a preview deployment link to itself rather than to production.
 */
export function resolveSiteUrl(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  if (host) return `${proto}://${host}`;
  return 'https://www.dopplervpn.org';
}
