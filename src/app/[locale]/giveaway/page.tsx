import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema } from "@/components/seo/json-ld";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

const X_URL = "https://x.com/simnetiq";
const INSTAGRAM_URL = "https://www.instagram.com/simnetiq/";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "giveaway" });
  const title = t("title");
  const description = t("subtitle");
  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/giveaway`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/giveaway`]),
        ["x-default", `${baseUrl}/en/giveaway`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/giveaway`,
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

/* ── Icons ────────────────────────────────────────────────────────── */

function XIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"/>
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function ExternalArrow({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function GiveawayPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("giveaway");

  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("title"), url: `${baseUrl}/${locale}/giveaway` },
        ]}
      />
      <Navbar />
      <main className="relative min-h-screen bg-bg-primary pt-28 pb-20">
        {/* Background blurs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -end-20 w-[32rem] h-[32rem] bg-accent-gold/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* ── Header ────────────────────────────────────────────── */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-accent-gold/10 text-accent-gold border border-accent-gold/20 mb-5">
              {t("stepsHeading")}
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-text-primary mb-4 tracking-tight">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* ── Steps ─────────────────────────────────────────────── */}
          <ol className="space-y-4 mb-10">
            {steps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5"
              >
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-accent-teal/15 text-accent-teal text-sm font-semibold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-1">
                    {step.title}
                  </h2>
                  <p className="text-sm text-text-muted leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* ── Social CTAs ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2.5 rounded-xl bg-accent-teal/10 border border-accent-teal/20 px-5 py-3.5 hover:bg-accent-teal/15 hover:border-accent-teal/40 transition-all text-accent-teal font-medium text-sm"
            >
              <XIcon className="w-4 h-4" />
              {t("followX")}
              <ExternalArrow className="w-3.5 h-3.5 opacity-70" />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2.5 rounded-xl bg-accent-teal/10 border border-accent-teal/20 px-5 py-3.5 hover:bg-accent-teal/15 hover:border-accent-teal/40 transition-all text-accent-teal font-medium text-sm"
            >
              <InstagramIcon className="w-4 h-4" />
              {t("followInstagram")}
              <ExternalArrow className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          {/* ── Account ID help ───────────────────────────────────── */}
          <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 mb-8">
            <h2 className="text-base font-semibold text-text-primary mb-2">
              {t("accountIdHelpTitle")}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed mb-3">
              {t("accountIdHelpBody")}
            </p>
            <Link
              href="/support"
              className="inline-flex items-center gap-1.5 text-sm text-accent-teal hover:text-accent-gold transition-colors"
            >
              {t("ctaSupport")}
              <svg className="w-3.5 h-3.5 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* ── Rules / fine print ───────────────────────────────── */}
          <div className="rounded-2xl border border-overlay/5 bg-bg-secondary/30 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted/80 mb-2">
              {t("rulesTitle")}
            </h2>
            <p className="text-xs text-text-muted/70 leading-relaxed">
              {t("rulesBody")}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
