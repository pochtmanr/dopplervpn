"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useCookieConsent } from "@/components/cookie-consent";
import {
  META_PIXEL_ID,
  fbqConsent,
  fbqPageView,
  loadMetaPixel,
  metaPixelLoaded,
} from "@/lib/meta-pixel";

/**
 * The Meta twin of `GaConsent`: bridges the banner's Marketing category to
 * `fbq('consent', …)` and sends one PageView per App Router navigation.
 *
 * fbevents.js is only injected once Marketing is granted (see MetaPixel for
 * why). PageViews are queued regardless: before consent they sit in the stub's
 * queue and never leave the browser; on grant the library loads and replays
 * them, so the landing page is still counted for a visitor who accepts late.
 * Withdrawing consent revokes the already-loaded library for the rest of the
 * page's life (re-granting on the same page grants it again), and the library
 * is not loaded at all on the next visit.
 * Same `window.location` rule as GaConsent: no `useSearchParams()`.
 */
export function MetaConsent() {
  const consent = useCookieConsent();
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  // See GaConsent: flips on the render where the stored choice is populated.
  const [consentResolved, setConsentResolved] = useState(false);
  useEffect(() => setConsentResolved(true), []);

  useEffect(() => {
    if (!META_PIXEL_ID || !consentResolved) return;
    const granted = consent?.marketing ?? false;
    // Consent calls go only to a LOADED library. Queued in the stub, a revoke
    // is replayed on load and holds everything after it, grant included.
    if (metaPixelLoaded()) fbqConsent(granted);
    else if (granted) loadMetaPixel();
  }, [consent, consentResolved]);

  useEffect(() => {
    if (!META_PIXEL_ID || !consentResolved) return;
    const url = window.location.pathname + window.location.search;
    if (lastTracked.current === url) return;
    lastTracked.current = url;
    fbqPageView();
  }, [pathname, consentResolved]);

  return null;
}
