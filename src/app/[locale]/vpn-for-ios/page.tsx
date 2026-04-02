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

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

const URLS = {
  ios: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
  androidPlayStore: "https://play.google.com/store/apps/details?id=org.dopplervpn.android",
};

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

const featureKeys = ["vlessEncryption", "noRegistration", "oneTapConnect", "bypassCensorship", "noLogs", "globalServers", "freeTrial", "iphoneIpad"] as const;
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

function GlobeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
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
        price="0"
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
        <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -end-20 w-[24rem] h-[24rem] bg-accent-gold/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left: screenshot */}
              <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                <Image
                  src="/images/ios-hero.avif"
                  alt="Doppler VPN running on iPhone — secure VPN connection screen"
                  width={500}
                  height={500}
                  className="w-full max-w-md lg:max-w-lg rounded-2xl"
                  priority
                />
              </div>
              {/* Right: text */}
              <div className="order-1 lg:order-2">
                <h1 className="font-display text-4xl md:text-5xl lg:text-5xl font-semibold text-text-primary mb-5 leading-tight">
                  {t("hero.title")}
                </h1>
                <p className="text-text-muted text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                  {t("hero.subtitle")}
                </p>
                <a
                  href={URLS.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors shadow-lg shadow-accent-teal/20"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  {t("hero.cta")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Grid ─────────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4 text-center">
              {t("features.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
              {t("features.subtitle")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featureKeys.map((key) => {
                const Icon = featureIcons[key];
                return (
                  <div key={key} className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-teal/15 border border-accent-teal/20 flex items-center justify-center text-accent-teal">
                        <Icon />
                      </div>
                      <h3 className="text-base font-semibold text-text-primary">
                        {t(`features.${key}.title`)}
                      </h3>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t(`features.${key}.description`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
              {t("howItWorks.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto text-center mb-12 leading-relaxed">
              {t("howItWorks.subtitle")}
            </p>

            <div className="space-y-4">
              {stepKeys.map((step, i) => (
                <div key={step} className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-teal/15 border border-accent-teal/20 flex items-center justify-center text-accent-teal font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">
                      {t(`howItWorks.${step}.title`)}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t(`howItWorks.${step}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-12 text-center">
              {t("faq.title")}
            </h2>

            <div className="space-y-4">
              {faqKeys.map((key) => (
                <div key={key} className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {t(`faq.${key}.question`)}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {t(`faq.${key}.answer`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Related Pages ────────────────────────────────────── */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/no-registration-vpn" className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors block">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{t("related.noRegistration")}</h3>
                <p className="text-xs text-text-muted">{t("related.noRegistrationDesc")}</p>
              </Link>
              <Link href="/vless-vpn" className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors block">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{t("related.vless")}</h3>
                <p className="text-xs text-text-muted">{t("related.vlessDesc")}</p>
              </Link>
              <Link href="/vpn-for-android" className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors block">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{t("related.android")}</h3>
                <p className="text-xs text-text-muted">{t("related.androidDesc")}</p>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Final CTA ───────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
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
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors shadow-lg shadow-accent-teal/20"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
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
        </section>
      </main>
      <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation="vpn-for-ios" />
      <Footer />
    </>
  );
}
