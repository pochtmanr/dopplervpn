import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
import { BLOG_LOCALES, isBlogLocale } from "@/i18n/blog-locales";
import { SECURITY_LOCALES, isSecurityLocale } from "@/i18n/security-locales";

// Rebuild sitemap shards at most once per day. Without this, every crawler
// hit to /sitemap/N.xml re-runs the Supabase query and re-serializes a full
// 45-language hreflang map per entry — burning Fast Origin Transfer fast.
export const revalidate = 86400;

// Cold/blocking regeneration of a shard (Supabase fetch + serializing a full
// 45-locale hreflang map per entry) must never hit the default function
// timeout. Googlebot fetches all 44 shards in parallel; a clipped regen is what
// produced the 2026-04 "Couldn't fetch" report. 60s is the safe ceiling across
// Vercel plans and is clamped down automatically where lower.
export const maxDuration = 60;

const baseUrl = "https://www.dopplervpn.org";

// Stable per-build timestamp for static pages — avoids lastmod churn within
// a single build while still updating on each deploy.
const BUILD_TIME = new Date();

interface SitemapPost {
  slug: string;
  updated_at: string | null;
  created_at: string | null;
}

type PostsByLocale = Record<string, SitemapPost[]>;

// Fetch every published post + its translations once, group by locale, and
// share the result across all 44 shards via the Next.js data cache.
//
// Why: GSC 2026-04-25 crawl reported 14/44 shards "Couldn't fetch". Root
// cause: Googlebot fetches every shard listed in /sitemap.xml in parallel.
// On cold ISR each shard ran its own Supabase query (44 round-trips at
// once) and serialized 45-locale hreflang maps for ~100 posts. Vercel
// concurrency + per-fetch crawler timeout dropped a chunk of shards.
// With unstable_cache one query feeds all 44 shards for 24h.
const fetchPostsByLocale = unstable_cache(
  async (): Promise<PostsByLocale> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, created_at, blog_post_translations!inner(locale)")
      .eq("status", "published");

    if (error) {
      // Throw so unstable_cache does not memoize a degraded result for 24h.
      throw new Error(`[sitemap] blog fetch failed: ${error.message}`);
    }

    // Supabase typegen mistypes one-to-many embeds as a single object on the
    // parent — the runtime always returns an array (see blog_post page.tsx).
    type Row = SitemapPost & { blog_post_translations: { locale: string }[] };
    const byLocale: PostsByLocale = {};
    for (const row of (data ?? []) as unknown as Row[]) {
      const post: SitemapPost = {
        slug: row.slug,
        updated_at: row.updated_at,
        created_at: row.created_at,
      };
      for (const t of row.blog_post_translations) {
        if (!byLocale[t.locale]) byLocale[t.locale] = [];
        byLocale[t.locale].push(post);
      }
    }
    return byLocale;
  },
  ["sitemap-blog-posts-by-locale"],
  { revalidate: 86400, tags: ["sitemap"] }
);

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
  "/security",
  "/bypass-censorship",
  "/giveaway",
  "/no-registration-vpn",
  "/pay-with-crypto",
  "/vless-vpn",
  "/vpn-for-ios",
  "/vpn-for-android",
  "/vpn-for-macos",
  "/vpn-for-windows",
  // SEO long-tail landing pages
  "/vpn-for-uae",
  "/vpn-for-iran",
  "/vpn-for-china",
  "/vpn-for-russia",
  "/vpn-for-turkey",
  "/vpn-for-telegram-calls-uae",
  "/vpn-for-whatsapp-calls-uae",
  "/vpn-for-instagram-russia",
  "/vpn-for-travelers-china",
  "/vpn-for-tiktok-ban",
  "/vpn-for-public-wifi-iphone",
  "/vless-vpn-android",
  // Free privacy tools (passive backlink magnets)
  "/tools",
  "/tools/what-is-my-ip",
  "/tools/webrtc-leak-test",
  "/tools/dns-leak-test",
];

