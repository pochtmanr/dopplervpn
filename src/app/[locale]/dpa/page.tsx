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
  const t = await getTranslations({ locale, namespace: "dpa" });
  const title = t("title");
  const description = t("intro");

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/dpa`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/dpa`]),
        ["x-default", `${baseUrl}/en/dpa`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/dpa`,
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

const sectionKeys = [
  "scope",
  "purpose",
  "roles",
  "dataTypes",
  "security",
  "subprocessors",
  "rights",
  "breach",
  "retention",
  "transfers",
  "audit",
  "termination",
] as const;

export default async function DpaPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dpa");

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Section className="min-h-screen">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-text-primary mb-4">
              {t("title")}
            </h1>
            <p className="text-text-muted mb-8">{t("lastUpdated")}</p>

            <div className="prose prose-invert max-w-none">
              <p className="text-text-muted text-lg leading-relaxed mb-8">
                {t("intro")}
              </p>

              {sectionKeys.map((key) => (
                <div key={key} className="mb-8">
                  <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">
                    {t(`sections.${key}.title`)}
                  </h2>
                  <p className="text-text-muted leading-relaxed whitespace-pre-line">
                    {t(`sections.${key}.content`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
