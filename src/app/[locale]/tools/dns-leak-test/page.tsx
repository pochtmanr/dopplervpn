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
import { DnsIcon, IpIcon, ShieldIcon, WebrtcIcon } from "@/components/tools/tool-icons";
import { DnsConnectionPanel } from "@/components/tools/dns-connection-panel";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";
const SLUG = "tools/dns-leak-test";
const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;
const CHECKLIST_KEYS = ["item1", "item2", "item3", "item4"] as const;
const STEP_KEYS = ["step1", "step2", "step3"] as const;
const EXPLAINERS = [
  { key: "what", Icon: DnsIcon },
  { key: "causes", Icon: WarningIcon },
  { key: "fix", Icon: ShieldIcon },
] as const;
const RELATED = [
  { href: "/tools/what-is-my-ip", key: "ip", Icon: IpIcon },
  { href: "/tools/webrtc-leak-test", key: "webrtc", Icon: WebrtcIcon },
  { href: "/bypass-censorship", key: "bypass", Icon: UnlockIcon },
] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "toolsDnsLeak.metadata" });
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

  const t = await getTranslations("toolsDnsLeak");
  const mt = await getTranslations({ locale, namespace: "toolsDnsLeak.metadata" });
  const hubT = await getTranslations("toolsHub");
  // Shared labels: the IP page already carries these in every locale.
  const ipT = await getTranslations("toolsIpChecker");
  const pageUrl = `${baseUrl}/${locale}/${SLUG}`;

  const faqItems = FAQ_KEYS.map((key) => ({
    question: t(`faq.${key}.question`),
    answer: t(`faq.${key}.answer`),
  }));

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t("widget.title"),
    description: t("widget.description"),
    inLanguage: locale,
    tool: [
      { "@type": "HowToTool", name: "dnsleaktest.com" },
      { "@type": "HowToTool", name: "browserleaks.com/dns" },
    ],
    step: STEP_KEYS.map((key, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: t(`widget.steps.${key}.title`),
      text: t(`widget.steps.${key}.body`),
      url: `${pageUrl}#${key}`,
    })),
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
          __html: JSON.stringify(howToSchema).replace(/<\//g, "<\\/"),
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
                    {ipT("hero.breadcrumbTools")}
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

        {/* Tool — a guide to an external test, not a probe of our own: a real DNS
            leak test needs a wildcard zone and a logging authoritative nameserver,
            which this site does not run. The panel shows the visitor's public IP
            and network so the test's resolver list has something to compare with. */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
          <div className="mx-auto max-w-site">
            <div className={CARD_SURFACE}>
              <div className={CARD_HAIRLINE} />
              <div className="grid lg:grid-cols-5">
                <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10 flex flex-col">
                  <h2 className="font-display text-2xl md:text-3xl font-semibold leading-tight text-text-primary">
                    {t("widget.title")}
                  </h2>
                  <p className="mt-3 text-sm md:text-base text-text-muted leading-relaxed max-w-2xl">
                    {t("widget.description")}
                  </p>

                  <ol className="mt-6 divide-y divide-dashed divide-overlay/10 border-y border-dashed border-overlay/10">
                    {STEP_KEYS.map((key, i) => (
                      <li key={key} id={key} className="flex gap-4 py-4 scroll-mt-28">
                        <span
                          aria-hidden="true"
                          className="flex w-8 h-8 shrink-0 items-center justify-center rounded-lg border border-accent-teal/25 bg-accent-teal/10 font-mono text-xs text-accent-teal-light tabular-nums"
                        >
                          0{i + 1}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-display text-base md:text-lg font-semibold leading-snug text-text-primary">
                            {t(`widget.steps.${key}.title`)}
                          </h3>
                          <p className="mt-1 text-sm md:text-base text-text-muted leading-relaxed">
                            {t(`widget.steps.${key}.body`)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
                    <a
                      href={t("widget.primaryHref")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cta-key inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white"
                    >
                      {t("widget.primaryButton")}
                      <ExternalIcon />
                    </a>
                    <a
                      href={t("widget.secondaryHref")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cta-flat inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium"
                    >
                      {t("widget.secondaryButton")}
                      <ExternalIcon />
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-2 flex flex-col border-t lg:border-t-0 lg:border-s border-overlay/5 bg-bg-secondary/30 p-6 sm:p-8 lg:p-10">
                  <DnsConnectionPanel
                    labels={{
                      title: t("widget.panel.title"),
                      yourIp: ipT("widget.yourIp"),
                      isp: ipT("widget.isp"),
                      asn: ipT("widget.asn"),
                      location: ipT("widget.location"),
                      unknown: ipT("widget.unknown"),
                      hint: t("widget.panel.hint"),
                      error: t("widget.panel.error"),
                      refresh: ipT("widget.refresh"),
                      refreshing: ipT("widget.refreshing"),
                    }}
                  />
                </div>
              </div>
            </div>
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
              {ipT("faqTitle")}
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

const iconProps = {
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.75,
  stroke: "currentColor",
  "aria-hidden": true,
} as const;

/** Explainer: what causes a leak — a warning triangle. */
function WarningIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} {...iconProps}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  );
}

/** Related: bypass censorship — an open padlock. */
function UnlockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} {...iconProps}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  );
}

/** Opens in a new tab — the arrow leaves the box, mirrored in RTL. */
function ExternalIcon() {
  return (
    <svg className="w-4 h-4 shrink-0 rtl:-scale-x-100" {...iconProps} strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}
