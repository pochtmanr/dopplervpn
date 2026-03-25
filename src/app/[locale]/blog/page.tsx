import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section, SectionHeader } from "@/components/ui/section";
import { BreadcrumbSchema } from "@/components/seo/json-ld";
import { BlogIndexContent } from "./blog-index-content";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { tag } = await searchParams;
  const t = await getTranslations({ locale, namespace: "blog" });
  const baseUrl = "https://www.dopplervpn.org";
  const tagSuffix = tag ? `?tag=${encodeURIComponent(tag)}` : "";

  return {
    title: t("indexTitle"),
    description: t("indexDescription"),
    alternates: {
      canonical: `${baseUrl}/${locale}/blog${tagSuffix}`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/blog${tagSuffix}`]),
        ["x-default", `${baseUrl}/en/blog${tagSuffix}`],
      ]),
    },
    openGraph: {
      title: t("indexTitle"),
      description: t("indexDescription"),
      url: `${baseUrl}/${locale}/blog${tagSuffix}`,
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
  const supabase = await createClient();

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

  // Build posts query — fetch target locale + English for fallback
  const { data: postsRaw } = await supabase
    .from("blog_posts")
    .select(`
      slug,
      image_url,
      published_at,
      blog_post_translations (
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
    .in("blog_post_translations.locale", locale === "en" ? ["en"] : [locale, "en"])
    .order("published_at", { ascending: false });

  const postsData = postsRaw as PostData[] | null;

  // Filter by tag if specified — prefer target locale, fall back to English
  let posts = (postsData || [])
    .map((post) => {
      const translation =
        post.blog_post_translations.find((t) => t.locale === locale) ||
        post.blog_post_translations.find((t) => t.locale === "en");
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
  const { tag: tagSlug } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const { posts, tags } = await getBlogData(locale, tagSlug);

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
              posts={posts}
              tags={tags}
              activeTagSlug={tagSlug || null}
              locale={locale}
              translations={{
                allPosts: t("allPosts"),
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
