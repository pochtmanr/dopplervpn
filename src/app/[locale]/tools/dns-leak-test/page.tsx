import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ogLocaleMap } from "@/lib/og-locale-map";
import {
  BreadcrumbSchema,
  ArticleSchema,
  FAQSchema,
  WebPageSchema,
} from "@/components/seo/json-ld";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";
const SLUG = "tools/dns-leak-test";
const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;
const CHECKLIST_KEYS = ["item1", "item2", "item3", "item4"] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "toolsDnsLeak.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title,
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
      type: "article",
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

  const t = await getTranslations("toolsDnsLeak");
  const mt = await getTranslations({ locale, namespace: "toolsDnsLeak.metadata" });
  const pageUrl = `${baseUrl}/${locale}/${SLUG}`;

  const faqItems = FAQ_KEYS.map((key) => ({
    question: t(`faq.${key}.question`),
    answer: t(`faq.${key}.answer`),
  }));

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: "Tools", url: `${baseUrl}/${locale}/tools` },
          { name: t("hero.title"), url: pageUrl },
        ]}
      />
      <WebPageSchema url={pageUrl} name={mt("title")} description={mt("description")} />
      <ArticleSchema
        headline={mt("title")}
        description={mt("description")}
        url={pageUrl}
        datePublished="2026-05-27"
      />
      <FAQSchema items={faqItems} />
      <Navbar />
      <main className="overflow-x-hidden">
        <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -end-20 w-[24rem] h-[24rem] bg-accent-gold/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary mb-4">
              {t("hero.title")}
            </h1>
            <p className="text-text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>
        </section>

        {/* External tool block */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-3xl rounded-2xl bg-bg-secondary/60 backdrop-blur-sm border border-overlay/5 p-6 sm:p-8">
            <h2 className="font-display text-2xl text-text-primary mb-2">
              {t("widget.title")}
            </h2>
            <p className="text-text-secondary mb-6">{t("widget.description")}</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href={t("widget.primaryHref")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors"
              >
                {t("widget.primaryButton")}
              </a>
              <a
                href={t("widget.secondaryHref")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-accent-gold/15 text-accent-gold hover:bg-accent-gold/25 transition-colors"
              >
                {t("widget.secondaryButton")}
              </a>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">{t("widget.instructions")}</p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-3xl space-y-10 text-text-secondary leading-relaxed">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-3">
                {t("explainer.whatTitle")}
              </h2>
              <p>{t("explainer.whatBody")}</p>
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-3">
                {t("explainer.causesTitle")}
              </h2>
              <p>{t("explainer.causesBody")}</p>
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-3">
                {t("explainer.fixTitle")}
              </h2>
              <p>{t("explainer.fixBody")}</p>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-3xl rounded-2xl bg-accent-teal/5 border border-accent-teal/20 p-6 sm:p-8">
            <h2 className="font-display text-xl md:text-2xl text-text-primary mb-4">
              {t("checklist.title")}
            </h2>
            <ul className="space-y-3 text-text-secondary">
              {CHECKLIST_KEYS.map((key) => (
                <li key={key} className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-accent-teal shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span>{t(`checklist.items.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-8 text-center">
              FAQ
            </h2>
            <div className="space-y-4">
              {FAQ_KEYS.map((key) => (
                <details
                  key={key}
                  className="rounded-xl bg-bg-secondary/40 border border-overlay/5 p-5 group"
                >
                  <summary className="font-medium text-text-primary cursor-pointer list-none flex justify-between items-start gap-4">
                    <span>{t(`faq.${key}.question`)}</span>
                    <span className="text-accent-teal shrink-0 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="text-text-secondary mt-3 leading-relaxed">
                    {t(`faq.${key}.answer`)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-5xl grid sm:grid-cols-3 gap-4">
            <Link
              href="/tools/what-is-my-ip"
              className="rounded-2xl bg-bg-secondary/40 border border-overlay/5 p-6 hover:border-accent-teal/30 transition-colors"
            >
              <div className="font-medium text-text-primary mb-2">{t("related.ipTitle")}</div>
              <div className="text-sm text-text-muted">{t("related.ipDesc")}</div>
            </Link>
            <Link
              href="/tools/webrtc-leak-test"
              className="rounded-2xl bg-bg-secondary/40 border border-overlay/5 p-6 hover:border-accent-teal/30 transition-colors"
            >
              <div className="font-medium text-text-primary mb-2">{t("related.webrtcTitle")}</div>
              <div className="text-sm text-text-muted">{t("related.webrtcDesc")}</div>
            </Link>
            <Link
              href="/bypass-censorship"
              className="rounded-2xl bg-bg-secondary/40 border border-overlay/5 p-6 hover:border-accent-teal/30 transition-colors"
            >
              <div className="font-medium text-text-primary mb-2">{t("related.bypassTitle")}</div>
              <div className="text-sm text-text-muted">{t("related.bypassDesc")}</div>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
