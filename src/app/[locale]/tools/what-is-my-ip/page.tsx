import { getTranslations, setRequestLocale } from "next-intl/server";
import { permanentRedirect } from "next/navigation";
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
import { IpCheckerWidget } from "@/components/tools/ip-checker-widget";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";
const SLUG = "tools/what-is-my-ip";
const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;
const CHECKLIST_KEYS = ["item1", "item2", "item3", "item4"] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "toolsIpChecker.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/en/${SLUG}`,
      languages: {
        en: `${baseUrl}/en/${SLUG}`,
        "x-default": `${baseUrl}/en/${SLUG}`,
      },
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

// English-only until the tool namespaces are hand-translated. See sibling
// /tools/page.tsx for context.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  // English-only tool page; redirect other locales to the canonical /en URL.
  if (locale !== "en") permanentRedirect(`/en/${SLUG}`);
  setRequestLocale(locale);

  const t = await getTranslations("toolsIpChecker");
  const mt = await getTranslations({ locale, namespace: "toolsIpChecker.metadata" });
  const pageUrl = `${baseUrl}/${locale}/${SLUG}`;

  const faqItems = FAQ_KEYS.map((key) => ({
    question: t(`faq.${key}.question`),
    answer: t(`faq.${key}.answer`),
  }));

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("hero.title"),
    description: mt("description"),
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
    browserRequirements: "Requires JavaScript",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webAppSchema).replace(/<\//g, "<\\/"),
        }}
      />
      <Navbar />
      <main className="overflow-x-hidden">
        {/* Hero */}
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

        {/* Widget */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-3xl">
            <IpCheckerWidget />
          </div>
        </section>

        {/* Explainer */}
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
                {t("explainer.exposeTitle")}
              </h2>
              <p>{t("explainer.exposeBody")}</p>
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-3">
                {t("explainer.vpnTitle")}
              </h2>
              <p>{t("explainer.vpnBody")}</p>
            </div>
          </div>
        </section>

        {/* Checklist */}
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

        {/* FAQ */}
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

        {/* Related */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-5xl grid sm:grid-cols-3 gap-4">
            <Link
              href="/tools/webrtc-leak-test"
              className="rounded-2xl bg-bg-secondary/40 border border-overlay/5 p-6 hover:border-accent-teal/30 transition-colors"
            >
              <div className="font-medium text-text-primary mb-2">{t("related.webrtcTitle")}</div>
              <div className="text-sm text-text-muted">{t("related.webrtcDesc")}</div>
            </Link>
            <Link
              href="/tools/dns-leak-test"
              className="rounded-2xl bg-bg-secondary/40 border border-overlay/5 p-6 hover:border-accent-teal/30 transition-colors"
            >
              <div className="font-medium text-text-primary mb-2">{t("related.dnsTitle")}</div>
              <div className="text-sm text-text-muted">{t("related.dnsDesc")}</div>
            </Link>
            <Link
              href="/vless-vpn"
              className="rounded-2xl bg-bg-secondary/40 border border-overlay/5 p-6 hover:border-accent-teal/30 transition-colors"
            >
              <div className="font-medium text-text-primary mb-2">{t("related.vlessTitle")}</div>
              <div className="text-sm text-text-muted">{t("related.vlessDesc")}</div>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
