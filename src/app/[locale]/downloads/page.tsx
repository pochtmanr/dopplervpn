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
import { seoTitle } from "@/lib/seo-title";
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
  androidPlayStore: "https://play.google.com/store/apps/details?id=org.dopplervpn.android",
  mac: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
  // One Windows build, x64 only. ARM64 Windows runs it under emulation; there is
  // no separate ARM64 installer to offer and no ARM64 tunnel that has been verified
  // on a device. See dopplerWindows/DopplerVPN.csproj.
  windowsX64: "/api/windows/download/latest-x64",
  // Standalone (sideload) build: no Play Billing, pays through the web checkout.
  // Same-origin on purpose — the route decides where the bytes come from, so the
  // link printed here survives a change of hosting. See the route's own header.
  androidApk: "/api/android/download/latest",
  // The 32-bit build, for pre-2019 hardware that cannot install the arm64 APK
  // (INSTALL_FAILED_NO_MATCHING_ABIS, which Android reports to the user only as
  // "app not installed"). It has to be a second, explicitly labelled link:
  // nothing in a browser request states the device's CPU architecture, so the
  // page cannot pick for the visitor the way the in-app update banner can.
  androidApk32: "/api/android/download/latest?abi=armeabi-v7a",
};

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

const RELEASES: Record<"ios" | "android" | "mac" | "windows", Release> = {
  ios:     { date: "2026-09-14", note: null },
  android: { date: "2026-08-16", note: null },
  mac:     { date: "2026-09-13", note: null },
  windows: { date: "2026-08-16", note: "fullTunnel" },
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

function ArrowIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`${className} rtl:-scale-x-100`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
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
};

