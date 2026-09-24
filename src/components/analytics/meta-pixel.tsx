import { META_PIXEL_ID } from "@/lib/meta-pixel";

/**
 * Meta Pixel bootstrap. Server component — render it inside <head>, after
 * `GoogleAnalytics`.
 *
 * This is Meta's stock snippet with two deliberate changes:
 *
 *  - It does not load fbevents.js (see below), and there is deliberately NO
 *    `fbq('consent','revoke')` in it. Consent is enforced by never loading the
 *    library without it, which is stronger — and a revoke sitting in the stub
 *    queue gets replayed when the library lands and holds every later call,
 *    including the grant, so nothing is ever sent (verified in Chromium).
 *  - No `fbq('track','PageView')` here. App Router navigations never reload
 *    the document, so the stock one-shot PageView would count only the entry
 *    page; `MetaConsent` fires one per route instead.
 *
 * Only the stub is rendered here. fbevents.js itself is NOT loaded until the
 * visitor grants Marketing — `MetaConsent` injects it then — because merely
 * fetching it from connect.facebook.net hands Meta the visitor's IP, which the
 * EU treats as needing consent. The stub queues every call made before that,
 * and the library replays the queue when it lands.
 *
 * The <noscript> fallback is intentionally absent: it fires a PageView with no
 * way to honour the consent choice, and the site does not work without JS.
 */
export function MetaPixel() {
  // The id is interpolated into an inline script, so accept digits only.
  if (!/^\d+$/.test(META_PIXEL_ID)) return null;

  const bootstrap = `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];}(window,document);
fbq('init','${META_PIXEL_ID}');
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: bootstrap }} />;
}
