import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { translateContent } from "@/lib/ai/translate";

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { post_id, locale } = await request.json();

  if (!post_id || !locale) {
    return NextResponse.json(
      { error: "post_id and locale are required" },
      { status: 400 }
    );
  }

  if (locale === "en") {
    return NextResponse.json(
      { error: "Cannot translate to English (source language)" },
      { status: 400 }
    );
  }

  const db = createAdminClient();

  // Fetch the EN source translation
  const { data: enTranslation, error: fetchError } = await db
    .from("blog_post_translations")
    .select(
      "title, excerpt, content, image_alt, meta_title, meta_description, og_title, og_description"
    )
    .eq("post_id", post_id)
    .eq("locale", "en")
    .single();

  if (fetchError || !enTranslation) {
    return NextResponse.json(
      { error: "English source translation not found" },
      { status: 404 }
    );
  }

  // Log the job as processing
  const { data: job } = await db
    .from("translation_jobs")
    .insert({
      post_id,
      locale,
      status: "processing" as const,
      model: "gpt-4o-mini",
    })
    .select("id")
    .single();

  try {
    const result = await translateContent(enTranslation, locale);

    // Upsert the translation (truncate SEO fields to fit DB constraints)
    const { error: upsertError } = await db
      .from("blog_post_translations")
      .upsert(
        {
          post_id,
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
      throw new Error(upsertError.message);
    }

    // Mark job as completed
    if (job) {
      await db
        .from("translation_jobs")
        .update({
          status: "completed" as const,
          tokens_used: result.tokensUsed,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }

    return NextResponse.json({
      success: true,
      locale,
      tokensUsed: result.tokensUsed,
    });
  } catch (err) {
    console.error("[translate] Error:", err);
    const message = err instanceof Error ? err.message : "Translation failed";

    // Mark job as failed
    if (job) {
      await db
        .from("translation_jobs")
        .update({
          status: "failed" as const,
          error_message: message,
        })
        .eq("id", job.id);
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
