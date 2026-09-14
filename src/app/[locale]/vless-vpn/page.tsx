import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema, ArticleSchema, FAQSchema, WebPageSchema } from "@/components/seo/json-ld";
import { seoTitle } from "@/lib/seo-title";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { SeoPageFrame } from "@/components/seo/page-frame";
import { SeoHero } from "@/components/seo/seo-hero";
import { GlassCard, CheckIcon } from "@/components/seo/glass-card";
import { GlyphPlateCard } from "@/components/seo/glyph-plate-card";
import { SeoWidePlate } from "@/components/seo/wide-plate";
import { ProtocolTable } from "@/components/seo/protocol-table";
import { PageFaq } from "@/components/no-registration/page-faq";
import type { RelatedRailItem } from "@/components/no-registration/related-rail";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vlessVpn.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title: seoTitle(title),
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/vless-vpn`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/vless-vpn`]),
        ["x-default", `${baseUrl}/en/vless-vpn`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/vless-vpn`,
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

const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"] as const;
const comparisonProtocols = ["vless", "wireguard", "openvpn", "shadowsocks", "trojan"] as const;
const comparisonCols = ["dpiResistance", "speed", "latency", "batteryImpact", "setupComplexity", "censorshipBypass"] as const;
const howItWorksSteps = ["step1", "step2", "step3", "step4"] as const;
const whyNotCards = ["card1", "card2", "card3", "card4"] as const;
const performanceStats = ["stat1", "stat2", "stat3"] as const;
const dopplerFeatures = ["feature1", "feature2", "feature3", "feature4"] as const;

export default async function VlessVpnPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, mt, tHero, tFooter, tNoReg, tCrypto, tBypass] = await Promise.all([
    getTranslations("vlessVpn"),
    getTranslations({ locale, namespace: "vlessVpn.metadata" }),
    getTranslations("hero"),
    getTranslations("footer"),
    getTranslations("noRegistrationVpn"),
    getTranslations("payWithCrypto"),
    getTranslations("bypassCensorship"),
  ]);

  const faqItems = faqKeys.map((key) => ({
    id: key,
    question: t(`faq.${key}.question`),
    answer: t(`faq.${key}.answer`),
  }));

  const relatedItems: RelatedRailItem[] = [
    {
      href: "/no-registration-vpn",
      title: tFooter("noRegistration"),
      desc: tNoReg("hero.title"),
      icon: "noreg",
    },
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
          { name: t("hero.title"), url: `${baseUrl}/${locale}/vless-vpn` },
        ]}
      />
      <WebPageSchema
        url={`${baseUrl}/${locale}/vless-vpn`}
        name={mt("title")}
        description={mt("description")}
      />
      <ArticleSchema
        headline={mt("title")}
        description={mt("description")}
        url={`${baseUrl}/${locale}/vless-vpn`}
        datePublished="2026-03-11"
        dateModified="2026-09-14"
      />
      <FAQSchema items={faqItems.map(({ question, answer }) => ({ question, answer }))} />
      <Navbar />
      <SeoPageFrame
        trackingLocation="vless-vpn"
        relatedItems={relatedItems}
        hero={
          <SeoHero
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
            location="vless-vpn"
            secondaryLabel={tHero("getPro")}
            trustLabel={(key) => tHero(`trustBadges.${key}`)}
          />
        }
      >
        <section className="py-12 md:py-20">
          <SectionHeader title={t("whatIs.title")} subtitle={t("whatIs.intro")} />
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            <Reveal>
              <GlassCard>
                <h3 className="text-lg font-semibold text-text-primary mb-3">{t("whatIs.origin.title")}</h3>
                <div className="space-y-3">
                  <p className="text-sm text-text-muted leading-relaxed">{t("whatIs.origin.p1")}</p>
                  <p className="text-sm text-text-muted leading-relaxed">{t("whatIs.origin.p2")}</p>
                  <p className="text-sm text-text-muted leading-relaxed">{t("whatIs.origin.p3")}</p>
                </div>
              </GlassCard>
            </Reveal>
            <Reveal delay={50}>
              <GlassCard>
                <h3 className="text-lg font-semibold text-text-primary mb-3">{t("whatIs.difference.title")}</h3>
                <div className="space-y-3">
                  <p className="text-sm text-text-muted leading-relaxed">{t("whatIs.difference.p1")}</p>
                  <p className="text-text-primary font-medium leading-relaxed">{t("whatIs.difference.p2")}</p>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <SectionHeader title={t("howItWorks.title")} subtitle={t("howItWorks.subtitle")} />
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
            aria-label={`${t("howItWorks.step1.title")} → ${t("howItWorks.step2.title")} → ${t("howItWorks.step3.title")} → ${t("howItWorks.step4.title")}`}
          >
            {howItWorksSteps.map((step, i) => (
              <Reveal key={step} delay={i * 50}>
                <GlyphPlateCard
                  kind="vless"
                  index={i}
                  title={t(`howItWorks.${step}.title`)}
                  description={t(`howItWorks.${step}.description`)}
                />
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <p className="text-center mt-8 text-lg font-medium text-text-primary">
              {t("howItWorks.conclusion")}
              <span aria-hidden="true" className="terminal-cursor ms-1 text-accent-teal-light">
                ▌
              </span>
            </p>
          </Reveal>
        </section>

        <section className="py-12 md:py-20">
          <SectionHeader title={t("comparison.title")} subtitle={t("comparison.subtitle")} />
          <Reveal>
            <ProtocolTable
              highlightKey="vless"
              headers={[
                t("comparison.headers.protocol"),
                ...comparisonCols.map((col) => t(`comparison.headers.${col}`)),
              ]}
              rows={comparisonProtocols.map((row) => ({
                key: row,
                cells: [
                  t(`comparison.${row}.name`),
                  ...comparisonCols.map((col) => t(`comparison.${row}.${col}`)),
                ],
              }))}
            />
          </Reveal>
        </section>

        <section className="py-12 md:py-20">
          <SectionHeader title={t("whyNot.title")} subtitle={t("whyNot.subtitle")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {whyNotCards.map((card, i) => (
              <Reveal key={card} delay={i * 50}>
                <GlassCard>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{t(`whyNot.${card}.title`)}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{t(`whyNot.${card}.description`)}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <p className="text-center mt-8 text-lg font-medium text-text-primary">
              {t("whyNot.conclusion")}
              <span aria-hidden="true" className="terminal-cursor ms-1 text-accent-teal-light">
                ▌
              </span>
            </p>
          </Reveal>
        </section>

        <section className="py-12 md:py-20">
          <GlassCard padded={false} hoverOrb={false} className="h-auto">
            <div className="p-6 sm:p-8 lg:p-10 space-y-6">
              <div>
                <p className="text-xs md:text-sm uppercase tracking-wider text-text-tertiary mb-1">
                  {t("performance.badge")}
                </p>
                <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-text-primary">
                  {t("performance.title")}
                </h2>
              </div>
              <div className="space-y-3 max-w-3xl">
                <p className="text-text-muted leading-relaxed">{t("performance.p1")}</p>
                <p className="text-text-muted leading-relaxed">{t("performance.p2")}</p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {performanceStats.map((stat) => (
                  <li key={stat} className="flex items-start gap-3">
                    <CheckIcon />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{t(`performance.${stat}value`)}</p>
                      <p className="text-xs text-text-muted leading-relaxed">{t(`performance.${stat}label`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative pt-2">
              <SeoWidePlate kind="vless-speed" />
            </div>
          </GlassCard>
        </section>

        <section className="py-12 md:py-20">
          <SectionHeader title={t("inDoppler.title")} subtitle={t("inDoppler.subtitle")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {dopplerFeatures.map((feature, i) => (
              <Reveal key={feature} delay={i * 50}>
                <GlassCard>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {t(`inDoppler.${feature}.title`)}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {t(`inDoppler.${feature}.description`)}
                  </p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="py-12 md:py-20">
          <PageFaq title={t("faq.title")} items={faqItems} idPrefix="vless-faq" />
        </section>
      </SeoPageFrame>
    </>
  );
}
