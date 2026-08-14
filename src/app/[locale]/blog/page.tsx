import { Suspense } from "react";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createStaticClient } from "@/lib/supabase/server";
import { BLOG_LOCALES, isBlogLocale } from "@/i18n/blog-locales";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section, SectionHeader } from "@/components/ui/section";
import { BreadcrumbSchema, WebPageSchema } from "@/components/seo/json-ld";
import { BlogIndexContent } from "./blog-index-content";
import type { Metadata } from "next";

// Revalidate blog index every 24h (ISR) to reduce serverless invocations.
// Use on-demand revalidation (revalidatePath) when publishing/updating posts.
//
// IMPORTANT: nothing in this file may read `searchParams`. Doing so opts the
// whole route into dynamic rendering, which silently nullifies the `revalidate`
// above — the route then answers `no-store` / cache MISS and re-runs both
// Supabase queries on every hit. That is exactly what happened until Aug 2026,
// when an AI crawler sweeping 21 blog locales made it the most expensive page
// on the site. Tag filtering and pagination live in blog-index-content.tsx
// (a client component reading useSearchParams) precisely to keep this page
// prerenderable. Keep it that way.
export const revalidate = 86400;

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return BLOG_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const baseUrl = "https://www.dopplervpn.org";

  return {
    title: t("indexTitle"),
    description: t("indexDescription"),
    alternates: {
      // Query variants (?tag=, ?page=) all canonicalise to the bare index.
      // They are also Disallowed in robots.ts — every post is reachable from
      // the sitemap shards, so discovery never depended on paginated URLs.
      canonical: `${baseUrl}/${locale}/blog`,
      languages: Object.fromEntries([
        ...BLOG_LOCALES.map((loc) => [loc, `${baseUrl}/${loc}/blog`]),
        ["x-default", `${baseUrl}/en/blog`],
      ]),
    },
    openGraph: {
      title: t("indexTitle"),
      description: t("indexDescription"),
      url: `${baseUrl}/${locale}/blog`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/images/og-banner.jpg`,
          width: 1200,
          height: 630,
          alt: "Doppler VPN — Fast & Secure",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("indexTitle"),
      description: t("indexDescription"),
      images: [`${baseUrl}/images/og-banner.jpg`],
    },
  };
}

interface TagData {
  slug: string;
  blog_tag_translations: { locale: string; name: string }[];
}

interface PostData {
  slug: string;
  image_url: string | null;
  published_at: string | null;
  blog_post_translations: {
    locale: string;
    title: string;
    excerpt: string;
    image_alt: string | null;
  }[];
  blog_post_tags: {
    blog_tags: {
      slug: string;
      blog_tag_translations: { locale: string; name: string }[];
    };
  }[];
}

async function fetchBlogData(locale: string) {
  // Use the cookie-less client: blog content is 100% public and we want this
  // page to stay statically rendered / ISR-cached. Calling the cookie-aware
  // `createClient()` here would opt the entire route into force-dynamic SSR
  // and nullify the `revalidate` above — burning Fast Origin Transfer on
  // every crawler hit across all locales.
  const supabase = createStaticClient();

  // Fetch all tags with translations
  const { data: tagsRaw } = await supabase
    .from("blog_tags")
    .select(`
      slug,
      blog_tag_translations (
        locale,
        name
      )
    `)
    // Stable order — see the tag sort in blog/[slug]/page.tsx. Unordered rows can
    // reshuffle on any UPDATE, changing page bytes and billing an ISR write for
    // content that did not change.
    .order("slug");

  const tagsData = tagsRaw as TagData[] | null;

  const tags = (tagsData || []).map((tag) => ({
    slug: tag.slug,
    name:
      tag.blog_tag_translations.find((t) => t.locale === locale)?.name ||
      tag.slug,
  }));

  // Strict per-locale query: only show posts that have a translation in the
  // requested locale. `!inner` turns the join into a filter instead of a
  // fallback. Eliminates duplicate English content served under translated
  // URLs — the primary cause of the Feb–Apr 2026 indexing penalty.
  const { data: postsRaw } = await supabase
    .from("blog_posts")
    .select(`
      slug,
      image_url,
      published_at,
      blog_post_translations!inner (
        locale,
        title,
        excerpt,
        image_alt
      ),
      blog_post_tags (
        blog_tags (
          slug,
          blog_tag_translations (
            locale,
            name
          )
        )
      )
    `)
    .eq("status", "published")
    .eq("blog_post_translations.locale", locale)
    .order("published_at", { ascending: false })
    // Tiebreak: posts sharing a published_at would otherwise order unstably,
    // reshuffling the card grid and billing an ISR write on every revalidation.
    .order("slug");

  const postsData = postsRaw as PostData[] | null;

  const posts = (postsData || [])
    .map((post) => {
      const translation = post.blog_post_translations.find((t) => t.locale === locale);
      if (!translation) return null;

      // Sorted for the same reason as the tag sort in blog/[slug]/page.tsx:
      // a nested embed's row order is not guaranteed, and a reshuffle is a
      // byte diff that bills an ISR write.
      const postTags = (post.blog_post_tags || [])
        .map((pt) => ({
          slug: pt.blog_tags.slug,
          name:
            pt.blog_tags.blog_tag_translations.find((t) => t.locale === locale)
              ?.name || pt.blog_tags.slug,
        }))
        .sort((a, b) => a.slug.localeCompare(b.slug));

      return {
        slug: post.slug,
        title: translation.title,
        excerpt: translation.excerpt,
        imageUrl: post.image_url,
        imageAlt: translation.image_alt,
        publishedAt: post.published_at,
        tags: postTags,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return { posts, tags };
}

// One Supabase round-trip per locale per 24h, shared across every request that
// hits a cold ISR render. Mirrors `fetchPostsByLocale` in src/app/sitemap.ts.
const getBlogData = unstable_cache(fetchBlogData, ["blog-index"], {
  revalidate: 86400,
  tags: ["blog-index"],
});

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;
  if (!isBlogLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const { posts } = await getBlogData(locale);

  const baseUrl = "https://www.dopplervpn.org";

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: t("breadcrumb.home"), url: `${baseUrl}/${locale}` },
          { name: t("title"), url: `${baseUrl}/${locale}/blog` },
        ]}
      />
      <WebPageSchema
        url={`${baseUrl}/${locale}/blog`}
        name={t("title")}
        description={t("subtitle")}
        type="CollectionPage"
      />
      <Navbar />
      <main className="min-h-screen pt-20">
        <Section>
          <SectionHeader title={t("title")} subtitle={t("subtitle")} />

          <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            <BlogIndexContent
              posts={posts}
              locale={locale}
              translations={{
                readMore: t("readMore"),
                noPosts: t("noPosts"),
                noPostsDescription: t("noPostsDescription"),
              }}
            />
          </Suspense>
        </Section>
      </main>
      <Footer />
    </>
  );
}
