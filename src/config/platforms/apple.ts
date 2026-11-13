import type { AppImage, AppPageConfig, GuideSlug } from "./app-page";

export type { AppChapter as AppleChapter, AppDevice as AppleDevice, GuideSlug } from "./app-page";

/**
 * Config for the Apple app pages (/vpn-for-ios, /vpn-for-ipad, /vpn-for-macos), rendered by
 * components/landing/platform-app-page.tsx. The shape is shared with the Android family
 * (config/platforms/app-page.ts).
 *
 * Every image is a caption-free capture or mockup exported by Screenshot Studio
 * (doppler-apple/fastlane/screenshot-studio/scripts/web-shots.mjs) into
 * public/images/apple/<name>-<width>.avif. Words live in messages under
 * `<namespace>.apple.*`, never inside the images.
 */

/** One image at a known size. Kept under its first name for the guides and the tour. */
export type AppleImage = AppImage;
export type AppleAppConfig = AppPageConfig;

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

const A = "/images/apple";
const phone = (name: string): AppleImage => ({ src: `${A}/iphone-${name}-1000.avif`, width: 1000, height: 2174 });
const mac = (name: string): AppleImage => ({ src: `${A}/mac-${name}-1920.avif`, width: 1920, height: 1200 });
const photo = (name: string, width = 1800, height = 1200): AppleImage => ({
  src: `${A}/${name}-${width}.avif`,
  width,
  height,
  bg: RENDER_BACKDROPS[name] ?? DEFAULT_RENDER_BG,
});
/** Device mockups from public/archive/ (chrome already in-frame). */
const archive = (name: string, width: number, height: number, bg: string): AppleImage => ({
  src: `/archive/${name}.avif`,
  width,
  height,
  bg,
});

const ARCHIVE_IPHONE = archive("iphone", 2250, 1500, "#C8C8C8");
const ARCHIVE_IPHONE2 = archive("iphone2", 2250, 1500, "#C8C8C8");
const ARCHIVE_IPHONE_BRICK = archive("iphonebrick", 1125, 750, "#D0D0D0");
const ARCHIVE_MACPRO = archive("macpro", 2250, 1500, "#1E3A2F");

/** One App Store listing serves iPhone, iPad, Mac and Apple Watch (universal purchase). */
export const APPLE_APP_STORE_URL = "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";

/** Cover art for each guide: the card on the app pages and the hero of the article. */
export const GUIDE_COVERS: Record<GuideSlug, AppleImage> = {
  "vpn-on-apple-watch": photo("watch-s11"),
  "what-is-sni": photo("sni-options"),
  "doppler-on-iphone-and-mac": ARCHIVE_IPHONE_BRICK,
  "one-account-every-apple-device": photo("watch-s10"),
};

export const APPLE_GUIDES: GuideSlug[] = [
  "doppler-on-iphone-and-mac",
  "what-is-sni",
  "vpn-on-apple-watch",
  "one-account-every-apple-device",
];

const APP_STORE_BUTTON = { href: APPLE_APP_STORE_URL, mark: "appStore", labelKey: "cta" } as const;

/** The Apple-devices band: its four devices and the two guides under them. */
const APPLE_DEVICES: Pick<NonNullable<AppPageConfig["ecosystem"]>, "devices" | "guides"> = {
  devices: [
    { key: "iphone", glyph: "phone" },
    { key: "ipad", glyph: "tablet" },
    { key: "mac", glyph: "laptop" },
    { key: "watch", glyph: "watch" },
  ],
  guides: ["vpn-on-apple-watch", "one-account-every-apple-device"],
};

const APPLE_PRIVACY = ["noEmail", "vless", "noLogs", "trial"];

export const iosApple: AppleAppConfig = {
  copyKey: "apple",
  family: "apple",
  slug: "vpn-for-ios",
  namespace: "vpnForIos",
  operatingSystem: "iOS",
  trackLocation: "vpn-for-ios",
  trackPlatform: "ios",
  primary: APP_STORE_BUTTON,
  rating: "appStore",
  ogImageAlt: "Doppler VPN for iPhone & iPad",
  hero: { ...ARCHIVE_IPHONE, alt: "Doppler VPN on an iPhone held in hand, connected and protected" },
  ecosystem: { image: photo("watch-s11"), altKey: "photoAlt", ...APPLE_DEVICES },
  tourDevice: "phone",
  tour: [],
  compact: true,
  chapters: [
    { key: "connect", frame: "phone", image: phone("search"), guide: "doppler-on-iphone-and-mac" },
    { key: "unblock", frame: "photo", image: ARCHIVE_IPHONE2, guide: "what-is-sni" },
    { key: "path", frame: "phone", image: phone("path") },
    { key: "split", frame: "phone", image: phone("split") },
  ],
  privacy: APPLE_PRIVACY,
  guides: APPLE_GUIDES,
  ctaImage: GUIDE_COVERS["doppler-on-iphone-and-mac"],
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
  copyKey: "apple",
  family: "apple",
  slug: "vpn-for-ipad",
  namespace: "vpnForIpad",
  parent: { href: "/vpn-for-ios", key: "ios" },
  operatingSystem: "iPadOS",
  trackLocation: "vpn-for-ipad",
  trackPlatform: "ios",
  primary: APP_STORE_BUTTON,
  rating: "appStore",
  ogImageAlt: "Doppler VPN for iPad and iPhone Duo",
  hero: { ...photo("ipad-hand", 1800, 1350), alt: "Doppler VPN on an iPad Pro held in one hand, showing the sidebar and the Devices page" },
  ecosystem: { image: photo("watch-s11"), altKey: "photoAlt", ...APPLE_DEVICES },
  tourDevice: "phone",
  tour: [],
  compact: true,
  chapters: [
    { key: "duo", frame: "photo", image: photo("iphone-duo", 1800, 1344) },
    { key: "keyboard", frame: "photo", image: photo("ipad-keyboard"), guide: "what-is-sni" },
    { key: "account", frame: "phone", image: phone("devices"), guide: "one-account-every-apple-device" },
  ],
  privacy: APPLE_PRIVACY,
  guides: APPLE_GUIDES,
  ctaImage: GUIDE_COVERS["doppler-on-iphone-and-mac"],
  faqKeys: ["q1", "q2", "q3", "q4", "q5"],
  related: [
    { href: "/vpn-for-ios", key: "ios" },
    { href: "/vpn-for-macos", key: "macos" },
    { href: "/vpn-for-android", key: "android" },
  ],
};

export const macosApple: AppleAppConfig = {
  copyKey: "apple",
  family: "apple",
  slug: "vpn-for-macos",
  namespace: "vpnForMacos",
  operatingSystem: "macOS",
  trackLocation: "vpn-for-macos",
  trackPlatform: "mac",
  primary: APP_STORE_BUTTON,
  rating: "appStore",
  ogImageAlt: "Doppler VPN for Mac",
  hero: { ...ARCHIVE_MACPRO, alt: "Doppler VPN on a Studio Display, connected and protected" },
  ecosystem: { image: photo("watch-s10"), altKey: "photoAltDevices", ...APPLE_DEVICES },
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
  privacy: APPLE_PRIVACY,
  guides: APPLE_GUIDES,
  ctaImage: GUIDE_COVERS["doppler-on-iphone-and-mac"],
  faqKeys: ["q1", "q2", "q3", "q4", "q5", "q6"],
  related: [
    { href: "/vpn-for-ios", key: "ios" },
    { href: "/vpn-for-windows", key: "windows" },
    { href: "/vpn-for-android", key: "android" },
  ],
};
