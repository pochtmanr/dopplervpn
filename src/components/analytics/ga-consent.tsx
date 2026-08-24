"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useCookieConsent } from "@/components/cookie-consent";
import { GA_MEASUREMENT_ID, gtagConsentUpdate, gtagPageView } from "@/lib/ga";

/**
 * Two jobs that both need to sit in a client component next to the router:
 *
 *  1. Bridge the existing cookie banner to Consent Mode v2. `useCookieConsent`
 *     reads the same localStorage key the banner writes and re-reads it on the
 *     "cookie-consent-change" event, so accepting or revoking takes effect
 *     without a reload. This mirrors `analytics-consent.tsx`, except GA is
 *     already loaded and we move a consent signal instead of mounting a tag.
 *
 *  2. Fire page_view manually. `send_page_view` is off in the bootstrap, so
 *     without this GA would record the entry page and nothing else — App Router
 *     navigations never reload the document.
 *
 * DO NOT reach for `useSearchParams()` to get the query string here. It opts
 * every page that renders this component out of static generation, and this
 * repo has already lost the blog index's ISR to exactly that mistake. Reading
 * `window.location.search` inside the effect yields the same value with no
 * Suspense boundary and no prerender deopt.
 */
export function GaConsent() {
  const consent = useCookieConsent();
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  /**
   * `useCookieConsent()` returns null both for "localStorage not read yet" and
   * for "visitor has not chosen", so the value alone cannot say whether the
   * stored choice has been applied. This effect is registered after the hook's
   * own, so it runs in the same commit right after it and flips on the render
   * where `consent` is populated — which is what lets the page_view below wait
   * for the real consent state instead of racing it.
   */
  const [consentResolved, setConsentResolved] = useState(false);
  useEffect(() => setConsentResolved(true), []);

  // Its own effect so a route change never re-sends the consent signal.
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !consentResolved) return;
    gtagConsentUpdate(consent?.analytics ?? false);
  }, [consent, consentResolved]);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !consentResolved) return;

    const url = window.location.pathname + window.location.search;
    // StrictMode double-invokes effects in dev, and a query-string-only change
    // re-runs this with an unchanged pathname. Both would double-count.
    if (lastTracked.current === url) return;
    lastTracked.current = url;

    // The first path segment is always the locale — see the routing guard in
    // app/[locale]/layout.tsx. Sent as a custom dimension so the 44 language
    // variants can be compared without parsing page_path in reports. Empty on
    // the unlocalized routes (/checkout), which is correct.
    const locale = window.location.pathname.split("/")[1] ?? "";

    gtagPageView({
      page_location: window.location.href,
      page_path: url,
      page_title: document.title,
      locale,
    });
  }, [pathname, consentResolved]);

  return null;
}
