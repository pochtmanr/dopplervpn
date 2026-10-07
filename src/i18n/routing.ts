import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
    "en", "ru", "es", "pt", "fr", "zh", "zh-Hant", "de", "he", "fa", "ar",
    "hi", "id", "tr", "vi", "th", "ms", "ko", "ja", "tl", "ur", "sw", "az",
    "pl", "uk", "bg", "bn", "ca", "cs", "da", "el", "et", "fi", "hr", "hu",
    "it", "lt", "lv", "nb", "nl", "ro", "sk", "sl", "sv",
  ],
  defaultLocale: "en",
  // No hreflang HTTP Link header. next-intl would list all 44 locales for
  // every path, contradicting the per-page <link rel="alternate"> set that
  // only names locales a page really exists in (blog: 21, security and
  // how-it-works: 6). The HTML tags are the single source of hreflang.
  alternateLinks: false,
});

export const rtlLocales: readonly string[] = ["he", "fa", "ar", "ur"];

export type Locale = (typeof routing.locales)[number];

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale);
}
