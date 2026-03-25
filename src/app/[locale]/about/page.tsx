import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

const baseUrl = "https://www.dopplervpn.org";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${baseUrl}/${locale}/about`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/about`]),
        ["x-default", `${baseUrl}/en/about`],
      ]),
    },
    openGraph: {
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
      url: `${baseUrl}/${locale}/about`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => ogLocaleMap[l] || l),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Doppler VPN",
    legalName: "Simnetiq Ltd",
    url: "https://www.dopplervpn.org",
    logo: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    description: t("meta.description"),
    foundingDate: "2025",
    sameAs: [],
  };

  const trustIcons: Record<string, React.ReactNode> = {
    noLogs: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    encryption: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    servers: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
      </svg>
    ),
    openProtocol: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  };

  const trustKeys = ["noLogs", "encryption", "servers", "openProtocol"] as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\//g, "<\\/") }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("hero.title"), url: `${baseUrl}/${locale}/about` },
        ]}
      />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <Section>
          {/* Hero / Mission */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-semibold text-text-primary mb-6">
              {t("hero.title")}
            </h1>
            <p className="text-lg text-text-muted leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Trust Signals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {trustKeys.map((key) => (
              <div
                key={key}
                className="bg-bg-secondary border border-overlay/10 rounded-2xl p-6 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal mx-auto mb-3">
                  {trustIcons[key]}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {t(`trust.${key}.title`)}
                </h3>
                <p className="text-sm text-text-muted">
                  {t(`trust.${key}.description`)}
                </p>
              </div>
            ))}
          </div>

          {/* Mission Section */}
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-4">
              {t("mission.title")}
            </h2>
            <p className="text-text-muted leading-relaxed">
              {t("mission.description")}
            </p>
          </div>

          {/* Company Info */}
          <div className="max-w-3xl mx-auto bg-bg-secondary border border-overlay/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              {t("company.title")}
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-2">
                <dt className="text-text-muted font-medium min-w-[120px]">
                  {t("company.nameLabel")}
                </dt>
                <dd className="text-text-primary">Simnetiq Ltd</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-text-muted font-medium min-w-[120px]">
                  {t("company.websiteLabel")}
                </dt>
                <dd className="text-text-primary">dopplervpn.org</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-text-muted font-medium min-w-[120px]">
                  {t("company.contactLabel")}
                </dt>
                <dd className="text-text-primary">support@simnetiq.store</dd>
              </div>
            </dl>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
