/**
 * Brand a page title exactly once, whatever shape the translator used.
 *
 * The locale layout sets `title.template = "%s | Doppler VPN"`, which Next.js
 * appends to every child page's title. But roughly half our source titles
 * already carry the brand themselves — sometimes as a suffix
 * ("VPN Without Registration — No Email, No Account | Doppler VPN"), more often
 * grammatically embedded ("Doppler VPN for Mac — Fast, Private…",
 * "Mac üçün Doppler VPN", "مكالمات واتساب في الإمارات — Doppler VPN"). Measured
 * across the 27 title keys × 44 locales: 604 of 1,150 title instances rendered
 * "Doppler VPN" twice, while the other 546 relied on the template as their only
 * brand mention.
 *
 * Neither blunt fix works. Deleting the template de-brands those 546; stripping
 * the brand out of the message files is a translation job rather than a string
 * edit, because it is embedded mid-sentence in 427 of 572 localized titles.
 *
 * Returning `{ absolute }` opts a title out of the template. So: keep the
 * template for titles that need it, bypass it for titles that already brand
 * themselves. Fixes every locale with no message-file changes.
 *
 * Deliberately NOT applied to `metadata.title` in the locale layout — that is
 * the `default`, which Next.js never runs through the template anyway.
 */
export function seoTitle(title: string): string | { absolute: string } {
  return title.includes("Doppler") ? { absolute: title } : title;
}
