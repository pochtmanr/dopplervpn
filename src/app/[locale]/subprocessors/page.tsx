import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "subprocessors" });
  const title = t("title");
  const description = t("intro");

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/subprocessors`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/subprocessors`]),
        ["x-default", `${baseUrl}/en/subprocessors`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/subprocessors`,
      siteName: "Doppler VPN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

const SUBPROCESSORS = [
  {
    name: "Supabase Inc.",
    purpose: "Database & authentication",
    location: "United States",
    data: "Account IDs, device sessions, subscription data",
    privacy: "https://supabase.com/privacy",
  },
  {
    name: "Vercel Inc.",
    purpose: "Website hosting & analytics",
    location: "United States",
    data: "Anonymous usage analytics, IP addresses (anonymized)",
    privacy: "https://vercel.com/legal/privacy-policy",
  },
  {
    name: "Revolut Ltd",
    purpose: "Payment processing (web)",
    location: "United Kingdom",
    data: "Payment details, email, transaction records",
    privacy: "https://www.revolut.com/legal/privacy",
  },
  {
    name: "Apple Inc.",
    purpose: "iOS payment processing",
    location: "United States",
    data: "In-app purchase records",
    privacy: "https://www.apple.com/legal/privacy/",
  },
  {
    name: "Google LLC",
    purpose: "Android payment processing",
    location: "United States",
    data: "In-app purchase records",
    privacy: "https://policies.google.com/privacy",
  },
  {
    name: "RevenueCat Inc.",
    purpose: "Mobile subscription management",
    location: "United States",
    data: "Anonymous purchase identifiers",
    privacy: "https://www.revenuecat.com/privacy",
  },
  {
    name: "Hostinger International Ltd",
    purpose: "VPN server infrastructure & email (SMTP)",
    location: "Lithuania (HQ), servers various",
    data: "Connection metadata (no logs retained), email delivery",
    privacy: "https://www.hostinger.com/privacy-policy",
  },
] as const;

export default async function SubprocessorsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("subprocessors");

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Section className="min-h-screen">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-text-primary mb-4">
              {t("title")}
            </h1>
            <p className="text-text-muted mb-8">{t("lastUpdated")}</p>

            <p className="text-text-muted text-lg leading-relaxed mb-8">
              {t("intro")}
            </p>

            <div className="overflow-x-auto rounded-xl border border-overlay/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-overlay/10 bg-bg-secondary/50">
                    <th className="text-start p-4 font-semibold text-text-primary">{t("colName")}</th>
                    <th className="text-start p-4 font-semibold text-text-primary">{t("colPurpose")}</th>
                    <th className="text-start p-4 font-semibold text-text-primary">{t("colLocation")}</th>
                    <th className="text-start p-4 font-semibold text-text-primary">{t("colData")}</th>
                    <th className="text-start p-4 font-semibold text-text-primary">{t("colPrivacy")}</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBPROCESSORS.map((sp) => (
                    <tr key={sp.name} className="border-b border-overlay/5 hover:bg-overlay/5 transition-colors">
                      <td className="p-4 text-text-primary font-medium">{sp.name}</td>
                      <td className="p-4 text-text-muted">{sp.purpose}</td>
                      <td className="p-4 text-text-muted">{sp.location}</td>
                      <td className="p-4 text-text-muted">{sp.data}</td>
                      <td className="p-4">
                        <a
                          href={sp.privacy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-teal hover:text-accent-gold transition-colors"
                        >
                          {t("viewPolicy")}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-text-muted text-sm mt-6">
              {t("notice")}
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
