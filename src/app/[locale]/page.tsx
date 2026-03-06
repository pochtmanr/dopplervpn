import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Hero,
  Features,
  HowItWorks,
  Servers,
  Pricing,
  FAQ,
  CTA,
} from "@/components/sections";
import { HomeBlogSection } from "@/components/blog";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface HomePostData {
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

async function getLatestPosts(locale: string) {
  const supabase = await createClient();

  const { data: postsRaw } = await supabase
    .from("blog_posts")
    .select(
      `
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
    `
    )
    .eq("status", "published")
    .in("blog_post_translations.locale", locale === "en" ? ["en"] : [locale, "en"])
    .order("published_at", { ascending: false })
    .limit(3);

  const postsData = postsRaw as HomePostData[] | null;

  return (postsData || [])
    .map((post) => {
      const translation =
        post.blog_post_translations.find((t) => t.locale === locale) ||
        post.blog_post_translations.find((t) => t.locale === "en");
      if (!translation) return null;

      const tags = (post.blog_post_tags || []).map((pt) => ({
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
        tags,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const posts = await getLatestPosts(locale);

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <Features />
        <HowItWorks />
        <Servers />
        <Pricing />
        <FAQ />
        <CTA />
        <HomeBlogSection posts={posts} locale={locale} />
      </main>
      <Footer />
    </>
  );
}
