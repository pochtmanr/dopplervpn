import Script from "next/script";

import { GA_MEASUREMENT_ID } from "@/lib/ga";

/**
 * GA4 bootstrap. Server component — render it inside <head>.
 *
 * ORDER IS THE WHOLE POINT
 * ------------------------
 * The inline block below is server-rendered into <head>, so it runs before
 * anything else on the page and defines `window.gtag` as a `dataLayer` shim.
 * gtag.js itself loads `lazyOnload` and replays whatever the shim queued, so the
 * `consent default` call is guaranteed to be processed before the first
 * measurement hit — which is the one thing Consent Mode v2 cannot tolerate
 * getting wrong. Anything that fires in between is simply held in the queue.
 *
 * That queue is also why the strategy can be `lazyOnload` rather than
 * `afterInteractive`: nothing is lost by loading the tag late, and on the
 * critical path gtag.js cost a 35ms forced reflow (it measures geometry on
 * startup) plus its own parse, against a hero that was already LCP-bound.
 *
 * CONSENT MODE V2
 * ---------------
 * Everything starts denied. With `analytics_storage: 'denied'` GA still
 * receives a cookieless ping (no client id, no _ga cookie) which is what feeds
 * Google's behavioural modelling — that is why the tag loads for everyone
 * instead of being withheld until opt-in the way `analytics-consent.tsx` gates
 * Vercel Analytics. `GaConsent` flips it to 'granted' when the visitor accepts.
 *
 * The three ad_* signals start denied too and are granted only by the banner's
 * Marketing category (see `gtagConsentUpdate`). `wait_for_update` gives the client-side consent bridge a 500 ms window
 * to restore a stored choice before the first hit is sent, so a returning
 * visitor who already accepted is not counted as denied for one pageview.
 *
 * `send_page_view: false` because page views are fired manually in `GaConsent`
 * — the App Router does not reload the page on navigation, so leaving it on
 * would report the entry page and nothing after it.
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  const bootstrap = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  analytics_storage:'denied',
  wait_for_update:500
});
gtag('js', new Date());
gtag('config','${GA_MEASUREMENT_ID}',{ send_page_view:false });
`.trim();

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
    </>
  );
}
