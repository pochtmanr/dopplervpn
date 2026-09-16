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
import { IpCheckerWidget } from "@/components/tools/ip-checker-widget";
import { seoTitle } from "@/lib/seo-title";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { CTA } from "@/components/sections/cta";
import { Reveal } from "@/components/ui/reveal";
import {
  CARD,
  CARD_HAIRLINE,
  CARD_SURFACE,
  CARD_TITLE,
  HERO_SUBTITLE,
  ROW_CARD,
  ROW_TEXT,
  ROW_TILE,
  ROW_TITLE,
} from "@/components/ui/card-recipes";
import {
  AddressIcon,
  DnsIcon,
  EyeIcon,
  ShieldIcon,
  WebrtcIcon,
} from "@/components/tools/tool-icons";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";
const SLUG = "tools/what-is-my-ip";
const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;
const CHECKLIST_KEYS = ["item1", "item2", "item3", "item4"] as const;
const EXPLAINERS = [
  { key: "what", Icon: AddressIcon },
  { key: "expose", Icon: EyeIcon },
  { key: "vpn", Icon: ShieldIcon },
] as const;
const RELATED = [
  { href: "/tools/webrtc-leak-test", key: "webrtc", Icon: WebrtcIcon },
  { href: "/tools/dns-leak-test", key: "dns", Icon: DnsIcon },
  { href: "/vless-vpn", key: "vless", Icon: ShieldIcon },
] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "toolsIpChecker.metadata" });
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

  const t = await getTranslations("toolsIpChecker");
  const mt = await getTranslations({ locale, namespace: "toolsIpChecker.metadata" });
  const hubT = await getTranslations("toolsHub");
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
    inLanguage: locale,
    applicationCategory: "UtilitiesApplication",
    browserRequirements: "Requires JavaScript",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    featureList: [
      t("widget.yourIp"),
      t("widget.ipv4"),
      t("widget.ipv6"),
      t("widget.location"),
      t("widget.isp"),
      t("widget.asn"),
      t("widget.timezone"),
    ],
    provider: { "@type": "Organization", name: "Doppler VPN", url: baseUrl },
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
          { name: hubT("title"), url: `${baseUrl}/${locale}/tools` },
          { name: t("hero.title"), url: pageUrl },
        ]}
      />
      <WebPageSchema url={pageUrl} name={mt("title")} description={mt("description")} />
      <ArticleSchema
        headline={mt("title")}
        description={mt("description")}
        url={pageUrl}
        datePublished="2026-05-27"
        dateModified="2026-09-16"
      />
      <FAQSchema items={faqItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webAppSchema).replace(/<\//g, "<\\/"),
        }}
      />
      <Navbar />
      <main className="overflow-x-clip">
        {/* Hero — static, no backdrop, no entrance (DESIGN.md §4, §5) */}
        <section className="pt-28 sm:pt-32 pb-8 md:pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-site text-center">
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="inline-flex items-center gap-2 text-xs text-text-tertiary">
                <li>
                  <Link href="/tools" className="hover:text-accent-teal transition-colors">
                    {t("hero.breadcrumbTools")}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-text-muted">
                  {t("hero.title")}
                </li>
              </ol>
            </nav>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[clamp(2.5rem,3.6vw,3.75rem)] font-semibold text-text-primary leading-[1.12]">
              {t("hero.title")}
            </h1>
            <p className={HERO_SUBTITLE}>{t("hero.subtitle")}</p>
          </div>
        </section>

        {/* Widget */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
          <div className="mx-auto max-w-site">
            <IpCheckerWidget />
          </div>
        </section>

        {/* Explainer */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
          <div className="mx-auto max-w-site grid md:grid-cols-3 gap-3 md:gap-4">
            {EXPLAINERS.map(({ key, Icon }, i) => (
              <Reveal key={key} delay={i * 50} className="h-full">
                <article className={`${CARD} p-6`}>
                  <div className={CARD_HAIRLINE} />
                  <div className={`${ROW_TILE} mb-4`}>
                    <Icon />
                  </div>
                  <h2 className={CARD_TITLE}>{t(`explainer.${key}Title`)}</h2>
                  <p className="mt-3 text-sm md:text-base text-text-muted leading-relaxed">
                    {t(`explainer.${key}Body`)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Checklist */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
          <Reveal className="mx-auto max-w-site">
            <div className={`${CARD_SURFACE} p-6 sm:p-8 lg:p-10`}>
              <div className={CARD_HAIRLINE} />
              <h2 className={CARD_TITLE}>{t("checklist.title")}</h2>
              <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                {CHECKLIST_KEYS.map((key, i) => (
                  <li key={key} className="flex gap-3 text-text-muted leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 font-mono text-xs text-text-tertiary tabular-nums"
                    >
                      0{i + 1}
                    </span>
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
          </Reveal>
        </section>

        {/* FAQ — native <details>, so every answer is in the server HTML */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
          <div className="mx-auto max-w-site lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
            <h2 className="section-title text-center lg:text-start mb-8 md:mb-12 lg:mb-0 lg:sticky lg:top-28 lg:self-start">
              {t("faqTitle")}
            </h2>
            <div className={`${CARD_SURFACE} divide-y divide-overlay/5`}>
              <div className={CARD_HAIRLINE} />
              {FAQ_KEYS.map((key) => (
                <details key={key} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-start font-medium text-text-primary hover:bg-bg-secondary/40 transition-colors [&::-webkit-details-marker]:hidden">
                    <h3 className="text-base sm:text-lg leading-snug">{t(`faq.${key}.question`)}</h3>
                    <span
                      aria-hidden="true"
                      className="flex w-7 h-7 shrink-0 items-center justify-center rounded-lg border border-accent-teal/20 font-mono text-accent-teal transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-5 sm:px-6 pb-5 -mt-1 text-text-muted leading-relaxed">
                    {t(`faq.${key}.answer`)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
          <div className="mx-auto max-w-site grid md:grid-cols-3 gap-3 md:gap-4">
            {RELATED.map(({ href, key, Icon }) => (
              <Link key={key} href={href} className={`${ROW_CARD} gap-4 px-4 md:px-5`}>
                <span className={ROW_TILE}>
                  <Icon />
                </span>
                <span className="min-w-0 flex-1 py-3 text-start">
                  <span className={`block ${ROW_TITLE}`}>{t(`related.${key}Title`)}</span>
                  <span className={`block ${ROW_TEXT}`}>{t(`related.${key}Desc`)}</span>
                </span>
                <svg
                  className="w-4 h-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
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
