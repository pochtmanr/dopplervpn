import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { CTA } from "@/components/sections/cta";
import { PricingBackdrop } from "@/components/glyph/pricing-glyphs";
import { Link } from "@/i18n/navigation";
import { BreadcrumbSchema, WebPageSchema } from "@/components/seo/json-ld";
import { CARD, CARD_HAIRLINE } from "@/components/ui/card-recipes";
import { RatingDots } from "@/components/vpn-protocols/rating-dots";
import { VPN_PROTOCOLS_LOCALES, isVpnProtocolsLocale } from "@/i18n/vpn-protocols-locales";
import { getAllProtocolMeta, getProtocolArticle } from "@/lib/vpn-protocols";
import { SITE_URL } from "@/lib/facts";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { seoTitle } from "@/lib/seo-title";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = SITE_URL;
const SLUG = "vpn-protocols";

export function generateStaticParams() {
  return VPN_PROTOCOLS_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isVpnProtocolsLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "vpnProtocols.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title: seoTitle(title),
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/${SLUG}`,
      languages: Object.fromEntries([
        ...VPN_PROTOCOLS_LOCALES.map((loc) => [loc, `${baseUrl}/${loc}/${SLUG}`]),
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

export default async function VpnProtocolsHubPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isVpnProtocolsLocale(locale)) permanentRedirect(`/en/${SLUG}`);
  setRequestLocale(locale);

  const [t, mt, protocols, why] = await Promise.all([
    getTranslations("vpnProtocols"),
    getTranslations({ locale, namespace: "vpnProtocols.metadata" }),
    getAllProtocolMeta(locale),
    getProtocolArticle("why-vless", locale),
  ]);
  const pageUrl = `${baseUrl}/${locale}/${SLUG}`;
  const rating = (n: number) => t(`ratings.${n === 3 ? "high" : n === 2 ? "medium" : "low"}`);

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

        <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="mx-auto max-w-site">
            <h2 className="font-display section-title text-center mb-3">{t("tableTitle")}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-text-muted">{t("ratingNote")}</p>
            <div className="overflow-x-auto rounded-2xl border border-overlay/10">
              <table className="w-full min-w-[760px] text-sm text-start">
                <thead className="bg-bg-secondary/60 text-text-primary">
                  <tr>
                    {(["protocol", "transport", "looksLike", "resistance", "speed", "builtIn"] as const).map((c) => (
                      <th key={c} scope="col" className="px-4 py-3 font-semibold text-start whitespace-nowrap">
                        {t(`columns.${c}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {protocols.map(({ slug, meta }) => {
                    const card = meta.card!;
                    return (
                      <tr key={slug} className="border-t border-overlay/8">
                        <th scope="row" className="px-4 py-3 text-start font-semibold whitespace-nowrap">
                          <Link href={`/${SLUG}/${slug}`} className="text-accent-teal-light hover:underline underline-offset-4">
                            {meta.navLabel}
                          </Link>
                          <span className="ms-2 font-mono text-xs font-normal text-text-tertiary">{card.year}</span>
                        </th>
                        <td className="px-4 py-3 text-text-muted whitespace-nowrap">{card.transport}</td>
                        <td className="px-4 py-3 text-text-muted">{card.looksLike}</td>
                        <td className="px-4 py-3"><RatingDots value={card.censorshipResistance} label={rating(card.censorshipResistance)} /></td>
                        <td className="px-4 py-3"><RatingDots value={card.speed} label={rating(card.speed)} /></td>
                        <td className="px-4 py-3 text-text-muted">{card.builtIn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="mx-auto max-w-site">
            <h2 className="font-display section-title text-center mb-10">{t("guidesTitle")}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {protocols.map(({ slug, meta }) => (
                <li key={slug}>
                  <Link href={`/${SLUG}/${slug}`} className={`${CARD} block h-full p-6`}>
                    <span className={CARD_HAIRLINE} />
                    <span className="block font-mono text-xs text-accent-teal-light">{meta.card?.transport}</span>
                    <span className="mt-2 block font-display text-xl font-semibold text-text-primary">{meta.navLabel}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-text-muted">{meta.excerpt}</span>
                    <span className="mt-4 block text-sm font-medium text-accent-teal">{t("readGuide")} →</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link href={`/${SLUG}/why-vless`} className={`${CARD} mt-8 block p-6 sm:p-8`}>
              <span className={CARD_HAIRLINE} />
              <span className="block font-mono text-xs tracking-wide text-accent-teal-light">{t("whyKicker")}</span>
              <span className="mt-2 block font-display text-2xl font-semibold text-text-primary">{why.meta.title}</span>
              <span className="mt-2 block max-w-3xl text-sm leading-relaxed text-text-muted">{why.meta.excerpt}</span>
            </Link>

            <div className="mx-auto mt-14 max-w-3xl space-y-5 text-lg leading-relaxed text-text-muted">
              <p>{t("intro.p1")}</p>
              <p>{t("intro.p2")}</p>
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
