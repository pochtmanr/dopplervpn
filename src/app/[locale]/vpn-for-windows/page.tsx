import { Fragment } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema, FAQSchema, PlatformAppSchema } from "@/components/seo/json-ld";
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/reveal";
import { Accordion } from "@/components/ui/accordion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

const URLS = {
  windowsX64: "/api/windows/download/DopplerVPN-1.0.0-x64-Setup.exe",
  windowsArm64: "/api/windows/download/DopplerVPN-1.0.0-arm64-Setup.exe",
};

// Locales where decorative Latin-only fonts break (no Cyrillic/CJK/Arabic glyphs)
const FALLBACK_FONT_LOCALES = new Set(["ru", "uk", "zh", "ja", "ko", "ar", "fa", "he", "hi", "ur", "th"]);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vpnForWindows.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/vpn-for-windows`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/vpn-for-windows`]),
        ["x-default", `${baseUrl}/en/vpn-for-windows`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/vpn-for-windows`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/images/og-banner.jpg`,
          width: 1200,
          height: 630,
          alt: "Doppler VPN for Windows",
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

const stepKeys = ["step1", "step2", "step3", "step4"] as const;
const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

/* ── Icons ────────────────────────────────────────────────────────── */

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function NoSymbolIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
    </svg>
  );
}

function ComputerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
    </svg>
  );
}

function ArrowPathIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

/* ── Feature bento layout ─────────────────────────────────────────── */
// Featured cards span two columns and carry an oversized watermark icon.

const featureLayout: { key: string; featured?: boolean }[] = [
  { key: "nativeWindows", featured: true },
  { key: "dualArchitecture" },
  { key: "autoUpdates" },
  { key: "vlessEncryption", featured: true },
  { key: "noRegistration" },
  { key: "noLogs" },
  { key: "bypassCensorship", featured: true },
  { key: "globalServers", featured: true },
];

