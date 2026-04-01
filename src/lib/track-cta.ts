import { track } from "@vercel/analytics";

export type CtaLocation =
  | "hero"
  | "blog-sticky"
  | "blog-inline"
  | "blog-bottom"
  | "bypass-censorship"
  | "no-registration-vpn"
  | "vless-vpn"
  | "vpn-for-ios"
  | "vpn-for-android"
  | "vpn-for-macos"
  | "vpn-for-windows"
  | "footer"
  | "downloads";

export function trackCta(
  location: CtaLocation,
  platform: "ios" | "android" | "desktop",
  pagePath?: string,
  locale?: string
) {
  track("cta_click", {
    location,
    platform,
    page_path: pagePath ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    locale: locale ?? "",
  });
}
