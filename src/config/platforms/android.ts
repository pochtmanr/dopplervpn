import type { AppImage, AppPageConfig } from "./app-page";

/**
 * The Android family's app pages: /vpn-for-android (Google Play first, the APK beside it) and
 * /vpn-for-huawei (Huawei and Honor phones without Google services: AppGallery once listed,
 * the APK until then). Rendered by components/landing/platform-app-page.tsx.
 *
 * Images: hero uses a device mockup from public/archive/. Feature chapters use caption-free
 * Play Store phone captures in public/images/android/ (phone-<name>-1000.avif) inside an
 * Android hole-punch frame — varied screens, not the home screen on every chapter. Tablet
 * art for the devices band: tablet-<name>-1920.avif. Words live in messages under
 * `<namespace>.app.*`, never inside the images.
 *
 * Claims follow doppler-product/PARITY.md's Android column. Phones, tablets, Chromebooks
 * (ChromeOS) and Android TV / Google TV install from the same Google Play listing; the
 * sideload APK covers phones without Play (including Huawei / Honor). The app runs on
 * tablets and foldables today, but has no two-pane layout yet.
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

const A = "/images/android";
const phone = (name: string): AppImage => ({ src: `${A}/phone-${name}-1000.avif`, width: 1000, height: 2222 });
/** Device mockups from public/archive/ (chrome already in-frame). */
const archive = (name: string, width: number, height: number, bg: string): AppImage => ({
  src: `/archive/${name}.avif`,
  width,
  height,
  bg,
});

const ANDROID_HERO: AppImage = archive("galaxy", 1500, 1000, "#2A2A2A");
const MOCK_PHONE = archive("galaxy", 1500, 1000, "#2A2A2A");
const MOCK_CHROMEBOOK = archive("glalaxy2", 1500, 1000, "#2F2F2F");
const MOCK_TV = archive("gyexu8daj3uegntwy1nr", 1800, 1350, "#B8B8B8");

const ANDROID_DEVICES = [
  { key: "phone", glyph: "phone" as const },
  { key: "tablet", glyph: "tablet" as const },
  { key: "chromebook", glyph: "laptop" as const },
  { key: "tv", glyph: "tv" as const },
];

const PLAY_BUTTON = {
  href: GOOGLE_PLAY_URL,
  mark: "googlePlay",
  variant: "android-play",
  labelKey: "cta",
} as const;

/** Sideload APK button — hero secondary on Play, primary on Huawei until AppGallery lists. */
export const ANDROID_APK_BUTTON = {
  href: ANDROID_APK_URL,
  mark: "file",
  variant: "android-apk",
  labelKey: "ctaSecondary",
} as const;

/** The smaller armeabi-v7a file for old 32-bit phones; the plain APK link serves the universal one. */
export const ANDROID_APK32_BUTTON = {
  href: `${ANDROID_APK_URL}?abi=armeabi-v7a`,
  mark: "file",
  variant: "android-apk",
  labelKey: "ctaSecondary",
} as const;

export const androidApp: AppPageConfig = {
  copyKey: "app",
  family: "android",
  slug: "vpn-for-android",
  namespace: "vpnForAndroid",
  operatingSystem: "Android",
  trackLocation: "vpn-for-android",
  trackPlatform: "android",
  primary: PLAY_BUTTON,
  secondary: ANDROID_APK_BUTTON,
  rating: "googlePlay",
  ogImageAlt: "Doppler VPN for Android",
  hero: { ...ANDROID_HERO, alt: "Doppler VPN on a Galaxy phone, connected and protected" },
  ecosystem: {
    image: MOCK_CHROMEBOOK,
    altKey: "photoAlt",
    devices: ANDROID_DEVICES,
    guides: [],
  },
  tourDevice: "phone",
  tour: [],
  compact: true,
  // Play-style captures in an Android frame — search / path / Smart Route / devices, not Home×4.
  chapters: [
    { key: "connect", frame: "android", image: phone("search") },
    { key: "route", frame: "android", image: phone("path") },
    { key: "killSwitch", frame: "android", image: phone("split") },
    { key: "account", frame: "android", image: phone("devices") },
  ],
  androidGet: {
    specs: [
      { key: "android" },
      { key: "size" },
      { key: "storage" },
      { key: "abi" },
      { key: "trial" },
    ],
    devices: ANDROID_DEVICES,
    rows: [
      { key: "play", status: "available", glyph: "phone", cta: "primary" },
      { key: "apk", status: "available", glyph: "download", cta: "apk" },
      { key: "huawei", status: "available", glyph: "download", cta: "huawei" },
    ],
  },
  ctaImage: MOCK_TV,
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
  // Listing live → AppGallery primary + APK secondary; otherwise APK alone + hero note.
  ...(HUAWEI_APPGALLERY_URL
    ? {
        primary: {
          href: HUAWEI_APPGALLERY_URL,
          mark: "appGallery" as const,
          variant: "huawei-appgallery" as const,
          labelKey: "cta" as const,
        },
        secondary: ANDROID_APK_BUTTON,
      }
    : {
        primary: ANDROID_APK_BUTTON,
        heroNote2: "hero.appGalleryNote",
      }),
  ogImageAlt: "Doppler VPN for Huawei and Honor",
  hero: { ...ANDROID_HERO, alt: "Doppler VPN on a Galaxy phone, connected and protected" },
  tourDevice: "phone",
  tour: [],
  compact: true,
  chapters: [
    { key: "noGoogle", frame: "glyph", glyph: "download" },
    { key: "connect", frame: "android", image: phone("search") },
    { key: "pay", frame: "glyph", glyph: "card" },
    { key: "phones", frame: "android", image: phone("devices") },
  ],
  ctaImage: MOCK_PHONE,
  privacy: ["noEmail", "vless", "noLogs", "page:pay"],
  guides: [],
  faqKeys: HUAWEI_APPGALLERY_URL ? ["q1", "q3", "q4", "q5"] : ["q1", "q2", "q3", "q4", "q5"],
  related: [
    { href: "/vpn-for-android#get", key: "android" },
    { href: "/vpn-for-ios", key: "ios" },
    { href: "/vpn-for-windows", key: "windows" },
  ],
};