type PlatformButton = {
  labelKey: string;
  href: string;
  variant?: CtaVariant;
  external?: boolean;
  download?: boolean;
  primary: boolean;
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
  key: "ios" | "android" | "mac" | "windows";
  icon: PlatformIcon;
  learnHref: "/vpn-for-ios" | "/vpn-for-android" | "/vpn-for-macos" | "/vpn-for-windows";
  buttons: PlatformButton[];
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
    buttons: [{ labelKey: "ios.button", href: URLS.ios, external: true, primary: true }],
  },
  {
    key: "android",
    icon: "android",
    learnHref: "/vpn-for-android",
    // The APK is the only Android route for anyone without Play — mainland China
    // most of all — so it is offered here rather than left to a link handed out
    // privately. Secondary, because Play is still the right default everywhere
    // it works: it updates itself, and the sideload build cannot.
    notes: [{ ns: "apps", key: "android.apkNote", tone: "info" }],
    buttons: [
      {
        labelKey: "android.buttonPlayStore",
        href: URLS.androidPlayStore,
        variant: "android-play",
        external: true,
        primary: true,
      },
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
        variant: "android-apk-32",
        download: true,
        primary: false,
      },
    ],
  },
  {
    key: "mac",
    icon: "apple",
    learnHref: "/vpn-for-macos",
    buttons: [{ labelKey: "mac.button", href: URLS.mac, external: true, primary: true }],
  },
  {
    key: "windows",
    icon: "windows",
    learnHref: "/vpn-for-windows",
    // Windows-only: the installer isn't code-signed yet, so SmartScreen blocks it
    // and people give up at the warning. The trial line is here because this card
    // is the last stop before a paid campaign visitor leaves for the download.
    notes: [
      { ns: "vpnForWindows", key: "downloadsSmartScreenNote", tone: "warn" },
      { ns: "vpnForWindows", key: "downloadsTrialNote", tone: "info" },
    ],
    buttons: [
      {
        labelKey: "windows.buttonX64",
        href: URLS.windowsX64,
        variant: "windows-x64",
        download: true,
        primary: true,
      },
    ],
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
const BTN_SECONDARY = `cta-flat ${BTN_BASE} mt-2 hover:text-accent-teal`;

/** The visitor's own platform (DetectedCard) — colour only, so nothing moves. */
const CARD_DETECTED =
  "data-[detected=true]:border-accent-teal/50 data-[detected=true]:ring-1 data-[detected=true]:ring-accent-teal/25";

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function DownloadsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("apps");
  // Platform-specific caveats live in the platform's own namespace — see `notes`.
  const tWindows = await getTranslations("vpnForWindows");
  // The ratings row is the same block, and the same real numbers, as the home
  // hero and the home CTA card — so it reuses their strings rather than adding
  // four more keys to 44 locale files.
  const tHero = await getTranslations("hero");
  const resolveNote = (note: PlatformNote) =>
    note.ns === "apps" ? t(note.key) : tWindows(note.key);

  // Resolved here so the four `vpnFor*` namespaces never reach the client
  // bundle: the setup card receives plain strings.
  const setupPlatforms: SetupPlatform[] = await Promise.all(
    PLATFORMS.map(async ({ key, icon, buttons }) => {
      const tHowTo = await getTranslations(HOW_TO_NS[key]);
      const primary = buttons.find((b) => b.primary) ?? buttons[0];
      return {
        key,
        icon,
        name: t(`${key}.title`),
        title: tHowTo("howItWorks.title"),
        subtitle: tHowTo("howItWorks.subtitle"),
        steps: [1, 2, 3, 4].map((n) => t(`${key}.step${n}`)),
        cta: {
          href: primary.href,
          label: t(primary.labelKey),
          ...(primary.variant ? { variant: primary.variant } : {}),
          external: !!primary.external,
          download: !!primary.download,
        },
      };
    }),
  );

  // The on-page headline drops the " — iOS, Android, Mac & Windows" tail; the
  // full string stays the meta/schema title, where the platform names help search.
  const headline = t("title").split(" — ")[0];
  const { lead: headlineLead, last: headlineLast } = splitHeadline(headline);

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
      <main className="relative overflow-x-hidden">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {PLATFORMS.map(({ key, icon, learnHref, buttons, notes }, i) => {
                return (
                  <Reveal key={key} delay={i * 50} className="h-full">
                    <DetectedCard
                      platform={key}
                      id={key}
                      className={`${CARD} ${CARD_DETECTED} p-6 scroll-mt-28`}
                    >
                      <div className={CARD_HAIRLINE} aria-hidden="true" />

                      <div className="relative flex flex-1 flex-col">
                        <h2 className={`mb-4 ${CARD_TITLE}`}>
                          {t(`${key}.title`)}
                        </h2>

                        {/* The store/installer button carries the platform mark;
                            the sideload APKs are files, so they keep the download glyph. */}
                        {buttons.map((btn) => (
                          <TrackedDownloadLink
                            key={btn.labelKey}
                            location="downloads-page"
                            platform={key}
                            {...(btn.variant ? { variant: btn.variant } : {})}
                            href={btn.href}
                            {...(btn.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            {...(btn.download ? { download: true } : {})}
                            className={btn.primary ? BTN_PRIMARY : BTN_SECONDARY}
                          >
                            {btn.primary ? (
                              <PlatformLogo icon={icon} className="w-4 h-4" />
                            ) : (
                              <DownloadIcon className="w-4 h-4" />
                            )}
                            {t(btn.labelKey)}
                          </TrackedDownloadLink>
                        ))}

                        {notes && (
                          <ul className="mt-3 space-y-1.5">
                            {notes.map((note) => (
                              <li
                                key={`${note.ns}.${note.key}`}
                                className="flex items-start gap-1.5 text-xs leading-relaxed text-text-muted"
                              >
                                {note.tone === "warn" && <WarnIcon />}
                                <span className={note.tone === "info" ? "text-text-tertiary" : undefined}>
                                  {resolveNote(note)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-auto pt-5">
                          <UpdateInfo release={RELEASES[key]} locale={locale} t={t} />
                          <Link
                            href={learnHref}
                            className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-teal hover:text-accent-teal-light transition-colors"
                          >
                            {t(`${key}.learnMore`)}
                            <span className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                              <ArrowIcon />
                            </span>
                          </Link>
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
                <Link href="/bypass-censorship" className={`${ROW_CARD} h-full`}>
                  <div className="flex min-w-0 items-center gap-4 px-5 py-4">
                    <div className={ROW_TILE}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>
                    </div>
                    <div className="min-w-0 text-start">
                      <h2 className={ROW_TITLE}>
                        {t("censorshipCard.title")}
                      </h2>
                      <p className={ROW_TEXT}>
                        {t("censorshipCard.description")}
                      </p>
                    </div>
                  </div>
                  <ChevronIcon />
                </Link>
              </Reveal>

              <Reveal delay={50} className="h-full">
                <Link href="/support" className={`${ROW_CARD} h-full`}>
                  <div className="flex min-w-0 items-center gap-4 px-5 py-4">
                    <div className={ROW_TILE}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                      </svg>
                    </div>
                    <div className="min-w-0 text-start">
                      <h2 className={ROW_TITLE}>
                        {t("needHelp")}
                      </h2>
                      <p className={ROW_TEXT}>
                        {t("visitSupport")}
                      </p>
                    </div>
                  </div>
                  <ChevronIcon />
                </Link>
              </Reveal>
            </div>
          </div>

          {/* ── Setup ─────────────────────────────────────────── */}
          {/* The home page's notched download card, one platform at a time,
              opening on the visitor's own. */}
          <SetupSection
            platforms={setupPlatforms}
            ratings={
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2">
                {ratings}
              </div>
            }
          />
        </DetectedPlatformProvider>
      </main>
      <Footer />
    </>
  );
}
