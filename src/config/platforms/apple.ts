import type { CtaLocation, CtaPlatform } from "@/lib/track-cta";

/**
 * Config for the two Apple app pages (/vpn-for-ios, /vpn-for-macos), rendered by
 * components/landing/apple-app-page.tsx. Android and Windows keep PlatformLandingPage.
 *
 * Every image is a caption-free capture or mockup exported by Screenshot Studio
 * (doppler-apple/fastlane/screenshot-studio/scripts/web-shots.mjs) into
 * public/images/apple/<name>-<width>.avif. Words live in messages under
 * `<namespace>.apple.*`, never inside the images.
 */

/** One image at a known size. `src` is the largest width; Next picks smaller ones from `sizes`. */
export interface AppleImage {
  src: string;
  width: number;
  height: number;
  /** Renders only: the studio backdrop colour, so the panel behind the image matches it. */
  bg?: string;
}

/**
 * Backdrop of each studio render, sampled from its corners. A panel holding a render is
 * painted this colour so the image bleeds into it. Framed app screens stay on the page's
 * own card colour (Roman, 2026-11-06: "better with white").
 */
const RENDER_BACKDROPS: Record<string, string> = {
  "mac-front": "#ABABAB",
  "watch-s10": "#2F2F2F",
  "ipad-hand": "#BEBEBE",
  // Lit from the left, black table bottom-left: the panel takes the top edge's mid grey.
  "ipad-keyboard": "#D7D7D7",
  "iphone-duo": "#D5D5D5",
};
const DEFAULT_RENDER_BG = "#CDCDCD";

/** Backdrop colour for a render's src (`/images/apple/<name>-<w>.avif`). */
export function renderBg(src: string): string {
  const name = src.split("/").pop()?.replace(/-\d+\.avif$/, "") ?? "";
  return RENDER_BACKDROPS[name] ?? DEFAULT_RENDER_BG;
}

export type AppleDevice = "phone" | "mac";

export interface AppleTourShot {
  /** Key under `<namespace>.apple.tour.items`. */
  key: string;
  image: AppleImage;
}

export interface AppleChapter {
  /** Key under `<namespace>.apple.chapters`. */
  key: string;
  /** "phone" draws an iPhone frame around a capture, "mac" a laptop bezel, "photo" fills the card. */
  frame: "phone" | "mac" | "photo";
  image: AppleImage;
  /** Optional guide link under the copy. Locale-free path; guides are English-only for now. */
  guide?: GuideSlug;
}

export type GuideSlug =
  | "vpn-on-apple-watch"
  | "what-is-sni"
  | "doppler-on-iphone-and-mac"
  | "one-account-every-apple-device";

export interface AppleAppConfig {
  slug: "vpn-for-ios" | "vpn-for-ipad" | "vpn-for-macos";
  namespace: "vpnForIos" | "vpnForIpad" | "vpnForMacos";
  /** A parent page for the breadcrumb (iPad sits under iPhone). Title key is `applePage.related.<key>.title`. */
  parent?: { href: string; key: string };
  operatingSystem: string;
  trackLocation: CtaLocation;
  trackPlatform: CtaPlatform;
  downloadUrl: string;
  ogImageAlt: string;
  /** Hero art, above the fold, loaded with priority: a 3:2 studio render. */
  hero: AppleImage & { alt: string };
  /** The render beside the "every Apple device" copy, and its alt key under `applePage.ecosystem`. */
  ecosystem: { image: AppleImage; altKey: "photoAlt" | "photoAltDevices" };
  tourDevice: AppleDevice;
  /** Swipeable screens. Empty skips the section (iOS dropped it 2026-11-06: "the gallery view is not important"). */
  tour: AppleTourShot[];
  /** Smaller chapter cards and headings (iOS + iPad). The Mac page keeps the large ones. */
  compact?: boolean;
  chapters: AppleChapter[];
  /** Order of the guide cards near the bottom of the page. */
  guides: GuideSlug[];
  /** Keys under `<namespace>.apple.faq`. */
  faqKeys: string[];
  /** Other platform pages, as related links at the foot of the page. */
  related: Array<{ href: string; key: string }>;
}

const A = "/images/apple";
const phone = (name: string): AppleImage => ({ src: `${A}/iphone-${name}-1000.avif`, width: 1000, height: 2174 });
const mac = (name: string): AppleImage => ({ src: `${A}/mac-${name}-1920.avif`, width: 1920, height: 1200 });
const photo = (name: string, width = 1800, height = 1200): AppleImage => ({
  src: `${A}/${name}-${width}.avif`,
  width,
  height,
  bg: RENDER_BACKDROPS[name] ?? DEFAULT_RENDER_BG,
});

/** One App Store listing serves iPhone, iPad, Mac and Apple Watch (universal purchase). */
export const APPLE_APP_STORE_URL = "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";

