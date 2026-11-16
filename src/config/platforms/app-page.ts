import type { CtaLocation, CtaPlatform, CtaVariant } from "@/lib/track-cta";

/**
 * Config shape for the app pages rendered by components/landing/platform-app-page.tsx:
 * the Apple pages (config/platforms/apple.ts) and the Android family
 * (config/platforms/android.ts: /vpn-for-android and /vpn-for-huawei) and the Linux
 * announcement (config/platforms/linux.ts). Windows still uses PlatformLandingPage.
 *
 * Words live in messages under `<namespace>.<copyKey>.*`; the strings every app page shares
 * (privacy facts, related links, "All downloads", the tour's prev/next) live in `applePage`,
 * the namespace that came first. Apple-only shared strings (the Apple-devices band, the guide
 * cards) stay there too; the Android family carries its own band under its page copy.
 */

/** One image at a known size. `src` is the largest width; Next picks smaller ones from `sizes`. */
export interface AppImage {
  src: string;
  width: number;
  height: number;
  /** Renders only: the studio backdrop colour, so the panel behind the image matches it. */
  bg?: string;
}

export type AppDevice = "phone" | "mac";

export type GuideSlug =
  | "vpn-on-apple-watch"
  | "what-is-sni"
  | "doppler-on-iphone-and-mac"
  | "one-account-every-apple-device";

/** Line glyphs the page draws itself (chapter trays, the device band). Paths live in the component. */
export type AppGlyph =
  | "phone"
  | "tablet"
  | "laptop"
  | "watch"
  | "tv"
  | "shield"
  | "route"
  | "killSwitch"
  | "id"
  | "download"
  | "card";

export interface AppTourShot {
  /** Key under `<namespace>.<copyKey>.tour.items`. */
  key: string;
  image: AppImage;
}

/**
 * One feature chapter. "phone" draws an iPhone frame around a capture, "android" a
 * hole-punch Android bezel (Play Store captures), "mac" a laptop bezel, "photo" fills
 * the card with a render. "glyph" draws a line glyph over the glyph rain: for platforms
 * with no caption-free captures yet, so the page never shows a staged screen. Its optional
 * `backdrop` is a photo under the rain (the App Store screenshots' glass photos).
 */
export type AppChapter =
  | { key: string; frame: "phone" | "android" | "mac" | "photo"; image: AppImage; guide?: GuideSlug }
  | { key: string; frame: "glyph"; glyph: AppGlyph; backdrop?: AppImage; guide?: GuideSlug }
  | { key: string; frame: "terminal"; lines: TerminalLine[]; guide?: GuideSlug };

/**
 * One line of a terminal card. Commands and their output are product syntax, so they live in
 * config and are never translated; the words around the card come from messages.
 */
export interface TerminalLine {
  kind: "cmd" | "out";
  text: string;
}

/** The mark on a download button. "file" is a direct download (the APK), not a store. */
export type StoreMark = "appStore" | "googlePlay" | "appGallery" | "file";

export interface AppButton {
  href: string;
  mark: StoreMark;
  variant?: CtaVariant;
  /** Label key under `<namespace>.<copyKey>.hero`. */
  labelKey: "cta" | "ctaSecondary";
}

/**
 * Install matrix on /vpn-for-android: real CTAs where a download exists, "Coming soon"
 * where it does not. Huawei deep-links here rather than duplicating the table.
 */
export type AndroidInstallStatus = "available" | "coming";

export interface AndroidInstallRow {
  key: string;
  status: AndroidInstallStatus;
  glyph: AppGlyph;
  /**
   * Action for an available row: page primary/secondary, always-APK, or Huawei page + APK.
   * Omitted on `coming` rows.
   */
  cta?: "primary" | "secondary" | "apk" | "huawei";
}

