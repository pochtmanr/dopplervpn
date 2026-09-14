import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema, WebPageSchema } from "@/components/seo/json-ld";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { seoTitle } from "@/lib/seo-title";
import { PricingBackdrop } from "@/components/glyph/pricing-glyphs";
import { Reveal } from "@/components/ui/reveal";
import { CTA } from "@/components/sections/cta";
import { GlyphPlateCard } from "@/components/seo/glyph-plate-card";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";
const SLUG = "tools";

const TOOLS = [
  { href: "/tools/what-is-my-ip", key: "ipChecker" },
  { href: "/tools/webrtc-leak-test", key: "webrtcLeak" },
  { href: "/tools/dns-leak-test", key: "dnsLeak" },
] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "toolsHub.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title: seoTitle(title),
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/${SLUG}`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/${SLUG}`]),
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("toolsHub");
  const mt = await getTranslations({ locale, namespace: "toolsHub.metadata" });
  const pageUrl = `${baseUrl}/${locale}/${SLUG}`;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("title"), url: pageUrl },
        ]}
      />
      <WebPageSchema
        url={pageUrl}
        name={mt("title")}
        description={mt("description")}
        type="CollectionPage"
      />
      <Navbar />
      <main className="overflow-x-clip">
        <section className="relative overflow-hidden bg-bg-secondary/30 pt-28 sm:pt-32 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8">
          <PricingBackdrop />
          <div className="relative mx-auto max-w-site py-6 md:py-10">
            <div className="mx-auto text-center space-y-6">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[clamp(2.5rem,3.6vw,3.75rem)] font-semibold text-text-primary leading-[1.12]">
                {t("title")}
              </h1>
              <p className="text-text-muted text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="mx-auto max-w-site grid sm:grid-cols-3 gap-3 md:gap-4">
            {TOOLS.map(({ href, key }, i) => (
              <Reveal key={key} delay={i * 50} className="h-full">
                <Link href={href} className="block h-full">
                  <GlyphPlateCard
                    kind="tools"
                    index={i}
                    title={t(`tools.${key}.title`)}
                    description={t(`tools.${key}.description`)}
                    cta={t(`tools.${key}.cta`)}
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <CTA />
        <MobileStickyCta />
      </main>
      <Footer />
    </>
  );
}
