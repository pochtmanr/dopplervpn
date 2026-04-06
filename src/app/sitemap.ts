import type { MetadataRoute } from "next";
import { createStaticClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

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

  let posts: SitemapPost[] = [];
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, created_at")
      .eq("status", "published");

    if (error) {
      console.error("[sitemap] blog fetch failed:", error);
    } else {
      posts = (data as SitemapPost[] | null) ?? [];
    }
  } catch (err) {
    console.error("[sitemap] blog fetch threw:", err);
  }

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}/${locale}${page}`,
    lastModified: BUILD_TIME,
    changeFrequency: changeFreqFor(page),
    priority: priorityFor(page),
    alternates: buildAlternates(page),
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => {
    const lastmodSource = post.updated_at ?? post.created_at;
    const lastModified = lastmodSource ? new Date(lastmodSource) : BUILD_TIME;
    return {
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: buildAlternates(`/blog/${post.slug}`),
    };
  });

  return [...staticEntries, ...blogEntries];
}
