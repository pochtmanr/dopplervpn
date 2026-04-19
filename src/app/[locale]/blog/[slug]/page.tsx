import { getTranslations, setRequestLocale } from "next-intl/server";
import { createStaticClient } from "@/lib/supabase/server";
import { BLOG_LOCALES, isBlogLocale } from "@/i18n/blog-locales";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import {
  BlogBreadcrumb,
  BlogContent,
  BlogRelatedPosts,
} from "@/components/blog";
import { ShareButtons } from "@/components/blog/share-buttons";
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
import { BlogPostJsonLd } from "@/components/seo/blog-json-ld";
import { NotFoundContent } from "@/components/not-found-content";
import type { Metadata } from "next";

// Revalidate blog posts every 24h (ISR) to reduce serverless invocations.
// Use on-demand revalidation (revalidatePath) when publishing/updating posts.
export const revalidate = 86400;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  // One path per (locale, slug) only where a translation actually exists.
  // Before this change, params were generated for all 44 locales × all
  // slugs, which fanned out to English-fallback pages under 23 non-blog
  // locales — the root of the Google duplicate-canonical penalty.
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, blog_post_translations!inner(locale)")
    .eq("status", "published")
    .in("blog_post_translations.locale", BLOG_LOCALES as readonly string[])
    .returns<{ slug: string; blog_post_translations: { locale: string }[] }[]>();

  const params: { locale: string; slug: string }[] = [];
  for (const post of data ?? []) {
    for (const t of post.blog_post_translations) {
      if (isBlogLocale(t.locale)) {
        params.push({ locale: t.locale, slug: post.slug });
      }
    }
  }
  return params;
}

