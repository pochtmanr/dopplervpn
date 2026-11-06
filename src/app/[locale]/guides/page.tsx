import type { Metadata } from "next";
import Image from "next/image";
import { permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { BreadcrumbSchema, WebPageSchema } from "@/components/seo/json-ld";
import { GuideDownloadCard } from "@/components/guides/guide-download-card";
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
import { GUIDES_LOCALES, getAllGuideMeta, isGuidesLocale } from "@/lib/guides";
import { GUIDE_COVERS } from "@/config/platforms/apple";
import { SITE_URL } from "@/lib/facts";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { seoTitle } from "@/lib/seo-title";
// Calm+ only, like the guide pages.
import { PlusPageShell } from "../design-lab/home-preview";
import { ArrowGlyph, PLUS_BODY, PLUS_CARD_HOVER, PLUS_META, PLUS_TITLE_SM, PlusContainer } from "../design-lab/plus-recipes";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SLUG = "guides";

export function generateStaticParams() {
  return GUIDES_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isGuidesLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "guides.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title: seoTitle(title),
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/${SLUG}`,
      languages: Object.fromEntries([
        ...GUIDES_LOCALES.map((loc) => [loc, `${SITE_URL}/${loc}/${SLUG}`]),
        ["x-default", `${SITE_URL}/en/${SLUG}`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/${SLUG}`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "website",
      images: [{ url: `${SITE_URL}/images/og-banner.jpg`, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${SITE_URL}/images/og-banner.jpg`] },
  };
}

export default async function GuidesHubPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isGuidesLocale(locale)) permanentRedirect(`/en/${SLUG}`);
  setRequestLocale(locale);

  const [t, mt, guides] = await Promise.all([
    getTranslations("guides"),
    getTranslations({ locale, namespace: "guides.metadata" }),
    getAllGuideMeta(locale),
  ]);
  const pageUrl = `${SITE_URL}/${locale}/${SLUG}`;
  const [lead, ...rest] = guides;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Doppler VPN", url: `${SITE_URL}/${locale}` },
          { name: t("breadcrumb"), url: pageUrl },
        ]}
      />
      <WebPageSchema
        url={pageUrl}
        name={mt("title")}
        description={mt("description")}
        type="CollectionPage"
        inLanguage={ogLocaleMap[locale]?.replace("_", "-") ?? "en-US"}
      />
      <Navbar />
      <PlusPageShell>
        <main className="overflow-x-clip">
          <section className="px-4 pt-28 pb-6 sm:px-6 sm:pt-32 md:pb-10 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-display text-4xl font-bold leading-[1.12] text-(--c-text) sm:text-5xl">{t("hero.title")}</h1>
              <p className="mt-5 text-lg leading-relaxed text-(--c-muted) md:text-xl">{t("hero.subtitle")}</p>
            </div>
          </section>

          <PlusContainer className="py-8 md:py-12">
            {/* The first guide gets the wide card, the rest a row of three. */}
            <Link href={`/${SLUG}/${lead.slug}`} className={`${PLUS_CARD_HOVER} overflow-hidden !p-0 lg:!grid lg:grid-cols-2`}>
              <span className="relative block aspect-[3/2]" style={{ backgroundColor: GUIDE_COVERS[lead.slug].bg }}>
                <Image src={GUIDE_COVERS[lead.slug].src} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
              </span>
              <span className="flex flex-col justify-center p-6 sm:p-10">
                <span className={PLUS_META}>{t("minRead", { n: lead.meta.readingMinutes })}</span>
                <span className="mt-2 block font-display text-2xl font-bold leading-tight text-(--c-text) sm:text-3xl">{lead.meta.title}</span>
                <span className={`mt-3 block ${PLUS_BODY}`}>{lead.meta.excerpt}</span>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-(--c-accent)">
                  {t("readGuide")}
                  <ArrowGlyph className="h-3.5 w-3.5" />
                </span>
              </span>
            </Link>

            <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {rest.map(({ slug, meta }) => (
                <li key={slug}>
                  <Link href={`/${SLUG}/${slug}`} className={`${PLUS_CARD_HOVER} overflow-hidden !p-0`}>
                    <span className="relative block aspect-[3/2]" style={{ backgroundColor: GUIDE_COVERS[slug].bg }}>
                      <Image src={GUIDE_COVERS[slug].src} alt="" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
                    </span>
                    <span className="flex flex-1 flex-col p-5">
                      <span className={PLUS_META}>{t("minRead", { n: meta.readingMinutes })}</span>
                      <span className={`mt-1.5 block ${PLUS_TITLE_SM}`}>{meta.navLabel}</span>
                      <span className={`mt-2 block ${PLUS_BODY}`}>{meta.excerpt}</span>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-(--c-accent)">
                        {t("readGuide")}
                        <ArrowGlyph className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {(
                [
                  ["/how-it-works", "howItWorks"],
                  ["/vpn-protocols", "protocols"],
                  ["/vpn-for-ios", "apps"],
                ] as const
              ).map(([href, key]) => (
                <Link key={href} href={href} className={`${PLUS_CARD_HOVER} !flex-row items-center justify-between gap-3 !p-5`}>
                  <span>
                    <span className={`block ${PLUS_TITLE_SM}`}>{t(`more.${key}.title`)}</span>
                    <span className={`mt-1 block ${PLUS_META}`}>{t(`more.${key}.desc`)}</span>
                  </span>
                  <ArrowGlyph className="h-5 w-5 shrink-0 text-(--c-tert) group-hover:text-(--c-accent)" />
                </Link>
              ))}
            </div>
          </PlusContainer>

          <PlusContainer className="pt-6 pb-16 md:pb-24">
            <GuideDownloadCard
              title={t("download.title")}
              body={t("download.body")}
              cta={t("download.cta")}
              other={t("download.other")}
              imageAlt={t("download.imageAlt")}
            />
          </PlusContainer>
        </main>
        <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation="guides" plus />
      </PlusPageShell>
      <Footer />
    </>
  );
}
