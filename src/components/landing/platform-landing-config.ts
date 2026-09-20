import type React from "react";
import type { CtaLocation, CtaPlatform, CtaVariant } from "@/lib/track-cta";

type Icon = React.ComponentType<{ className?: string }>;

export interface PlatformFeature {
  /** Translation key under `<namespace>.features` */
  key: string;
  /** Featured cards span two columns and carry an oversized watermark icon. */
  featured?: boolean;
  icon: Icon;
}

export interface PlatformRelatedLink {
  /** Path beginning with "/" — passed to next-intl Link */
  href: string;
  /** Translation key under `<namespace>.related` */
  title: string;
  /** Translation key under `<namespace>.related` */
  desc: string;
}

export interface PlatformGalleryShot {
  /** Translation key under `<namespace>.gallery` */
  key: string;
  src: string;
}

/** Right-hand side of the hero: a real screenshot, or a brand panel when we don't have one yet. */
export type PlatformHeroVisual =
  | {
      kind: "image";
      src: string;
      /** A literal alt string, or `{ tKey }` to resolve one from the page namespace. */
      alt: string | { tKey: string };
      width: number;
      height: number;
      /** Corner radius utility — iOS/Android use the phone-like `rounded-[2rem]`. */
      roundedClass: string;
    }
  | { kind: "brandPanel"; icon: Icon };

/**
 * Everything that differs between `/vpn-for-ios`, `/vpn-for-android`,
 * `/vpn-for-macos` and `/vpn-for-windows`.
 *
 * Those four pages were ~85% identical (iOS and macOS differed by 172 of 1073
 * lines) and each re-declared its own copies of ShieldIcon, CheckIcon,
 * ArrowIcon, its own `generateMetadata`, and the same seven sections of markup.
 * `PlatformLandingPage` now owns the markup; this owns the differences.
 */
export interface PlatformLandingConfig {
  /** URL slug — must also exist in CtaLocation for analytics tracking. */
  slug: CtaLocation;
  /** next-intl namespace, e.g. "vpnForIos". */
  namespace: string;
  /** schema.org `operatingSystem` on PlatformAppSchema. */
  operatingSystem: string;
  /** `platform` passed to TrackedDownloadLink. */
  trackPlatform: CtaPlatform;
  downloadUrl: string;
  /** `variant` passed to TrackedDownloadLink, where the platform has more than one artifact. */
  downloadVariant?: CtaVariant;
  /**
   * true  → `<a download>` (we serve the file, e.g. the Windows installer)
   * false → `target="_blank" rel="noopener noreferrer"` (off to a store)
   */
  directDownload?: boolean;
  /** `alt` on the OG image. */
  ogImageAlt: string;

  /** Store-rating chip above the headline. Omitted on Windows (no store rating). */
  ratingChip?: { storeKey: string };
  heroCtaIcon: Icon;
  /** Translation key for the hero button label, e.g. "hero.cta". */
  heroCtaKey: string;
  /** Hero grid gap — Windows runs tighter at `lg:gap-16`. */
  heroGapClass: string;
  heroVisual: PlatformHeroVisual;
  /** Windows only: the SmartScreen heads-up under the download button. */
  smartScreenNotice?: boolean;

  features: readonly PlatformFeature[];
  stepKeys: readonly string[];
  faqKeys: readonly string[];
  /** Optional "inside the app" screenshot gallery. Windows only today. */
  gallery?: readonly PlatformGalleryShot[];
  related: readonly PlatformRelatedLink[];
  /** Translation key for the final-CTA button label, e.g. "cta.downloadIos". */
  ctaDownloadKey: string;
}
