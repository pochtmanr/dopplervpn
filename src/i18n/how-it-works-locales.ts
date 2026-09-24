/**
 * Locales the /how-it-works articles exist in. The long-form copy is written
 * and translated by hand, so it ships English-first; every other locale
 * 308-redirects to /en/how-it-works/* (the /security consolidation pattern).
 * Add a locale here only after its `content/how-it-works/<slug>/<locale>.md`
 * files and the `howItWorksHub` namespace land.
 */
export const HOW_IT_WORKS_LOCALES = ["en"] as const;

export function isHowItWorksLocale(locale: string): boolean {
  return (HOW_IT_WORKS_LOCALES as readonly string[]).includes(locale);
}
