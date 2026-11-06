import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { ArticleSchema, BreadcrumbSchema, FAQSchema } from "@/components/seo/json-ld";
import { ArticleBody } from "@/components/how-it-works/article-body";
import { ArticleToc } from "@/components/how-it-works/article-toc";
import { ArticleFooter } from "@/components/how-it-works/article-footer";
import { GuideDownloadCard } from "@/components/guides/guide-download-card";
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
import { extractH2s } from "@/lib/how-it-works";
import { GUIDES_LOCALES, GUIDE_SLUGS, getGuide, isGuideSlug, isGuidesLocale, nextGuideSlug } from "@/lib/guides";
import { GUIDE_COVERS } from "@/config/platforms/apple";
import { SITE_URL } from "@/lib/facts";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { seoTitle } from "@/lib/seo-title";
// Calm+ only: /guides was written after Calm+ went live and has no Glyph Terminal branch.
import { PlusPageShell } from "../../design-lab/home-preview";
import { PlusFaqAccordion } from "../../design-lab/plus/faq";
import { PLUS_META, PLUS_TITLE } from "../../design-lab/plus-recipes";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return GUIDES_LOCALES.flatMap((locale) => GUIDE_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isGuideSlug(slug) || !isGuidesLocale(locale)) return {};
  const { meta } = await getGuide(slug, locale);
  const path = `/guides/${slug}`;
  return {
    title: seoTitle(meta.metaTitle),
    description: meta.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/${locale}${path}`,
      languages: Object.fromEntries([
        ...GUIDES_LOCALES.map((loc) => [loc, `${SITE_URL}/${loc}${path}`]),
        ["x-default", `${SITE_URL}/en${path}`],
      ]),
    },
    openGraph: {
      title: meta.metaTitle,
      description: meta.metaDescription,
      url: `${SITE_URL}/${locale}${path}`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "article",
      publishedTime: meta.datePublished,
      modifiedTime: meta.dateModified,
      images: [{ url: `${SITE_URL}/images/og-banner.jpg`, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.metaTitle,
      description: meta.metaDescription,
      images: [`${SITE_URL}/images/og-banner.jpg`],
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isGuideSlug(slug)) notFound();
  if (!isGuidesLocale(locale)) permanentRedirect(`/en/guides/${slug}`);
  setRequestLocale(locale);

  const [t, { meta, body }] = await Promise.all([getTranslations("guides"), getGuide(slug, locale)]);
  const pageUrl = `${SITE_URL}/${locale}/guides/${slug}`;
  const headings = extractH2s(body);
  const cover = GUIDE_COVERS[slug];

  const nextSlug = nextGuideSlug(slug);
  const next = nextSlug
    ? await (async () => {
        const { meta: nm } = await getGuide(nextSlug, locale);
        return { href: `/guides/${nextSlug}`, kicker: t("nextGuide"), title: nm.navLabel, desc: nm.excerpt };
      })()
    : { href: "/guides", kicker: t("backKicker"), title: t("backTitle"), desc: t("backDesc") };

  const updated = new Date(meta.dateModified).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Doppler VPN", url: `${SITE_URL}/${locale}` },
          { name: t("breadcrumb"), url: `${SITE_URL}/${locale}/guides` },
          { name: meta.navLabel, url: pageUrl },
        ]}
      />
      <ArticleSchema
        headline={meta.title}
        description={meta.metaDescription}
        url={pageUrl}
        datePublished={meta.datePublished}
        dateModified={meta.dateModified}
        inLanguage={ogLocaleMap[locale]?.replace("_", "-") ?? "en-US"}
      />
      <FAQSchema items={meta.faq} />
      <Navbar />
      <PlusPageShell>
        <main className="overflow-x-clip">
          <section className="px-4 pt-28 pb-6 sm:px-6 sm:pt-32 md:pb-10 lg:px-8">
            <div className="mx-auto grid max-w-site grid-cols-1 items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
              <div>
                <nav aria-label="Breadcrumb" className={`mb-5 ${PLUS_META}`}>
                  <Link href="/guides" className="hover:text-(--c-accent)">
                    {t("breadcrumb")}
                  </Link>
                  <span className="mx-2" aria-hidden="true">/</span>
                  <span className="text-(--c-muted)">{meta.navLabel}</span>
                </nav>
                <h1 className="font-display text-4xl font-bold leading-[1.12] text-(--c-text) sm:text-5xl">{meta.title}</h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-(--c-muted)">{meta.excerpt}</p>
                <p className={`mt-5 ${PLUS_META}`}>
                  {t("minRead", { n: meta.readingMinutes })} · {t("updated", { date: updated })}
                </p>
              </div>
              <div className="relative aspect-[3/2] overflow-hidden rounded-[28px]" style={{ backgroundColor: cover.bg }}>
                <Image src={cover.src} alt="" fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
              </div>
            </div>
          </section>

          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-site py-10 md:py-14 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
              <article className="min-w-0 max-w-3xl">
                <ArticleToc headings={headings} label={t("onThisPage")} variant="inline" plus />
                <ArticleBody markdown={body} locale={locale} plus />
                <ArticleFooter sources={meta.sources} sourcesLabel={t("sources")} next={next} plus />
              </article>
              <aside className="hidden lg:block">
                <div className="sticky top-28">
                  <ArticleToc headings={headings} label={t("onThisPage")} variant="rail" plus />
                </div>
              </aside>
            </div>
          </div>

          <section className="px-4 pb-10 sm:px-6 md:pb-16 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className={`mb-8 text-center ${PLUS_TITLE} md:text-3xl`}>{t("faqTitle")}</h2>
              <PlusFaqAccordion items={meta.faq} />
            </div>
          </section>

          <section className="px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
            <div className="mx-auto max-w-site">
              <GuideDownloadCard
                title={t("download.title")}
                body={t("download.body")}
                cta={t("download.cta")}
                other={t("download.other")}
                imageAlt={t("download.imageAlt")}
              />
            </div>
          </section>
        </main>
        <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation="guides" plus />
      </PlusPageShell>
      <Footer />
    </>
  );
}
