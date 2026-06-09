/**
 * Locales the /security trust page is hand-translated into. Other locales
 * 308-redirect to /en/security (same consolidation pattern as the blog).
 * Extend this list only after the `security` namespace lands in that locale's
 * messages file.
 */
export const SECURITY_LOCALES = ["en", "ru", "fa", "zh", "ar", "tr"] as const;

export function isSecurityLocale(locale: string): boolean {
  return (SECURITY_LOCALES as readonly string[]).includes(locale);
}