const featureIcons: Record<string, () => React.JSX.Element> = {
  nativeWindows: ComputerIcon,
  dualArchitecture: CpuIcon,
  autoUpdates: ArrowPathIcon,
  vlessEncryption: LockIcon,
  noRegistration: NoSymbolIcon,
  bypassCensorship: ShieldIcon,
  noLogs: ShieldIcon,
  globalServers: ServerIcon,
};

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function VpnForWindowsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("vpnForWindows");
  const mt = await getTranslations({ locale, namespace: "vpnForWindows.metadata" });
  const tHero = await getTranslations({ locale, namespace: "hero" });

  const useFallbackFont = FALLBACK_FONT_LOCALES.has(locale);
  const displayFontStyle = useFallbackFont
    ? { fontFamily: "var(--font-body)", fontWeight: 300 }
    : { fontFamily: "var(--font-serif)" };

  // Word-by-word blur-up cascade (same timing as the homepage hero)
  const WORD_BASE_DELAY = 0.1;
  const WORD_STAGGER = 0.07;
  const headlineWords = t("hero.title").split(/\s+/).filter(Boolean);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("hero.title"), url: `${baseUrl}/${locale}/vpn-for-windows` },
        ]}
      />
      <PlatformAppSchema
        name="Doppler VPN"
        description={mt("description")}
        operatingSystem="Windows"
        applicationCategory="UtilitiesApplication"
        downloadUrl={`${baseUrl}${URLS.windowsX64}`}
      />
      <FAQSchema
        items={faqKeys.map((key) => ({
          question: t(`faq.${key}.question`),
          answer: t(`faq.${key}.answer`),
        }))}
      />
      <Navbar />
      <main className="overflow-x-hidden">
        {/* ── Hero — centered (no Windows screenshot yet) ──────── */}
        <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -end-20 w-[24rem] h-[24rem] bg-accent-gold/10 rounded-full blur-3xl" />
            {/* Faint dot field — echoes the homepage DotGlobe motif */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: "radial-gradient(circle, var(--color-overlay) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                opacity: 0.05,
                maskImage: "radial-gradient(ellipse 60% 70% at 50% 20%, black, transparent)",
                WebkitMaskImage: "radial-gradient(ellipse 60% 70% at 50% 20%, black, transparent)",
              }}
            />
          </div>
          <div className="relative z-10 mx-auto max-w-site text-center">
            {/* Headline — serif blur-up cascade, last word in gradient italic */}
            <h1
              className="mx-auto max-w-4xl text-5xl md:text-6xl xl:text-7xl text-text-primary leading-[1.05]"
              style={displayFontStyle}
            >
              {headlineWords.map((word, i) => {
                const isLast = i === headlineWords.length - 1;
                return (
                  <Fragment key={i}>
                    <span
                      className={
                        isLast
                          ? `hero-word bg-gradient-to-t from-text-muted to-text-primary bg-clip-text text-transparent${useFallbackFont ? "" : " italic"}`
                          : "hero-word"
                      }
                      style={{ animationDelay: `${WORD_BASE_DELAY + i * WORD_STAGGER}s` }}
                    >
                      {word}
                    </span>{" "}
                  </Fragment>
                );
              })}
            </h1>

            <p className="hero-animate hero-animate-delay-2 mt-6 text-text-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>

            <div className="hero-animate hero-animate-delay-3 mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={URLS.windowsX64}
                download
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-accent-teal text-white hover:bg-accent-teal-light transition-all duration-200 shadow-lg shadow-accent-teal/25 hover:shadow-accent-teal/40 hover:-translate-y-0.5"
              >
                <DownloadIcon />
                {t("hero.ctaX64")}
              </a>
              <a
                href={URLS.windowsArm64}
                download
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border border-overlay/20 text-text-primary hover:border-accent-teal/30 hover:bg-accent-teal/5 transition-colors"
              >
                <DownloadIcon />
                {t("hero.ctaArm64")}
              </a>
            </div>

            <p className="hero-animate hero-animate-delay-4 mt-5 text-xs text-text-muted">
              {tHero("socialProof.users")}
            </p>

            {/* Trust badges — same trio as the homepage hero */}
            <ul className="hero-animate hero-animate-delay-5 mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-muted">
              <li className="flex items-center gap-1.5">
                <CheckIcon />
                {tHero("trustBadges.noData")}
              </li>
              <li className="flex items-center gap-1.5">
                <CheckIcon />
                {tHero("trustBadges.noLogs")}
              </li>
              <li className="flex items-center gap-1.5">
                <CheckIcon />
                {tHero("trustBadges.vless")}
              </li>
            </ul>
          </div>
        </section>

        {/* ── Feature Bento Grid ───────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-site">
            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4 text-center">
                {t("features.title")}
              </h2>
              <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-14 leading-relaxed">
                {t("features.subtitle")}
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featureLayout.map(({ key, featured }, i) => {
                const Icon = featureIcons[key];
                return (
                  <Reveal
                    key={key}
                    delay={(i % 4) * 60}
                    className={featured ? "md:col-span-2 h-full" : "h-full"}
                  >
                    <div
                      className={`group relative h-full overflow-hidden rounded-2xl border border-overlay/10 bg-bg-secondary/50 transition-all duration-300 hover:border-accent-teal/30 hover:bg-bg-secondary/70 ${
                        featured ? "p-7 sm:p-8" : "p-6"
                      }`}
                    >
                      {featured && (
                        <>
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-accent-teal/[0.07] via-transparent to-transparent pointer-events-none"
                            aria-hidden="true"
                          />
                          <div
                            className="absolute -bottom-4 -end-4 scale-[5] origin-bottom-right rtl:origin-bottom-left text-accent-teal/[0.06] pointer-events-none"
                            aria-hidden="true"
                          >
                            <Icon />
                          </div>
                        </>
                      )}
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-accent-teal/15 border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-4 transition-all duration-300 group-hover:bg-accent-teal/25 group-hover:shadow-[0_0_20px_rgba(0,140,140,0.3)]">
                          <Icon />
                        </div>
                        <h3 className={`font-semibold text-text-primary mb-2 ${featured ? "text-xl" : "text-base"}`}>
                          {t(`features.${key}.title`)}
                        </h3>
                        <p className={`text-text-muted leading-relaxed ${featured ? "text-[15px] max-w-xl" : "text-sm"}`}>
                          {t(`features.${key}.description`)}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How It Works — vertical timeline ─────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-secondary/30 border-y border-overlay/5">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
                {t("howItWorks.title")}
              </h2>
              <p className="text-text-muted text-lg max-w-2xl mx-auto text-center mb-14 leading-relaxed">
                {t("howItWorks.subtitle")}
              </p>
            </Reveal>

            <div>
              {stepKeys.map((step, i) => {
                const isLast = i === stepKeys.length - 1;
                return (
                  <Reveal key={step} delay={i * 80}>
                    <div className="flex gap-5 sm:gap-7">
                      <div className="flex flex-col items-center">
                        <span
                          className="flex w-12 h-12 shrink-0 items-center justify-center rounded-full border border-accent-teal/30 bg-accent-teal/10 text-accent-teal text-lg font-semibold"
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                        {!isLast && (
                          <span
                            className="w-px flex-1 my-2 bg-gradient-to-b from-accent-teal/40 to-overlay/5"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className={isLast ? "pb-0" : "pb-10"}>
                        <h3 className="text-lg font-semibold text-text-primary mb-1.5 pt-2.5">
                          {t(`howItWorks.${step}.title`)}
                        </h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                          {t(`howItWorks.${step}.description`)}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ — interactive accordion ──────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-12 text-center">
                {t("faq.title")}
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/40 px-6 sm:px-8">
                <Accordion
                  items={faqKeys.map((key) => ({
                    question: t(`faq.${key}.question`),
                    answer: t(`faq.${key}.answer`),
                  }))}
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Related Pages ────────────────────────────────────── */}
        <section className="pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-site">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(
                [
                  { href: "/no-registration-vpn", title: "noRegistration", desc: "noRegistrationDesc" },
                  { href: "/vless-vpn", title: "vless", desc: "vlessDesc" },
                  { href: "/vpn-for-macos", title: "macos", desc: "macosDesc" },
                  { href: "/vpn-for-ios", title: "ios", desc: "iosDesc" },
                  { href: "/vpn-for-android", title: "android", desc: "androidDesc" },
                ] as const
              ).map(({ href, title, desc }, i) => (
                <Reveal key={href} delay={i * 60} className="h-full">
                  <Link
                    href={href}
                    className="group h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/30 hover:bg-bg-secondary/70 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-text-primary">{t(`related.${title}`)}</h3>
                      <span className="text-text-muted group-hover:text-accent-teal transition-all duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                        <ArrowIcon />
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">{t(`related.${desc}`)}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA — glowing panel ────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-site">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-accent-teal/20 bg-gradient-to-b from-accent-teal/10 via-bg-secondary/50 to-bg-secondary/30 px-6 py-16 sm:py-20 text-center">
                <div
                  className="absolute -top-24 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-[30rem] h-[16rem] bg-accent-teal/20 rounded-full blur-3xl pointer-events-none"
                  aria-hidden="true"
                />
                <div className="relative">
                  <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4">
                    {t("cta.title")}
                  </h2>
                  <p className="text-text-muted text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
                    {t("cta.subtitle")}
                  </p>

                  <div id="blog-cta-sentinel" aria-hidden="true" />

                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <a
                      href={URLS.windowsX64}
                      download
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-accent-teal text-white hover:bg-accent-teal-light transition-all duration-200 shadow-lg shadow-accent-teal/25 hover:shadow-accent-teal/40 hover:-translate-y-0.5"
                    >
                      <DownloadIcon />
                      {t("cta.downloadX64")}
                    </a>
                    <a
                      href={URLS.windowsArm64}
                      download
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border border-overlay/20 text-text-primary hover:border-accent-teal/30 hover:bg-accent-teal/5 transition-colors"
                    >
                      <DownloadIcon />
                      {t("cta.downloadArm64")}
                    </a>
                  </div>

                  <p className="text-sm text-text-muted mb-2">{t("cta.otherPlatforms")}</p>
                  <Link
                    href="/downloads"
                    className="inline-flex items-center gap-2 text-sm text-accent-teal hover:text-accent-gold transition-colors"
                  >
                    <ArrowIcon />
                    {t("cta.downloadsLink")}
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation="vpn-for-windows" />
      <Footer />
    </>
  );
}
