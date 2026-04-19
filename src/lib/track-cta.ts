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
  | "downloads"
  | "landing-cta"
  | "downloads-page";

export type CtaPlatform = "ios" | "android" | "mac" | "windows" | "desktop";

export type CtaVariant =
  | "android-play"
  | "android-apk"
  | "windows-x64"
  | "windows-arm64";

export function trackCta(
  location: CtaLocation,
  platform: CtaPlatform,
  variant?: CtaVariant,
  pagePath?: string,
  locale?: string
) {
  track("cta_click", {
    location,
    platform,
    variant: variant ?? "",
    page_path: pagePath ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    locale: locale ?? "",
  });
}

export type GetProLocation =
  | "pricing"
  | "nav-desktop"
  | "nav-mobile"
  | "account-paywall"
  | "account-subscribe";

export function trackGetPro(
  location: GetProLocation,
  pagePath?: string,
  locale?: string
) {
  track("subscribe_cta_click", {
    location,
    page_path: pagePath ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    locale: locale ?? "",
  });
}
