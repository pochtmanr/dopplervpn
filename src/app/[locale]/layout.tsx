import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Instrument_Serif, Space_Grotesk, Inter, Jost } from "next/font/google";

import { routing, isRtlLocale } from "@/i18n/routing";
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

// Inter - body font for Russian locale (Cyrillic-capable Google Sans alternative)
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Jost - heading font for Russian locale (Cyrillic-capable)
const jost = Jost({
  subsets: ["latin", "cyrillic"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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

const ogLocaleMap: Record<string, string> = {
  en: "en_US",
  ru: "ru_RU",
  es: "es_ES",
  pt: "pt_BR",
  fr: "fr_FR",
  zh: "zh_CN",
  de: "de_DE",
  he: "he_IL",
  fa: "fa_IR",
  ar: "ar_SA",
  hi: "hi_IN",
  id: "id_ID",
  tr: "tr_TR",
  vi: "vi_VN",
  th: "th_TH",
  ms: "ms_MY",
  ko: "ko_KR",
  ja: "ja_JP",
  tl: "tl_PH",
  ur: "ur_PK",
  sw: "sw_KE",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const title = t("title");
  const description = t("description");

  const alternateLanguages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `https://www.dopplervpn.org/${loc}`])
  );

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
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
      className={locale === "ru"
        ? `${jost.variable} ${inter.variable}`
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
