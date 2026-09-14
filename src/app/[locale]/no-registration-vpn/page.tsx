import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema, ArticleSchema, FAQSchema, WebPageSchema } from "@/components/seo/json-ld";
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
import { seoTitle } from "@/lib/seo-title";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ComparisonAccordion } from "@/components/sections/comparison-accordion";
import { CTA } from "@/components/sections/cta";
import { RelatedRail, type RelatedRailItem } from "@/components/no-registration/related-rail";
import { NoRegStepCard } from "@/components/no-registration/step-card";
import { CollectItem } from "@/components/no-registration/collect-item";
import { NoRegIdentityPlate } from "@/components/no-registration/identity-plate";
import { PageFaq } from "@/components/no-registration/page-faq";
import { SeoHero } from "@/components/seo/seo-hero";
import { CheckIcon } from "@/components/seo/glass-card";
import { PricingBackdrop } from "@/components/glyph/pricing-glyphs";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "noRegistrationVpn.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title: seoTitle(title),
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
const compareRows = ["account", "logs", "protocol"] as const;
const devicePillars = ["deviceGen", "serverVal", "zeroPii"] as const;

export default async function NoRegistrationVpnPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, mt, tHero, tFooter, tCrypto, tBypass, tCmp, tFaq] = await Promise.all([
    getTranslations("noRegistrationVpn"),
    getTranslations({ locale, namespace: "noRegistrationVpn.metadata" }),
    getTranslations("hero"),
    getTranslations("footer"),
    getTranslations("payWithCrypto"),
    getTranslations("bypassCensorship"),
    getTranslations("comparisonTable"),
    getTranslations("faq"),
  ]);

  const faqItems = faqKeys.map((key) => ({
    id: key,
    question: t(`faq.${key}.question`),
    answer: t(`faq.${key}.answer`),
  }));

  const relatedItems: RelatedRailItem[] = [
    { href: "/vless-vpn", title: t("related.vless"), desc: t("related.vlessDesc"), icon: "vless" },
    {
      href: "/pay-with-crypto",
      title: tFooter("payWithCrypto"),
      desc: tCrypto("why.anonymousTitle"),
      icon: "crypto",
    },
    {
      href: "/bypass-censorship",
      title: tFooter("bypassCensorship"),
      desc: tBypass("hero.title"),
      icon: "bypass",
    },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("hero.title"), url: `${baseUrl}/${locale}/no-registration-vpn` },
        ]}
      />
      <WebPageSchema
        url={`${baseUrl}/${locale}/no-registration-vpn`}
        name={mt("title")}
        description={mt("description")}
      />
      <ArticleSchema
        headline={mt("title")}
        description={mt("description")}
        url={`${baseUrl}/${locale}/no-registration-vpn`}
        datePublished="2026-03-11"
        dateModified="2026-09-14"
      />
      <FAQSchema items={faqItems.map(({ question, answer }) => ({ question, answer }))} />
      <Navbar />
      <main className="overflow-x-clip">
        <section className="relative overflow-hidden bg-bg-secondary/30 pt-28 sm:pt-32 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8">
          <PricingBackdrop />
          <div className="relative mx-auto max-w-site py-6 md:py-10">
            <SeoHero
              title={t("hero.title")}
              subtitle={t("hero.subtitle")}
              location="no-registration-vpn"
              secondaryLabel={tHero("getPro")}
              trustLabel={(key) => tHero(`trustBadges.${key}`)}
            />
            <div className="lg:hidden mt-8">
              <RelatedRail items={relatedItems} variant="chips" />
            </div>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-site lg:grid lg:grid-cols-[minmax(0,1fr)_16.5rem] xl:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-10 xl:gap-12">
            <div className="min-w-0">
              <section className="py-12 md:py-20">
                <SectionHeader title={t("whyRegister.title")} subtitle={t("whyRegister.intro")} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {registrationReasons.map((reason, i) => (
                    <Reveal key={reason} delay={i * 50}>
                      <div className="group relative h-full rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] p-6 overflow-hidden backdrop-blur-sm hover:border-accent-teal/30 transition-colors duration-300">
                        <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />
                        <div className="absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative">
                          <h3 className="text-lg font-semibold text-text-primary mb-2">
                            {t(`whyRegister.${reason}.title`)}
                          </h3>
                          <p className="text-sm text-text-muted leading-relaxed">
                            {t(`whyRegister.${reason}.description`)}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <Reveal delay={200}>
                  <p className="text-center mt-8 text-lg font-medium text-text-primary">
                    {t("whyRegister.conclusion")}
                    <span aria-hidden="true" className="terminal-cursor ms-1 text-accent-teal-light">
                      ▌
                    </span>
                  </p>
                </Reveal>
              </section>

              <section className="py-12 md:py-20">
                <SectionHeader title={t("howItWorks.title")} subtitle={t("howItWorks.subtitle")} />
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
                  aria-label={`${t("howItWorks.download.title")} → ${t("howItWorks.generateKey.title")} → ${t("howItWorks.connect.title")} → ${t("howItWorks.done.title")}`}
                >
                  {howSteps.map((step, i) => (
                    <Reveal key={step} delay={i * 50}>
                      <NoRegStepCard
                        index={i}
                        title={t(`howItWorks.${step}.title`)}
                        description={t(`howItWorks.${step}.description`)}
                      />
                    </Reveal>
                  ))}
                </div>
              </section>

              <section className="py-12 md:py-20">
                <SectionHeader title={t("noCollect.title")} subtitle={t("noCollect.subtitle")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {collectionItems.map((item, i) => (
                    <Reveal key={item} delay={i * 40}>
                      <CollectItem
                        item={item}
                        label={t(`noCollect.${item}.label`)}
                        never={tCmp("rows.logs.doppler")}
                      />
                    </Reveal>
                  ))}
                </div>
              </section>

              <section className="py-12 md:py-20">
                <SectionHeader title={t("comparison.title")} subtitle={tCmp("subtitle")} />
                <Reveal>
                  <ComparisonAccordion
                    headers={{
                      feature: tCmp("headers.feature"),
                      traditional: tCmp("headers.traditional"),
                      doppler: tCmp("headers.doppler"),
                    }}
                    panel={{ means: tCmp("panel.means"), keeps: tCmp("panel.keeps"), why: tCmp("panel.why") }}
                    rows={compareRows.map((key) => ({
                      key,
                      feature: tCmp(`rows.${key}.feature`),
                      traditional: tCmp(`rows.${key}.traditional`),
                      doppler: tCmp(`rows.${key}.doppler`),
                      means: tCmp(`rows.${key}.means`),
                      keeps: tCmp(`rows.${key}.keeps`),
                      why: tCmp(`rows.${key}.why`),
                    }))}
                  />
                </Reveal>
              </section>

              <section className="py-12 md:py-20">
                <div className="group relative overflow-hidden rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] backdrop-blur-sm">
                  <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />
                  <div className="relative p-6 sm:p-8 lg:p-10 space-y-6">
                    <div>
                      <p className="text-xs md:text-sm uppercase tracking-wider text-text-tertiary mb-1">
                        {t("deviceKey.badge")}
                      </p>
                      <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-text-primary">
                        {t("deviceKey.title")}
                      </h2>
                    </div>
                    <div className="space-y-4 max-w-3xl">
                      <p className="text-text-muted leading-relaxed">{t("deviceKey.p1")}</p>
                      <p className="text-text-muted leading-relaxed">{t("deviceKey.p2")}</p>
                      <p className="text-text-muted leading-relaxed">{t("deviceKey.p3")}</p>
                      <p className="text-text-primary font-medium">{t("deviceKey.p4")}</p>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {devicePillars.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckIcon />
                          <div>
                            <h3 className="text-sm font-semibold text-text-primary mb-1">
                              {t(`deviceKey.${item}.title`)}
                            </h3>
                            <p className="text-xs text-text-muted leading-relaxed">
                              {t(`deviceKey.${item}.description`)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative pt-2">
                    <NoRegIdentityPlate />
                  </div>
                </div>
              </section>

              <section className="py-12 md:py-20">
                <PageFaq title={tFaq("title")} items={faqItems} />
              </section>
            </div>

            <aside className="hidden lg:block pt-12 md:pt-20">
              <div className="sticky top-28">
                <RelatedRail items={relatedItems} />
              </div>
            </aside>
          </div>
        </div>

        <div id="blog-cta-sentinel" aria-hidden="true" />
        <CTA />
        <MobileStickyCta />
      </main>
      <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation="no-registration-vpn" />
      <Footer />
    </>
  );
}
