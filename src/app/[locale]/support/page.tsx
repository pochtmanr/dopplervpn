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
import { Link } from "@/i18n/navigation";
import {
  HERO_SECTION,
  HERO_SUBTITLE,
  HERO_TITLE,
  HERO_TITLE_RAMP,
  splitHeadline,
} from "@/components/ui/card-recipes";
// Calm+ (design-lab/home-preview.tsx; CALM_PLUS_PREVIEW=0 turns it off).
import { calmPlusPreview, PlusPageShell } from "../design-lab/home-preview";
import { PlusFaqAccordion } from "../design-lab/plus/faq";
import { ArrowGlyph, PLUS_TITLE } from "../design-lab/plus-recipes";

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
      <main className="relative overflow-x-clip">
        {calmPlusPreview ? (
          <PlusPageShell>
            <section className={HERO_SECTION}>
              <div className="relative mx-auto max-w-site text-center">
                <h1 className={HERO_TITLE}>
                  {headlineLead}{headlineLead && " "}
                  <span className={HERO_TITLE_RAMP}>{headlineLast}</span>
                </h1>
                <p className={HERO_SUBTITLE}>{t("subtitle")}</p>
              </div>
            </section>

            <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
              <SupportContent plus />
              {/* Guides: one card of row links, as the FAQ card is one card of rows. */}
              <section id="guides" className="scroll-mt-28 mt-10">
                <h2 className={`mb-4 ${PLUS_TITLE}`}>{t("guides.title")}</h2>
                <ul className="overflow-hidden rounded-[22px] bg-(--c-card)">
                  {(
                    [
                      ["/help/account-id", "guides.accountId"],
                      ["/help/web-and-store", "guides.webAndStore"],
                      ["/help/restore-cancel-refund", "guides.restoreCancelRefund"],
                      ["/refund", "guides.refund"],
                    ] as const
                  ).map(([href, key], i) => (
                    <li key={href} className={i > 0 ? "border-t border-(--c-separator)" : undefined}>
                      <Link
                        href={href}
                        className="group flex items-center gap-3 px-5 py-4 text-[16px] font-bold text-(--c-text) transition-colors hover:bg-(--c-accent-tint) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--c-accent)"
                      >
                        <span className="flex-1">{t(key)}</span>
                        <ArrowGlyph className="h-4 w-4 text-(--c-tert) group-hover:text-(--c-accent)" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              {/* FAQ + troubleshooting: two Calm+ accordion cards. */}
              <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-6">
                <section id="faq" className="scroll-mt-28">
                  <h2 className={`mb-4 ${PLUS_TITLE}`}>{t("faq.title")}</h2>
                  <PlusFaqAccordion items={faqItems} />
                </section>
                <section id="troubleshooting" className="scroll-mt-28">
                  <h2 className={`mb-4 ${PLUS_TITLE}`}>{t("troubleshooting.title")}</h2>
                  <PlusFaqAccordion items={troubleshootItems} />
                </section>
              </div>
            </div>
          </PlusPageShell>
        ) : (
        <>
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
          <section id="guides" className="scroll-mt-28 max-w-3xl mx-auto mt-10">
            <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">{t("guides.title")}</h2>
            <ul className="space-y-3 text-text-muted">
              <li><Link href="/help/account-id" className="text-accent-teal underline underline-offset-4">{t("guides.accountId")}</Link></li>
              <li><Link href="/help/web-and-store" className="text-accent-teal underline underline-offset-4">{t("guides.webAndStore")}</Link></li>
              <li><Link href="/help/restore-cancel-refund" className="text-accent-teal underline underline-offset-4">{t("guides.restoreCancelRefund")}</Link></li>
              <li><Link href="/refund" className="text-accent-teal underline underline-offset-4">{t("guides.refund")}</Link></li>
            </ul>
          </section>
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
        </>
        )}
      </main>
      <Footer />
    </>
  );
}
