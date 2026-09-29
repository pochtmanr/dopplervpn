import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { seoTitle } from "@/lib/seo-title";
import { ogLocaleMap } from "@/lib/og-locale-map";

const baseUrl = "https://www.dopplervpn.org";

export function legalMetadata(locale: string, path: string, title: string, description: string): Metadata {
  return {
    title: seoTitle(title),
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}${path}`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}${path}`]),
        ["x-default", `${baseUrl}/en${path}`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}${path}`,
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
