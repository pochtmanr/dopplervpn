/** Edge-safe, public existence check before Next commits streaming headers. */
export async function publishedBlogTranslationExists(locale: string, slug: string): Promise<boolean> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) throw new Error("Public blog database is not configured");
  const url = new URL("/rest/v1/blog_posts", base);
  url.search = new URLSearchParams({
    select: "id,blog_post_translations!inner(locale)",
    slug: `eq.${slug}`, status: "eq.published",
    "blog_post_translations.locale": `eq.${locale}`, limit: "1",
  }).toString();
  const response = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Public blog database is unavailable");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error("Unexpected blog database response");
  return rows.length > 0;
}

/** A paginated archive beyond the catalogue must not become a soft 404. */
export async function publishedBlogArchivePageExists(locale: string, page: number): Promise<boolean> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) throw new Error("Public blog database is not configured");
  const url = new URL("/rest/v1/blog_posts", base);
  url.search = new URLSearchParams({
    select: "id,blog_post_translations!inner(locale)", status: "eq.published",
    "blog_post_translations.locale": `eq.${locale}`, limit: "1", offset: String((page - 1) * 18),
  }).toString();
  const response = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Public blog database is unavailable");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error("Unexpected blog database response");
  return rows.length > 0;
}

export interface BlogTranslationVersion {
  locale: string;
  updated_at: string | null;
}

/**
 * Advertise only translations updated at or after a reviewed English revision.
 * An explicit visible correction/update notice opts in. Legacy timestamps alone
 * cannot prove factual divergence. This version signal does
 * not revoke existing URLs; old pages can remain reachable while refreshed.
 */
export function hasReviewedEnglishRevision(content: string | null | undefined): boolean {
  return /(?:^|\n)\*\*(?:Correction|Updated), [^\n]{1,80}:\*\*/.test(content ?? "");
}

export function currentBlogTranslations<T extends BlogTranslationVersion>(translations: readonly T[], revisedEnglishContent?: string | null): T[] {
  if (!hasReviewedEnglishRevision(revisedEnglishContent)) return [...translations];
  const english = translations.find((translation) => translation.locale === "en");
  const baseline = english?.updated_at ? Date.parse(english.updated_at) : NaN;
  return translations.filter((translation) => {
    if (translation.locale === "en") return true;
    const updated = translation.updated_at ? Date.parse(translation.updated_at) : NaN;
    return Number.isFinite(baseline) && Number.isFinite(updated) && updated >= baseline;
  });
}
