import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Instrument_Serif, Space_Grotesk, Rubik } from "next/font/google";

import { routing, isRtlLocale } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import {
  OrganizationSchema,
  ProductSchema,
  WebsiteSchema,
  SoftwareApplicationSchema,
} from "@/components/seo/json-ld";
import { Analytics } from "@vercel/analytics/react";
import { CookieConsent } from "@/components/cookie-consent";
import { ThemeProvider } from "@/components/theme-provider";
import "@/app/globals.css";

// Instrument Serif - for hero headline only
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

// Space Grotesk - main font for body and section headers
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Rubik - Google Sans alternative for Cyrillic locales (ru, uk)
const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  variable: "--font-rubik",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});


export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const title = t("title");
  const description = t("description");

  const alternateLanguages: Record<string, string> = Object.fromEntries(
    routing.locales.map((loc) => [loc, `https://www.dopplervpn.org/${loc}`])
  );
  alternateLanguages["x-default"] = "https://www.dopplervpn.org/en";

  return {
    title: {
      default: title,
      template: "%s | Doppler VPN",
    },
    description,
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    openGraph: {
      title,
      description,
      url: `https://www.dopplervpn.org/${locale}`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => ogLocaleMap[l] || l),
      type: "website",
      images: [
        {
          url: "https://www.dopplervpn.org/images/og-banner.jpg",
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
      images: ["https://www.dopplervpn.org/images/og-banner.jpg"],
    },
    alternates: {
      canonical: `https://www.dopplervpn.org/${locale}`,
      languages: alternateLanguages,
    },
    verification: {
      google: "vfzTLNRXO6Wqg4yP5UTzG8jlnVilqSxwsW4cEAOvqx8",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={(locale === "ru" || locale === "uk" || locale === "bg")
        ? rubik.variable
        : `${instrumentSerif.variable} ${spaceGrotesk.variable}`
      }
    >
      <head>
        <OrganizationSchema locale={locale} />
        <ProductSchema locale={locale} />
        <WebsiteSchema locale={locale} />
        <SoftwareApplicationSchema locale={locale} />
      </head>
      <body className="min-h-screen bg-bg-primary text-text-primary font-body antialiased">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
            <CookieConsent />
          </NextIntlClientProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
