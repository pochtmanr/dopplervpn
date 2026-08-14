import type { AbstractIntlMessages } from "next-intl";

/**
 * Top-level message namespaces that Client Components need at runtime.
 *
 * WHY THIS EXISTS
 * ---------------
 * `<NextIntlClientProvider messages={messages}>` serialises whatever it is given
 * into the RSC flight payload of every page. Passing the whole bundle put
 * 276 KB (en) into every one of ~4,900 prerendered pages — and far more on other
 * locales, since en is one of the smaller files (bn 592 KB, hi 582 KB, el 487 KB).
 *
 * That weight is paid three times: written to the ISR cache, read back from it on
 * every CDN miss, and sent over the wire on every request. Restricting the pick to
 * the namespaces below takes it to ~37 KB.
 *
 * Server Components are unaffected — `getTranslations()` reads messages on the
 * server and never ships them. The ~21 long-form SEO and legal namespaces
 * (privacy, terms, dpa, refund, vlessVpn, bypassCensorship, all vpnFor*, guide*)
 * are ~72% of the bundle and are server-only, which is where the saving comes from.
 *
 * MAINTENANCE
 * -----------
 * Every `useTranslations("x")` call in a "use client" file needs its top-level
 * namespace listed here. Nested namespaces (e.g. "blog.stickyBar") are covered by
 * their parent ("blog"). A namespace that is used but not listed does NOT fail the
 * build — it throws MISSING_MESSAGE in the browser at runtime — so
 * `scripts/check-client-namespaces.mjs` runs in CI to catch it. Run it after
 * adding or changing any client-side `useTranslations` call.
 */
export const CLIENT_NAMESPACES = [
  "apps", // apps.waitlist — downloads/waitlist-form
  "blog", // + blog.stickyBar, blog.inlineCta — share-buttons, sticky bar, home section
  "cookie", // cookie-consent
  "cta",
  "deleteAccount",
  "faq",
  "hero", // hero-ctas, mobile-sticky-cta, cta
  "nav", // desktop-nav, mobile-nav
  "priceComparison",
  "pricing",
  "speedComparison",
  "subscribe", // account/subscribe-content
  "success", // checkout/success/success-client (the only t.rich call site)
  "support",
  "toolsIpChecker", // toolsIpChecker.widget
  "toolsWebrtcLeak", // toolsWebrtcLeak.widget
] as const;

/**
 * Shallow pick of top-level namespaces. Hand-rolled because lodash is not a
 * dependency and the need is this small.
 */
export function pickMessages(
  messages: AbstractIntlMessages,
  namespaces: readonly string[] = CLIENT_NAMESPACES
): AbstractIntlMessages {
  const picked: AbstractIntlMessages = {};
  for (const ns of namespaces) {
    if (ns in messages) picked[ns] = messages[ns];
  }
  return picked;
}
