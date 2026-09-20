import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { BLOG_LOCALES } from "@/i18n/blog-locales";
import { safeCompare } from "@/lib/api-auth";

/**
 * On-demand ISR flush for the blog.
 *
 * Both blog routes are `export const revalidate = 86400`, so without this a
 * newly published post — or a freshly translated locale — stays invisible to
 * the public for up to 24 hours. `doppler-admin` calls this whenever a post or
 * a translation is saved.
 *
 * Auth is a shared secret in `x-revalidate-secret` rather than the blog API
 * key: this is a cache-control endpoint, not a write path, and it should not
 * require handing out a key that can create posts.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  // Return rather than throw. An unset env var means "nobody can call this",
  // which is a 401 — not a 500. Throwing would turn a config mistake into an
  // opaque server error.
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 401 });
  }

  const provided = request.headers.get("x-revalidate-secret");
  if (!provided || !safeCompare(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let slug: string | undefined;
  try {
    const body = await request.json();
    if (typeof body?.slug === "string" && body.slug.length > 0) {
      slug = body.slug;
    }
  } catch {
    // No body, or not JSON. Flushing just the index is a valid request.
  }

  // Only the 21 blog locales. The site has 44, but the other 23 308-redirect
  // /{locale}/blog/* to /en/blog/* in middleware, so they have nothing cached
  // to flush.
  const paths: string[] = [];
  for (const locale of BLOG_LOCALES) {
    paths.push(`/${locale}/blog`);
    if (slug) paths.push(`/${locale}/blog/${slug}`);
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  // The blog index and the sitemap read through unstable_cache with these
  // tags. Without flushing them a new post or locale stays out of the index
  // listing and the sitemap for up to another 24h after the pages refresh.
  revalidateTag("blog-index");
  revalidateTag("sitemap");

  return NextResponse.json({
    revalidated: paths.length,
    slug: slug ?? null,
  });
}
