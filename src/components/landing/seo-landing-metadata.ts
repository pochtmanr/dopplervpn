import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";

const baseUrl = "https://www.dopplervpn.org";

interface BuildMetadataArgs {
  locale: string;
  slug: string;
  namespace: string;
  ogType?: "website" | "article";
}

export async function buildSeoLandingMetadata({
  locale,
  slug,
  namespace,
  ogType = "article",
}: BuildMetadataArgs): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `${namespace}.metadata` });
  const title = t("title");
  const description = t("description");
  const pageUrl = `${baseUrl}/${locale}/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/${slug}`]),
        ["x-default", `${baseUrl}/en/${slug}`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: ogType,
      images: [
        {
          url: `${baseUrl}/images/og-banner.jpg`,
          width: 1200,
          height: 630,
          alt: title,
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