const toolPages = new Set([
  "/tools",
  "/tools/what-is-my-ip",
  "/tools/webrtc-leak-test",
  "/tools/dns-leak-test",
]);

const seoLandingPages = new Set([
  "/vpn-for-uae",
  "/vpn-for-iran",
  "/vpn-for-china",
  "/vpn-for-russia",
  "/vpn-for-turkey",
  "/vpn-for-telegram-calls-uae",
  "/vpn-for-whatsapp-calls-uae",
  "/vpn-for-instagram-russia",
  "/vpn-for-travelers-china",
  "/vpn-for-tiktok-ban",
  "/vpn-for-public-wifi-iphone",
  "/vless-vpn-android",
]);

function buildAlternates(path: string) {
  return {
    languages: Object.fromEntries([
      ...routing.locales.map((locale) => [locale, `${baseUrl}/${locale}${path}`]),
      ["x-default", `${baseUrl}/en${path}`],
    ]),
  };
}

// /security ships in the hand-translated core-market locales only; other
// locales 308-redirect to /en/security (see /[locale]/security/page.tsx).
function buildSecurityAlternates(path: string) {
  return {
    languages: Object.fromEntries([
      ...SECURITY_LOCALES.map((locale) => [locale, `${baseUrl}/${locale}${path}`]),
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
      "/pay-with-crypto",
      "/vless-vpn",
      "/vpn-for-ios",
      "/vpn-for-android",
      "/vpn-for-macos",
      "/vpn-for-windows",
    ].includes(page)
  )
    return 0.7;
  if (seoLandingPages.has(page)) return 0.7;
  if (toolPages.has(page)) return 0.8;
  if (page === "/security") return 0.7;
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

  const localeHasBlog = isBlogLocale(locale);

  let posts: SitemapPost[] = [];
  if (localeHasBlog) {
    try {
      const byLocale = await fetchPostsByLocale();
      posts = byLocale[locale] ?? [];
    } catch (err) {
      // Degrade to static-only entries rather than 500ing the shard.
      // A 500 makes Google retry the whole sitemap; an emptier-than-usual
      // 200 just suppresses blog URLs for one ISR cycle.
      console.error("[sitemap] falling back to static-only entries:", err);
    }
  }

  const staticEntries: MetadataRoute.Sitemap = staticPages
    // Omit the blog index from non-blog locales — middleware 308-redirects
    // /:locale/blog to /en/blog for those, so listing them would advertise
    // redirects rather than canonical URLs.
    .filter((page) => page !== "/blog" || localeHasBlog)
    // /security exists only in its hand-translated locales.
    .filter((page) => page !== "/security" || isSecurityLocale(locale))
    .map((page) => {
      let alternates;
      if (page === "/blog") {
        alternates = buildBlogAlternates(page);
      } else if (page === "/security") {
        alternates = buildSecurityAlternates(page);
      } else {
        alternates = buildAlternates(page);
      }
      return {
        url: `${baseUrl}/${locale}${page}`,
        lastModified: BUILD_TIME,
        changeFrequency: changeFreqFor(page),
        priority: priorityFor(page),
        alternates,
      };
    });

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

  // Non-localized agent-surface URLs (one canonical URL each, no /:locale
  // prefix). Emit once — in the en shard — to avoid 44× duplication.
  const agentSurfaceEntries: MetadataRoute.Sitemap =
    locale === "en"
      ? [
          { url: `${baseUrl}/agents`, lastModified: BUILD_TIME, changeFrequency: "monthly" as const, priority: 0.6 },
          { url: `${baseUrl}/llms.txt`, lastModified: BUILD_TIME, changeFrequency: "monthly" as const, priority: 0.5 },
          { url: `${baseUrl}/llms-full.txt`, lastModified: BUILD_TIME, changeFrequency: "monthly" as const, priority: 0.5 },
        ]
      : [];

  return [...staticEntries, ...blogEntries, ...agentSurfaceEntries];
}
