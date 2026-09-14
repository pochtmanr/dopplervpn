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
import { GlyphPlateCard } from "@/components/seo/glyph-plate-card";
import { SeoWidePlate } from "@/components/seo/wide-plate";
import { PageFaq } from "@/components/no-registration/page-faq";
import type { RelatedRailItem } from "@/components/no-registration/related-rail";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "payWithCrypto.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title: seoTitle(title),
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/pay-with-crypto`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/pay-with-crypto`]),
        ["x-default", `${baseUrl}/en/pay-with-crypto`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/pay-with-crypto`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "article",
      images: [
        {
          url: `${baseUrl}/images/og-banner.jpg`,
          width: 1200,
          height: 630,
          alt: "Doppler VPN — Pay with Bitcoin & Crypto",
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

const faqKeys = ["q1", "q2", "q3", "q4", "q5"] as const;
const whyKeys = ["anonymous", "works", "permanent"] as const;
const howSteps = ["step1", "step2", "step3"] as const;
const platforms = ["ios", "android", "mac", "windows"] as const;

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function BuyButton({ href, label }: { href: "/account"; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 px-5 py-3 w-full sm:w-auto text-center bg-accent-teal text-white hover:bg-accent-teal/90 rounded-lg transition-colors text-sm font-medium pulse-glow-once"
    >
      {label}
      <ArrowIcon />
    </Link>
  );
}

export default async function PayWithCryptoPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, mt, tHero, tFooter, tNoReg, tBypass] = await Promise.all([
    getTranslations("payWithCrypto"),
    getTranslations({ locale, namespace: "payWithCrypto.metadata" }),
    getTranslations("hero"),
    getTranslations("footer"),
    getTranslations("noRegistrationVpn"),
    getTranslations("bypassCensorship"),
  ]);

  const faqItems = faqKeys.map((key) => ({
    id: key,
    question: t(`faq.${key}Question`),
    answer: t(`faq.${key}Answer`),
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
      desc: tNoReg("related.vlessDesc"),
      icon: "vless",
    },
    {
      href: "/bypass-censorship",
      title: tFooter("bypassCensorship"),
      desc: tBypass("hero.title"),
      icon: "bypass",
    },
  ];

  const coins = [
    { icon: <BtcIcon size={40} />, name: t("coins.btcName"), ticker: t("coins.btcTicker"), network: t("coins.btcNetwork") },
    { icon: <EthIcon size={40} />, name: t("coins.ethName"), ticker: t("coins.ethTicker"), network: t("coins.ethNetwork") },
    { icon: <UsdtIcon size={40} />, name: t("coins.usdtName"), ticker: t("coins.usdtTicker"), network: t("coins.usdtNetwork") },
    { icon: <UsdcIcon size={40} />, name: t("coins.usdcName"), ticker: t("coins.usdcTicker"), network: t("coins.usdcNetwork") },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("hero.title"), url: `${baseUrl}/${locale}/pay-with-crypto` },
        ]}
      />
      <WebPageSchema
        url={`${baseUrl}/${locale}/pay-with-crypto`}
        name={mt("title")}
        description={mt("description")}
      />
      <ArticleSchema
        headline={mt("title")}
        description={mt("description")}
        url={`${baseUrl}/${locale}/pay-with-crypto`}
        datePublished="2026-04-20"
        dateModified="2026-09-14"
      />
      <FAQSchema items={faqItems.map(({ question, answer }) => ({ question, answer }))} />
      <Navbar />
      <SeoPageFrame
        trackingLocation="pay-with-crypto"
        relatedItems={relatedItems}
        hero={
          <SeoHero
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
            location="pay-with-crypto"
            secondaryLabel={tHero("getPro")}
            trustLabel={(key) => tHero(`trustBadges.${key}`)}
            primary={<BuyButton href="/account" label={t("hero.cta")} />}
          />
        }
      >
        <section className="py-12 md:py-20">
          <SectionHeader title={t("coins.heading")} subtitle={t("coins.subheading")} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {coins.map((coin, i) => (
              <Reveal key={coin.ticker} delay={i * 40}>
                <GlassCard className="text-center">
                  <div className="flex justify-center mb-3">{coin.icon}</div>
                  <h3 className="text-lg font-semibold text-text-primary">{coin.name}</h3>
                  <p className="text-sm text-text-muted">{coin.ticker}</p>
                  <p className="mt-2 text-xs text-text-tertiary">{coin.network}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="py-12 md:py-20">
          <SectionHeader title={t("why.heading")} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {whyKeys.map((key, i) => (
              <Reveal key={key} delay={i * 50}>
                <GlassCard>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{t(`why.${key}Title`)}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{t(`why.${key}Body`)}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="py-12 md:py-20">
          <SectionHeader title={t("howItWorks.heading")} subtitle={t("howItWorks.subheading")} />
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
            aria-label={`${t("howItWorks.step1Title")} → ${t("howItWorks.step2Title")} → ${t("howItWorks.step3Title")}`}
          >
            {howSteps.map((step, i) => (
              <Reveal key={step} delay={i * 50}>
                <GlyphPlateCard
                  kind="crypto"
                  index={i}
                  title={t(`howItWorks.${step}Title`)}
                  description={t(`howItWorks.${step}Body`)}
                />
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mt-10 flex justify-center">
              <BuyButton href="/account" label={t("howItWorks.cta")} />
            </div>
          </Reveal>
        </section>

        <section className="py-12 md:py-20">
          <GlassCard padded={false} hoverOrb={false} className="h-auto">
            <div className="p-6 sm:p-8 lg:p-10 space-y-6">
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-text-primary">
                {t("devices.heading")}
              </h2>
              <p className="text-text-muted leading-relaxed max-w-3xl">{t("devices.body")}</p>
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platforms.map((platform) => (
                  <li key={platform} className="flex items-center gap-2 rounded-xl border border-overlay/10 bg-bg-secondary/40 px-4 py-3">
                    <CheckIcon />
                    <span className="text-sm text-text-primary">{t(`devices.${platform}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative pt-2">
              <SeoWidePlate kind="crypto-id" />
            </div>
          </GlassCard>
        </section>

        <section className="py-12 md:py-20">
          <PageFaq title={t("faq.heading")} items={faqItems} idPrefix="crypto-faq" />
        </section>
      </SeoPageFrame>
    </>
  );
}
