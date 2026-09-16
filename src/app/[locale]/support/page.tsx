import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SupportFaq } from "./faq";
import { SupportContent } from "./support-content";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { FAQSchema, BreadcrumbSchema, WebPageSchema } from "@/components/seo/json-ld";
import { seoTitle } from "@/lib/seo-title";
import { Reveal } from "@/components/ui/reveal";
import {
  HERO_SECTION,
  HERO_SUBTITLE,
  HERO_TITLE,
  HERO_TITLE_RAMP,
  splitHeadline,
} from "@/components/ui/card-recipes";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "support" });
  const title = t("title");
  const description = t("subtitle");
  return {
    title: seoTitle(title),
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/support`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/support`]),
        ["x-default", `${baseUrl}/en/support`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/support`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/images/og-banner.jpg`,
          width: 1200,
          height: 630,
          alt: "Doppler VPN — Fast & Secure",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/images/og-banner.jpg`],
    },
  };
}

/* ── Data ─────────────────────────────────────────────────────────── */

const FAQ_KEYS = ["what", "cost", "subscribe", "multiDevice", "accountId", "refund", "privacy", "platforms"] as const;
const TROUBLESHOOT_KEYS = ["wontConnect", "drops", "battery", "noSub"] as const;

/** A reading column's heading: display face over a hairline rule. */
const READ_TITLE =
  "pb-3 mb-1 border-b border-overlay/10 font-display text-2xl md:text-3xl font-semibold text-text-primary";

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function SupportPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support");

  const faqItems = FAQ_KEYS.map((key) => ({
    question: t(`faq.items.${key}.question`),
    answer: t(`faq.items.${key}.answer`),
  }));

  const troubleshootItems = TROUBLESHOOT_KEYS.map((key) => ({
    question: t(`troubleshooting.items.${key}.question`),
    answer: t(`troubleshooting.items.${key}.answer`),
  }));

  const allFaqItems = [...faqItems, ...troubleshootItems];

  const { lead: headlineLead, last: headlineLast } = splitHeadline(t("title"));

  return (
    <>
      <FAQSchema items={allFaqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("title"), url: `${baseUrl}/${locale}/support` },
        ]}
      />
      <WebPageSchema
        url={`${baseUrl}/${locale}/support`}
        name={t("title")}
        description={t("subtitle")}
      />
      <Navbar />
      <main className="relative overflow-x-hidden">
        {/* ── Hero ──────────────────────────────────────────────── */}
        {/* The downloads hero: static, last word on the clip-text ramp. */}
        <section className={HERO_SECTION}>
          <div className="relative mx-auto max-w-site text-center">
            <h1 className={HERO_TITLE}>
              {headlineLead}{headlineLead && " "}
              <span className={HERO_TITLE_RAMP}>{headlineLast}</span>
            </h1>

            <p className={HERO_SUBTITLE}>{t("subtitle")}</p>

          </div>
        </section>

        <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
          {/* ── Actions ───────────────────────────────────────────── */}
          <SupportContent />
        </div>

        {/* ── FAQ + Troubleshooting ─────────────────────────────── */}
        {/* Read, not act: a flat band with no card chrome, so nothing here
            looks like one of the controls above. */}
        <div className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary/30 border-y border-overlay/5">
          <div className="mx-auto max-w-site grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <Reveal>
              <section id="faq" className="scroll-mt-28">
                <h2 className={READ_TITLE}>{t("faq.title")}</h2>
                <SupportFaq items={faqItems} />
              </section>
            </Reveal>

            <Reveal delay={50}>
              <section id="troubleshooting" className="scroll-mt-28">
                <h2 className={READ_TITLE}>{t("troubleshooting.title")}</h2>
                <SupportFaq items={troubleshootItems} />
              </section>
            </Reveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
