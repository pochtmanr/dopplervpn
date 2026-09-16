import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema, ArticleSchema, FAQSchema, WebPageSchema } from "@/components/seo/json-ld";
import { BtcIcon, EthIcon, UsdtIcon, UsdcIcon } from "@/components/icons/crypto";
import { seoTitle } from "@/lib/seo-title";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { SeoPageFrame } from "@/components/seo/page-frame";
import { SeoHero } from "@/components/seo/seo-hero";
import { GlassCard, CheckIcon } from "@/components/seo/glass-card";
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
  const t = await getTranslations({ locale, namespace: "bypassCensorship.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title: seoTitle(title),
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/bypass-censorship`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/bypass-censorship`]),
        ["x-default", `${baseUrl}/en/bypass-censorship`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/bypass-censorship`,
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
const protocolRows = ["openvpn", "wireguard", "vless"] as const;
const comparisonCols = ["detectability", "speed", "censorship", "fingerprint"] as const;
const detectionMethods = ["method1", "method2", "method3", "method4"] as const;
const defenseKeys = ["signatures", "fingerprinting", "entropy", "probing", "blacklisting"] as const;
const prepareSteps = ["step1", "step2", "step3", "step4", "step5"] as const;
const futureStages = ["stage1", "stage2", "stage3"] as const;
const blockedStats = ["stat1", "stat2", "stat3"] as const;

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default async function BypassCensorshipPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, mt, tHero, tFooter, tNoReg, tCrypto] = await Promise.all([
    getTranslations("bypassCensorship"),
    getTranslations({ locale, namespace: "bypassCensorship.metadata" }),
    getTranslations("hero"),
    getTranslations("footer"),
    getTranslations("noRegistrationVpn"),
    getTranslations("payWithCrypto"),
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
      href: "/vless-vpn",
      title: tFooter("vlessVpn"),
      desc: t("related.vlessDesc"),
      icon: "vless",
    },
    {
      href: "/pay-with-crypto",
      title: tFooter("payWithCrypto"),
      desc: tCrypto("why.anonymousTitle"),
      icon: "crypto",
    },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("hero.title"), url: `${baseUrl}/${locale}/bypass-censorship` },
        ]}
      />
      <WebPageSchema
        url={`${baseUrl}/${locale}/bypass-censorship`}
        name={mt("title")}
        description={mt("description")}
      />
      <ArticleSchema
        headline={mt("title")}
        description={mt("description")}
        url={`${baseUrl}/${locale}/bypass-censorship`}
        datePublished="2026-03-11"
        dateModified="2026-09-14"
      />
      <FAQSchema items={faqItems.map(({ question, answer }) => ({ question, answer }))} />
      <Navbar />
      <SeoPageFrame
        trackingLocation="bypass-censorship"
        relatedItems={relatedItems}
        hero={
          <SeoHero
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
            location="bypass-censorship"
            secondaryLabel={tHero("getPro")}
            trustLabel={(key) => tHero(`trustBadges.${key}`)}
          />
        }
      >
        <section className="py-12 md:py-20">
          <SectionHeader title={t("detection.title")} subtitle={t("detection.intro")} />
          <Reveal>
            <GlassCard className="mb-4">
              <h3 className="text-lg font-semibold text-text-primary mb-3">{t("detection.tspu.title")}</h3>
              <div className="space-y-3">
                <p className="text-sm text-text-muted leading-relaxed">{t("detection.tspu.p1")}</p>
                <p className="text-sm text-text-muted leading-relaxed">{t("detection.tspu.p2")}</p>
                <p className="text-sm text-text-muted leading-relaxed">{t("detection.tspu.p3")}</p>
              </div>
            </GlassCard>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {detectionMethods.map((method, i) => (
              <Reveal key={method} delay={i * 50}>
                <GlassCard>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {t(`detection.${method}.title`)}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {t(`detection.${method}.description`)}
                  </p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <p className="text-center mt-8 text-lg font-medium text-text-primary">
              {t("detection.conclusion")}
              <span aria-hidden="true" className="terminal-cursor ms-1 text-accent-teal-light">
                ▌
              </span>
            </p>
          </Reveal>
        </section>

        <section className="py-12 md:py-20">
          <SectionHeader title={t("defeats.title")} subtitle={t("defeats.subtitle")} />
          <div className="space-y-3">
            {defenseKeys.map((key, i) => (
              <Reveal key={key} delay={i * 40}>
                <GlassCard>
                  <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                    <div className="md:w-52 shrink-0">
                      <p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
                        {t(`defeats.${key}.attack`)}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-2">
                        <CheckIcon />
                        <h3 className="text-sm font-semibold text-accent-teal">{t(`defeats.${key}.defense`)}</h3>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed">
                        {t(`defeats.${key}.description`)}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="py-12 md:py-20">
          <GlassCard padded={false} hoverOrb={false} className="h-auto">
            <div className="p-6 sm:p-8 lg:p-10 space-y-6">
              <div>
                <p className="text-xs md:text-sm uppercase tracking-wider text-text-tertiary mb-1">
                  {t("blocked.badge")}
                </p>
                <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-text-primary">
                  {t("blocked.title")}
                </h2>
              </div>
              <div className="space-y-3 max-w-3xl">
                <p className="text-text-muted leading-relaxed">{t("blocked.p1")}</p>
                <p className="text-text-muted leading-relaxed">{t("blocked.p2")}</p>
                <p className="text-text-primary font-medium">{t("blocked.p3")}</p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {blockedStats.map((stat) => (
                  <li key={stat} className="flex items-start gap-3">
                    <CheckIcon />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{t(`blocked.${stat}value`)}</p>
                      <p className="text-xs text-text-muted leading-relaxed">{t(`blocked.${stat}label`)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative pt-2">
              <SeoWidePlate kind="bypass-status" />
            </div>
          </GlassCard>
        </section>

        <section className="py-12 md:py-20">
          <GlassCard>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
              <div className="md:col-span-3">
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-3">
                  {t("cryptoPayment.title")}
                </h2>
                <p className="text-sm text-text-muted leading-relaxed mb-6">{t("cryptoPayment.body")}</p>
                <Link
                  href="/pay-with-crypto"
                  className="cta-key inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white"
                >
                  {t("cryptoPayment.cta")}
                  <ArrowIcon />
                </Link>
              </div>
              <ul className="md:col-span-2 grid grid-cols-2 gap-3">
                {(
                  [
                    { icon: <BtcIcon size={28} />, label: t("cryptoPayment.btc") },
                    { icon: <EthIcon size={28} />, label: t("cryptoPayment.eth") },
                    { icon: <UsdtIcon size={28} />, label: t("cryptoPayment.usdt") },
                    { icon: <UsdcIcon size={28} />, label: t("cryptoPayment.usdc") },
                  ] as const
                ).map((coin) => (
                  <li
                    key={coin.label}
                    className="flex items-center gap-2 rounded-xl border border-overlay/10 bg-bg-secondary/60 px-3 py-2 text-sm text-text-primary"
                  >
                    {coin.icon}
                    <span>{coin.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </section>

        <section className="py-12 md:py-20">
          <SectionHeader title={t("future.title")} subtitle={t("future.intro")} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
            {futureStages.map((stage, i) => (
              <Reveal key={stage} delay={i * 50}>
                <GlassCard>
                  <p className="text-xs uppercase tracking-wider text-text-tertiary mb-2">
                    {t(`future.${stage}.label`)}
                  </p>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{t(`future.${stage}.title`)}</h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-3">
                    {t(`future.${stage}.description`)}
                  </p>
                  <p className="text-xs text-text-tertiary">{t(`future.${stage}.status`)}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
          <Reveal delay={150}>
            <GlassCard>
              <h3 className="text-lg font-semibold text-text-primary mb-3">{t("future.reality.title")}</h3>
              <div className="space-y-3">
                <p className="text-sm text-text-muted leading-relaxed">{t("future.reality.p1")}</p>
                <p className="text-sm text-text-muted leading-relaxed">{t("future.reality.p2")}</p>
                <p className="text-sm text-text-muted leading-relaxed">{t("future.reality.p3")}</p>
                <p className="text-text-primary font-medium leading-relaxed">{t("future.reality.p4")}</p>
              </div>
            </GlassCard>
          </Reveal>
        </section>

        <section className="py-12 md:py-20">
          <SectionHeader title={t("prepare.title")} subtitle={t("prepare.subtitle")} />
          <ol className="space-y-3">
            {prepareSteps.map((step, i) => (
              <Reveal key={step} delay={i * 40}>
                <li>
                  <GlassCard>
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg border border-accent-teal/20 bg-bg-secondary/80 text-accent-teal text-sm font-semibold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-1">
                          {t(`prepare.${step}.title`)}
                        </h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                          {t(`prepare.${step}.description`)}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className="py-12 md:py-20">
          <SectionHeader title={t("comparison.title")} />
          <Reveal>
            <ProtocolTable
              highlightKey="vless"
              headers={[
                t("comparison.headers.protocol"),
                ...comparisonCols.map((col) => t(`comparison.headers.${col}`)),
              ]}
              rows={protocolRows.map((row) => ({
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
          <PageFaq title={t("faq.title")} items={faqItems} idPrefix="bypass-faq" />
        </section>
      </SeoPageFrame>
    </>
  );
}
