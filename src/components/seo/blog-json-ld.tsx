import { ogLocaleMap } from "@/lib/og-locale-map";
import { ORG_ID } from "@/components/seo/json-ld";

/** Escape closing script tags to prevent XSS when injecting JSON into <script> */
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/<\//g, "<\\/");
}

interface BlogPostJsonLdProps {
  title: string;
  description: string;
  imageUrl: string | null;
  authorName: string;
  publishedAt: string | null;
  updatedAt: string;
  slug: string;
  locale: string;
  breadcrumbHome: string;
  breadcrumbBlog: string;
}

export function BlogPostJsonLd({
  title,
  description,
  imageUrl,
  authorName,
  publishedAt,
  updatedAt,
  slug,
  locale,
  breadcrumbHome,
  breadcrumbBlog,
}: BlogPostJsonLdProps) {
  const baseUrl = "https://www.dopplervpn.org";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: imageUrl || `${baseUrl}/images/iosdopplerlogo.png`,
    datePublished: publishedAt || undefined,
    dateModified: updatedAt,
    author: {
      "@type": "Organization",
      name: authorName || "Doppler Team",
      url: baseUrl,
    },
    publisher: { "@type": "Organization", "@id": ORG_ID, name: "Doppler VPN" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/${locale}/blog/${slug}`,
    },
    inLanguage: ogLocaleMap[locale]?.replace("_", "-") || "en-US",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: breadcrumbHome,
        item: `${baseUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: breadcrumbBlog,
        item: `${baseUrl}/${locale}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${baseUrl}/${locale}/blog/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
    </>
  );
}
