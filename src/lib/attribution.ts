/**
 * Marketing attribution: where a buyer came from, carried from the landing
 * request to the payment webhook.
 *
 * The webhook is a server-to-server call with no cookies, so everything the
 * GA4 Measurement Protocol and the Meta Conversions API need to credit a sale
 * to the right channel has to be snapshotted at checkout creation and stored
 * with the order (Revolut: order metadata; OxaPay: `vpn_invoices.attribution`).
 *
 * Two layers:
 *
 *  1. `dp_attr` cookie, written by middleware on landing: UTM tags, gclid,
 *     fbclid, landing path and referrer host. Last non-direct touch wins — a
 *     request carrying campaign tags overwrites it, an untagged one only fills
 *     an empty slot. Same model as GA4's default attribution.
 *  2. `readCheckoutAttribution()` at checkout: the cookie plus GA and Meta
 *     identifiers, IP and user agent, gated by what the buyer consented to.
 *
 * Imported by src/middleware.ts, so this file must stay edge-safe: no
 * `server-only`, no Node APIs.
 */

export const ATTR_COOKIE = "dp_attr";
export const ATTR_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/** The landing snapshot stored in `dp_attr`. Every field is optional. */
export interface LandingTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  /** Epoch ms when the fbclid was seen — Meta's `fbc` needs it. */
  fbclid_at?: number;
  landing_path?: string;
  referrer_host?: string;
  at?: number;
}

const MAX_VALUE = 150;

/** Printable, bounded, no characters that could break a cookie or a URL. */
function clean(raw: string | null | undefined, max = MAX_VALUE): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim().slice(0, max);
  if (!value) return undefined;
  return /^[\p{L}\p{N} _.:\/+%@|~-]+$/u.test(value) ? value : undefined;
}

function compact<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as T;
}

export function parseLandingTouch(raw: string | undefined): LandingTouch | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return parsed && typeof parsed === "object" ? (parsed as LandingTouch) : null;
  } catch {
    return null;
  }
}

export function serializeLandingTouch(touch: LandingTouch): string {
  return encodeURIComponent(JSON.stringify(touch));
}

/**
 * The touch to store for this request, or null to leave the cookie alone.
 * `ownHost` excludes internal navigation from being recorded as a referrer.
 */
export function landingTouchFromRequest(
  url: URL,
  referer: string | null,
  existing: LandingTouch | null,
  ownHost: string
): LandingTouch | null {
  const params = url.searchParams;
  const utm: Partial<Record<(typeof UTM_PARAMS)[number], string>> = {};
  for (const key of UTM_PARAMS) {
    const value = clean(params.get(key));
    if (value) utm[key] = value;
  }
  const gclid = clean(params.get("gclid"), 200);
  const fbclid = clean(params.get("fbclid"), 500);
  const tagged = Object.keys(utm).length > 0 || !!gclid || !!fbclid;

  let referrerHost: string | undefined;
  try {
    const host = referer ? new URL(referer).hostname : "";
    if (host && host !== ownHost && !host.endsWith(`.${ownHost.replace(/^www\./, "")}`)) {
      referrerHost = clean(host);
    }
  } catch {
    // Malformed Referer — ignore.
  }

  // An untagged visit only fills an empty slot, so later internal page loads
  // (and untagged returns) never overwrite the touch that brought them.
  if (!tagged && existing) return null;

  const now = Date.now();
  return compact({
    ...utm,
    gclid,
    fbclid,
    fbclid_at: fbclid ? now : undefined,
    landing_path: clean(url.pathname, 200),
    referrer_host: referrerHost,
    at: now,
  });
}

/** What the buyer's banner choice was, sent by the checkout client. */
export interface ConsentFlags {
  analytics: boolean;
  marketing: boolean;
}

export function parseConsentFlags(raw: unknown): ConsentFlags {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return { analytics: obj.analytics === true, marketing: obj.marketing === true };
}

/** Everything the webhook needs to report a purchase. Stored with the order. */
export interface CheckoutAttribution extends LandingTouch {
  consent_analytics?: boolean;
  consent_marketing?: boolean;
  ga_client_id?: string;
  ga_session_id?: string;
  fbp?: string;
  fbc?: string;
  ip?: string;
  user_agent?: string;
  /** Non-web origin, e.g. "telegram_miniapp". */
  source?: string;
}

