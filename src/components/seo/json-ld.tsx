interface OrganizationSchemaProps {
  locale: string;
}

export function OrganizationSchema({ locale }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Doppler VPN",
    url: `https://www.dopplervpn.org/${locale}`,
    logo: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    image: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    description:
      locale === "he"
        ? "VPN חינמי ללא צורך באימייל או הרשמה. התחבר מיידית עם הצפנת VLESS-Reality, חוסם פרסומות מובנה וסינון תוכן."
        : "Free VPN with no email or sign up required. Connect instantly with VLESS-Reality encryption, built-in ad blocker & content filter.",
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

interface ProductSchemaProps {
  locale: string;
}

export function ProductSchema({ locale }: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Doppler VPN",
    image: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    description:
      locale === "he"
        ? "VPN חינמי ללא צורך באימייל או הרשמה. התחבר מיידית עם הצפנת VLESS-Reality, חוסם פרסומות מובנה וסינון תוכן. ללא יומנים."
        : "Free VPN with no email or sign up required. Connect instantly with VLESS-Reality encryption, built-in ad blocker & content filter. No logs.",
    brand: {
      "@type": "Brand",
      name: "Doppler VPN",
    },
    offers: [
      {
        "@type": "Offer",
        name: locale === "he" ? "חודשי" : "Monthly",
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
        name: locale === "he" ? "שנתי" : "Annual",
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

interface SoftwareApplicationSchemaProps {
  locale: string;
}

export function SoftwareApplicationSchema({
  locale,
}: SoftwareApplicationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Doppler VPN",
    image: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    applicationCategory: "SecurityApplication",
    operatingSystem: "iOS, Android, macOS, Windows",
    description:
      locale === "he"
        ? "VPN חינמי ללא צורך באימייל או הרשמה. התחבר מיידית עם הצפנת VLESS-Reality, חוסם פרסומות מובנה וסינון תוכן. ללא יומנים. ללא הגבלות נתונים."
        : "Free VPN with no email or sign up required. Connect instantly with VLESS-Reality encryption, built-in ad blocker & content filter. No logs. No data caps.",
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
      locale === "he" ? "ללא רישום נדרש" : "No registration required",
      locale === "he" ? "הצפנת VLESS-Reality" : "VLESS-Reality encryption",
      locale === "he" ? "חוסם פרסומות מובנה" : "Built-in ad blocker",
      locale === "he" ? "סינון תוכן ובקרת הורים" : "Content filter & parental controls",
      locale === "he" ? "מדיניות ללא יומנים" : "No-logs policy",
      locale === "he" ? "רוחב פס ללא הגבלה" : "Unlimited bandwidth",
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

interface WebsiteSchemaProps {
  locale: string;
}

export function WebsiteSchema({ locale }: WebsiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Doppler VPN",
    url: `https://www.dopplervpn.org/${locale}`,
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
