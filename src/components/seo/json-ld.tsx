import { getTranslations } from "next-intl/server";
import { ogLocaleMap } from "@/lib/og-locale-map";

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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
        priceValidUntil: "2026-12-31",
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
        priceValidUntil: "2026-12-31",
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1000",
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://www.dopplervpn.org/${locale}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
