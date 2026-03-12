import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { translateContent, SUPPORTED_LOCALES } from "@/lib/openai/translate";
import { requireBlogApiKey } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";

// Allow up to 5 minutes for translating all 20 languages
export const maxDuration = 300;

// POST /api/blog/translate — trigger translations for an existing post
export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { limit: 10, windowMs: 60_000, prefix: 'blog-translate' });
  if (rl) return rl;

  if (!requireBlogApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { post_id, slug, locales } = body;

  if (!post_id && !slug) {
    return NextResponse.json(
      { error: "post_id or slug is required" },
      { status: 400 }
    );
  }

  const db = createAdminClient();

  // Resolve post
  let postId = post_id;
  let postSlug = slug;
  if (!postId) {
    const { data: post } = await db
      .from("blog_posts")
      .select("id, slug")
      .eq("slug", slug)
      .single();
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    postId = post.id;
    postSlug = post.slug;
  } else if (!postSlug) {
    const { data: post } = await db
      .from("blog_posts")
      .select("slug")
      .eq("id", postId)
      .single();
    postSlug = post?.slug || postId;
  }

  // Fetch template_type for translation prompt selection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: postData } = await (db as any)
    .from("blog_posts")
    .select("template_type")
    .eq("id", postId)
    .single();
  const templateType: string = postData?.template_type || "quick-take";

  // Fetch EN source
  const { data: enTranslation } = await db
    .from("blog_post_translations")
    .select(
      "title, excerpt, content, image_alt, meta_title, meta_description, og_title, og_description"
    )
    .eq("post_id", postId)
    .eq("locale", "en")
    .single();

  if (!enTranslation) {
    return NextResponse.json(
      { error: "English source translation not found" },
      { status: 404 }
    );
  }

  // Determine which locales to translate
  const targetLocales = locales && locales.length > 0
    ? locales.filter((l: string) => l !== "en" && SUPPORTED_LOCALES.includes(l))
    : SUPPORTED_LOCALES;

  const baseUrl = "https://www.dopplervpn.org";
  const results: Record<string, string> = {};
  const errors: string[] = [];

  // Process translations in parallel batches of 5 to avoid timeouts
  const BATCH_SIZE = 5;
  for (let i = 0; i < targetLocales.length; i += BATCH_SIZE) {
    const batch = targetLocales.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (locale: string) => {
        const result = await translateContent(enTranslation, locale, templateType);

        const { error: upsertError } = await db.from("blog_post_translations").upsert(
          {
            post_id: postId,
            locale,
            title: result.title?.slice(0, 255),
            excerpt: result.excerpt,
            content: result.content,
            image_alt: result.image_alt,
            meta_title: result.meta_title?.slice(0, 70) || null,
            meta_description: result.meta_description?.slice(0, 160) || null,
            og_title: result.og_title?.slice(0, 70) || null,
            og_description: result.og_description?.slice(0, 200) || null,
          },
          { onConflict: "post_id,locale" }
        );

        if (upsertError) {
          throw new Error(`DB upsert failed: ${upsertError.message}`);
        }

        return locale;
      })
    );

    for (const r of batchResults) {
      if (r.status === "fulfilled") {
        results[r.value] = `${baseUrl}/${r.value}/blog/${postSlug}`;
      } else {
        const locale = batch[batchResults.indexOf(r)];
        const msg = r.reason instanceof Error ? r.reason.message : "Unknown error";
        errors.push(`${locale}: ${msg}`);
      }
    }
  }

  return NextResponse.json({
    post_id: postId,
    slug: postSlug,
    translated: Object.keys(results),
    all_urls: { en: `${baseUrl}/en/blog/${postSlug}`, ...results },
    translation_complete: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  });
}
