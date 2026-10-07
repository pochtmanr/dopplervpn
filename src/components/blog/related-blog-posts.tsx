import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createStaticClient } from "@/lib/supabase/server";
import { isBlogLocale } from "@/i18n/blog-locales";

interface RelatedBlogPostsProps {
  locale: string;
  /** Blog slugs in display order. Only posts published in `locale` render. */
  slugs: readonly string[];
}

/**
 * "Related articles" for landing and reference pages. Landing pages never
 * linked into the blog, so the explainers that support them got no internal
 * links from the pages with the most authority. Renders nothing when the
 * locale has no blog or none of the posts are translated into it.
 */
export async function RelatedBlogPosts({ locale, slugs }: RelatedBlogPostsProps) {
  if (!isBlogLocale(locale) || slugs.length === 0) return null;
  const { data } = await createStaticClient()
    .from("blog_posts")
    .select("slug, blog_post_translations!inner(locale, title, excerpt)")
    .eq("status", "published")
    .in("slug", slugs as string[])
    .eq("blog_post_translations.locale", locale)
    .returns<{ slug: string; blog_post_translations: { title: string; excerpt: string | null }[] }[]>();
  const posts = slugs
    .map((slug) => data?.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => !!p && p.blog_post_translations.length > 0);
  if (posts.length === 0) return null;
  const t = await getTranslations({ locale, namespace: "blog" });

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl font-semibold text-text-primary mb-6">{t("relatedPosts")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {posts.slice(0, 6).map((post) => {
            const tr = post.blog_post_translations[0];
            return (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors block"
              >
                <h3 className="text-sm font-semibold text-text-primary mb-1">{tr.title}</h3>
                {tr.excerpt && <p className="text-xs text-text-muted line-clamp-3">{tr.excerpt}</p>}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
