import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

// `now` and `timeZone` MUST be pinned. If they are omitted, next-intl fills them
// in per render — see getConfig.js in next-intl/server/react-server, which does
// `now: config.now || cache(() => new Date)()` — and NextIntlClientProviderServer
// serialises the result into the RSC payload of every page as
// `"now":"$D2026-08-13T17:01:41.785Z"`.
//
// Vercel only bills an ISR *write* when regenerated output differs byte-wise from
// the previous version. A render-time `now` guarantees a difference on every single
// regeneration, so every one of the ~4,900 prerendered pages was billing a write
// (~212 KB each) on each daily revalidation. Pinning it makes unchanged pages cost
// zero write units.
//
// Safe because nothing on the site formats relative time ("2 days ago"); all dates
// are formatted from explicit DB values. Do not replace these with `new Date()`.
const NOW = new Date("2026-01-01T00:00:00.000Z");
const TIME_ZONE = "UTC";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ensure valid locale
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    now: NOW,
    timeZone: TIME_ZONE,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
