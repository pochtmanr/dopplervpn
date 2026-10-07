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
import { RatingDots } from "@/components/vpn-protocols/rating-dots";
import { VPN_PROTOCOLS_LOCALES, isVpnProtocolsLocale } from "@/i18n/vpn-protocols-locales";
import { extractH2s } from "@/lib/how-it-works";
import {
  ARTICLE_SLUGS,
  getProtocolArticle,
  isProtocolArticleSlug,
  nextProtocolSlug,
} from "@/lib/vpn-protocols";
import { SITE_URL } from "@/lib/facts";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { seoTitle } from "@/lib/seo-title";
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
// Calm+ (design-lab/home-preview.tsx; CALM_PLUS_PREVIEW=0 turns it off).
import { calmPlusPreview, PlusPageShell, PreviewCta } from "../../design-lab/home-preview";
import { PlusFaqAccordion } from "../../design-lab/plus/faq";
import { PLUS_CARD, PLUS_LABEL, PLUS_META, PLUS_TITLE } from "../../design-lab/plus-recipes";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const baseUrl = SITE_URL;

export function generateStaticParams() {
  return VPN_PROTOCOLS_LOCALES.flatMap((locale) => ARTICLE_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isProtocolArticleSlug(slug) || !isVpnProtocolsLocale(locale)) return {};
  const { meta } = await getProtocolArticle(slug, locale);
  const path = `/vpn-protocols/${slug}`;
  return {
    title: seoTitle(meta.metaTitle),
    description: meta.metaDescription,
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: Object.fromEntries([
        ...VPN_PROTOCOLS_LOCALES.map((loc) => [loc, `${baseUrl}/${loc}${path}`]),
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

export default async function VpnProtocolArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isProtocolArticleSlug(slug)) notFound();
  if (!isVpnProtocolsLocale(locale)) permanentRedirect(`/en/vpn-protocols/${slug}`);
  setRequestLocale(locale);

  const [t, { meta, body }] = await Promise.all([
    getTranslations("vpnProtocols"),
    getProtocolArticle(slug, locale),
  ]);
  const pageUrl = `${baseUrl}/${locale}/vpn-protocols/${slug}`;
  const headings = extractH2s(body);
  const rating = (n: number) => t(`ratings.${n === 3 ? "high" : n === 2 ? "medium" : "low"}`);

  const nextSlug = nextProtocolSlug(slug);
  const next = nextSlug
    ? await (async () => {
        const { meta: nm } = await getProtocolArticle(nextSlug, locale);
        return { href: `/vpn-protocols/${nextSlug}`, kicker: t("nextGuide"), title: nm.navLabel, desc: nm.excerpt };
      })()
    : { href: "/vpn-protocols", kicker: t("backKicker"), title: t("backTitle"), desc: t("backDesc") };

  const updated = new Date(meta.dateModified).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Doppler VPN", url: `${baseUrl}/${locale}` },
          { name: t("breadcrumb"), url: `${baseUrl}/${locale}/vpn-protocols` },
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
      {calmPlusPreview ? (
        <PlusPageShell>
          <main className="overflow-x-clip">
            <section className="px-4 pt-28 pb-6 sm:px-6 sm:pt-32 md:pb-10 lg:px-8">
              <div className="mx-auto max-w-site">
                <div className="max-w-4xl">
                  <nav aria-label="Breadcrumb" className={`mb-5 ${PLUS_META}`}>
                    <Link href="/vpn-protocols" className="hover:text-(--c-accent)">
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

                {meta.card && (
                  <dl className={`${PLUS_CARD} mt-10 !grid max-w-4xl grid-cols-2 gap-x-6 gap-y-5 text-[15px] sm:grid-cols-3`}>
                    {([
                      ["year", meta.card.year],
                      ["transport", meta.card.transport],
                      ["looksLike", meta.card.looksLike],
                      ["builtIn", meta.card.builtIn],
                    ] as const).map(([k, v]) => (
                      <div key={k}>
                        <dt className={PLUS_LABEL}>{t(`columns.${k}`)}</dt>
                        <dd className="mt-1 font-medium text-(--c-text)">{v}</dd>
                      </div>
                    ))}
                    <div>
                      <dt className={PLUS_LABEL}>{t("columns.resistance")}</dt>
                      <dd className="mt-1"><RatingDots value={meta.card.censorshipResistance} label={rating(meta.card.censorshipResistance)} plus /></dd>
                    </div>
                    <div>
                      <dt className={PLUS_LABEL}>{t("columns.speed")}</dt>
                      <dd className="mt-1"><RatingDots value={meta.card.speed} label={rating(meta.card.speed)} plus /></dd>
                    </div>
                  </dl>
                )}
              </div>
            </section>

            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-site py-10 md:py-14 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
                <article className="min-w-0 max-w-3xl">
                  <ArticleToc headings={headings} label={t("onThisPage")} variant="inline" plus />
                  <ArticleBody markdown={body} locale={locale} plus />

                  {meta.apps && meta.apps.length > 0 && (
                    <section aria-labelledby="apps" className="mt-14">
                      <h2 id="apps" className="mb-2 font-display text-2xl font-bold text-(--c-text)">
                        {t("appsTitle", { protocol: meta.navLabel })}
                      </h2>
                      <p className={`mb-5 ${PLUS_META}`}>{t("appsNote")}</p>
                      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {meta.apps.map((app) => (
                          <li key={app.url} className="rounded-2xl bg-(--c-card) p-4">
                            <a
                              href={app.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-(--c-text) underline-offset-4 hover:text-(--c-accent) hover:underline"
                            >
                              {app.name}
                            </a>
                            <span className={`mt-1 block ${PLUS_META}`}>{app.platforms}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

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

            <div id="blog-cta-sentinel" aria-hidden="true" />
            <PreviewCta />
          </main>
        </PlusPageShell>
      ) : (
      <main className="overflow-x-clip">
        <section className="relative overflow-hidden bg-bg-secondary/30 pt-28 sm:pt-32 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
          <PricingBackdrop />
          <div className="relative mx-auto max-w-site">
            <div className="max-w-4xl">
              <nav aria-label="Breadcrumb" className="mb-5 font-mono text-xs text-text-tertiary">
                <Link href="/vpn-protocols" className="hover:text-accent-teal-light">
                  {t("breadcrumb")}
                </Link>
                <span className="mx-2" aria-hidden="true">/</span>
                <span className="text-text-muted">{meta.navLabel}</span>
              </nav>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.12] text-text-primary">
                {meta.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-text-muted">{meta.excerpt}</p>
              <p className="mt-5 font-mono text-xs text-text-tertiary">
                {t("minRead", { n: meta.readingMinutes })} · {t("updated", { date: updated })}
              </p>
            </div>

            {meta.card && (
              <dl className="mt-10 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-overlay/10 bg-bg-primary/60 p-5 text-sm sm:grid-cols-3">
                {([
                  ["year", meta.card.year],
                  ["transport", meta.card.transport],
                  ["looksLike", meta.card.looksLike],
                  ["builtIn", meta.card.builtIn],
                ] as const).map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono text-xs text-text-tertiary">{t(`columns.${k}`)}</dt>
                    <dd className="mt-1 text-text-primary">{v}</dd>
                  </div>
                ))}
                <div>
                  <dt className="font-mono text-xs text-text-tertiary">{t("columns.resistance")}</dt>
                  <dd className="mt-1"><RatingDots value={meta.card.censorshipResistance} label={rating(meta.card.censorshipResistance)} /></dd>
                </div>
                <div>
                  <dt className="font-mono text-xs text-text-tertiary">{t("columns.speed")}</dt>
                  <dd className="mt-1"><RatingDots value={meta.card.speed} label={rating(meta.card.speed)} /></dd>
                </div>
              </dl>
            )}
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-site py-12 md:py-16 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
            <article className="min-w-0 max-w-3xl">
              <ArticleToc headings={headings} label={t("onThisPage")} variant="inline" />
              <ArticleBody markdown={body} locale={locale} />

              {meta.apps && meta.apps.length > 0 && (
                <section aria-labelledby="apps" className="mt-14">
                  <h2 id="apps" className="font-display text-2xl font-semibold text-text-primary mb-2">
                    {t("appsTitle", { protocol: meta.navLabel })}
                  </h2>
                  <p className="mb-5 text-sm text-text-muted">{t("appsNote")}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {meta.apps.map((app) => (
                      <li key={app.url} className="rounded-xl border border-overlay/10 bg-bg-secondary/40 p-4">
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-text-primary hover:text-accent-teal-light underline-offset-4 hover:underline"
                        >
                          {app.name}
                        </a>
                        <span className="mt-1 block text-xs text-text-muted">{app.platforms}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

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
            idPrefix={`vp-${slug}`}
            items={meta.faq.map((f, i) => ({ id: `q${i + 1}`, ...f }))}
          />
        </section>

        <div id="blog-cta-sentinel" aria-hidden="true" />
        <CTA />
        <MobileStickyCta sentinelId="blog-cta-sentinel" />
      </main>
      )}
      {calmPlusPreview && (
        <PlusPageShell>
          <BlogStickyBar sentinelId="blog-cta-sentinel" plus />
        </PlusPageShell>
      )}
      <Footer />
    </>
  );
}
