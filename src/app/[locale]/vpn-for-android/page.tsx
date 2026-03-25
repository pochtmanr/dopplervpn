import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema, ArticleSchema } from "@/components/seo/json-ld";
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
import { Link } from "@/i18n/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

const URLS = {
  ios: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
  androidPlayStore: "https://play.google.com/store/apps/details?id=org.dopplervpn.android",
  telegramBot: "https://t.me/dopplercreatebot",
  telegramChannelRu: "https://t.me/dopplervpn",
  telegramChannelEn: "https://t.me/dopplervpnen",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vpnForAndroid.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/vpn-for-android`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/vpn-for-android`]),
        ["x-default", `${baseUrl}/en/vpn-for-android`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/vpn-for-android`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "article",
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

const featureKeys = ["noRegistration", "vlessReality", "adBlocker", "alwaysOn", "apkSideload", "dnsProtection"] as const;
const howSteps = ["step1", "step2", "step3", "step4"] as const;
const androidFeatures = ["alwaysOnVpn", "splitTunneling", "quickSettings", "batteryOptimization", "androidTv"] as const;
const sideloadSteps = ["step1", "step2", "step3", "step4"] as const;
const manufacturers = ["Samsung", "Xiaomi", "Huawei", "OnePlus", "Google Pixel", "OPPO", "Realme"] as const;

/* -- Icons ---------------------------------------------------------- */

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
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

function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-accent-teal shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
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

function BoltIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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

function GlobeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
    </svg>
  );
}

function NoUserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
  );
}

const featureIcons = [NoUserIcon, ShieldIcon, GlobeIcon, BoltIcon, DownloadIcon, LockIcon] as const;

/* -- Page ----------------------------------------------------------- */

export default async function VpnForAndroidPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("vpnForAndroid");
  const mt = await getTranslations({ locale, namespace: "vpnForAndroid.metadata" });

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("hero.title"), url: `${baseUrl}/${locale}/vpn-for-android` },
        ]}
      />
      <ArticleSchema
        headline={mt("title")}
        description={mt("description")}
        url={`${baseUrl}/${locale}/vpn-for-android`}
      />
      <Navbar />
      <main className="overflow-x-hidden">
        {/* -- Hero -------------------------------------------------- */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -end-20 w-[24rem] h-[24rem] bg-accent-gold/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary mb-4">
              {t("hero.title")}
            </h1>
            <p className="text-text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* Hero CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <a
                href={URLS.androidPlayStore}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                {t("hero.googlePlay")}
              </a>
              <a
                href="#apk-download"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-gold/15 text-accent-gold hover:bg-accent-gold/25 transition-colors"
              >
                <DownloadIcon />
                {t("hero.downloadApk")}
              </a>
            </div>
          </div>
        </section>

        {/* -- Why Doppler for Android? ------------------------------ */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4 text-center">
              {t("features.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
              {t("features.subtitle")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureKeys.map((key, i) => {
                const Icon = featureIcons[i];
                return (
                  <div key={key} className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal">
                        <Icon />
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary">
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

        {/* -- Two Ways to Install ----------------------------------- */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
              {t("install.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
              {t("install.subtitle")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Google Play */}
              <div className="rounded-2xl border border-accent-teal/20 bg-accent-teal/[0.03] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-teal/15 border border-accent-teal/20 flex items-center justify-center text-accent-teal">
                    <PhoneIcon />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary">
                      {t("install.playStore.title")}
                    </h3>
                    <span className="text-xs font-medium text-accent-teal bg-accent-teal/10 px-2 py-0.5 rounded-full">
                      {t("install.playStore.badge")}
                    </span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {(["benefit1", "benefit2", "benefit3"] as const).map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-text-muted">
                      <CheckIcon />
                      <span>{t(`install.playStore.${b}`)}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={URLS.androidPlayStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-medium bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  {t("install.playStore.cta")}
                </a>
              </div>

              {/* APK Download */}
              <div id="apk-download" className="rounded-2xl border border-accent-gold/20 bg-accent-gold/[0.03] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-gold/15 border border-accent-gold/20 flex items-center justify-center text-accent-gold">
                    <DownloadIcon />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary">
                      {t("install.apk.title")}
                    </h3>
                    <span className="text-xs font-medium text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full">
                      {t("install.apk.badge")}
                    </span>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {(["benefit1", "benefit2", "benefit3"] as const).map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-text-muted">
                      <CheckIcon />
                      <span>{t(`install.apk.${b}`)}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-accent-gold/80 mb-6 leading-relaxed">
                  {t("install.apk.note")}
                </p>
                <a
                  href={URLS.telegramBot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-medium bg-accent-gold/15 text-accent-gold hover:bg-accent-gold/25 transition-colors"
                >
                  <DownloadIcon />
                  {t("install.apk.cta")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* -- How It Works on Android ------------------------------- */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
              {t("howItWorks.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto text-center mb-12 leading-relaxed">
              {t("howItWorks.subtitle")}
            </p>

            <div className="space-y-4">
              {howSteps.map((step, i) => (
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

        {/* -- Android-Specific Features ----------------------------- */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
              {t("androidFeatures.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
              {t("androidFeatures.subtitle")}
            </p>

            <div className="space-y-4">
              {androidFeatures.map((feature) => (
                <div key={feature} className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                  <div className="flex items-center gap-3 md:w-56 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-accent-teal/10 flex items-center justify-center text-accent-teal">
                      <CogIcon />
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {t(`androidFeatures.${feature}.title`)}
                    </h3>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t(`androidFeatures.${feature}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- APK Sideloading Guide --------------------------------- */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-accent-gold/20 bg-accent-gold/[0.03] p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-gold/15 border border-accent-gold/20 flex items-center justify-center text-accent-gold">
                  <DownloadIcon />
                </div>
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary">
                    {t("sideloading.title")}
                  </h2>
                  <span className="text-xs font-medium text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full">
                    {t("sideloading.badge")}
                  </span>
                </div>
              </div>

              <p className="text-text-muted leading-relaxed mb-6">
                {t("sideloading.intro")}
              </p>

              <div className="space-y-4 mb-8">
                {sideloadSteps.map((step, i) => (
                  <div key={step} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-gold/15 flex items-center justify-center text-accent-gold text-sm font-semibold">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary mb-1">
                        {t(`sideloading.${step}.title`)}
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {t(`sideloading.${step}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security note */}
              <div className="rounded-xl border border-accent-teal/20 bg-accent-teal/5 p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-accent-teal/15 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldIcon />
                </div>
                <div>
                  <span className="text-sm font-semibold text-accent-teal">{t("sideloading.security.title")}</span>
                  <p className="text-sm text-text-muted leading-relaxed mt-1">
                    {t("sideloading.security.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -- System Requirements ----------------------------------- */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-8 text-center">
              {t("requirements.title")}
            </h2>

            <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OS requirement */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">
                    {t("requirements.os.title")}
                  </h3>
                  <p className="text-sm text-text-muted">{t("requirements.os.value")}</p>
                </div>

                {/* Battery */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">
                    {t("requirements.battery.title")}
                  </h3>
                  <p className="text-sm text-text-muted">{t("requirements.battery.value")}</p>
                </div>

                {/* Storage */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">
                    {t("requirements.storage.title")}
                  </h3>
                  <p className="text-sm text-text-muted">{t("requirements.storage.value")}</p>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">
                    {t("requirements.permissions.title")}
                  </h3>
                  <p className="text-sm text-text-muted">{t("requirements.permissions.value")}</p>
                </div>
              </div>

              {/* Compatible manufacturers */}
              <div className="mt-6 pt-6 border-t border-overlay/10">
                <h3 className="text-sm font-semibold text-text-primary mb-3">
                  {t("requirements.compatibility.title")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {manufacturers.map((brand) => (
                    <span
                      key={brand}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-teal/10 text-accent-teal border border-accent-teal/20"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -- Related Pages ----------------------------------------- */}
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
              <Link href="/vpn-for-ios" className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors block">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{t("related.ios")}</h3>
                <p className="text-xs text-text-muted">{t("related.iosDesc")}</p>
              </Link>
            </div>
          </div>
        </section>

        {/* -- Final CTA --------------------------------------------- */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-text-muted text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
              {t("cta.subtitle")}
            </p>

            <div id="blog-cta-sentinel" aria-hidden="true" />

            {/* Primary download buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <a
                href={URLS.androidPlayStore}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                {t("cta.googlePlay")}
              </a>
              <a
                href={URLS.telegramBot}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-gold/15 text-accent-gold hover:bg-accent-gold/25 transition-colors"
              >
                <DownloadIcon />
                {t("cta.downloadApk")}
              </a>
            </div>

            {/* Secondary links */}
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              <a
                href={URLS.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-teal transition-colors"
              >
                <ArrowIcon />
                {t("cta.alsoOnIos")}
              </a>
              <a
                href={URLS.telegramBot}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-teal transition-colors"
              >
                <ArrowIcon />
                {t("cta.telegramBot")}
              </a>
            </div>

            {/* Telegram channel links */}
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={URLS.telegramChannelRu}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-teal transition-colors"
              >
                <ArrowIcon />
                {t("cta.telegramChannelRu")}
              </a>
              <a
                href={URLS.telegramChannelEn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-teal transition-colors"
              >
                <ArrowIcon />
                {t("cta.telegramChannelEn")}
              </a>
            </div>
          </div>
        </section>
      </main>
      <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation="vpn-for-android" />
      <Footer />
    </>
  );
}
