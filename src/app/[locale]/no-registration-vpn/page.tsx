import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema, ArticleSchema, FAQSchema } from "@/components/seo/json-ld";
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
  const t = await getTranslations({ locale, namespace: "noRegistrationVpn.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/no-registration-vpn`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/no-registration-vpn`]),
        ["x-default", `${baseUrl}/en/no-registration-vpn`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/no-registration-vpn`,
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

const faqKeys = ["q1", "q2", "q3", "q4"] as const;
const registrationReasons = ["dataHarvesting", "targetedAds", "govRequests", "breachLiability"] as const;
const howSteps = ["download", "generateKey", "connect", "done"] as const;
const collectionItems = ["email", "phone", "name", "browsingHistory", "ipLogs", "connectionTimestamps"] as const;
const comparisonProviders = ["doppler", "protonvpn", "nordvpn", "expressvpn"] as const;
const comparisonCols = ["registration", "emailNeeded", "logsPolicy", "paymentTracking", "openProtocol"] as const;
const getStartedSteps = ["step1", "step2", "step3"] as const;

/* -- Icons ------------------------------------------------------------ */

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
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

function XMarkIcon() {
  return (
    <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function CollectedIcon() {
  return (
    <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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

/* -- Page ------------------------------------------------------------- */

export default async function NoRegistrationVpnPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("noRegistrationVpn");
  const mt = await getTranslations({ locale, namespace: "noRegistrationVpn.metadata" });

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("hero.title"), url: `${baseUrl}/${locale}/no-registration-vpn` },
        ]}
      />
      <ArticleSchema
        headline={mt("title")}
        description={mt("description")}
        url={`${baseUrl}/${locale}/no-registration-vpn`}
      />
      <FAQSchema
        items={faqKeys.map((key) => ({
          question: t(`faq.${key}.question`),
          answer: t(`faq.${key}.answer`),
        }))}
      />
      <Navbar />
      <main className="overflow-x-hidden">
        {/* -- Hero ---------------------------------------------------- */}
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
          </div>
        </section>

        {/* -- Why Most VPNs Require Registration ---------------------- */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4 text-center">
              {t("whyRegister.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
              {t("whyRegister.intro")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registrationReasons.map((reason, i) => (
                <div key={reason} className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 text-sm font-semibold">
                      {i + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {t(`whyRegister.${reason}.title`)}
                    </h3>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {t(`whyRegister.${reason}.description`)}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-center text-text-muted font-medium italic mt-8">
              {t("whyRegister.conclusion")}
            </p>
          </div>
        </section>

        {/* -- How Doppler Works Without an Account -------------------- */}
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
                <div key={step} className="rounded-2xl border border-accent-teal/15 bg-accent-teal/[0.03] p-6 flex items-start gap-4">
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

        {/* -- What We Don't Collect ----------------------------------- */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
              {t("noCollect.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
              {t("noCollect.subtitle")}
            </p>

            <div className="overflow-x-auto rounded-2xl border border-overlay/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-secondary/50">
                    <th scope="col" className="text-start p-4 font-medium text-text-muted">
                      {t("noCollect.headers.dataType")}
                    </th>
                    <th scope="col" className="text-center p-4 font-medium text-text-muted">
                      {t("noCollect.headers.otherVpns")}
                    </th>
                    <th scope="col" className="text-center p-4 font-medium text-text-muted">
                      {t("noCollect.headers.doppler")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {collectionItems.map((item, i) => (
                    <tr key={item} className={i < collectionItems.length - 1 ? "border-t border-overlay/5" : ""}>
                      <td className="p-4 text-text-primary font-medium">
                        {t(`noCollect.${item}.label`)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <CollectedIcon />
                        </div>
                      </td>
                      <td className="p-4 bg-accent-teal/5">
                        <div className="flex justify-center">
                          <XMarkIcon />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-center text-text-muted text-sm mt-4 italic">
              {t("noCollect.footnote")}
            </p>
          </div>
        </section>

        {/* -- Privacy Comparison -------------------------------------- */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-8 text-center">
              {t("comparison.title")}
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-overlay/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-secondary/50">
                    <th scope="col" className="text-start p-4 font-medium text-text-muted">
                      {t("comparison.headers.provider")}
                    </th>
                    {comparisonCols.map((col) => (
                      <th key={col} scope="col" className="text-start p-4 font-medium text-text-muted">
                        {t(`comparison.headers.${col}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonProviders.map((provider, i) => (
                    <tr key={provider} className={`${i < comparisonProviders.length - 1 ? "border-t border-overlay/5" : ""} ${provider === "doppler" ? "bg-accent-teal/5" : ""}`}>
                      <th scope="row" className={`text-start p-4 font-medium ${provider === "doppler" ? "text-accent-teal" : "text-text-primary"}`}>
                        {t(`comparison.${provider}.name`)}
                      </th>
                      {comparisonCols.map((col) => (
                        <td key={col} className={`p-4 ${provider === "doppler" ? "text-accent-teal font-medium" : "text-text-muted"}`}>
                          {t(`comparison.${provider}.${col}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* -- Your Data, Your Device ---------------------------------- */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-accent-teal/20 bg-accent-teal/[0.03] p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/15 border border-accent-teal/20 flex items-center justify-center text-accent-teal">
                  <DeviceIcon />
                </div>
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary">
                    {t("deviceKey.title")}
                  </h2>
                  <span className="text-xs font-medium text-accent-teal bg-accent-teal/10 px-2 py-0.5 rounded-full">
                    {t("deviceKey.badge")}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-text-muted leading-relaxed">{t("deviceKey.p1")}</p>
                <p className="text-text-muted leading-relaxed">{t("deviceKey.p2")}</p>
                <p className="text-text-muted leading-relaxed">{t("deviceKey.p3")}</p>
                <p className="text-text-primary font-medium">{t("deviceKey.p4")}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["deviceGen", "serverVal", "zeroPii"] as const).map((item) => (
                  <div key={item} className="rounded-xl border border-accent-teal/15 bg-accent-teal/[0.05] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-accent-teal/15 flex items-center justify-center text-accent-teal">
                        {item === "deviceGen" && <KeyIcon />}
                        {item === "serverVal" && <ShieldIcon />}
                        {item === "zeroPii" && <CheckIcon />}
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {t(`deviceKey.${item}.title`)}
                      </h3>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {t(`deviceKey.${item}.description`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* -- Get Started in 30 Seconds ------------------------------- */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
              {t("getStarted.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto text-center mb-12 leading-relaxed">
              {t("getStarted.subtitle")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getStartedSteps.map((step, i) => (
                <div key={step} className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 text-center">
                  <span className="inline-flex w-12 h-12 rounded-2xl bg-accent-teal/15 border border-accent-teal/20 items-center justify-center text-accent-teal text-xl font-bold mb-4">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {t(`getStarted.${step}.title`)}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {t(`getStarted.${step}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- Related Pages ------------------------------------------- */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/vless-vpn" className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors block">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{t("related.vless")}</h3>
                <p className="text-xs text-text-muted">{t("related.vlessDesc")}</p>
              </Link>
              <Link href="/vpn-for-ios" className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors block">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{t("related.ios")}</h3>
                <p className="text-xs text-text-muted">{t("related.iosDesc")}</p>
              </Link>
              <Link href="/vpn-for-android" className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors block">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{t("related.android")}</h3>
                <p className="text-xs text-text-muted">{t("related.androidDesc")}</p>
              </Link>
            </div>
          </div>
        </section>

        {/* -- Final CTA ----------------------------------------------- */}
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
                href={URLS.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                {t("cta.downloadIos")}
              </a>
              <a
                href={URLS.androidPlayStore}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                {t("cta.downloadAndroid")}
              </a>
              <a
                href={URLS.telegramBot}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-gold/15 text-accent-gold hover:bg-accent-gold/25 transition-colors"
              >
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
      <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation="no-registration-vpn" />
      <Footer />
    </>
  );
}
