import { Fragment } from "react";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema, WebPageSchema } from "@/components/seo/json-ld";
import { TrackedDownloadLink } from "@/components/downloads/tracked-download-link";
import { Reveal } from "@/components/ui/reveal";
import type { CtaVariant } from "@/lib/track-cta";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

// Locales where decorative Latin-only fonts break (no Cyrillic/CJK/Arabic glyphs)
const FALLBACK_FONT_LOCALES = new Set(["ru", "uk", "zh", "ja", "ko", "ar", "fa", "he", "hi", "ur", "th"]);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apps" });
  const title = t("title");
  const description = t("subtitle");
  return {
    title,
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
  windowsX64: "/api/windows/download/latest-x64",
  windowsArm64: "/api/windows/download/latest-arm64",
};

/* ── Release Updates ─────────────────────────────────────────────── */
// Shown as a small "Last updated: <date>" subtitle under each download button.
// To register a new release: bump the date below. To attach a release note,
// add a discriminator (e.g. "performanceFix") + a matching translation key
// `releaseNotePerformanceFix` in messages/*.json, then add a branch in
// UpdateInfo below to render it.

type Release = {
  date: string;
  note: "connectionFix" | null;
  status?: "review";
};

const RELEASES: Record<"ios" | "android" | "mac" | "windows", Release> = {
  ios:     { date: "2026-04-08", note: null },
  android: { date: "2026-05-03", note: null },
  mac:     { date: "2026-05-11", note: "connectionFix", status: "review" },
  windows: { date: "2026-05-11", note: "connectionFix" },
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
          <span className="text-accent-gold/90"> · {t("statusPendingReview")}</span>
        )}
      </p>
      {release.note === "connectionFix" && (
        <p className="mt-1 text-xs text-text-muted/70">
          {t("releaseNoteConnectionFix")}
        </p>
      )}
    </div>
  );
}

/* ── Icons ────────────────────────────────────────────────────────── */

function AppleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AndroidIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.61 15.15c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m-9.22 0c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m9.5-5.09l1.67-2.88a.35.35 0 00-.12-.47.35.35 0 00-.48.12l-1.69 2.93A10.1 10.1 0 0012 8.57c-1.53 0-2.98.34-4.27.95L6.04 6.59a.35.35 0 00-.48-.12.35.35 0 00-.12.47l1.67 2.88C4.44 11.36 2.62 14.09 2.3 17.3h19.4c-.32-3.21-2.14-5.94-4.81-7.24z" />
    </svg>
  );
}

function WindowsIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .08V5.67L20 3zM3 13l6 .09v6.81l-6-1.15V13zm7 .18l10 .08V21l-10-1.76V13.18z" />
    </svg>
  );
}

function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function ArrowIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`${className} rtl:-scale-x-100`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

/* ── Setup Steps — numbered list with connecting line ────────────── */

function SetupSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-5">
      {steps.map((step, i) => (
        <li key={i} className="relative flex items-start gap-3 pb-3.5 last:pb-0">
          {i < steps.length - 1 && (
            <span
              className="absolute start-3 top-7 bottom-0 w-px bg-overlay/10"
              aria-hidden="true"
            />
          )}
          <span className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-accent-teal/15 border border-accent-teal/20 text-accent-teal text-xs font-semibold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-sm text-text-muted leading-relaxed">{step}</span>
        </li>
      ))}
    </ol>
  );
}

/* ── Platform card config ────────────────────────────────────────── */

type PlatformButton = {
  labelKey: string;
  href: string;
  variant?: CtaVariant;
  external?: boolean;
  download?: boolean;
  primary: boolean;
};

