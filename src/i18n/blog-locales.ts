// Locales that have real blog translations in `blog_post_translations`.
// The main site supports 44 locales (routing.ts) — but the blog is only
// actually translated into these 21. Serving English content under a
// non-blog-translated locale URL created a sitewide duplicate-content
// penalty in Google (see GSC Coverage report 2026-04-17: ~2,250 duplicate
// URLs, 90% impression drop Feb–Apr 2026).
//
// Routes under /{non-blog-locale}/blog/* now 308-redirect to /en/blog/*
// via middleware. See middleware.ts.
export const BLOG_LOCALES = [
  "en", "es", "pt", "ru", "fr", "he", "zh", "de", "fa", "tr", "ar",
  "hi", "vi", "id", "ms", "th", "ja", "tl", "ur", "sw", "ko",
] as const;

export type BlogLocale = (typeof BLOG_LOCALES)[number];

const BLOG_LOCALES_SET = new Set<string>(BLOG_LOCALES);

export function isBlogLocale(locale: string): locale is BlogLocale {
  return BLOG_LOCALES_SET.has(locale);
}
