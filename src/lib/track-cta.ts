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
  | "vpn-for-uae"
  | "vpn-for-iran"
  | "vpn-for-china"
  | "vpn-for-russia"
  | "vpn-for-turkey"
  | "vpn-for-telegram-calls-uae"
  | "vpn-for-whatsapp-calls-uae"
  | "vpn-for-instagram-russia"
  | "vpn-for-travelers-china"
  | "vpn-for-tiktok-ban"
  | "vpn-for-public-wifi-iphone"
  | "vless-vpn-android"
  | "footer"
  | "downloads"
  | "landing-cta"
  | "downloads-page"
  | "sticky-mobile";

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
  | "account-paywall";

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

export function trackAccountIdentified(
  mode: "new" | "existing",
  locale?: string
) {
  track("account_identified", {
    mode,
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
    locale: locale ?? "",
  });
}

export function trackCheckoutStarted(
  plan: string,
  paymentMethod: "card" | "crypto",
  hasPromo: boolean,
  locale?: string
) {
  track("checkout_started", {
    plan,
    payment_method: paymentMethod,
    promo: hasPromo,
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
    locale: locale ?? "",
  });
}

export function trackPurchaseResult(
  status: "paid" | "failed",
  plan: string | null,
  provider: string | null,
  reason?: string
) {
  track(status === "paid" ? "purchase_completed" : "purchase_failed", {
    plan: plan ?? "",
    provider: provider ?? "",
    ...(status === "failed" ? { reason: reason ?? "" } : {}),
  });
}