const PLATFORMS: {
  key: "ios" | "android" | "mac" | "windows";
  icon: ({ className }: { className?: string }) => React.JSX.Element;
  learnHref: "/vpn-for-ios" | "/vpn-for-android" | "/vpn-for-macos" | "/vpn-for-windows";
  buttons: PlatformButton[];
}[] = [
  {
    key: "ios",
    icon: AppleIcon,
    learnHref: "/vpn-for-ios",
    buttons: [{ labelKey: "ios.button", href: URLS.ios, external: true, primary: true }],
  },
  {
    key: "android",
    icon: AndroidIcon,
    learnHref: "/vpn-for-android",
    buttons: [
      {
        labelKey: "android.buttonPlayStore",
        href: URLS.androidPlayStore,
        variant: "android-play",
        external: true,
        primary: true,
      },
    ],
  },
  {
    key: "mac",
    icon: AppleIcon,
    learnHref: "/vpn-for-macos",
    buttons: [{ labelKey: "mac.button", href: URLS.mac, external: true, primary: true }],
  },
  {
    key: "windows",
    icon: WindowsIcon,
    learnHref: "/vpn-for-windows",
    buttons: [
      {
        labelKey: "windows.buttonX64",
        href: URLS.windowsX64,
        variant: "windows-x64",
        download: true,
        primary: true,
      },
      {
        labelKey: "windows.buttonArm64",
        href: URLS.windowsArm64,
        variant: "windows-arm64",
        download: true,
        primary: false,
      },
    ],
  },
];

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function DownloadsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("apps");

  const useFallbackFont = FALLBACK_FONT_LOCALES.has(locale);
  const displayFontStyle = useFallbackFont
    ? { fontFamily: "var(--font-body)", fontWeight: 300 }
    : { fontFamily: "var(--font-serif)" };

  // Word-by-word blur-up cascade (same timing as the homepage hero)
  const WORD_BASE_DELAY = 0.1;
  const WORD_STAGGER = 0.07;
  const headlineWords = t("title").split(/\s+/).filter(Boolean);

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
      <Navbar />
      <main className="relative min-h-screen bg-bg-primary pt-28 pb-20 overflow-x-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -end-20 w-[32rem] h-[32rem] bg-accent-gold/10 rounded-full blur-3xl" />
          {/* Faint dot field — echoes the homepage DotGlobe motif */}
          <div
            className="absolute inset-x-0 top-0 h-[40rem]"
            style={{
              backgroundImage: "radial-gradient(circle, var(--color-overlay) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              opacity: 0.05,
              maskImage: "radial-gradient(ellipse 70% 80% at 50% 0%, black, transparent)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 50% 0%, black, transparent)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-site px-4 sm:px-6 lg:px-8">
          {/* ── Header ────────────────────────────────────────────── */}
          <div className="text-center mb-14">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl text-text-primary mb-5 leading-[1.08]"
              style={displayFontStyle}
            >
              {headlineWords.map((word, i) => (
                <Fragment key={i}>
                  <span
                    className={i === 0 && !useFallbackFont ? "hero-word italic" : "hero-word"}
                    style={{ animationDelay: `${WORD_BASE_DELAY + i * WORD_STAGGER}s` }}
                  >
                    {word}
                  </span>{" "}
                </Fragment>
              ))}
            </h1>
            <p className="hero-animate hero-animate-delay-3 text-lg text-text-muted max-w-2xl mx-auto">
              {t("subtitle")}
            </p>

            {/* Platform quick-jump chips */}
            <div className="hero-animate hero-animate-delay-4 mt-8 flex flex-wrap justify-center gap-2.5">
              {PLATFORMS.map(({ key, icon: Icon }) => (
                <a
                  key={key}
                  href={`#${key}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-text-muted border border-overlay/10 bg-bg-secondary/50 hover:text-accent-teal hover:border-accent-teal/30 hover:bg-bg-secondary/80 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {t(`${key}.title`)}
                </a>
              ))}
            </div>
          </div>

          {/* ── Platform Cards ───────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PLATFORMS.map(({ key, icon: Icon, learnHref, buttons }, i) => (
              <Reveal key={key} delay={(i % 2) * 70} className="h-full">
                <div
                  id={key}
                  className="group relative h-full scroll-mt-28 overflow-hidden rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 sm:p-7 transition-all duration-300 hover:border-accent-teal/25 flex flex-col"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent-teal/[0.06] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden="true"
                  />

                  <div className="relative flex items-center gap-3.5 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal transition-all duration-300 group-hover:bg-accent-teal/20 group-hover:shadow-[0_0_20px_rgba(0,140,140,0.25)]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-semibold text-text-primary">{t(`${key}.title`)}</h2>
                  </div>

                  <div className="relative">
                    {buttons.map((btn) => (
                      <TrackedDownloadLink
                        key={btn.labelKey}
                        platform={key}
                        {...(btn.variant ? { variant: btn.variant } : {})}
                        href={btn.href}
                        {...(btn.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        {...(btn.download ? { download: true } : {})}
                        className={
                          btn.primary
                            ? "flex items-center justify-center gap-2 rounded-xl bg-accent-teal text-white px-4 py-3.5 hover:bg-accent-teal-light transition-all duration-200 font-semibold text-sm shadow-lg shadow-accent-teal/20 hover:shadow-accent-teal/35"
                            : "flex items-center justify-center gap-2 rounded-xl border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 px-4 py-2.5 mt-2 transition-all text-text-muted hover:text-accent-teal text-sm"
                        }
                      >
                        <DownloadIcon className="w-4 h-4" />
                        {t(btn.labelKey)}
                      </TrackedDownloadLink>
                    ))}

                    <UpdateInfo release={RELEASES[key]} locale={locale} t={t} />

                    <SetupSteps
                      steps={[1, 2, 3, 4].map((n) => t(`${key}.step${n}`))}
                    />
                  </div>

                  <div className="relative mt-auto pt-5">
                    <Link
                      href={learnHref}
                      className="inline-flex items-center gap-1.5 text-sm text-accent-teal hover:text-accent-gold transition-colors"
                    >
                      {t(`${key}.learnMore`)}
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                        <ArrowIcon />
                      </span>
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Pro sync note — shown once for all platforms */}
          <Reveal>
            <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-text-muted">
              <svg className="w-4 h-4 text-accent-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {t("syncNote")}
            </p>
          </Reveal>

          {/* ── Bottom Cards ──────────────────────────────────── */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bypass Censorship */}
            <Reveal className="h-full">
              <Link
                href="/bypass-censorship"
                className="group block h-full relative overflow-hidden rounded-2xl border border-accent-teal/20 bg-gradient-to-b from-accent-teal/10 to-accent-teal/[0.03] p-8 sm:p-10 text-center hover:border-accent-teal/35 transition-all duration-300"
              >
                <div
                  className="absolute -top-16 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-64 h-32 bg-accent-teal/15 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-hidden="true"
                />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-accent-teal/15 border border-accent-teal/20 flex items-center justify-center text-accent-teal mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">
                    {t("censorshipCard.title")}
                  </h2>
                  <p className="text-sm text-text-muted">
                    {t("censorshipCard.description")}
                  </p>
                </div>
              </Link>
            </Reveal>

            {/* Need Help */}
            <Reveal delay={70} className="h-full">
              <Link
                href="/support"
                className="group block h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-8 sm:p-10 text-center hover:bg-bg-secondary/70 hover:border-overlay/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-overlay/5 border border-overlay/10 flex items-center justify-center text-text-muted mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">
                  {t("needHelp")}
                </h2>
                <p className="text-sm text-text-muted">
                  {t("visitSupport")}
                </p>
              </Link>
            </Reveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