export interface AppPageConfig {
  slug: "vpn-for-ios" | "vpn-for-ipad" | "vpn-for-macos" | "vpn-for-android" | "vpn-for-huawei" | "vpn-for-linux";
  namespace: "vpnForIos" | "vpnForIpad" | "vpnForMacos" | "vpnForAndroid" | "vpnForHuawei" | "vpnForLinux";
  /** Sub-key of `namespace` holding this page's copy. */
  copyKey: "apple" | "app";
  /** Picks the eyebrow mark and where the device band's strings live. */
  family: "apple" | "android" | "linux";
  /** A parent page for the breadcrumb (iPad sits under iPhone). Title key is `applePage.related.<key>.title`. */
  parent?: { href: string; key: string };
  operatingSystem: string;
  trackLocation: CtaLocation;
  trackPlatform: CtaPlatform;
  /**
   * The page's one primary action, repeated in the final CTA. Its href is the schema's downloadUrl.
   * Omitted only on a page with `waitlist`: there is nothing to download yet.
   */
  primary?: AppButton;
  /**
   * An announced platform with no build: the hero and the final CTA show an email form in place
   * of a download button, the SoftwareApplication schema is left out (it would claim the app is
   * in stock), and the sticky download bar is not rendered. Strings: `<namespace>.<copyKey>.waitlist`.
   */
  waitlist?: { platform: "linux" };
  /** A quieter second way in, beside the primary (the APK next to Google Play). */
  secondary?: AppButton;
  /** Store whose rating sits beside the hero button. Omitted where there is no listing to rate. */
  rating?: "appStore" | "googlePlay";
  /** A second line under the hero note, key under `<namespace>.<copyKey>` (Huawei: "AppGallery is coming"). */
  heroNote2?: string;
  ogImageAlt: string;
  /** Hero art, above the fold, loaded with priority: a 3:2 image. Omitted with `heroTerminal`. */
  hero?: AppImage & { alt: string };
  /** A terminal card as the hero art, for a platform with no screens to show yet. */
  heroTerminal?: TerminalLine[];
  /**
   * The devices band. With `image`, the picture fills the left half; without one, a glyph tray
   * stands in. Apple reads its strings from `applePage.ecosystem`, the Android family from
   * `<namespace>.<copyKey>.ecosystem`. Omitted: no band.
   */
  ecosystem?: {
    image?: AppImage;
    altKey?: "photoAlt" | "photoAltDevices";
    devices: Array<{ key: string; glyph: AppGlyph }>;
    guides: GuideSlug[];
  };
  tourDevice: AppDevice;
  /** Swipeable screens. Empty skips the section (iOS dropped it 2026-11-06: "the gallery view is not important"). */
  tour: AppTourShot[];
  /** Smaller chapter cards and headings (iOS + iPad + Android). The Mac page keeps the large ones. */
  compact?: boolean;
  chapters: AppChapter[];
  /**
   * The four privacy cards. Keys without a dot read `applePage.privacy.<key>`; `page:<key>` reads
   * `<namespace>.<copyKey>.privacy.<key>`, for a card whose words depend on how the build is paid for.
   */
  privacy: string[];
  /** Order of the guide cards near the bottom of the page. Empty skips the section. */
  guides: GuideSlug[];
  /** Keys under `<namespace>.<copyKey>.faq`. */
  faqKeys: string[];
  /** Other platform pages, as related links at the foot of the page (`applePage.related.<key>`). */
  related: Array<{ href: string; key: string }>;
  /**
   * The picture beside the final CTA (alt: `applePage.cta.imageAlt`). Omitted: a glyph tray with
   * the primary button's store mark, so a page with one image does not repeat its hero.
   */
  ctaImage?: AppImage;
  /** A photo under the fallback glyph tray's rain, when there is no `ctaImage`. */
  ctaBackdrop?: AppImage;
  /**
   * Android-only: specs + device list (same Play APK everywhere) + install channels
   * (Play, sideload APK, Huawei). Rendered as `#get` so Huawei can deep-link here.
   */
  androidGet?: {
    specs: Array<{ key: string }>;
    /** Devices that share the Google Play listing / same app. Shown as a glyph list, not download rows. */
    devices: Array<{ key: string; glyph: AppGlyph }>;
    rows: AndroidInstallRow[];
  };
}
