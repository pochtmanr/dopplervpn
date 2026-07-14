import { Fragment } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
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
  ios: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
};

// Locales where decorative Latin-only fonts break (no Cyrillic/CJK/Arabic glyphs)
const FALLBACK_FONT_LOCALES = new Set(["ru", "uk", "zh", "ja", "ko", "ar", "fa", "he", "hi", "ur", "th"]);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vpnForIos.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/vpn-for-ios`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/vpn-for-ios`]),
        ["x-default", `${baseUrl}/en/vpn-for-ios`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/vpn-for-ios`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/images/og-banner.jpg`,
          width: 1200,
          height: 630,
          alt: "Doppler VPN for iPhone & iPad",
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

function BoltIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
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

function GiftIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
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

function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
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

function Stars() {
  return (
    <span className="flex items-center gap-px text-accent-amber" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 0 0-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.445a1 1 0 0 0-1.175 0l-3.367 2.445c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.958Z" />
        </svg>
      ))}
    </span>
  );
}

/* ── Feature bento layout ─────────────────────────────────────────── */
// Featured cards span two columns and carry an oversized watermark icon.

const featureLayout: { key: string; featured?: boolean }[] = [
  { key: "vlessEncryption", featured: true },
  { key: "noRegistration" },
  { key: "oneTapConnect" },
  { key: "bypassCensorship", featured: true },
  { key: "noLogs" },
  { key: "globalServers" },
  { key: "freeTrial", featured: true },
  { key: "iphoneIpad", featured: true },
];

const featureIcons: Record<string, () => React.JSX.Element> = {
  vlessEncryption: LockIcon,
  noRegistration: NoSymbolIcon,
  oneTapConnect: BoltIcon,
  bypassCensorship: ShieldIcon,
  noLogs: ShieldIcon,
  globalServers: ServerIcon,
  freeTrial: GiftIcon,
  iphoneIpad: PhoneIcon,
};

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function VpnForIosPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("vpnForIos");
  const mt = await getTranslations({ locale, namespace: "vpnForIos.metadata" });
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
          { name: t("hero.title"), url: `${baseUrl}/${locale}/vpn-for-ios` },
        ]}
      />
      <PlatformAppSchema
        name="Doppler VPN"
        description={mt("description")}
        operatingSystem="iOS"
        applicationCategory="UtilitiesApplication"
        downloadUrl={URLS.ios}
      />
      <FAQSchema
        items={faqKeys.map((key) => ({
          question: t(`faq.${key}.question`),
          answer: t(`faq.${key}.answer`),
        }))}
      />
      <Navbar />
      <main className="overflow-x-hidden">
        {/* ── Hero ──────────────────────────────────────────────── */}
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
                maskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black, transparent)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black, transparent)",
              }}
            />
          </div>
          <div className="relative z-10 mx-auto max-w-site">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Text */}
              <div className="text-center lg:text-start">
                {/* App Store rating chip */}
                <a
                  href={URLS.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-animate inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm bg-accent-teal/10 border border-accent-teal/20 hover:bg-accent-teal/20 hover:border-accent-teal/40 transition-colors"
                >
                  <Stars />
                  <span className="font-semibold text-text-primary">{tHero("socialProof.rating")}</span>
                  <span className="text-text-muted">{tHero("socialProof.appStore")}</span>
                </a>

                {/* Headline — serif blur-up cascade, last word in gradient italic */}
                <h1
                  className="mt-6 text-5xl md:text-6xl xl:text-7xl text-text-primary leading-[1.05]"
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

                <p className="hero-animate hero-animate-delay-2 mt-6 text-text-muted text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {t("hero.subtitle")}
                </p>

                <div className="hero-animate hero-animate-delay-3 mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <a
                    href={URLS.ios}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-accent-teal text-white hover:bg-accent-teal-light transition-all duration-200 shadow-lg shadow-accent-teal/25 hover:shadow-accent-teal/40 hover:-translate-y-0.5"
                  >
                    <AppleIcon />
                    {t("hero.cta")}
                  </a>
                  <span className="text-xs text-text-muted">{tHero("socialProof.users")}</span>
                </div>

                {/* Trust badges — same trio as the homepage hero */}
                <ul className="hero-animate hero-animate-delay-5 mt-7 hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-text-muted">
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

              {/* Screenshot — layered glow presentation */}
              <div className="hero-animate hero-animate-delay-3 relative flex justify-center lg:justify-end">
                <div className="absolute w-[22rem] h-[22rem] bg-accent-teal/15 rounded-full blur-3xl" aria-hidden="true" />
                <Image
                  src="/images/ios-hero.avif"
                  alt="Doppler VPN running on iPhone — secure VPN connection screen"
                  width={1354}
                  height={909}
                  className="relative w-full max-w-lg lg:max-w-2xl rounded-[2rem] ring-1 ring-overlay/10 shadow-2xl shadow-black/40"
                  priority
                />
              </div>
            </div>
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
                  { href: "/vpn-for-android", title: "android", desc: "androidDesc" },
                  { href: "/vpn-for-macos", title: "macos", desc: "macosDesc" },
                  { href: "/vpn-for-windows", title: "windows", desc: "windowsDesc" },
                  { href: "/vpn-for-public-wifi-iphone", title: "publicWifi", desc: "publicWifiDesc" },
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
                      href={URLS.ios}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-accent-teal text-white hover:bg-accent-teal-light transition-all duration-200 shadow-lg shadow-accent-teal/25 hover:shadow-accent-teal/40 hover:-translate-y-0.5"
                    >
                      <AppleIcon />
                      {t("cta.downloadIos")}
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
      <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation="vpn-for-ios" />
      <Footer />
    </>
  );
}