interface PostMetadata {
  slug: string;
  image_url: string | null;
  blog_post_translations: {
    locale: string;
    title: string;
    excerpt: string;
    meta_title: string | null;
    meta_description: string | null;
    og_title: string | null;
    og_description: string | null;
  }[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  // Cookie-less client: keep this route fully static/ISR. See getPostData below.
  const supabase = createStaticClient();
  const baseUrl = "https://www.dopplervpn.org";

  const { data } = await supabase
    .from("blog_posts")
    .select(
      `
      slug,
      image_url,
      blog_post_translations!inner (
        title,
        excerpt,
        meta_title,
        meta_description,
        og_title,
        og_description,
        locale
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .eq("blog_post_translations.locale", locale)
    .single();

  const post = data as PostMetadata | null;

  if (!post || post.blog_post_translations.length === 0) return { title: "Not Found" };

  const translation = post.blog_post_translations[0];
  const title = translation.meta_title || translation.title;
  const description = translation.meta_description || translation.excerpt;

  // hreflang alternates reference only locales that actually have blog
  // translations — emitting the full 44-locale set created duplicate-canonical
  // noise for locales where the URL served English fallback content.
  const languages = Object.fromEntries([
    ...BLOG_LOCALES.map((loc) => [loc, `${baseUrl}/${loc}/blog/${slug}`]),
    ["x-default", `${baseUrl}/en/blog/${slug}`],
  ]);

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog/${slug}`,
      languages,
    },
    openGraph: {
      title: translation.og_title || title,
      description: translation.og_description || description,
      url: `${baseUrl}/${locale}/blog/${slug}`,
      locale: ogLocaleMap[locale] || "en_US",
      alternateLocale: BLOG_LOCALES
        .filter((l) => l !== locale)
        .map((l) => ogLocaleMap[l] || l),
      type: "article",
      images: post.image_url
        ? [{ url: post.image_url, width: 1200, height: 630 }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: translation.og_title || title,
      description: translation.og_description || description,
      images: post.image_url ? [post.image_url] : [],
    },
  };
}

interface PostFull {
  slug: string;
  image_url: string | null;
  author_name: string;
  published_at: string | null;
  updated_at: string;
  blog_post_translations: {
    title: string;
    excerpt: string;
    content: string;
    image_alt: string | null;
    meta_title: string | null;
    meta_description: string | null;
    locale: string;
  }[];
  blog_post_tags: {
    blog_tags: {
      slug: string;
      blog_tag_translations: { locale: string; name: string }[];
    };
  }[];
  blog_internal_links: {
    target_post_id: string;
    link_order: number;
    blog_posts: {
      slug: string;
      image_url: string | null;
      published_at: string | null;
      blog_post_translations: {
        locale: string;
        title: string;
        excerpt: string;
        image_alt: string | null;
      }[];
    };
  }[];
}

async function getPostData(locale: string, slug: string) {
  // Cookie-less client: blog content is 100% public. Using the cookie-aware
  // `createClient()` here would call `cookies()` and opt the entire route
  // into force-dynamic SSR, nullifying `revalidate` and burning Fast Origin
  // Transfer on every crawler hit across 43 locales.
  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      slug,
      image_url,
      author_name,
      published_at,
      updated_at,
      blog_post_translations!inner (
        title,
        excerpt,
        content,
        image_alt,
        meta_title,
        meta_description,
        locale
      ),
      blog_post_tags (
        blog_tags (
          slug,
          blog_tag_translations (
            locale,
            name
          )
        )
      ),
      blog_internal_links!source_post_id (
        target_post_id,
        link_order,
        blog_posts!target_post_id (
          slug,
          image_url,
          published_at,
          blog_post_translations (
            locale,
            title,
            excerpt,
            image_alt
          )
        )
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .eq("blog_post_translations.locale", locale)
    .single();

  const post = data as PostFull | null;

  if (!post || error || post.blog_post_translations.length === 0) return null;

  // Only accept the target-locale translation. No English fallback — a
  // post without a translation in the requested locale should 404 so the
  // URL stops competing with /en/blog/<slug> for the same content.
  const translation = post.blog_post_translations.find((t) => t.locale === locale);
  if (!translation) return null;

  const tags = (post.blog_post_tags || []).map((pt) => ({
    slug: pt.blog_tags.slug,
    name:
      pt.blog_tags.blog_tag_translations.find((t) => t.locale === locale)
        ?.name || pt.blog_tags.slug,
  }));

  const relatedPosts = (post.blog_internal_links || [])
    .sort((a, b) => a.link_order - b.link_order)
    .map((link) => {
      const relatedTranslation =
        link.blog_posts.blog_post_translations.find((t) => t.locale === locale) ||
        link.blog_posts.blog_post_translations.find((t) => t.locale === "en");
      return {
        slug: link.blog_posts.slug,
        title: relatedTranslation?.title || "",
        excerpt: relatedTranslation?.excerpt || "",
        imageUrl: link.blog_posts.image_url,
        imageAlt: relatedTranslation?.image_alt ?? null,
        publishedAt: link.blog_posts.published_at,
      };
    })
    .filter((p) => p.title);

  return {
    slug: post.slug,
    title: translation.title,
    excerpt: translation.excerpt,
    content: translation.content,
    metaTitle: translation.meta_title,
    metaDescription: translation.meta_description,
    imageUrl: post.image_url,
    imageAlt: translation.image_alt,
    authorName: post.author_name,
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    tags,
    relatedPosts,
  };
}

function formatDate(dateString: string | null, locale: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

async function findAvailableTranslationLocale(slug: string): Promise<string | null> {
  // Called only after the requested-locale fetch missed — figure out whether
  // the post exists at all and, if so, which locale to offer as a fallback
  // link. Prefer English, then any blog-supported locale.
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("blog_post_translations(locale)")
    .eq("slug", slug)
    .eq("status", "published")
    .single<{ blog_post_translations: { locale: string }[] }>();

  const locales = (data?.blog_post_translations ?? [])
    .map((t) => t.locale)
    .filter((l) => isBlogLocale(l));

  if (locales.length === 0) return null;
  if (locales.includes("en")) return "en";
  return locales[0];
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isBlogLocale(locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const post = await getPostData(locale, slug);

  if (!post) {
    // Post is missing in the requested locale. Check if it exists in another
    // locale — if so, render the "not available in this language" UI with a
    // link to the fallback translation. Otherwise show the generic 404.
    const fallbackLocale = await findAvailableTranslationLocale(slug);
    if (fallbackLocale && fallbackLocale !== locale) {
      return (
        <NotFoundContent
          locale={locale}
          variant="missing-translation"
          englishHref={`/${fallbackLocale}/blog/${slug}`}
        />
      );
    }
    notFound();
  }

  const readingTime = estimateReadingTime(post.content);

  return (
    <>
      <BlogPostJsonLd
        title={post.title}
        description={post.excerpt}
        imageUrl={post.imageUrl}
        authorName={post.authorName}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        slug={post.slug}
        locale={locale}
        breadcrumbHome={t("breadcrumb.home")}
        breadcrumbBlog={t("breadcrumb.blog")}
      />
      <Navbar />
      <main className="min-h-screen pt-20">
        <Section as="article">
          {/* Breadcrumb */}
          <BlogBreadcrumb
            items={[
              { label: t("breadcrumb.home"), href: "/" },
              { label: t("breadcrumb.blog"), href: "/blog" },
              { label: post.title },
            ]}
            locale={locale}
          />

          {/* Article Header */}
          <header className="mb-8">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag.slug} variant="auto" seed={tag.slug}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-text-primary mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
              <span>
                {t("by")} {post.authorName}
              </span>
              <span className="hidden sm:inline">•</span>
              <time dateTime={post.publishedAt || undefined}>
                {formatDate(post.publishedAt, locale)}
              </time>
              <span className="hidden sm:inline">•</span>
              <span>{t("readingTime", { minutes: readingTime })}</span>
            </div>
          </header>

          {/* Featured Image — `unoptimized` bypasses Vercel's /_next/image
              pipeline so crawler fetches of remote blog images don't burn
              Fast Origin Transfer quota on a Hobby plan. */}
          {post.imageUrl && (
            <div className="relative aspect-[21/9] mb-10 rounded-2xl overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.imageAlt || post.title}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Article Content */}
          <div className="max-w-3xl mx-auto">
            <BlogContent content={post.content} locale={locale} />

            {/* Tags at bottom */}
            {post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-overlay/10">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag.slug} variant="auto" seed={tag.slug}>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <ShareButtons
              url={`https://www.dopplervpn.org/${locale}/blog/${post.slug}`}
              title={post.title}
              imageUrl={post.imageUrl}
            />

            {/* Related Posts */}
            <BlogRelatedPosts
              posts={post.relatedPosts}
              locale={locale}
              title={t("relatedPosts")}
              readMoreText={t("readMore")}
            />

          </div>
        </Section>
      </main>
      <BlogStickyBar />
      <Footer />
    </>
  );
}