/** Cover art for each guide: the card on the app pages and the hero of the article. */
export const GUIDE_COVERS: Record<GuideSlug, AppleImage> = {
  "vpn-on-apple-watch": photo("watch-s11"),
  "what-is-sni": photo("sni-options"),
  "doppler-on-iphone-and-mac": photo("iphone-hand"),
  "one-account-every-apple-device": photo("watch-s10"),
};

export const APPLE_GUIDES: GuideSlug[] = [
  "doppler-on-iphone-and-mac",
  "what-is-sni",
  "vpn-on-apple-watch",
  "one-account-every-apple-device",
];

export const iosApple: AppleAppConfig = {
  slug: "vpn-for-ios",
  namespace: "vpnForIos",
  operatingSystem: "iOS",
  trackLocation: "vpn-for-ios",
  trackPlatform: "ios",
  downloadUrl: APPLE_APP_STORE_URL,
  ogImageAlt: "Doppler VPN for iPhone & iPad",
  hero: { ...photo("iphone-hand"), alt: "Doppler VPN on an iPhone held in hand, connected and protected" },
  ecosystem: { image: photo("watch-s11"), altKey: "photoAlt" },
  tourDevice: "phone",
  tour: [],
  compact: true,
  chapters: [
    { key: "connect", frame: "phone", image: phone("search"), guide: "doppler-on-iphone-and-mac" },
    { key: "unblock", frame: "photo", image: photo("sni-options"), guide: "what-is-sni" },
    { key: "path", frame: "phone", image: phone("path") },
    { key: "split", frame: "phone", image: phone("split") },
  ],
  guides: APPLE_GUIDES,
  faqKeys: ["q1", "q2", "q3", "q4", "q5", "q6"],
  related: [
    { href: "/vpn-for-ipad", key: "ipad" },
    { href: "/vpn-for-macos", key: "macos" },
    { href: "/vpn-for-android", key: "android" },
  ],
};

/**
 * iPad and the iPhone Duo: the big-screen layouts of the same iOS app (sidebar on iPad,
 * two columns on Duo). No tour: there are no caption-free iPad captures yet, only renders.
 */
export const ipadApple: AppleAppConfig = {
  slug: "vpn-for-ipad",
  namespace: "vpnForIpad",
  parent: { href: "/vpn-for-ios", key: "ios" },
  operatingSystem: "iPadOS",
  trackLocation: "vpn-for-ipad",
  trackPlatform: "ios",
  downloadUrl: APPLE_APP_STORE_URL,
  ogImageAlt: "Doppler VPN for iPad and iPhone Duo",
  hero: { ...photo("ipad-hand", 1800, 1350), alt: "Doppler VPN on an iPad Pro held in one hand, showing the sidebar and the Devices page" },
  ecosystem: { image: photo("watch-s11"), altKey: "photoAlt" },
  tourDevice: "phone",
  tour: [],
  compact: true,
  chapters: [
    { key: "duo", frame: "photo", image: photo("iphone-duo", 1800, 1344) },
    { key: "keyboard", frame: "photo", image: photo("ipad-keyboard"), guide: "what-is-sni" },
    { key: "account", frame: "phone", image: phone("devices"), guide: "one-account-every-apple-device" },
  ],
  guides: APPLE_GUIDES,
  faqKeys: ["q1", "q2", "q3", "q4", "q5"],
  related: [
    { href: "/vpn-for-ios", key: "ios" },
    { href: "/vpn-for-macos", key: "macos" },
    { href: "/vpn-for-android", key: "android" },
  ],
};

export const macosApple: AppleAppConfig = {
  slug: "vpn-for-macos",
  namespace: "vpnForMacos",
  operatingSystem: "macOS",
  trackLocation: "vpn-for-macos",
  trackPlatform: "mac",
  downloadUrl: APPLE_APP_STORE_URL,
  ogImageAlt: "Doppler VPN for Mac",
  hero: { ...photo("mac-front"), alt: "Doppler VPN on a MacBook Pro, connected and protected" },
  ecosystem: { image: photo("watch-s10"), altKey: "photoAltDevices" },
  tourDevice: "mac",
  // The hero already shows the connected VPN screen, so the tour starts one step in.
  tour: ["unblock", "path", "split", "speed", "devices", "appearance"].map((key) => ({
    key,
    image: mac(key),
  })),
  chapters: [
    { key: "connect", frame: "mac", image: mac("search"), guide: "doppler-on-iphone-and-mac" },
    { key: "unblock", frame: "photo", image: photo("mac-hand"), guide: "what-is-sni" },
    { key: "path", frame: "mac", image: mac("path") },
    { key: "split", frame: "mac", image: mac("split") },
  ],
  guides: APPLE_GUIDES,
  faqKeys: ["q1", "q2", "q3", "q4", "q5", "q6"],
  related: [
    { href: "/vpn-for-ios", key: "ios" },
    { href: "/vpn-for-windows", key: "windows" },
    { href: "/vpn-for-android", key: "android" },
  ],
};
