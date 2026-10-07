/**
 * Locales the /vpn-protocols hub and its articles exist in. The copy is
 * written and translated by hand. A locale is listed only after its
 * `content/vpn-protocols/<slug>/<locale>.md` files and the `vpnProtocols`
 * namespace exist. Any locale left off this list 308-redirects to
 * /en/vpn-protocols/*.
 */
export const VPN_PROTOCOLS_LOCALES = [
  "en", "ru", "es", "pt", "fr", "zh", "zh-Hant", "de", "he", "fa", "ar",
  "hi", "id", "tr", "vi", "th", "ms", "ko", "ja", "tl", "ur", "sw", "az",
  "pl", "uk", "bg", "bn", "ca", "cs", "da", "el", "et", "fi", "hr", "hu",
  "it", "lt", "lv", "nb", "nl", "ro", "sk", "sl", "sv",
] as const;

export function isVpnProtocolsLocale(locale: string): boolean {
  return (VPN_PROTOCOLS_LOCALES as readonly string[]).includes(locale);
}