/** `_ga` is `GA1.1.<random>.<ts>`; the client id is the last two parts. */
export function clientIdFromGaCookie(raw: string | undefined): string | null {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length < 4) return null;
  const clientId = `${parts[2]}.${parts[3]}`;
  return /^\d+\.\d+$/.test(clientId) ? clientId : null;
}

/**
 * `_ga_<container>` holds the current session id. Two formats are live:
 * `GS1.1.<session_id>.<n>.…` and the newer `GS2.1.s<session_id>$o<n>$g…`.
 */
export function sessionIdFromGaSessionCookie(raw: string | undefined): string | null {
  if (!raw) return null;
  const gs2 = raw.match(/^GS2\.\d\.s(\d+)/);
  if (gs2) return gs2[1];
  const parts = raw.split(".");
  if (parts[0] === "GS1" && /^\d+$/.test(parts[2] ?? "")) return parts[2];
  return null;
}

interface CookieReader {
  cookies: { get(name: string): { value: string } | undefined };
  headers: { get(name: string): string | null };
}

/**
 * Snapshot at checkout creation. Identifiers are only included for the
 * categories the buyer granted: GA ids need Analytics, Meta ids and the
 * IP/user agent (used only for Meta matching) need Marketing. The landing
 * touch itself carries no identifier and is always kept, so revenue by
 * channel stays reportable for everyone.
 */
export function readCheckoutAttribution(
  req: CookieReader,
  consent: ConsentFlags,
  gaMeasurementId: string | undefined
): CheckoutAttribution {
  const touch = parseLandingTouch(req.cookies.get(ATTR_COOKIE)?.value) ?? {};
  const out: CheckoutAttribution = {
    ...touch,
    consent_analytics: consent.analytics,
    consent_marketing: consent.marketing,
  };

  if (consent.analytics) {
    out.ga_client_id = clientIdFromGaCookie(req.cookies.get("_ga")?.value) ?? undefined;
    if (gaMeasurementId) {
      const container = gaMeasurementId.replace(/^G-/, "");
      out.ga_session_id =
        sessionIdFromGaSessionCookie(req.cookies.get(`_ga_${container}`)?.value) ?? undefined;
    }
  }

  if (consent.marketing) {
    out.fbp = clean(req.cookies.get("_fbp")?.value, 100);
    out.fbc =
      clean(req.cookies.get("_fbc")?.value, 600) ??
      (touch.fbclid ? `fb.1.${touch.fbclid_at ?? Date.now()}.${touch.fbclid}` : undefined);
    const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    out.ip = clean(forwarded ?? req.headers.get("x-real-ip"), 64);
    out.user_agent = req.headers.get("user-agent")?.slice(0, 400) || undefined;
  } else {
    // Without Marketing consent fbclid is a Meta identifier we must not use.
    delete out.fbclid;
    delete out.fbclid_at;
  }

  return compact(out);
}

/**
 * Revolut order metadata is a flat string map with per-value length limits,
 * so the snapshot is split across short `a_`-prefixed keys and joined again
 * in the webhook.
 */
export function attributionToMetadata(attr: CheckoutAttribution): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(attr)) {
    if (value === undefined || value === null || value === "") continue;
    out[`a_${key}`] = String(value).slice(0, 450);
  }
  return out;
}

const BOOLEAN_KEYS = new Set(["consent_analytics", "consent_marketing"]);
const NUMBER_KEYS = new Set(["fbclid_at", "at"]);

export function attributionFromMetadata(
  metadata: Record<string, unknown> | null | undefined
): CheckoutAttribution {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata ?? {})) {
    if (!key.startsWith("a_") || typeof value !== "string") continue;
    const name = key.slice(2);
    if (BOOLEAN_KEYS.has(name)) out[name] = value === "true";
    else if (NUMBER_KEYS.has(name)) out[name] = Number(value) || undefined;
    else out[name] = value;
  }
  return compact(out) as CheckoutAttribution;
}
