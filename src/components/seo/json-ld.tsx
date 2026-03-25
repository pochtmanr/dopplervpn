import { getTranslations } from "next-intl/server";
import { ogLocaleMap } from "@/lib/og-locale-map";

/** Escape closing script tags to prevent XSS when injecting JSON into <script> */
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/<\//g, "<\\/");
}

interface LocaleProps {
  locale: string;
}

export async function OrganizationSchema({ locale }: LocaleProps) {
  const t = await getTranslations({ locale, namespace: "metadata" });

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Doppler VPN",
    url: `https://www.dopplervpn.org/${locale}`,
    logo: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    image: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    description: t("description"),
    sameAs: [
      "https://apps.apple.com/app/doppler-vpn-fast-secure/id6744068438",
      "https://t.me/dopplervpn",
      "https://t.me/dopplervpnen",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export async function ProductSchema({ locale }: LocaleProps) {
  const t = await getTranslations({ locale, namespace: "metadata" });
  const pt = await getTranslations({ locale, namespace: "pricing" });

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Doppler VPN",
    image: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    description: t("description"),
    brand: {
      "@type": "Brand",
      name: "Doppler VPN",
    },
    offers: [
      {
        "@type": "Offer",
        name: pt("durations.monthly"),
        price: "7.99",
        priceCurrency: "USD",
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        availability: "https://schema.org/InStock",
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "US",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 30,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "USD",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "US",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "DAY",
            },
          },
        },
      },
      {
        "@type": "Offer",
        name: pt("durations.annual"),
        price: "79.99",
        priceCurrency: "USD",
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        availability: "https://schema.org/InStock",
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "US",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 30,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "USD",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "US",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 0,
              unitCode: "DAY",
            },
          },
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export async function SoftwareApplicationSchema({ locale }: LocaleProps) {
  const t = await getTranslations({ locale, namespace: "metadata" });
  const ft = await getTranslations({ locale, namespace: "features.items" });

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Doppler VPN",
    image: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    applicationCategory: "SecurityApplication",
    operatingSystem: "iOS, Android, macOS, Windows",
    description: t("description"),
    inLanguage: ogLocaleMap[locale]?.replace("_", "-") || "en-US",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      ft("noRegistration.title"),
      ft("vlessReality.title"),
      ft("adBlocker.title"),
      ft("dnsProtection.title"),
      ft("minimalData.title"),
      ft("smartRouting.title"),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

interface FAQSchemaProps {
  items: Array<{ question: string; answer: string }>;
}

export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export async function WebsiteSchema({ locale }: LocaleProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Doppler VPN",
    url: `https://www.dopplervpn.org/${locale}`,
    inLanguage: ogLocaleMap[locale]?.replace("_", "-") || "en-US",
    publisher: {
      "@type": "Organization",
      name: "Doppler VPN",
      url: "https://www.dopplervpn.org",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

export function ArticleSchema({
  headline,
  description,
  url,
  image = "https://www.dopplervpn.org/images/og-banner.jpg",
  datePublished = "2025-03-01",
  dateModified = "2025-06-15",
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image,
    datePublished,
    dateModified,
    author: {
      "@type": "Organization",
      name: "Doppler VPN",
    },
    publisher: {
      "@type": "Organization",
      name: "Doppler VPN",
      logo: {
        "@type": "ImageObject",
        url: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
    />
  );
}
