import type { MetadataRoute } from "next";
import { createStaticClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
import { BLOG_LOCALES, isBlogLocale } from "@/i18n/blog-locales";

// Rebuild sitemap shards at most once per day. Without this, every crawler
// hit to /sitemap/N.xml re-runs the Supabase query and re-serializes a full
// 45-language hreflang map per entry — burning Fast Origin Transfer fast.
export const revalidate = 86400;

const baseUrl = "https://www.dopplervpn.org";

// Stable per-build timestamp for static pages — avoids lastmod churn within
// a single build while still updating on each deploy.
const BUILD_TIME = new Date();

interface SitemapPost {
  slug: string;
  updated_at: string | null;
  created_at: string | null;
}

const staticPages = [
  "",
  "/downloads",
  "/privacy",
  "/terms",
  "/refund",
  "/dpa",
  "/subprocessors",
  "/blog",
  "/support",
  "/about",
  "/bypass-censorship",
  "/no-registration-vpn",
  "/vless-vpn",
  "/vpn-for-ios",
  "/vpn-for-android",
  "/vpn-for-macos",
  "/vpn-for-windows",
];

function buildAlternates(path: string) {
  return {
    languages: Object.fromEntries([
      ...routing.locales.map((locale) => [locale, `${baseUrl}/${locale}${path}`]),
      ["x-default", `${baseUrl}/en${path}`],
    ]),
  };
}

// Blog URLs only exist for the 21 locales with real translations; the other
// 23 locales 308-redirect to /en/blog via middleware. Alternates and URL
// emission must reflect that or Google sees duplicate-canonical noise again.
function buildBlogAlternates(path: string) {
  return {
    languages: Object.fromEntries([
      ...BLOG_LOCALES.map((locale) => [locale, `${baseUrl}/${locale}${path}`]),
      ["x-default", `${baseUrl}/en${path}`],
    ]),
  };
}

function priorityFor(page: string): number {
  if (page === "") return 1;
  if (page === "/blog") return 0.9;
  if (page === "/downloads") return 0.8;
  if (
    [
      "/bypass-censorship",
      "/no-registration-vpn",
      "/vless-vpn",
      "/vpn-for-ios",
      "/vpn-for-android",
      "/vpn-for-macos",
      "/vpn-for-windows",
    ].includes(page)
  )
    return 0.7;
  if (page === "/support" || page === "/about") return 0.6;
  return 0.5;
}

function changeFreqFor(page: string): "weekly" | "daily" | "monthly" {
  if (page === "") return "weekly";
  if (page === "/blog") return "daily";
  return "monthly";
}

// Next.js 15 generateSitemaps() — one shard per locale to stay well under
// Vercel's 19.07 MB ISR fallback body cap. Each shard carries full 44-locale
// hreflang, so total body ~= (17 static + N blog) × 45 alternates per shard.
export async function generateSitemaps() {
  return routing.locales.map((_locale, id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const locale = routing.locales[id];
  if (!locale) return [];

  const supabase = createStaticClient();
  const localeHasBlog = isBlogLocale(locale);

  let posts: SitemapPost[] = [];
  if (localeHasBlog) {
    try {
      // Strict join: only emit URLs for posts that have a translation in
      // this locale. A post without a target-locale translation will 404
      // under that path, and listing 404s in a sitemap is a quality hit.
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, updated_at, created_at, blog_post_translations!inner(locale)")
        .eq("status", "published")
        .eq("blog_post_translations.locale", locale);

      if (error) {
        console.error("[sitemap] blog fetch failed:", error);
      } else {
        posts = (data as SitemapPost[] | null) ?? [];
      }
    } catch (err) {
      console.error("[sitemap] blog fetch threw:", err);
    }
  }

  const staticEntries: MetadataRoute.Sitemap = staticPages
    // Omit the blog index from non-blog locales — middleware 308-redirects
    // /:locale/blog to /en/blog for those, so listing them would advertise
    // redirects rather than canonical URLs.
    .filter((page) => page !== "/blog" || localeHasBlog)
    .map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: BUILD_TIME,
      changeFrequency: changeFreqFor(page),
      priority: priorityFor(page),
      alternates: page === "/blog" ? buildBlogAlternates(page) : buildAlternates(page),
    }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const lastmodSource = post.updated_at ?? post.created_at;
    const lastModified = lastmodSource ? new Date(lastmodSource) : BUILD_TIME;
    return {
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: buildBlogAlternates(`/blog/${post.slug}`),
    };
  });

  return [...staticEntries, ...blogEntries];
}
