import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import {
  BreadcrumbSchema,
  SoftwareApplicationSchema,
  WebPageSchema,
} from "@/components/seo/json-ld";
import { TrackedDownloadLink } from "@/components/downloads/tracked-download-link";
import { Reveal } from "@/components/ui/reveal";
import { PlatformLogo, type PlatformIcon } from "@/components/glyph/platform-icons";
import { SetupSection, type SetupPlatform } from "@/components/downloads/setup-section";
import { DetectedCard, DetectedPlatformProvider } from "@/components/downloads/detected-platform";
import type { CtaVariant } from "@/lib/track-cta";
import { ANDROID_APK32_BUTTON, ANDROID_APK_URL, GOOGLE_PLAY_URL as PLAY_URL } from "@/config/platforms/android";
import { seoTitle } from "@/lib/seo-title";
import { iosApple, macosApple } from "@/config/platforms/apple";
import { androidApp } from "@/config/platforms/android";
import {
  CARD,
  CARD_HAIRLINE,
  CARD_TITLE,
  HERO_SECTION,
  HERO_SUBTITLE,
  HERO_TITLE,
  HERO_TITLE_RAMP,
  ROW_CARD,
  ROW_TEXT,
  ROW_TILE,
  ROW_TITLE,
  splitHeadline,
} from "@/components/ui/card-recipes";
// Calm+ (design-lab/home-preview.tsx; CALM_PLUS_PREVIEW=0 turns it off).
import { Fragment } from "react";
import { PlatformGlyphBand } from "@/components/glyph/platform-glyph-band";
import { calmPlusPreview, PlusPageShell } from "../design-lab/home-preview";
import {
  ArrowGlyph,
  PLUS_BTN,
  PLUS_BTN_SECONDARY,
  PLUS_CARD,
  PLUS_CARD_HOVER,
  PLUS_CHIP,
  PLUS_ICON,
  PLUS_ICON_TONE,
  PLUS_META,
  PLUS_TITLE_SM,
  PLUS_WELL,
} from "../design-lab/plus-recipes";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apps" });
  const title = t("title");
  const description = t("subtitle");
  return {
    title: seoTitle(title),
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/downloads`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/downloads`]),
        ["x-default", `${baseUrl}/en/downloads`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/downloads`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/images/og-banner.jpg`,
          width: 1200,
          height: 630,
          alt: "Doppler VPN — Fast & Secure",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/images/og-banner.jpg`],
    },
  };
}

/* ── Download URLs ───────────────────────────────────────────────── */

const URLS = {
  ios: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
  androidPlayStore: PLAY_URL,
  mac: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
  // One Windows build, x64 only. ARM64 Windows runs it under emulation; there is
  // no separate ARM64 installer to offer and no ARM64 tunnel that has been verified
  // on a device. See dopplerWindows/DopplerVPN.csproj.
  windowsX64: "/api/windows/download/latest-x64",
  // Standalone (sideload) build: no Play Billing, pays through the web checkout.
  // Same-origin on purpose — the route decides where the bytes come from, so the
  // link printed here survives a change of hosting. See the route's own header.
  androidApk: ANDROID_APK_URL,
  // The smaller 32-bit file for old phones (armeabi-v7a only). The plain link
  // above serves the universal APK, which also installs on them.
  androidApk32: ANDROID_APK32_BUTTON.href,
  // The direct builds for people whose App Store has no Doppler (Russia, China):
  // a public TestFlight link for iPhone and a Developer ID DMG for Mac, both
  // paying through the web checkout. Same-origin for the same reason as the APK.
  iosTestflight: "/api/ios/testflight",
  macDmg: "/api/mac/download/latest",
};

// Each direct button stays hidden until its build exists, so the page never
// offers a link that dead-ends. IOS_TESTFLIGHT_URL is the public link itself;
// MAC_DMG_ENABLED=1 is flipped once the first mac-v* release is published.
const SHOW_IOS_TESTFLIGHT = Boolean(process.env.IOS_TESTFLIGHT_URL);
const SHOW_MAC_DMG = process.env.MAC_DMG_ENABLED === "1";

// Store links for the ratings row — the same two the home hero and CTA card use.
const APP_STORE_URL = URLS.ios;
const GOOGLE_PLAY_URL = URLS.androidPlayStore;

/* ── Release Updates ─────────────────────────────────────────────── */
// Shown as a small "Last updated: <date>" subtitle under each download button.
// To register a new release: bump the date below. To attach a release note,
// add a discriminator (e.g. "performanceFix") + a matching translation key
// `releaseNotePerformanceFix` in messages/*.json, then add a branch in
// UpdateInfo below to render it.

type Release = {
  date: string;
  note: "connectionFix" | "fullTunnel" | null;
  status?: "review";
};

type PlatformKey = "ios" | "android" | "mac" | "windows" | "linux";

const RELEASES: Record<Exclude<PlatformKey, "linux">, Release> = {
  ios:     { date: "2026-11-13", note: null },
  android: { date: "2026-11-13", note: null },
  mac:     { date: "2026-11-13", note: null },
  windows: { date: "2026-11-22", note: null },
};

function UpdateInfo({
  release,
  locale,
  t,
}: {
  release: Release;
  locale: string;
  t: (key: string) => string;
}) {
  const formatted = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(release.date),
  );
  return (
    <div className="mt-3 leading-snug">
      <p className="text-xs">
        <span className="text-text-muted/60">{t("lastUpdated")}: </span>
        <span className="text-text-muted">{formatted}</span>
        {release.status === "review" && (
          <span className="text-text-tertiary"> · {t("statusPendingReview")}</span>
        )}
      </p>
      {release.note === "connectionFix" && (
        <p className="mt-1 text-xs text-text-muted/70">
          {t("releaseNoteConnectionFix")}
        </p>
      )}
      {release.note === "fullTunnel" && (
        <p className="mt-1 text-xs text-text-muted/70">
          {t("releaseNoteFullTunnel")}
        </p>
      )}
    </div>
  );
}

/* ── Icons ────────────────────────────────────────────────────────── */
// Platform marks come from `glyph/platform-icons`, shared with the home page's
// "Available on" band and the account dashboard, so the three surfaces stay one
// picture. Only the page's own UI glyphs live here.

function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg className="mt-px w-3.5 h-3.5 shrink-0 text-accent-amber" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="hidden sm:block ms-auto me-4 w-4 h-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function Stars() {
  return (
    <span className="flex items-center gap-px text-accent-gold" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 0 0-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.445a1 1 0 0 0-1.175 0l-3.367 2.445c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.958Z" />
        </svg>
      ))}
    </span>
  );
}

/** Device line-icons for the chips under each download card's title. */
type DeviceIconKey = "phone" | "tablet" | "laptop" | "tv" | "watch" | "chip" | "memory" | "key" | "apple" | "windows";

const DEVICE_ICON: Record<Exclude<DeviceIconKey, "apple" | "windows">, string> = {
  phone:
    "M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  tablet:
    "M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-15a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25Z",
  // Laptop and TV: the same marks as the Android app page's device band.
  laptop:
    "M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z",
  tv:
    "M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z",
  watch:
    "M8.25 6.75h7.5A2.25 2.25 0 0 1 18 9v6a2.25 2.25 0 0 1-2.25 2.25h-7.5A2.25 2.25 0 0 1 6 15V9a2.25 2.25 0 0 1 2.25-2.25ZM9 6.75 9.75 3h4.5L15 6.75M9 17.25 9.75 21h4.5l.75-3.75",
  // A processor: the Mac card names architectures, not models.
  chip:
    "M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z",
  // A RAM stick: a board with contacts along its lower edge.
  memory:
    "M3.75 7.5h16.5a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V8.25a.75.75 0 0 1 .75-.75ZM6 15.75v2.25m3-2.25v2.25m3-2.25v2.25m3-2.25v2.25m3-2.25v2.25M6.75 10.5h2.25v2.25H6.75V10.5Zm4.125 0h2.25v2.25h-2.25V10.5Zm4.125 0h2.25v2.25H15V10.5Z",
  key:
    "M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z",
};

function DeviceIcon({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

/* ── Platform card config ────────────────────────────────────────── */

type PlatformNote = {
  ns: "apps" | "vpnForWindows";
  key: string;
  /**
   * "warn" is amber and reserved for a real warning — currently only the
   * unsigned-installer SmartScreen block, which stops the install dead. Anything
   * that is merely worth knowing is "info" and stays neutral, so the amber plate
   * keeps its meaning.
   */
  tone: "warn" | "info";
  /** Appends a link to the install guide (/install#<anchor>) after the text. */
  guide?: "iphone" | "mac";
  /** Appends a "Learn more" link to the platform page section that explains the note. */
  learn?: "/vpn-for-windows#smartscreen";
};

type PlatformButton = {
  labelKey: string;
  href: string;
  variant?: CtaVariant;
  external?: boolean;
  download?: boolean;
  primary: boolean;
  /** The store's mark on a store button (App Store, Google Play). Defaults to the platform's. */
  logo?: PlatformIcon;
  /** The setup card's label where the card's own is a short form. Defaults to `labelKey`. */
  setupLabelKey?: string;
};

/**
 * The setup card's picture for each platform: the platform page's own device
 * render (iPhone, Studio Display, Galaxy), and for Windows the app window on a
 * Windows 11 desktop (the Windows page's hero).
 */
const SETUP_IMAGE: Record<Exclude<PlatformKey, "linux">, SetupPlatform["image"]> = {
  ios: { ...iosApple.ctaImage!, alt: "Doppler VPN on an iPhone, connected and protected" },
  // `hero` is optional only for the Linux announcement, which has no setup card.
  mac: macosApple.hero!,
  android: androidApp.hero!,
  windows: {
    src: "/images/windows-home.avif",
    bg: "#B9B5BB",
    alt: "Doppler VPN for Windows, connected",
  },
};

/**
 * The platform page each card links to, and whose `howItWorks` strings title
 * that platform's panel in the setup section below.
 */
const HOW_TO_NS = {
  ios: "vpnForIos",
  android: "vpnForAndroid",
  mac: "vpnForMacos",
  windows: "vpnForWindows",
} as const;

const PLATFORMS: {
  key: PlatformKey;
  icon: PlatformIcon;
  /** The platform page the whole card links to. Linux links to its announcement page. */
  learnHref?: "/vpn-for-ios" | "/vpn-for-android" | "/vpn-for-macos" | "/vpn-for-windows" | "/vpn-for-linux";
  buttons: PlatformButton[];
  /** Fifth grid slot: Linux has no build yet — card shows the badge, no download. */
  comingSoon?: boolean;
  /**
   * The panel under the title, one line each: `[message key, icon]`. Devices on
   * the phone cards, the two architectures the universal build runs on for Mac,
   * and the minimum system for Windows (its `devicesLabel` reads "Requirements").
   * Linux has none.
   */
  devices?: [string, DeviceIconKey][];
  /**
   * Short caveats shown under the download buttons, each naming the namespace
   * its key lives in. Windows' caveats sit next to the rest of that platform's
   * strings in `vpnForWindows`; the Android sideload caveat belongs to this page
   * and lives in `apps`, so the namespace has to travel with the key.
   */
  notes?: PlatformNote[];
}[] = [
  {
    key: "ios",
    icon: "apple",
    learnHref: "/vpn-for-ios",
    devices: [["phone", "phone"], ["tablet", "tablet"], ["watch", "watch"]],
    buttons: [
      { labelKey: "ios.button", href: URLS.ios, external: true, primary: true, logo: "appStore" },
      ...(SHOW_IOS_TESTFLIGHT
        ? [
            {
              labelKey: "ios.buttonTestflight",
              href: URLS.iosTestflight,
              variant: "ios-testflight" as const,
              external: true,
              primary: false,
            },
          ]
        : []),
    ],
    ...(SHOW_IOS_TESTFLIGHT
      ? { notes: [{ ns: "apps" as const, key: "ios.directNote", tone: "info" as const, guide: "iphone" as const }] }
      : {}),
  },
  {
    key: "android",
    // Card uses the Android mark; Play stays on the store button.
    icon: "android",
    learnHref: "/vpn-for-android",
    devices: [["phone", "phone"], ["tablet", "tablet"], ["chromebook", "laptop"], ["tv", "tv"]],
    // The APK is the only Android route for anyone without Play — mainland China
    // most of all — so it is offered here rather than left to a link handed out
    // privately. Secondary, because Play is still the right default everywhere
    // it works: it updates itself, and the sideload build cannot.
    notes: [{ ns: "apps", key: "android.apkNote", tone: "info" }],
    buttons: [
      // Listed first, Play's teal pill under it at the foot of the card.
      {
        labelKey: "android.buttonApk",
        href: URLS.androidApk,
        variant: "android-apk",
        download: true,
        primary: false,
      },
      {
        labelKey: "android.buttonApk32",
        href: URLS.androidApk32,
        variant: "android-apk",
        download: true,
        primary: false,
      },
      {
        labelKey: "android.buttonPlayStore",
        href: URLS.androidPlayStore,
        variant: "android-play",
        external: true,
        primary: true,
        logo: "googlePlay",
      },
    ],
  },
  {
    key: "mac",
    icon: "apple",
    learnHref: "/vpn-for-macos",
    devices: [["appleSilicon", "apple"], ["intel", "chip"]],
    buttons: [
      // The DMG first, the Mac App Store's teal pill under it at the foot of the card.
      ...(SHOW_MAC_DMG
        ? [
            {
              labelKey: "mac.buttonDmg",
              href: URLS.macDmg,
              variant: "mac-dmg" as const,
              download: true,
              primary: false,
            },
          ]
        : []),
      { labelKey: "mac.button", href: URLS.mac, external: true, primary: true, logo: "appStore" },
    ],
    ...(SHOW_MAC_DMG
      ? { notes: [{ ns: "apps" as const, key: "mac.dmgNote", tone: "info" as const, guide: "mac" as const }] }
      : {}),
  },
  {
    key: "windows",
    icon: "windows",
    learnHref: "/vpn-for-windows",
    // The real floor of the build: TargetPlatformMinVersion / the installer's
    // MinVersion is 10.0.17763 (1809), ArchitecturesAllowed=x64compatible, and
    // DopplerVPN.exe ships a requireAdministrator manifest. 2 GB is 64-bit
    // Windows 10's own minimum, not a figure measured on the app.
    devices: [["os", "windows"], ["arch", "chip"], ["ram", "memory"], ["admin", "key"]],
    // The installer isn't code-signed yet, so SmartScreen blocks it and people
    // give up at the warning. One line here; the steps are on the Windows page.
    notes: [
      {
        ns: "vpnForWindows",
        key: "smartScreen.title",
        tone: "warn",
        learn: "/vpn-for-windows#smartscreen",
      },
    ],
    buttons: [
      {
        // "Download .exe" here: the card is too narrow for "Download for
        // Windows" on one line. The setup card below keeps `buttonX64`.
        labelKey: "windows.buttonCard",
        setupLabelKey: "windows.buttonX64",
        href: URLS.windowsX64,
        variant: "windows-x64",
        download: true,
        primary: true,
      },
    ],
  },
  {
    key: "linux",
    icon: "linux",
    learnHref: "/vpn-for-linux",
    comingSoon: true,
    buttons: [],
    notes: [{ ns: "apps", key: "linux.note", tone: "info" }],
  },
];

/* ── Shared class lists ──────────────────────────────────────────── */
// The card, row and hero recipes live in `ui/card-recipes`, shared with the
// support page. Only this page's own buttons and detected-card state are here.

/**
 * Download buttons — the hero's CTA pair (hero/hero-ctas.tsx), verbatim apart
 * from the width. `.cta-key` is the keycap and `.cta-flat` the deck it sits on,
 * so a card shows at most one key. No `bg-*` utility on the key: the cap
 * gradient IS its background, and a utility would paint over it.
 *
 * The hero is `w-full sm:w-auto` because it lays its two buttons out in a row;
 * here they stack down a card column, so they stay full width. Everything that
 * makes the button itself — padding, radius, type, icon size, focus ring — is
 * the hero's.
 */
const BTN_BASE =
  "inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-center rounded-lg text-sm font-medium " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal-light " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary";
const BTN_PRIMARY = `cta-key ${BTN_BASE} text-white`;
const BTN_SECONDARY = `cta-flat ${BTN_BASE} hover:text-accent-teal`;

/**
 * One platform card on the grid's shared row tracks, three rows: the card's own
 * content (picture, title, devices, notes) flows freely in the first; the date +
 * learn-more block and the buttons take the last two, so those line up across a
 * row of cards and the buttons sit at the foot. `gap-0` keeps the grid's own gap
 * between card rows only.
 */
const CARD_SUBGRID = "row-span-2 grid grid-rows-subgrid gap-0";

/** The visitor's own platform (DetectedCard) — colour only, so nothing moves. */
const CARD_DETECTED =
  "data-[detected=true]:border-accent-teal/50 data-[detected=true]:ring-1 data-[detected=true]:ring-accent-teal/25";

/**
 * The whole card opens the platform page: a link stretched over it, with the
 * card's own controls (downloads, inline links) raised above it on CARD_RAISED.
 */
const CARD_STRETCHED_LINK =
  "absolute inset-0 z-[1] rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary";
const CARD_RAISED = "relative z-[2]";
/** Hover on a linked card: no movement, only the lift shadow one step deeper. */
const CARD_LIFT = "plus-lift plus-lift-2";

/* ── Calm+ preview (CALM_PLUS_PREVIEW) ───────────────────────────── */
// The detected card gets a teal ring, colour only.

const PLUS_DETECTED = "data-[detected=true]:ring-2 data-[detected=true]:ring-(--c-accent)";
// The pills are a fixed h-11; at five across a long label ("Télécharger sur
// Google Play") wraps, so the card's pills grow instead of spilling. The subgrid
// keeps the bands aligned when one does.
const PLUS_DL_FIT = "!h-auto min-h-11 py-2.5 leading-tight text-center xl:px-4";
const PLUS_DL_PRIMARY = `${PLUS_BTN} ${PLUS_DL_FIT} w-full`;
const PLUS_DL_SECONDARY = `${PLUS_BTN_SECONDARY} ${PLUS_DL_FIT} w-full`;
const PLUS_ROW =
  `${PLUS_CARD_HOVER} h-full min-h-[96px] !flex-row items-center !p-0 ` +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--c-bg)";
const PLUS_ROW_ICON = `${PLUS_ICON} ${PLUS_ICON_TONE.teal} [&_svg]:h-7 [&_svg]:w-7`;

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function DownloadsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("apps");
  // Platform-specific caveats live in the platform's own namespace — see `notes`.
  const tWindows = await getTranslations("vpnForWindows");
  // The Linux card links to its announcement page; its link label lives with that page's copy.
  const tLinux = await getTranslations("vpnForLinux");
  // The ratings row is the same block, and the same real numbers, as the home
  // hero and the home CTA card — so it reuses their strings rather than adding
  // four more keys to 44 locale files.
  const tHero = await getTranslations("hero");
  // "Learn more" after a card note — the generic string, already in every locale.
  const tLearn = await getTranslations("technicalHowItWorks");
  const resolveNote = (note: PlatformNote) =>
    note.ns === "apps" ? t(note.key) : tWindows(note.key);

  // Resolved here so the four `vpnFor*` namespaces never reach the client
  // bundle: the setup card receives plain strings.
  const setupPlatforms: SetupPlatform[] = await Promise.all(
    PLATFORMS.filter((p) => !p.comingSoon).map(async ({ key, icon, buttons, learnHref }) => {
      const tHowTo = await getTranslations(HOW_TO_NS[key as Exclude<PlatformKey, "linux">]);
      const primary = buttons.find((b) => b.primary) ?? buttons[0];
      return {
        key: key as SetupPlatform["key"],
        icon,
        name: t(`${key}.title`),
        title: tHowTo("howItWorks.title"),
        subtitle: tHowTo("howItWorks.subtitle"),
        steps: [1, 2, 3, 4].map((n) => t(`${key}.step${n}`)),
        cta: {
          href: primary.href,
          label: t(primary.setupLabelKey ?? primary.labelKey),
          ...(primary.variant ? { variant: primary.variant } : {}),
          external: !!primary.external,
          download: !!primary.download,
          logo: primary.logo ?? icon,
        },
        ...(learnHref ? { learn: { href: learnHref, label: t(`${key}.learnMore`) } } : {}),
        image: SETUP_IMAGE[key as Exclude<PlatformKey, "linux">],
      };
    }),
  );

  // The on-page headline drops the " — iOS, Android, Mac & Windows" tail; the
  // full string stays the meta/schema title, where the platform names help search.
  const headline = t("title").split(" — ")[0];
  const { lead: headlineLead, last: headlineLast } = splitHeadline(headline);
  const plus = calmPlusPreview;
  const Scope = plus ? PlusPageShell : Fragment;

  // Social proof — the same real store ratings as the home hero. Rendered twice:
  // under the headline, and under the setup card's download button.
  const ratings = (
    <>
      <TrackedDownloadLink
        location="downloads-page"
        platform="ios"
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group/star flex items-center gap-1.5"
      >
        <Stars />
        <span className="text-sm font-semibold text-text-primary">{tHero("socialProof.rating")}</span>
        <span className="text-xs text-text-muted group-hover/star:text-text-primary transition-colors">
          {tHero("socialProof.appStore")}
        </span>
      </TrackedDownloadLink>
      <TrackedDownloadLink
        location="downloads-page"
        platform="android"
        variant="android-play"
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group/star flex items-center gap-1.5"
      >
        <Stars />
        <span className="text-sm font-semibold text-text-primary">{tHero("socialProof.ratingGooglePlay")}</span>
        <span className="text-xs text-text-muted group-hover/star:text-text-primary transition-colors">
          {tHero("socialProof.googlePlay")}
        </span>
      </TrackedDownloadLink>
      <span className="hidden sm:inline text-text-tertiary" aria-hidden="true">·</span>
      <span className="text-xs text-text-muted">{tHero("socialProof.users")}</span>
    </>
  );

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("title"), url: `${baseUrl}/${locale}/downloads` },
        ]}
      />
      <WebPageSchema
        url={`${baseUrl}/${locale}/downloads`}
        name={t("title")}
        description={t("subtitle")}
        type="CollectionPage"
      />
      {/* Page-scoped, not in the locale layout: the SoftwareApplication rich
          result requires an aggregateRating we cannot honestly supply yet, so
          the node only ships on the two pages where the app itself is the
          subject (here and the locale home page) instead of failing on ~4,900
          pages. See the comment above the component in json-ld.tsx. */}
      <SoftwareApplicationSchema locale={locale} />
      <Navbar />
      <main className="relative overflow-x-clip">
        <Scope>
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className={HERO_SECTION}>
          <div className="relative mx-auto max-w-site text-center">
            {/* Static, with no entrance: this is the page's LCP element, and an
                element at opacity 0 is not an LCP candidate at all. */}
            <h1 className={HERO_TITLE}>
              {headlineLead}{headlineLead && " "}
              <span className={HERO_TITLE_RAMP}>
                {headlineLast}
              </span>
            </h1>

            <p className={HERO_SUBTITLE}>
              {t("subtitle")}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {ratings}
            </div>
          </div>
        </section>

        <DetectedPlatformProvider>
          <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
            {/* ── Platform Cards ───────────────────────────────────── */}
            {/* Name, download, the platform's caveats, date. The app itself is
                shown in the setup card below. */}
            {/* Five cards: 2 + 2 + 1 on tablets, 3 + 2 on small laptops, one row from xl.
                Each card's own content flows freely; the date + learn-more block and
                the buttons sit on the grid's shared row tracks (subgrid), so they line
                up across a row whatever wraps above them. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
              {PLATFORMS.map(({ key, icon, learnHref, buttons, notes, comingSoon, devices = [] }, i) => {
                return (
                  <Reveal key={key} delay={i * 50} className={CARD_SUBGRID}>
                    <DetectedCard
                      platform={key}
                      id={key}
                      className={`${CARD_SUBGRID} ${learnHref ? CARD_LIFT : ""} ${plus ? `${PLUS_CARD} !grid ${PLUS_DETECTED} scroll-mt-28` : `${CARD} ${CARD_DETECTED} !grid p-6 scroll-mt-28`}`}
                    >
                      {!plus && <div className={CARD_HAIRLINE} aria-hidden="true" />}
                      {learnHref && (
                        <Link
                          href={learnHref}
                          aria-label={key === "linux" ? tLinux("learnMore") : t(`${key}.learnMore`)}
                          className={CARD_STRETCHED_LINK}
                        />
                      )}

                      {/* 1 · the card's own content, flowing with no reserved gaps */}
                      <div className="relative">
                        {/* picture */}
                        {plus ? (
                          <span className={`${PLUS_WELL} mb-5 block h-24`} aria-hidden="true">
                            <PlatformGlyphBand index={i} />
                            <span className="absolute inset-0 flex items-center justify-center">
                              <PlatformLogo icon={icon} className="h-8 w-8 text-(--c-text)" />
                            </span>
                          </span>
                        ) : null}

                        {/* title */}
                        <h2 className={plus ? `relative mb-3 ${PLUS_TITLE_SM}` : `relative mb-3 ${CARD_TITLE}`}>
                          {t(`${key}.title`)}
                        </h2>

                        {/* devices: one panel, one device per line (the warning plate's shape) */}
                        {devices.length > 0 ? (
                          <ul
                            className={`relative mb-4 space-y-1.5 self-start rounded-xl p-3 ${plus ? "bg-(--c-bg)" : "bg-bg-secondary"}`}
                            aria-label={t(`${key}.devicesLabel`)}
                          >
                            {devices.map(([label, glyph]) => (
                              <li
                                key={label}
                                className={
                                  plus
                                    ? "flex items-center gap-2 text-[13px] text-(--c-muted)"
                                    : "flex items-center gap-2 text-[13px] text-text-tertiary"
                                }
                              >
                                {glyph === "apple" || glyph === "windows" ? (
                                  <PlatformLogo icon={glyph} className="h-4 w-4" />
                                ) : (
                                  <DeviceIcon d={DEVICE_ICON[glyph]} />
                                )}
                                <span>{t(`${key}.devices.${label}`)}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}

                        {/* notes */}
                        <ul className="relative space-y-2">
                          {notes?.map((note) => (
                            <li
                              key={`${note.ns}.${note.key}`}
                              className={`flex items-start gap-1.5 text-xs leading-relaxed text-text-muted ${
                                note.tone === "warn" ? "rounded-xl bg-accent-amber/10 p-3" : ""
                              }`}
                            >
                              {note.tone === "warn" && <WarnIcon />}
                              <span className={note.tone === "info" ? "text-text-tertiary" : undefined}>
                                {resolveNote(note)}
                                {note.guide && (
                                  <>
                                    {" "}
                                    <Link
                                      href={`/install#${note.guide}`}
                                      className={`${CARD_RAISED} ${plus ? "font-bold text-(--c-accent)" : "text-accent-teal hover:text-accent-teal-light"}`}
                                    >
                                      {t("installGuide")}
                                    </Link>
                                  </>
                                )}
                                {note.learn && (
                                  <>
                                    {" "}
                                    <Link
                                      href={note.learn}
                                      className={`${CARD_RAISED} whitespace-nowrap ${plus ? "font-bold text-(--c-accent)" : "text-accent-teal hover:text-accent-teal-light"}`}
                                    >
                                      {tLearn("readMore")}
                                    </Link>
                                  </>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 2 · the foot, pinned to the bottom: date, then the buttons */}
                      <div className="relative self-end pt-5">
                        {!comingSoon && key !== "linux" && (
                          <UpdateInfo release={RELEASES[key]} locale={locale} t={t} />
                        )}

                        {/* downloads */}
                        <div className={`${CARD_RAISED} flex flex-col gap-2 [:not(:empty)+&]:mt-4`}>
                          {comingSoon ? (
                            <span
                              className={
                                plus
                                  ? `${PLUS_CHIP} self-start bg-(--c-inset) text-(--c-tert)`
                                  : "inline-flex self-start rounded-full bg-bg-secondary px-3 py-1.5 text-xs font-semibold text-text-tertiary"
                              }
                            >
                              {t("comingSoon")}
                            </span>
                          ) : (
                            buttons.map((btn) => (
                              <TrackedDownloadLink
                                key={btn.labelKey}
                                location="downloads-page"
                                platform={key as Exclude<PlatformKey, "linux">}
                                {...(btn.variant ? { variant: btn.variant } : {})}
                                href={btn.href}
                                {...(btn.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                {...(btn.download ? { download: true } : {})}
                                className={
                                  plus
                                    ? btn.primary ? PLUS_DL_PRIMARY : PLUS_DL_SECONDARY
                                    : btn.primary ? BTN_PRIMARY : BTN_SECONDARY
                                }
                              >
                                {btn.primary ? (
                                  <PlatformLogo icon={btn.logo ?? icon} className="w-4 h-4 shrink-0" />
                                ) : (
                                  <DownloadIcon className="w-4 h-4 shrink-0" />
                                )}
                                {t(btn.labelKey)}
                              </TrackedDownloadLink>
                            ))
                          )}
                        </div>
                      </div>
                    </DetectedCard>
                  </Reveal>
                );
              })}
            </div>

            {/* Pro sync note — shown once for all platforms, set as the last line
                of a terminal session (the privacy section's tagline treatment). */}
            <Reveal>
              <p className="mt-10 text-center text-sm text-text-muted">
                {t("syncNote")}
                <span aria-hidden="true" className="terminal-cursor ms-1 text-accent-teal-light">
                  ▌
                </span>
              </p>
            </Reveal>

            {/* ── Elsewhere ─────────────────────────────────────── */}
            <div className="mt-8 mb-4 md:mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Reveal className="h-full">
                <Link href="/bypass-censorship" className={plus ? PLUS_ROW : `${ROW_CARD} h-full`}>
                  <div className="flex min-w-0 items-center gap-4 px-5 py-4">
                    <div className={plus ? PLUS_ROW_ICON : ROW_TILE}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>
                    </div>
                    <div className="min-w-0 text-start">
                      <h2 className={plus ? PLUS_TITLE_SM : ROW_TITLE}>
                        {t("censorshipCard.title")}
                      </h2>
                      <p className={plus ? PLUS_META : ROW_TEXT}>
                        {t("censorshipCard.description")}
                      </p>
                    </div>
                  </div>
                  {plus ? <ArrowGlyph className="ms-auto me-5 hidden h-4 w-4 shrink-0 text-(--c-tert) sm:block" /> : <ChevronIcon />}
                </Link>
              </Reveal>

              <Reveal delay={50} className="h-full">
                <Link href="/support" className={plus ? PLUS_ROW : `${ROW_CARD} h-full`}>
                  <div className="flex min-w-0 items-center gap-4 px-5 py-4">
                    <div className={plus ? PLUS_ROW_ICON : ROW_TILE}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                      </svg>
                    </div>
                    <div className="min-w-0 text-start">
                      <h2 className={plus ? PLUS_TITLE_SM : ROW_TITLE}>
                        {t("needHelp")}
                      </h2>
                      <p className={plus ? PLUS_META : ROW_TEXT}>
                        {t("visitSupport")}
                      </p>
                    </div>
                  </div>
                  {plus ? <ArrowGlyph className="ms-auto me-5 hidden h-4 w-4 shrink-0 text-(--c-tert) sm:block" /> : <ChevronIcon />}
                </Link>
              </Reveal>
            </div>
          </div>

          {/* ── Setup ─────────────────────────────────────────── */}
          {/* The home page's notched download card, one platform at a time,
              opening on the visitor's own. */}
          <SetupSection
            plus={plus}
            platforms={setupPlatforms}
            ratings={
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2">
                {ratings}
              </div>
            }
          />
        </DetectedPlatformProvider>
        </Scope>
      </main>
      <Footer />
    </>
  );
}
