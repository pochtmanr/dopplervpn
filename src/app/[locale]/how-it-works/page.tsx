import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { CTA } from "@/components/sections/cta";
import { PricingBackdrop } from "@/components/glyph/pricing-glyphs";
import { TrafficStepCard } from "@/components/sections/traffic-step-card";
import { Reveal } from "@/components/ui/reveal";
import { BreadcrumbSchema, WebPageSchema } from "@/components/seo/json-ld";
import { HOW_IT_WORKS_LOCALES, isHowItWorksLocale } from "@/i18n/how-it-works-locales";
import { getAllArticleMeta } from "@/lib/how-it-works";
import { JourneySchema } from "@/components/how-it-works/charts/registry";
import { SITE_URL } from "@/lib/facts";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { seoTitle } from "@/lib/seo-title";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = SITE_URL;
const SLUG = "how-it-works";

export function generateStaticParams() {
  return HOW_IT_WORKS_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isHowItWorksLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "howItWorksHub.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title: seoTitle(title),
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/${SLUG}`,
      languages: Object.fromEntries([
        ...HOW_IT_WORKS_LOCALES.map((loc) => [loc, `${baseUrl}/${loc}/${SLUG}`]),
        ["x-default", `${baseUrl}/en/${SLUG}`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/${SLUG}`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "website",
      images: [{ url: `${baseUrl}/images/og-banner.jpg`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/images/og-banner.jpg`],
    },
  };
}

export default async function HowItWorksHubPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isHowItWorksLocale(locale)) permanentRedirect(`/en/${SLUG}`);
  setRequestLocale(locale);

  const [t, mt, articles] = await Promise.all([
    getTranslations("howItWorksHub"),
    getTranslations({ locale, namespace: "howItWorksHub.metadata" }),
    getAllArticleMeta(locale),
  ]);
  const pageUrl = `${baseUrl}/${locale}/${SLUG}`;

  const steps = [
    ...articles.map(({ slug, meta }) => ({
      href: `/${SLUG}/${slug}`,
      title: meta.navLabel,
      description: meta.excerpt,
      cta: t("readGuide"),
    })),
    { href: "/tools", title: t("toolsCardTitle"), description: t("toolsCardDesc"), cta: t("runTests") },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Doppler VPN", url: `${baseUrl}/${locale}` },
          { name: t("breadcrumb"), url: pageUrl },
        ]}
      />
      <WebPageSchema url={pageUrl} name={mt("title")} description={mt("description")} type="CollectionPage" inLanguage={ogLocaleMap[locale]?.replace("_", "-") ?? "en-US"} />
      <Navbar />
      <main className="overflow-x-clip">
        <section className="relative overflow-hidden bg-bg-secondary/30 pt-28 sm:pt-32 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
          <PricingBackdrop />
          <div className="relative mx-auto max-w-3xl py-6 md:py-10 text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.12] text-text-primary">
              {t("hero.title")}
            </h1>
            <p className="mt-6 text-base sm:text-lg md:text-xl leading-relaxed text-text-muted">{t("hero.subtitle")}</p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="mx-auto max-w-site">
            <h2 className="font-display section-title text-center mb-10 md:mb-12">{t("stepsTitle")}</h2>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((s, i) => (
                <li key={s.href}>
                  <Reveal delay={i * 50} className="h-full">
                    <TrafficStepCard index={i} title={s.title} description={s.description} href={s.href} linkLabel={s.cta} />
                  </Reveal>
                </li>
              ))}
            </ol>

            <div className="mx-auto mt-14 max-w-3xl space-y-5 text-lg leading-relaxed text-text-muted">
              <p>{t("intro.p1")}</p>
              <p>{t("intro.p2")}</p>
            </div>
            <div className="mx-auto max-w-5xl">
              <JourneySchema locale={locale} />
            </div>
          </div>
        </section>

        <div id="blog-cta-sentinel" aria-hidden="true" />
        <CTA />
        <MobileStickyCta sentinelId="blog-cta-sentinel" />
      </main>
      <Footer />
    </>
  );
}
