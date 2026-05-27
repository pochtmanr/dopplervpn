import { getTranslations, setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { BreadcrumbSchema, FAQSchema, ArticleSchema, WebPageSchema } from "@/components/seo/json-ld";
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
import type { CtaLocation } from "@/lib/track-cta";

const baseUrl = "https://www.dopplervpn.org";

const URLS = {
  ios: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
  androidPlayStore: "https://play.google.com/store/apps/details?id=org.dopplervpn.android",
  telegramBot: "https://t.me/dopplercreatebot",
  telegramChannelRu: "https://t.me/dopplervpn",
  telegramChannelEn: "https://t.me/dopplervpnen",
};

export type PrimaryPlatform = "all" | "ios" | "android";

export interface RelatedLink {
  /** Path beginning with "/" — passed to next-intl Link */
  href: string;
  /** Translation key under `<namespace>.related` for the label */
  titleKey: string;
  /** Translation key under `<namespace>.related` for the description */
  descKey: string;
}

export interface SeoLandingPageProps {
  locale: string;
  /** URL slug — must also exist in CtaLocation for analytics tracking. */
  slug: CtaLocation;
  namespace: string;
  /** Which download buttons to feature. "all" shows iOS + Android + Telegram bot. */
  primaryPlatform?: PrimaryPlatform;
  /** Number of feature cards rendered. Keys must be feature1…featureN. */
  featureCount?: number;
  /** Number of FAQ entries. Keys must be q1…qN. */
  faqCount?: number;
  /** Number of how-it-works steps. Keys must be step1…stepN. */
  stepCount?: number;
  /** Up to 3 internal links shown above the final CTA. */
  related: RelatedLink[];
  /** ISO 8601 date the page first shipped (e.g. "2026-05-26"). Required so
   *  ArticleSchema emits a real freshness signal — never default. */
  datePublished: string;
  /** ISO 8601 date of the most recent material content change. Defaults to
   *  `datePublished`. Bump when the user-visible copy changes. */
  dateModified?: string;
}

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
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
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

const featureIcons = [LockIcon, ShieldIcon, BoltIcon, NoSymbolIcon, GlobeIcon];

function AppleLogo() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}

function DownloadButtons({
  t,
  primaryPlatform,
  utmCampaign,
}: {
  t: (key: string) => string;
  primaryPlatform: PrimaryPlatform;
  utmCampaign: string;
}) {
  const utm = `?utm_source=organic&utm_medium=seo&utm_campaign=${utmCampaign}`;
  const showIos = primaryPlatform !== "android";
  const showAndroid = primaryPlatform !== "ios";

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {showIos && (
        <a
          href={`${URLS.ios}${utm}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors shadow-lg shadow-accent-teal/20"
        >
          <AppleLogo />
          {t("cta.downloadIos")}
        </a>
      )}
      {showAndroid && (
        <a
          href={`${URLS.androidPlayStore}${utm}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors shadow-lg shadow-accent-teal/20"
        >
          <GoogleLogo />
          {t("cta.downloadAndroid")}
        </a>
      )}
      <a
        href={`${URLS.telegramBot}${utm}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-accent-gold/15 text-accent-gold hover:bg-accent-gold/25 transition-colors"
      >
        {t("cta.telegramBot")}
      </a>
    </div>
  );
}

export async function SeoLandingPage({
  locale,
  slug,
  namespace,
  primaryPlatform = "all",
  featureCount = 4,
  faqCount = 6,
  stepCount = 4,
  related,
  datePublished,
  dateModified,
}: SeoLandingPageProps) {
  setRequestLocale(locale);
  const t = await getTranslations(namespace);
  const mt = await getTranslations({ locale, namespace: `${namespace}.metadata` });

  const featureKeys = Array.from({ length: featureCount }, (_, i) => `feature${i + 1}`);
  const stepKeys = Array.from({ length: stepCount }, (_, i) => `step${i + 1}`);
  const faqKeys = Array.from({ length: faqCount }, (_, i) => `q${i + 1}`);
  const pageUrl = `${baseUrl}/${locale}/${slug}`;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("hero.title"), url: pageUrl },
        ]}
      />
      <WebPageSchema
        url={pageUrl}
        name={mt("title")}
        description={mt("description")}
      />
      <ArticleSchema
        headline={mt("title")}
        description={mt("description")}
        url={pageUrl}
        datePublished={datePublished}
        dateModified={dateModified}
      />
      <FAQSchema
        items={faqKeys.map((key) => ({
          question: t(`faq.${key}.question`),
          answer: t(`faq.${key}.answer`),
        }))}
      />
      <Navbar />
      <main className="overflow-x-hidden">
        {/* Hero */}
        <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -end-20 w-[24rem] h-[24rem] bg-accent-gold/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary mb-4">
              {t("hero.title")}
            </h1>
            <p className="text-text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              {t("hero.subtitle")}
            </p>
            <DownloadButtons t={t} primaryPlatform={primaryPlatform} utmCampaign={slug} />
          </div>
        </section>

        {/* Problem context */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-accent-amber/20 bg-accent-amber/[0.03] p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber">
                  <ShieldIcon />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary">
                  {t("problem.title")}
                </h2>
              </div>
              <div className="space-y-3">
                <p className="text-text-muted leading-relaxed">{t("problem.p1")}</p>
                <p className="text-text-muted leading-relaxed">{t("problem.p2")}</p>
                <p className="text-text-primary font-medium leading-relaxed">{t("problem.p3")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4 text-center">
              {t("features.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
              {t("features.subtitle")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featureKeys.map((key, i) => {
                const Icon = featureIcons[i % featureIcons.length];
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

        {/* How it works */}
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

        {/* FAQ */}
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
                  <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
                    {t(`faq.${key}.answer`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related pages */}
        {related.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.slice(0, 3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors block"
                  >
                    <h3 className="text-sm font-semibold text-text-primary mb-1">
                      {t(`related.${link.titleKey}`)}
                    </h3>
                    <p className="text-xs text-text-muted">{t(`related.${link.descKey}`)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-text-muted text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
              {t("cta.subtitle")}
            </p>

            <div id="blog-cta-sentinel" aria-hidden="true" />

            <DownloadButtons t={t} primaryPlatform={primaryPlatform} utmCampaign={slug} />

            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <a
                href={`${URLS.telegramChannelEn}?utm_source=organic&utm_medium=seo&utm_campaign=${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-teal transition-colors"
              >
                <ArrowIcon />
                {t("cta.telegramChannelEn")}
              </a>
              <a
                href={`${URLS.telegramChannelRu}?utm_source=organic&utm_medium=seo&utm_campaign=${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-teal transition-colors"
              >
                <ArrowIcon />
                {t("cta.telegramChannelRu")}
              </a>
            </div>
          </div>
        </section>
      </main>
      <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation={slug} />
      <Footer />
    </>
  );
}
