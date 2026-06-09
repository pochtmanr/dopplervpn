import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { permanentRedirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";
import { ObfuscatedEmail } from "@/components/ui/obfuscated-email";
import { BreadcrumbSchema, WebPageSchema } from "@/components/seo/json-ld";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { SECURITY_LOCALES, isSecurityLocale } from "@/i18n/security-locales";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";
const SLUG = "security";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "security.metadata" });
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/${SLUG}`,
      languages: Object.fromEntries([
        ...SECURITY_LOCALES.map((loc) => [loc, `${baseUrl}/${loc}/${SLUG}`]),
        ["x-default", `${baseUrl}/en/${SLUG}`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/${SLUG}`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "website",
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

// Hand-translated into the core censorship-market locales; the rest
// consolidate on /en/security (see src/i18n/security-locales.ts).
export function generateStaticParams() {
  return SECURITY_LOCALES.map((locale) => ({ locale }));
}

const NEVER_KEYS = ["never1", "never2", "never3", "never4", "never5", "never6"] as const;
const ONLY_KEYS = ["only1", "only2", "only3"] as const;
const RETENTION_KEYS = ["retention1", "retention2", "retention3", "retention4"] as const;

export default async function SecurityPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isSecurityLocale(locale)) permanentRedirect(`/en/${SLUG}`);
  setRequestLocale(locale);

  const t = await getTranslations("security");
  const mt = await getTranslations({ locale, namespace: "security.metadata" });
  const pageUrl = `${baseUrl}/${locale}/${SLUG}`;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("title"), url: pageUrl },
        ]}
      />
      <WebPageSchema url={pageUrl} name={mt("title")} description={mt("description")} />
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

              <div className="mb-8">
                <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">
                  {t("sections.protocol.title")}
                </h2>
                <p className="text-text-muted leading-relaxed mb-4">
                  {t("sections.protocol.p1")}
                </p>
                <p className="text-text-muted leading-relaxed mb-4">
                  {t("sections.protocol.p2")}
                </p>
                <Link
                  href="/vless-vpn"
                  className="text-accent-teal hover:text-accent-gold transition-colors text-sm font-medium"
                >
                  {t("sections.protocol.link")} →
                </Link>
              </div>

              <div className="mb-8">
                <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">
                  {t("sections.encryption.title")}
                </h2>
                <p className="text-text-muted leading-relaxed mb-4">
                  {t("sections.encryption.p1")}
                </p>
                <p className="text-text-muted leading-relaxed">
                  {t("sections.encryption.p2")}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">
                  {t("sections.noLogs.title")}
                </h2>
                <p className="text-text-muted leading-relaxed mb-4">
                  {t("sections.noLogs.intro")}
                </p>
                <h3 className="font-semibold text-text-primary mb-2">
                  {t("sections.noLogs.neverTitle")}
                </h3>
                <ul className="list-disc ps-6 text-text-muted leading-relaxed mb-4 space-y-1">
                  {NEVER_KEYS.map((key) => (
                    <li key={key}>{t(`sections.noLogs.${key}`)}</li>
                  ))}
                </ul>
                <h3 className="font-semibold text-text-primary mb-2">
                  {t("sections.noLogs.onlyTitle")}
                </h3>
                <ul className="list-disc ps-6 text-text-muted leading-relaxed mb-4 space-y-1">
                  {ONLY_KEYS.map((key) => (
                    <li key={key}>{t(`sections.noLogs.${key}`)}</li>
                  ))}
                </ul>
                <h3 className="font-semibold text-text-primary mb-2">
                  {t("sections.noLogs.retentionTitle")}
                </h3>
                <ul className="list-disc ps-6 text-text-muted leading-relaxed space-y-1">
                  {RETENTION_KEYS.map((key) => (
                    <li key={key}>{t(`sections.noLogs.${key}`)}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">
                  {t("sections.account.title")}
                </h2>
                <p className="text-text-muted leading-relaxed mb-4">
                  {t("sections.account.p1")}
                </p>
                <Link
                  href="/no-registration-vpn"
                  className="text-accent-teal hover:text-accent-gold transition-colors text-sm font-medium"
                >
                  {t("sections.account.link")} →
                </Link>
              </div>

              <div className="mb-8">
                <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">
                  {t("sections.infrastructure.title")}
                </h2>
                <p className="text-text-muted leading-relaxed mb-4">
                  {t("sections.infrastructure.p1")}
                </p>
                <p className="text-text-muted leading-relaxed">
                  {t("sections.infrastructure.p2")}
                </p>
              </div>

              <div className="mb-8" id="disclosure">
                <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">
                  {t("sections.disclosure.title")}
                </h2>
                <p className="text-text-muted leading-relaxed mb-4">
                  {t("sections.disclosure.p1")}
                </p>
                <ul className="list-disc ps-6 text-text-muted leading-relaxed space-y-1">
                  <li>
                    <ObfuscatedEmail
                      user="support"
                      domain="simnetiq.store"
                      className="text-accent-teal hover:text-accent-gold transition-colors"
                    />
                  </li>
                  <li>
                    <a
                      href="/.well-known/security.txt"
                      className="text-accent-teal hover:text-accent-gold transition-colors"
                    >
                      {t("sections.disclosure.securityTxt")}
                    </a>
                  </li>
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">
                  {t("sections.jurisdiction.title")}
                </h2>
                <p className="text-text-muted leading-relaxed mb-4">
                  {t("sections.jurisdiction.p1")}
                </p>
                <p className="text-text-muted leading-relaxed">
                  {t("sections.jurisdiction.related")}{" "}
                  <Link href="/privacy" className="text-accent-teal hover:text-accent-gold transition-colors">
                    Privacy
                  </Link>
                  {" · "}
                  <Link href="/dpa" className="text-accent-teal hover:text-accent-gold transition-colors">
                    DPA
                  </Link>
                  {" · "}
                  <Link href="/subprocessors" className="text-accent-teal hover:text-accent-gold transition-colors">
                    Subprocessors
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
