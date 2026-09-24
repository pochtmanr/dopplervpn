import "server-only";

import { clientIdFromGaCookie } from "@/lib/attribution";

/**
 * GA4 Measurement Protocol — server-side events.
 *
 * Why this exists at all: a browser `file_download` on the Windows installer is
 * the first thing an ad blocker drops, and the click also has to survive a
 * cross-origin redirect to GitHub. Reporting from the route handler counts what
 * the server actually served, which is the number that reconciles against the
 * paid-campaign postbacks in `lib/postback.ts`.
 *
 * Two properties are deliberate:
 *
 *  - Never throws, never blocks. Call it inside `after()`; a slow or dead
 *    endpoint must not delay the visitor's redirect.
 *  - `client_id` is taken from the `_ga` cookie when one exists, so the hit
 *    joins the visitor's existing GA session instead of inventing a new user.
 *    When consent was denied there is no cookie, so a random id is used and the
 *    event carries `synthetic_client: true` — the download count stays right and
 *    the inflated user count stays visible in reports rather than silently
 *    skewing them.
 */

const MP_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const TIMEOUT_MS = 5_000;

export { clientIdFromGaCookie };

export interface ServerEvent {
  name: string;
  /** `unknown` because ecommerce events carry an `items` array. */
  params?: Record<string, unknown>;
}

export interface ServerEventOptions {
  /**
   * A client id captured earlier (e.g. at checkout creation) for callers that
   * have no request cookie to read — the payment webhooks. Wins over the cookie.
   */
  clientId?: string | null;
  /**
   * The visitor's GA session id at checkout. Sent as `session_id` so GA4 joins
   * the hit to that session and credits it to the session's source/medium;
   * without it a server purchase lands as "(not set)".
   */
  sessionId?: string | null;
}

export async function sendServerEvent(
  event: ServerEvent,
  gaCookie: string | undefined,
  options: ServerEventOptions = {}
): Promise<void> {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_API_SECRET;
  // Both are required. Unset in preview/dev by design, so this is a normal
  // no-op rather than a misconfiguration.
  if (!measurementId || !apiSecret) return;

  const known = options.clientId || clientIdFromGaCookie(gaCookie);
  const clientId = known ?? `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`;

  const body = {
    client_id: clientId,
    events: [
      {
        name: event.name,
        params: {
          ...event.params,
          ...(known ? {} : { synthetic_client: true }),
          ...(options.sessionId ? { session_id: options.sessionId } : {}),
          // Without this GA4 treats a Measurement Protocol hit as a
          // non-session event and it never appears in realtime or standard
          // reports — a very common way for MP to look silently broken.
          engagement_time_msec: 1,
        },
      },
    ],
  };

  const url = `${MP_ENDPOINT}?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    // Analytics must never surface as a failed download or a failed webhook.
  }
}
