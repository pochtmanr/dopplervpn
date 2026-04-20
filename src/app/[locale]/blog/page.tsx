import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createStaticClient } from "@/lib/supabase/server";
import { BLOG_LOCALES, isBlogLocale } from "@/i18n/blog-locales";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section, SectionHeader } from "@/components/ui/section";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { BlogIndexContent } from "./blog-index-content";
import type { Metadata } from "next";

// Revalidate blog index every 24h (ISR) to reduce serverless invocations.
// Use on-demand revalidation (revalidatePath) when publishing/updating posts.
export const revalidate = 86400;

const PAGE_SIZE = 18;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string; page?: string }>;
};

export function generateStaticParams() {
  return BLOG_LOCALES.map((locale) => ({ locale }));
}

function parsePageParam(raw: string | undefined): number {
  const n = raw ? parseInt(raw, 10) : 1;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function buildQuerySuffix(tag: string | undefined, page: number): string {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { tag, page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);
  const t = await getTranslations({ locale, namespace: "blog" });
  const baseUrl = "https://www.dopplervpn.org";
  const suffix = buildQuerySuffix(tag, page);

  return {
    title: t("indexTitle"),
    description: t("indexDescription"),
    alternates: {
      canonical: `${baseUrl}/${locale}/blog${suffix}`,
      languages: Object.fromEntries([
        ...BLOG_LOCALES.map((loc) => [loc, `${baseUrl}/${loc}/blog${suffix}`]),
        ["x-default", `${baseUrl}/en/blog${suffix}`],
      ]),
    },
    openGraph: {
      title: t("indexTitle"),
      description: t("indexDescription"),
      url: `${baseUrl}/${locale}/blog${suffix}`,
      siteName: "Doppler VPN",
      locale: locale,
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

async function getBlogData(locale: string, tagSlug: string | undefined) {
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
    `);

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
    .order("published_at", { ascending: false });

  const postsData = postsRaw as PostData[] | null;

  let posts = (postsData || [])
    .map((post) => {
      const translation = post.blog_post_translations.find((t) => t.locale === locale);
      if (!translation) return null;

      const postTags = (post.blog_post_tags || []).map((pt) => ({
        slug: pt.blog_tags.slug,
        name:
          pt.blog_tags.blog_tag_translations.find((t) => t.locale === locale)
            ?.name || pt.blog_tags.slug,
      }));

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

  // Filter by tag
  if (tagSlug) {
    posts = posts.filter((post) =>
      post.tags.some((tag) => tag.slug === tagSlug)
    );
  }

  return { posts, tags };
}

export default async function BlogIndexPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isBlogLocale(locale)) notFound();
  const { tag: tagSlug, page: pageRaw } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const { posts } = await getBlogData(locale, tagSlug);

  const requestedPage = parsePageParam(pageRaw);
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  // Out-of-range page numbers should 404 (avoids duplicate thin content for SEO).
  if (requestedPage > totalPages && posts.length > 0) notFound();
  const currentPage = Math.min(requestedPage, totalPages);
  const pagePosts = posts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const baseUrl = "https://www.dopplervpn.org";

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: t("breadcrumb.home"), url: `${baseUrl}/${locale}` },
          { name: t("title"), url: `${baseUrl}/${locale}/blog` },
        ]}
      />
      <Navbar />
      <main className="min-h-screen pt-20">
        <Section>
          <SectionHeader title={t("title")} subtitle={t("subtitle")} />

          <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            <BlogIndexContent
              posts={pagePosts}
              locale={locale}
              currentPage={currentPage}
              totalPages={totalPages}
              tagSlug={tagSlug ?? null}
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
