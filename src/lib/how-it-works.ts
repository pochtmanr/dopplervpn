import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * The /how-it-works articles: one per card of the home section
 * "How Doppler VPN Protects Your Traffic". The fourth card, "Open Internet",
 * points at /tools instead of an article.
 *
 * Each article is two files under content/how-it-works/<slug>/:
 *   <locale>.md         the body (GitHub-flavoured markdown; ```chart <id>```
 *                       fences render the SVG charts in components/how-it-works)
 *   <locale>.meta.json  title, meta, FAQ and sources (typed below)
 * Kept out of messages/*.json on purpose: long prose does not belong in 44
 * key-value files, and nothing in the admin can overwrite these.
 */

export const ARTICLE_SLUGS = ["your-device", "vless-reality-tunnel", "edge-network"] as const;
export type ArticleSlug = (typeof ARTICLE_SLUGS)[number];

export function isArticleSlug(slug: string): slug is ArticleSlug {
  return (ARTICLE_SLUGS as readonly string[]).includes(slug);
}

export interface ArticleSource {
  label: string;
  url: string;
}

export interface ArticleMeta {
  /** Step number on the home flow, 1-3. */
  step: number;
  /** The H1. */
  title: string;
  /** <title>, before seoTitle() appends the brand. */
  metaTitle: string;
  metaDescription: string;
  /** Hero subtitle and hub-card blurb. */
  excerpt: string;
  /** Short label for breadcrumbs, rails and the next-step link. */
  navLabel: string;
  datePublished: string;
  dateModified: string;
  readingMinutes: number;
  faq: Array<{ question: string; answer: string }>;
  sources: ArticleSource[];
}

export interface Article {
  slug: ArticleSlug;
  meta: ArticleMeta;
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "how-it-works");

export async function getArticle(slug: ArticleSlug, locale: string): Promise<Article> {
  const dir = path.join(CONTENT_DIR, slug);
  const [body, metaRaw] = await Promise.all([
    readFile(path.join(dir, `${locale}.md`), "utf8"),
    readFile(path.join(dir, `${locale}.meta.json`), "utf8"),
  ]);
  return { slug, meta: JSON.parse(metaRaw) as ArticleMeta, body };
}

export async function getAllArticleMeta(locale: string) {
  return Promise.all(
    ARTICLE_SLUGS.map(async (slug) => ({ slug, meta: (await getArticle(slug, locale)).meta })),
  );
}

/** The step after this one on the home flow; the last article hands off to /tools. */
export function nextStepHref(slug: ArticleSlug): string {
  const i = ARTICLE_SLUGS.indexOf(slug);
  return i < ARTICLE_SLUGS.length - 1 ? `/how-it-works/${ARTICLE_SLUGS[i + 1]}` : "/tools";
}

/** Heading text → anchor id. Shared by the renderer and the table of contents. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** H2s in document order, ignoring fenced blocks, for the table of contents. */
export function extractH2s(markdown: string): Array<{ id: string; text: string }> {
  const out: Array<{ id: string; text: string }> = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s{0,3}(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*#*$/.exec(line);
    if (m) {
      const text = m[1].replace(/[*_`]/g, "");
      out.push({ id: headingId(text), text });
    }
  }
  return out;
}
