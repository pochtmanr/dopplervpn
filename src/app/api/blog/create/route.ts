import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { translateContent, SUPPORTED_LOCALES } from "@/lib/ai/translate";
import { requireBlogApiKey, isAllowedWebhookUrl } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";
import { CURATED_TAG_SLUGS, TOPIC_CATEGORY_TAG_MAP } from "@/lib/blog-tags";

// Allow up to 5 minutes for AI generation + translating all languages
export const maxDuration = 300;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per minute
  const rl = rateLimit(request, { limit: 10, windowMs: 60_000, prefix: 'blog-create' });
  if (rl) return rl;

  // Auth check (timing-safe)
  if (!requireBlogApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    title,
    content,
    slug: customSlug,
    meta_description,
    meta_keywords,
    featured_image,
    source_links,
    category,
    tags,
    auto_translate = true,
    author = "Doppler Team",
    excerpt,
    webhook_url,
    // Editorial strategy fields
    template_type = "quick-take",
    source_combo,
    topic_category,
  } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "title and content are required" },
      { status: 400 }
    );
  }

  const validTemplateTypes = ["quick-take", "analysis", "meme", "roundup"];
  if (template_type && !validTemplateTypes.includes(template_type)) {
    return NextResponse.json(
      { error: `template_type must be one of: ${validTemplateTypes.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate webhook URL against SSRF
  if (webhook_url && !isAllowedWebhookUrl(webhook_url)) {
    return NextResponse.json(
      { error: "Invalid webhook_url: must be HTTPS to a public host" },
      { status: 400 }
    );
  }

  const db = createAdminClient();
  const slug = customSlug || slugify(title);

  // Check slug uniqueness
  const { data: existing } = await db
    .from("blog_posts")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: `Slug "${slug}" already exists` },
      { status: 409 }
    );
  }

  // Create the post
  const { data: post, error: postError } = await db
    .from("blog_posts")
    .insert({
      slug,
      author_name: author,
      status: "published",
      published_at: new Date().toISOString(),
      image_url: featured_image || null,
      template_type,
      source_combo: source_combo || null,
      topic_category: topic_category || null,
    })
    .select("id")
    .single();

  if (postError || !post) {
    return NextResponse.json(
      { error: postError?.message || "Failed to create post" },
      { status: 500 }
    );
  }

  // Build excerpt from content if not provided
  const postExcerpt =
    excerpt ||
    content
      .replace(/[#*_\[\]()]/g, "")
      .slice(0, 200)
      .trim() + "...";

  // Embed source links at bottom of content if provided (and not already present)
  let fullContent = content;
  const alreadyHasSources = /\*\*Sources?:\*\*/i.test(content);
  if (source_links && source_links.length > 0 && !alreadyHasSources) {
    const validLinks = source_links
      .map((link: string | { text?: string; url?: string }) => {
        if (typeof link === "string") {
          const domain = link.replace(/^https?:\/\/(?:www\.)?/, "").split("/")[0];
          return { text: domain, url: link };
        }
        return link;
      })
      .filter((link: { text?: string; url?: string }) => link.url && link.url !== "undefined" && link.url.startsWith("http"))
      .slice(0, 3);

    if (validLinks.length > 0) {
      fullContent += "\n\n---\n\n**Sources:**\n";
      for (const link of validLinks) {
        // Sanitize text and URL to prevent markdown injection
        const safeText = (link.text || "Source").replace(/[\[\]()]/g, "");
        const safeUrl = (link.url as string).replace(/[()]/g, "");
        fullContent += `- [${safeText}](${safeUrl})\n`;
      }
    }
  }

  // Create EN translation
  const { error: transError } = await db
    .from("blog_post_translations")
    .insert({
      post_id: post.id,
      locale: "en" as const,
      title,
      excerpt: postExcerpt,
      content: fullContent,
      meta_title: title.slice(0, 70),
      meta_description: meta_description?.slice(0, 160) || postExcerpt.slice(0, 160),
      og_title: title.slice(0, 70),
      og_description: meta_description?.slice(0, 200) || postExcerpt.slice(0, 200),
    });

  if (transError) {
    await db.from("blog_posts").delete().eq("id", post.id);
    return NextResponse.json({ error: transError.message }, { status: 500 });
  }

  // Collect tag slugs: from explicit tags + topic_category mapping
  const tagSlugs = new Set<string>();

  // Map topic_category to curated tags (primary source for automated posts)
  if (topic_category && TOPIC_CATEGORY_TAG_MAP[topic_category]) {
    for (const slug of TOPIC_CATEGORY_TAG_MAP[topic_category]) {
      tagSlugs.add(slug);
    }
  }

  // Add explicit tags if they match curated slugs
  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      const tagSlug = slugify(tagName);
      if (CURATED_TAG_SLUGS.includes(tagSlug)) {
        tagSlugs.add(tagSlug);
      }
    }
  }

  // Ensure at least "news" tag on automated posts
  if (tagSlugs.size === 0 && template_type) {
    tagSlugs.add("news");
  }

  // Attach tags to post
  for (const tagSlug of tagSlugs) {
    const { data: tag } = await db
      .from("blog_tags")
      .upsert({ slug: tagSlug }, { onConflict: "slug" })
      .select("id")
      .single();

    if (tag) {
      await db.from("blog_post_tags").insert({
        post_id: post.id,
        tag_id: tag.id,
      });
    }
  }

  const baseUrl = "https://www.dopplervpn.org";
  const englishUrl = `${baseUrl}/en/blog/${slug}`;

  // If no auto-translate, return immediately
  if (!auto_translate) {
    return NextResponse.json(
      {
        blog_id: post.id,
        slug,
        english_url: englishUrl,
        status: "published",
        translation_complete: false,
        message: "Post created. Auto-translate disabled.",
      },
      { status: 201 }
    );
  }

  // Translate to all languages sequentially to avoid rate limits
  const translationResults: Record<string, string> = { en: englishUrl };
  const errors: string[] = [];

  const enSource = {
    title,
    excerpt: postExcerpt,
    content: fullContent,
    image_alt: null,
    meta_title: title.slice(0, 70),
    meta_description: meta_description?.slice(0, 160) || postExcerpt.slice(0, 160),
    og_title: title.slice(0, 70),
    og_description: meta_description?.slice(0, 200) || postExcerpt.slice(0, 200),
  };

  // Process translations in parallel batches of 2 (mini model rate limits)
  const BATCH_SIZE = 2;
  for (let i = 0; i < SUPPORTED_LOCALES.length; i += BATCH_SIZE) {
    const batch = SUPPORTED_LOCALES.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (locale: string) => {
        const result = await translateContent(enSource, locale, template_type);

        const { error: upsertError } = await db.from("blog_post_translations").upsert(
          {
            post_id: post.id,
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
        translationResults[r.value] = `${baseUrl}/${r.value}/blog/${slug}`;
      } else {
        const locale = batch[batchResults.indexOf(r)];
        const msg = r.reason instanceof Error ? r.reason.message : "Unknown error";
        errors.push(`${locale}: ${msg}`);
        console.error(`[blog/create] Translation to ${locale} failed:`, msg);
      }
    }
  }

  const response = {
    blog_id: post.id,
    slug,
    template_type,
    english_url: englishUrl,
    russian_url: `${baseUrl}/ru/blog/${slug}`,
    all_urls: translationResults,
    all_languages: Object.keys(translationResults),
    status: "published",
    translation_complete: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };

  // Send webhook if provided (already validated above)
  if (webhook_url) {
    try {
      await fetch(webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });
    } catch (err) {
      console.error("[blog/create] Webhook failed:", err);
    }
  }

  return NextResponse.json(response, { status: 201 });
}
