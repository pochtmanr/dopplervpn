import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema, ArticleSchema, FAQSchema } from "@/components/seo/json-ld";
import { BtcIcon, EthIcon, UsdtIcon, UsdcIcon } from "@/components/icons/crypto";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "payWithCrypto.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/pay-with-crypto`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/pay-with-crypto`]),
        ["x-default", `${baseUrl}/en/pay-with-crypto`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/pay-with-crypto`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "article",
      images: [
        {
          url: `${baseUrl}/images/og-banner.jpg`,
          width: 1200,
          height: 630,
          alt: "Doppler VPN — Pay with Bitcoin & Crypto",
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

const faqKeys = ["q1", "q2", "q3", "q4", "q5"] as const;

function CoinCard({
  icon,
  name,
  ticker,
  network,
}: {
  icon: React.ReactNode;
  name: string;
  ticker: string;
  network: string;
}) {
  return (
    <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 flex flex-col items-center text-center">
      <div className="mb-3">{icon}</div>
      <div className="text-lg font-semibold text-text-primary">{name}</div>
      <div className="text-sm text-text-muted">{ticker}</div>
      <div className="mt-2 text-xs text-text-muted/80">{network}</div>
    </div>
  );
}

function WhyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{body}</p>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

export default async function PayWithCryptoPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("payWithCrypto");
  const mt = await getTranslations({ locale, namespace: "payWithCrypto.metadata" });

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("hero.title"), url: `${baseUrl}/${locale}/pay-with-crypto` },
        ]}
      />
      <ArticleSchema
        headline={mt("title")}
        description={mt("description")}
        url={`${baseUrl}/${locale}/pay-with-crypto`}
      />
      <FAQSchema
        items={faqKeys.map((key) => ({
          question: t(`faq.${key}Question`),
          answer: t(`faq.${key}Answer`),
        }))}
      />
      <Navbar />
      <main className="overflow-x-hidden">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -end-20 w-[24rem] h-[24rem] bg-accent-gold/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary mb-4">
              {t("hero.title")}
            </h1>
            <p className="text-text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/account"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors"
              >
                {t("hero.cta")}
                <ArrowIcon />
              </Link>

            </div>
          </div>
        </section>

        {/* ── Accepted coins ───────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
              {t("coins.heading")}
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto text-center mb-12 leading-relaxed">
              {t("coins.subheading")}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CoinCard
                icon={<BtcIcon size={48} />}
                name={t("coins.btcName")}
                ticker={t("coins.btcTicker")}
                network={t("coins.btcNetwork")}
              />
              <CoinCard
                icon={<EthIcon size={48} />}
                name={t("coins.ethName")}
                ticker={t("coins.ethTicker")}
                network={t("coins.ethNetwork")}
              />
              <CoinCard
                icon={<UsdtIcon size={48} />}
                name={t("coins.usdtName")}
                ticker={t("coins.usdtTicker")}
                network={t("coins.usdtNetwork")}
              />
              <CoinCard
                icon={<UsdcIcon size={48} />}
                name={t("coins.usdcName")}
                ticker={t("coins.usdcTicker")}
                network={t("coins.usdcNetwork")}
              />
            </div>
          </div>
        </section>

        {/* ── Why pay with crypto ──────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-12 text-center">
              {t("why.heading")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <WhyCard title={t("why.anonymousTitle")} body={t("why.anonymousBody")} />
              <WhyCard title={t("why.worksTitle")} body={t("why.worksBody")} />
              <WhyCard title={t("why.permanentTitle")} body={t("why.permanentBody")} />
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
              {t("howItWorks.heading")}
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto text-center mb-12 leading-relaxed">
              {t("howItWorks.subheading")}
            </p>
            <ol className="space-y-4">
              {(["step1", "step2", "step3"] as const).map((step, i) => (
                <li
                  key={step}
                  className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 flex items-start gap-4"
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-teal/15 border border-accent-teal/20 flex items-center justify-center text-accent-teal font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">
                      {t(`howItWorks.${step}Title`)}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t(`howItWorks.${step}Body`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10 text-center">
              <Link
                href="/account"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors"
              >
                {t("howItWorks.cta")}
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Works on all devices ─────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-accent-teal/20 bg-accent-teal/[0.03] p-8 md:p-10">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-4">
                {t("devices.heading")}
              </h2>
              <p className="text-text-muted leading-relaxed mb-6">
                {t("devices.body")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(["ios", "android", "mac", "windows"] as const).map((platform) => (
                  <div
                    key={platform}
                    className="rounded-xl border border-overlay/10 bg-bg-secondary/60 px-4 py-3 text-sm text-text-primary text-center"
                  >
                    {t(`devices.${platform}`)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-12 text-center">
              {t("faq.heading")}
            </h2>
            <div className="space-y-4">
              {faqKeys.map((key) => (
                <details
                  key={key}
                  className="group rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 open:bg-bg-secondary/70"
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-text-primary font-medium">
                    <span>{t(`faq.${key}Question`)}</span>
                    <svg className="w-5 h-5 text-text-muted shrink-0 transition-transform duration-200 group-open:rotate-45" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm text-text-muted leading-relaxed">
                    {t(`faq.${key}Answer`)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-text-muted text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
              {t("cta.subtitle")}
            </p>
            <Link
              href="/account"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors"
            >
              {t("cta.primary")}
              <ArrowIcon />
            </Link>
            <p className="mt-6 text-sm text-text-muted">{t("cta.secondary")}</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
