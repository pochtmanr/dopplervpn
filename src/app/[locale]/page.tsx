import { setRequestLocale, getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FAQSchema } from "@/components/seo/json-ld";
import {
  Hero,
  TrustIndicators,
  Features,
  CensorshipResistance,
  UseCases,
  ComparisonTable,
  HowItWorks,
  TechnicalHowItWorks,
  Servers,
  PrivacyModel,
  CTA,
} from "@/components/sections";
import { HomeBlogSection } from "@/components/blog";
import { isBlogLocale } from "@/i18n/blog-locales";

const SpeedComparison = dynamic(() => import("@/components/sections/speed-comparison").then(m => ({ default: m.SpeedComparison })));
const PriceComparison = dynamic(() => import("@/components/sections/price-comparison").then(m => ({ default: m.PriceComparison })));
const Pricing = dynamic(() => import("@/components/sections/pricing").then(m => ({ default: m.Pricing })));
const FAQ = dynamic(() => import("@/components/sections/faq").then(m => ({ default: m.FAQ })));
import { createStaticClient } from "@/lib/supabase/server";

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
  // Blog is translated into 21 locales only. For the other 23, the homepage
  // renders without the blog section rather than showing English posts under
  // a localized URL.
  if (!isBlogLocale(locale)) return [];

  const supabase = createStaticClient();

  const { data: postsRaw } = await supabase
    .from("blog_posts")
    .select(
      `
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
    `
    )
    .eq("status", "published")
    .eq("blog_post_translations.locale", locale)
    .order("published_at", { ascending: false })
    .limit(3);

  const postsData = postsRaw as HomePostData[] | null;

  return (postsData || [])
    .map((post) => {
      const translation = post.blog_post_translations.find((t) => t.locale === locale);
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

const faqKeys = [
  "what", "noLogs", "adBlocker", "categories", "devices",
  "platforms", "whatIsIncluded", "plans", "trial", "cancel", "restore", "refund",
] as const;

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [posts, t] = await Promise.all([
    getLatestPosts(locale),
    getTranslations({ locale, namespace: "faq" }),
  ]);

  const faqItems = faqKeys.map((key) => ({
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }));

  return (
    <>
      <Navbar />
      <FAQSchema items={faqItems} />
      <main className="overflow-x-hidden">
        <Hero />
        <TrustIndicators />
        <TechnicalHowItWorks />
        <Features />
        <SpeedComparison />
        <CensorshipResistance />
        <ComparisonTable />
        <UseCases />
        <Servers />
        <Pricing />
        <PriceComparison />
        <PrivacyModel />
        <HowItWorks />
        <FAQ />
        <CTA />
        <HomeBlogSection posts={posts} locale={locale} />
      </main>
      <Footer />
    </>
  );
}
