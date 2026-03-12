import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const baseUrl = "https://www.dopplervpn.org";

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

  const trustKeys = ["noLogs", "encryption", "servers", "openProtocol"] as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
                <div className="text-3xl mb-3">{t(`trust.${key}.icon`)}</div>
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
