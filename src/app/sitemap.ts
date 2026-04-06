import type { MetadataRoute } from "next";
import { createStaticClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient();

  const { data: postsRaw } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published");

  const posts = (postsRaw as SitemapPost[] | null) ?? [];

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

  const now = new Date();

  // Static pages — one entry per locale × path
  const staticEntries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const page of staticPages) {
      staticEntries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: now,
        changeFrequency: changeFreqFor(page),
        priority: priorityFor(page),
        alternates: buildAlternates(page),
      });
    }
  }

  // Blog posts — one entry per locale × post
  const blogEntries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const post of posts) {
      blogEntries.push({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: buildAlternates(`/blog/${post.slug}`),
      });
    }
  }

  return [...staticEntries, ...blogEntries];
}
