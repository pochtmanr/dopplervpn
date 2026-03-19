import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { createStaticClient } from "@/lib/supabase/server";

const baseUrl = "https://www.dopplervpn.org";

interface SitemapPost {
  slug: string;
  updated_at: string;
}

function buildAlternates(path: string) {
  return {
    languages: Object.fromEntries([
      ...routing.locales.map((locale) => [locale, `${baseUrl}/${locale}${path}`]),
      ["x-default", `${baseUrl}/en${path}`],
    ]),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient();

  // Fetch all published blog posts
  const { data: postsRaw } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published");

  const posts = postsRaw as SitemapPost[] | null;

  // Static pages — one entry per page with hreflang alternates
  const staticPages = ["", "/downloads", "/privacy", "/terms", "/blog", "/support", "/about", "/bypass-censorship"];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}/en${page}`,
    lastModified: new Date(),
    changeFrequency:
      page === ""
        ? ("weekly" as const)
        : page === "/blog"
          ? ("daily" as const)
          : page === "/downloads" || page === "/guide"
            ? ("monthly" as const)
            : ("monthly" as const),
    priority:
      page === "" ? 1 : page === "/blog" ? 0.9 : page === "/downloads" ? 0.8 : page === "/bypass-censorship" ? 0.7 : page === "/support" ? 0.6 : page === "/about" ? 0.6 : 0.5,
    alternates: buildAlternates(page),
  }));

  // Blog post pages — one entry per post with hreflang alternates
  const blogEntries: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/en/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: buildAlternates(`/blog/${post.slug}`),
  }));

  return [...staticEntries, ...blogEntries];
}
