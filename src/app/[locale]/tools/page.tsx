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
  {
    href: "/tools/what-is-my-ip",
    key: "ipChecker",
    // heroicons globe-alt
    icon: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418",
  },
  {
    href: "/tools/webrtc-leak-test",
    key: "webrtcLeak",
    // heroicons signal
    icon: "M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z",
  },
  {
    href: "/tools/dns-leak-test",
    key: "dnsLeak",
    // heroicons server-stack
    icon: "M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z",
  },
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
      <main className="overflow-x-hidden min-h-screen flex flex-col">
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

        <section className="px-4 sm:px-6 lg:px-8 pb-16 flex-1 flex items-center">
          <div className="mx-auto max-w-5xl w-full grid sm:grid-cols-3 gap-4 lg:gap-5">
            {TOOLS.map(({ href, key, icon }) => (
              <Link
                key={key}
                href={href}
                className="group relative rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] p-6 sm:p-7 overflow-hidden backdrop-blur-sm hover:border-accent-teal/30 transition-colors duration-300 flex flex-col"
              >
                <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />
                <div className="absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-6 -end-6 w-32 h-32 text-accent-teal/[0.07] group-hover:text-accent-teal/[0.14] transition-colors duration-300 select-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                <div className="relative flex flex-col grow">
                  <div className="w-11 h-11 rounded-xl bg-accent-teal/10 ring-1 ring-accent-teal/20 flex items-center justify-center text-accent-teal mb-5 group-hover:bg-accent-teal/15 transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                  </div>
                  <div className="font-display text-xl text-text-primary mb-2">
                    {t(`tools.${key}.title`)}
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed mb-5 grow">
                    {t(`tools.${key}.description`)}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-accent-teal text-sm font-medium">
                    {t(`tools.${key}.cta`)}
                    <svg
                      className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
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
