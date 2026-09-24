import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { CTA } from "@/components/sections/cta";
import { PricingBackdrop } from "@/components/glyph/pricing-glyphs";
import { Link } from "@/i18n/navigation";
import { ArticleSchema, BreadcrumbSchema, FAQSchema } from "@/components/seo/json-ld";
import { PageFaq } from "@/components/no-registration/page-faq";
import { ArticleBody } from "@/components/how-it-works/article-body";
import { ArticleToc } from "@/components/how-it-works/article-toc";
import { ArticleFooter } from "@/components/how-it-works/article-footer";
import { HOW_IT_WORKS_LOCALES, isHowItWorksLocale } from "@/i18n/how-it-works-locales";
import {
  ARTICLE_SLUGS,
  extractH2s,
  getArticle,
  isArticleSlug,
  nextStepHref,
} from "@/lib/how-it-works";
import { SITE_URL } from "@/lib/facts";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { seoTitle } from "@/lib/seo-title";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const baseUrl = SITE_URL;

export function generateStaticParams() {
  return HOW_IT_WORKS_LOCALES.flatMap((locale) => ARTICLE_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isArticleSlug(slug) || !isHowItWorksLocale(locale)) return {};
  const { meta } = await getArticle(slug, locale);
  const path = `/how-it-works/${slug}`;
  return {
    title: seoTitle(meta.metaTitle),
    description: meta.metaDescription,
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: Object.fromEntries([
        ...HOW_IT_WORKS_LOCALES.map((loc) => [loc, `${baseUrl}/${loc}${path}`]),
        ["x-default", `${baseUrl}/en${path}`],
      ]),
    },
    openGraph: {
      title: meta.metaTitle,
      description: meta.metaDescription,
      url: `${baseUrl}/${locale}${path}`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "article",
      publishedTime: meta.datePublished,
      modifiedTime: meta.dateModified,
      images: [{ url: `${baseUrl}/images/og-banner.jpg`, width: 1200, height: 630, alt: meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.metaTitle,
      description: meta.metaDescription,
      images: [`${baseUrl}/images/og-banner.jpg`],
    },
  };
}

export default async function HowItWorksArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isArticleSlug(slug)) notFound();
  if (!isHowItWorksLocale(locale)) permanentRedirect(`/en/how-it-works/${slug}`);
  setRequestLocale(locale);

  const [t, { meta, body }] = await Promise.all([
    getTranslations("howItWorksHub"),
    getArticle(slug, locale),
  ]);
  const pageUrl = `${baseUrl}/${locale}/how-it-works/${slug}`;
  const headings = extractH2s(body);

  const nextHref = nextStepHref(slug);
  const next = nextHref === "/tools"
    ? { href: nextHref, kicker: t("nextTools"), title: t("toolsNextTitle"), desc: t("toolsNextDesc") }
    : await (async () => {
        const nextSlug = nextHref.split("/").pop() as (typeof ARTICLE_SLUGS)[number];
        const { meta: nm } = await getArticle(nextSlug, locale);
        return { href: nextHref, kicker: t("nextStep", { n: nm.step }), title: nm.navLabel, desc: nm.excerpt };
      })();

  const updated = new Date(meta.dateModified).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("breadcrumb"), url: `${baseUrl}/${locale}/how-it-works` },
          { name: meta.navLabel, url: pageUrl },
        ]}
      />
      <ArticleSchema
        headline={meta.title}
        description={meta.metaDescription}
        url={pageUrl}
        datePublished={meta.datePublished}
        dateModified={meta.dateModified}
      />
      <FAQSchema items={meta.faq} />
      <Navbar />
      <main className="overflow-x-clip">
        <section className="relative overflow-hidden bg-bg-secondary/30 pt-28 sm:pt-32 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
          <PricingBackdrop />
          <div className="relative mx-auto max-w-site">
            <div className="max-w-4xl">
              <nav aria-label="Breadcrumb" className="mb-5 font-mono text-xs text-text-tertiary">
                <Link href="/how-it-works" className="hover:text-accent-teal-light">
                  {t("breadcrumb")}
                </Link>
                <span className="mx-2" aria-hidden="true">/</span>
                <span className="text-text-muted">{meta.navLabel}</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span className="text-accent-teal-light">{t("stepLabel", { n: meta.step })}</span>
              </nav>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.12] text-text-primary">
                {meta.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-text-muted">{meta.excerpt}</p>
              <p className="mt-5 font-mono text-xs text-text-tertiary">
                {t("minRead", { n: meta.readingMinutes })} · {t("updated", { date: updated })}
              </p>
            </div>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-site py-12 md:py-16 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
            <article className="min-w-0 max-w-3xl">
              <ArticleToc headings={headings} label={t("onThisPage")} variant="inline" />
              <ArticleBody markdown={body} locale={locale} />
              <ArticleFooter sources={meta.sources} sourcesLabel={t("sources")} next={next} />
            </article>
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <ArticleToc headings={headings} label={t("onThisPage")} variant="rail" />
              </div>
            </aside>
          </div>
        </div>

        <section className="px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <PageFaq
            title={t("faqTitle")}
            idPrefix={`hiw-${slug}`}
            items={meta.faq.map((f, i) => ({ id: `q${i + 1}`, ...f }))}
          />
        </section>

        <div id="blog-cta-sentinel" aria-hidden="true" />
        <CTA />
        <MobileStickyCta sentinelId="blog-cta-sentinel" />
      </main>
      <Footer />
    </>
  );
}
