import type { AppImage, AppPageConfig } from "./app-page";

/**
 * The Android family's app pages: /vpn-for-android (Google Play first, the APK beside it) and
 * /vpn-for-huawei (Huawei and Honor phones without Google services: AppGallery once listed,
 * the APK until then). Rendered by components/landing/platform-app-page.tsx.
 *
 * Images: there are no caption-free Android captures or studio renders yet, so both heroes use
 * the one existing composite of real Android screens (android-hero.avif) and every chapter is a
 * glyph tray. TODO(renders): export Android phone, tablet and Huawei renders and give the
 * chapters real screens, the way public/images/apple/* serves the Apple pages.
 *
 * Claims follow doppler-product/PARITY.md's Android column. Chromebooks and Android TV are
 * phrased as coming, and so is a big-screen layout: the app runs on tablets and foldables, but
 * has no two-pane layout yet.
 */

export const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=org.dopplervpn.android";

/**
 * The standalone (sideload) build: no Play Billing, pays through the web checkout, and shows its
 * own "update available" banner. Same-origin on purpose; see the route's header.
 */
export const ANDROID_APK_URL = "/api/android/download/latest";

/**
 * The AppGallery listing. null until the listing is live: until then the Huawei page and the
 * Huawei download card offer the APK as their primary action. Set it to the listing URL and
 * both switch to AppGallery first with the APK beside it, with no other change.
 */
export const HUAWEI_APPGALLERY_URL: string | null = null;

const ANDROID_HERO: AppImage = { src: "/images/android-hero.avif", width: 1354, height: 909 };

export const androidApp: AppPageConfig = {
  copyKey: "app",
  family: "android",
  slug: "vpn-for-android",
  namespace: "vpnForAndroid",
  operatingSystem: "Android",
  trackLocation: "vpn-for-android",
  trackPlatform: "android",
  primary: { href: GOOGLE_PLAY_URL, mark: "googlePlay", variant: "android-play", labelKey: "cta" },
  secondary: { href: ANDROID_APK_URL, mark: "file", variant: "android-apk", labelKey: "ctaSecondary" },
  rating: "googlePlay",
  ogImageAlt: "Doppler VPN for Android",
  hero: { ...ANDROID_HERO, alt: "Doppler VPN on Android: the Home, Smart Route and Devices screens" },
  ecosystem: {
    devices: [
      { key: "phone", glyph: "phone" },
      { key: "tablet", glyph: "tablet" },
      { key: "chromebook", glyph: "laptop" },
      { key: "tv", glyph: "tv" },
    ],
    guides: [],
  },
  tourDevice: "phone",
  tour: [],
  compact: true,
  chapters: [
    { key: "connect", frame: "glyph", glyph: "shield" },
    { key: "route", frame: "glyph", glyph: "route" },
    { key: "killSwitch", frame: "glyph", glyph: "killSwitch" },
    { key: "account", frame: "glyph", glyph: "id" },
  ],
  privacy: ["noEmail", "vless", "noLogs", "page:trial"],
  guides: [],
  faqKeys: ["q1", "q2", "q3", "q4", "q5"],
  related: [
    { href: "/vpn-for-huawei", key: "huawei" },
    { href: "/vpn-for-ios", key: "ios" },
    { href: "/vpn-for-windows", key: "windows" },
  ],
};

export const huaweiApp: AppPageConfig = {
  copyKey: "app",
  family: "android",
  slug: "vpn-for-huawei",
  namespace: "vpnForHuawei",
  parent: { href: "/vpn-for-android", key: "android" },
  operatingSystem: "Android",
  trackLocation: "vpn-for-huawei",
  trackPlatform: "huawei",
  primary: HUAWEI_APPGALLERY_URL
    ? { href: HUAWEI_APPGALLERY_URL, mark: "appGallery", variant: "huawei-appgallery", labelKey: "cta" }
    : { href: ANDROID_APK_URL, mark: "file", variant: "android-apk", labelKey: "ctaSecondary" },
  ...(HUAWEI_APPGALLERY_URL
    ? { secondary: { href: ANDROID_APK_URL, mark: "file" as const, variant: "android-apk" as const, labelKey: "ctaSecondary" as const } }
    : {}),
  // Said only while there is no listing; the FAQ's AppGallery answer goes with it.
  ...(HUAWEI_APPGALLERY_URL ? {} : { heroNote2: "hero.appGalleryNote" }),
  ogImageAlt: "Doppler VPN for Huawei and Honor",
  hero: { ...ANDROID_HERO, alt: "Doppler VPN's Android app: the Home, Smart Route and Devices screens" },
  tourDevice: "phone",
  tour: [],
  compact: true,
  chapters: [
    { key: "noGoogle", frame: "glyph", glyph: "download" },
    { key: "connect", frame: "glyph", glyph: "shield" },
    { key: "pay", frame: "glyph", glyph: "card" },
    { key: "phones", frame: "glyph", glyph: "phone" },
  ],
  privacy: ["noEmail", "vless", "noLogs", "page:pay"],
  guides: [],
  faqKeys: HUAWEI_APPGALLERY_URL ? ["q1", "q3", "q4", "q5"] : ["q1", "q2", "q3", "q4", "q5"],
  related: [
    { href: "/vpn-for-android", key: "android" },
    { href: "/vpn-for-ios", key: "ios" },
    { href: "/vpn-for-windows", key: "windows" },
  ],
};
