import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema, WebPageSchema } from "@/components/seo/json-ld";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";
const SLUG = "tools";

const TOOLS = [
  { href: "/tools/what-is-my-ip", key: "ipChecker" },
  { href: "/tools/webrtc-leak-test", key: "webrtcLeak" },
  { href: "/tools/dns-leak-test", key: "dnsLeak" },
] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "toolsHub.metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title,
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("toolsHub");
  const mt = await getTranslations({ locale, namespace: "toolsHub.metadata" });
  const pageUrl = `${baseUrl}/${locale}/${SLUG}`;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("title"), url: pageUrl },
        ]}
      />
      <WebPageSchema
        url={pageUrl}
        name={mt("title")}
        description={mt("description")}
        type="CollectionPage"
      />
      <Navbar />
      <main className="overflow-x-hidden">
        <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -end-20 w-[24rem] h-[24rem] bg-accent-gold/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary mb-4">
              {t("title")}
            </h1>
            <p className="text-text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto max-w-5xl grid sm:grid-cols-3 gap-4">
            {TOOLS.map(({ href, key }) => (
              <Link
                key={key}
                href={href}
                className="rounded-2xl bg-bg-secondary/40 border border-overlay/5 p-6 hover:border-accent-teal/30 transition-colors flex flex-col"
              >
                <div className="font-display text-xl text-text-primary mb-3">
                  {t(`tools.${key}.title`)}
                </div>
                <p className="text-text-muted text-sm mb-4 grow">
                  {t(`tools.${key}.description`)}
                </p>
                <div className="text-accent-teal text-sm font-medium">
                  {t(`tools.${key}.cta`)} →
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-3xl rounded-2xl bg-accent-teal/5 border border-accent-teal/20 p-6 sm:p-8 text-center">
            <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-3">
              {t("cta.title")}
            </h2>
            <p className="text-text-secondary mb-6 max-w-2xl mx-auto">{t("cta.description")}</p>
            <Link
              href="/downloads"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors"
            >
              {t("cta.button")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
