import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient, createStaticClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
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
import type { Metadata } from "next";

// Revalidate blog posts every 5 minutes (ISR) to reduce serverless invocations
export const revalidate = 300;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published")
    .returns<{ slug: string }[]>();

  const params: { locale: string; slug: string }[] = [];

  if (posts) {
    for (const post of posts) {
      for (const locale of routing.locales) {
        params.push({ locale, slug: post.slug });
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
  const supabase = await createClient();
  const baseUrl = "https://www.dopplervpn.org";

  const { data } = await supabase
    .from("blog_posts")
    .select(
      `
      slug,
      image_url,
      blog_post_translations (
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
    .in("blog_post_translations.locale", locale === "en" ? ["en"] : [locale, "en"])
    .single();

  const post = data as PostMetadata | null;

  if (!post || post.blog_post_translations.length === 0) return { title: "Not Found" };

  const translation =
    post.blog_post_translations.find((t) => t.locale === locale) ||
    post.blog_post_translations[0];
  const title = translation.meta_title || translation.title;
  const description = translation.meta_description || translation.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog/${slug}`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/blog/${slug}`]),
        ["x-default", `${baseUrl}/en/blog/${slug}`],
      ]),
    },
    openGraph: {
      title: translation.og_title || title,
      description: translation.og_description || description,
      url: `${baseUrl}/${locale}/blog/${slug}`,
      locale: ogLocaleMap[locale] || "en_US",
      alternateLocale: routing.locales
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
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      slug,
      image_url,
      author_name,
      published_at,
      updated_at,
      blog_post_translations (
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
    .in("blog_post_translations.locale", locale === "en" ? ["en"] : [locale, "en"])
    .single();

  const post = data as PostFull | null;

  if (!post || error || post.blog_post_translations.length === 0) return null;

  const translation =
    post.blog_post_translations.find((t) => t.locale === locale) ||
    post.blog_post_translations.find((t) => t.locale === "en")!;

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

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "blog" });
  const post = await getPostData(locale, slug);

  if (!post) {
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
                  <Badge key={tag.slug} variant="teal">
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

          {/* Featured Image */}
          {post.imageUrl && (
            <div className="relative aspect-[21/9] mb-10 rounded-2xl overflow-hidden">
              <Image
                src={post.imageUrl}
                alt={post.imageAlt || post.title}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
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
                    <Badge key={tag.slug} variant="default">
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
