import "server-only";

import { createHash } from "node:crypto";

/**
 * Meta Conversions API — the server half of Meta tracking (browser half:
 * `lib/meta-pixel.ts`).
 *
 * Used for purchases only, from the payment webhooks, so a sale is reported
 * even when the buyer's browser blocked fbevents.js or never returned to the
 * success page. The Pixel `Purchase` and this one share `event_id` (the order
 * id); Meta keeps one and merges their matching signals.
 *
 * Same contract as `lib/ga-server.ts`: never throws, never blocks — call it
 * inside `after()`. A no-op unless both env vars are set (Production only).
 *
 * Personal data: Meta requires `em` and `external_id` SHA-256 hashed after
 * normalisation; IP and user agent are sent in clear, as Meta specifies. The
 * caller must only pass identifiers the buyer consented to (Marketing).
 */

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v23.0";
const TIMEOUT_MS = 5_000;

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export interface CapiEvent {
  eventName: string;
  eventId: string;
  /** Unix seconds. Meta rejects events older than 7 days. */
  eventTime?: number;
  actionSource: "website" | "app" | "other";
  eventSourceUrl?: string;
  user: {
    email?: string | null;
    externalId?: string | null;
    fbp?: string | null;
    fbc?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  };
  custom?: Record<string, unknown>;
}

export async function sendCapiEvent(event: CapiEvent): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) return;

  const { user } = event;
  const userData: Record<string, unknown> = {};
  if (user.email) userData.em = [sha256(user.email)];
  if (user.externalId) userData.external_id = [sha256(user.externalId)];
  if (user.fbp) userData.fbp = user.fbp;
  if (user.fbc) userData.fbc = user.fbc;
  if (user.ip) userData.client_ip_address = user.ip;
  if (user.userAgent) userData.client_user_agent = user.userAgent;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: event.actionSource,
        ...(event.eventSourceUrl ? { event_source_url: event.eventSourceUrl } : {}),
        user_data: userData,
        custom_data: event.custom ?? {},
      },
    ],
  };
  // Set while verifying in Events Manager -> Test events; unset in normal running.
  if (process.env.META_CAPI_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_CAPI_TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) {
      // Logged, not thrown: a rejected event is a tracking gap, not a payment
      // failure. The body names the bad field (expired token, stale event…).
      console.error("[meta-capi] rejected", res.status, (await res.text()).slice(0, 300));
    }
  } catch (err) {
    console.error("[meta-capi] send_failed", err instanceof Error ? err.message : err);
  }
}
