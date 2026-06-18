import { routing } from "@/i18n/routing";

// Sitemap INDEX pointing to every per-locale shard emitted by
// src/app/sitemap.ts + generateSitemaps(). Next.js 15 does not auto-generate
// a sitemap index when generateSitemaps() is used — shards live at
// /sitemap/<id>.xml. This route exposes the canonical /sitemap.xml entry
// point that Google Search Console and robots.txt reference.

const baseUrl = "https://www.dopplervpn.org";

// Serve the index as a static asset and stop emitting a per-request `now`
// timestamp — the old `new Date()` made the index claim all 44 shards changed
// on every fetch. Bump this only when the shard set actually changes.
export const dynamic = "force-static";

const lastmod = new Date("2026-06-09").toISOString();

export function GET() {
  const entries = routing.locales
    .map(
      (_locale, id) =>
        `  <sitemap>\n    <loc>${baseUrl}/sitemap/${id}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
