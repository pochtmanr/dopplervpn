import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ArticleSource } from "@/lib/how-it-works";
import { APPLE_GUIDES, type GuideSlug } from "@/config/platforms/apple";

/**
 * /guides: standalone how-to and explainer articles about the apps, linked from
 * the iPhone and Mac pages. Same storage as /how-it-works and /vpn-protocols:
 *   content/guides/<slug>/<locale>.md         the body (GitHub markdown, ```chart and ```shots blocks)
 *   content/guides/<slug>/<locale>.meta.json  title, meta, FAQ, sources
 * Hand-written. English only for now: any other locale 308-redirects to /en/guides/*.
 * A locale joins GUIDES_LOCALES only once every guide has its files in it.
 */

export const GUIDES_LOCALES = ["en"] as const;

export function isGuidesLocale(locale: string): boolean {
  return (GUIDES_LOCALES as readonly string[]).includes(locale);
}

/** Hub and reading order. */
export const GUIDE_SLUGS: readonly GuideSlug[] = APPLE_GUIDES;

export function isGuideSlug(slug: string): slug is GuideSlug {
  return (GUIDE_SLUGS as readonly string[]).includes(slug);
}

export interface GuideMeta {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  navLabel: string;
  datePublished: string;
  dateModified: string;
  readingMinutes: number;
  faq: Array<{ question: string; answer: string }>;
  sources: ArticleSource[];
}

export interface Guide {
  slug: GuideSlug;
  meta: GuideMeta;
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "guides");

export async function getGuide(slug: GuideSlug, locale: string): Promise<Guide> {
  const dir = path.join(CONTENT_DIR, slug);
  const [body, metaRaw] = await Promise.all([
    readFile(path.join(dir, `${locale}.md`), "utf8"),
    readFile(path.join(dir, `${locale}.meta.json`), "utf8"),
  ]);
  return { slug, meta: JSON.parse(metaRaw) as GuideMeta, body };
}

export async function getAllGuideMeta(locale: string) {
  return Promise.all(GUIDE_SLUGS.map(async (slug) => ({ slug, meta: (await getGuide(slug, locale)).meta })));
}

/** The next guide in hub order; the last one hands back to the hub (null). */
export function nextGuideSlug(slug: GuideSlug): GuideSlug | null {
  const i = GUIDE_SLUGS.indexOf(slug);
  return i < GUIDE_SLUGS.length - 1 ? GUIDE_SLUGS[i + 1] : null;
}

/** Newest dateModified across the guides, for the sitemap. Kept by hand like HOW_IT_WORKS_LASTMOD. */
export const GUIDES_LASTMOD = "2026-11-06";
