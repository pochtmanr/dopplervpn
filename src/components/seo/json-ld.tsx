import { getTranslations } from "next-intl/server";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { RATING_DATA } from "@/lib/ratings";

const aggregateRating = RATING_DATA
  ? {
      "@type": "AggregateRating",
      ratingValue: RATING_DATA.ratingValue,
      ratingCount: RATING_DATA.ratingCount,
      bestRating: RATING_DATA.bestRating,
      worstRating: RATING_DATA.worstRating,
    }
  : undefined;

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
      "https://play.google.com/store/apps/details?id=org.dopplervpn.android",
      "https://t.me/dopplervpn",
      "https://t.me/dopplervpnen",
      "https://www.linkedin.com/company/109536645/",
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

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Doppler VPN",
    image: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    description: t("description"),
    brand: {
      "@type": "Brand",
      name: "Doppler VPN",
    },
    ...(aggregateRating ? { aggregateRating } : {}),
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

  const schema: Record<string, unknown> = {
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
      price: "7.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    ...(aggregateRating ? { aggregateRating } : {}),
    featureList: [
      ft("noRegistration.title"),
      ft("vlessReality.title"),
      ft("cryptoPayment.title"),
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

interface PlatformAppSchemaProps {
  name: string;
  description: string;
  operatingSystem: string;
  applicationCategory?: string;
  price?: string;
  downloadUrl?: string;
}

export function PlatformAppSchema({
  name,
  description,
  operatingSystem,
  applicationCategory = "UtilitiesApplication",
  price = "0",
  downloadUrl,
}: PlatformAppSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    operatingSystem,
    applicationCategory,
    image: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
  if (downloadUrl) {
    schema.downloadUrl = downloadUrl;
  }

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
  // Deduplicate by normalized question text. Google Search Console flags
  // repeated questions inside a single FAQPage as "Duplicate field 'FAQPage'",
  // which invalidates the entire rich-result item. This guard is also defensive
  // against translators producing identical question strings across namespaces
  // (e.g. support faq + troubleshooting on /support).
  const seen = new Set<string>();
  const uniqueItems = items.filter((item) => {
    const key = item.question.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (uniqueItems.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: uniqueItems.map((item) => ({
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

interface WebPageSchemaProps {
  url: string;
  name: string;
  description: string;
  /** Optional — when omitted, the page is implicitly part of the WebSite
   *  defined by `WebsiteSchema`. Pass a different URL to associate the page
   *  with a sub-collection (e.g. the blog index) for cleaner entity graphs. */
  isPartOf?: string;
  /** Use "CollectionPage" for index/listing pages (blog, downloads) to
   *  match the entity Google expects. Defaults to "WebPage". */
  type?: "WebPage" | "CollectionPage";
  inLanguage?: string;
}

export function WebPageSchema({
  url,
  name,
  description,
  isPartOf,
  type = "WebPage",
  inLanguage,
}: WebPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": url,
    url,
    name,
    description,
    ...(inLanguage ? { inLanguage } : {}),
    isPartOf: {
      "@type": "WebSite",
      url: isPartOf ?? "https://www.dopplervpn.org",
      name: "Doppler VPN",
    },
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
  /** ISO 8601 date (e.g. "2026-05-26"). Required — schemas with stale/fake
   *  dates poison freshness signals for YMYL content. */
  datePublished: string;
  /** Defaults to `datePublished` when omitted. Bump whenever the page's
   *  user-visible content materially changes. */
  dateModified?: string;
  image?: string;
}

export function ArticleSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  image = "https://www.dopplervpn.org/images/og-banner.jpg",
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image,
    datePublished,
    dateModified: dateModified ?? datePublished,
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
