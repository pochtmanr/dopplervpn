import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { GONE_BLOG_SLUGS, parseBlogSlug } from "./lib/blog-gone-slugs";
import { isBlogLocale } from "./i18n/blog-locales";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Force non-www to www with a permanent redirect (308).
  // IMPORTANT: This middleware branch is the ACTUAL workhorse for apex-root
  // redirection. vercel.json has two redirect rules, but the second uses
  // `/:path((?!api/.*)` which does NOT match the empty root path `/`.
  // The first rule in vercel.json covers `/`, but has been returning 307 in
  // practice (see SEO audit 2026-04). If you touch either file, keep the
  // other in sync — see vercel.json and this block together.
  const host = request.headers.get("host") || "";
  if (host === "dopplervpn.org") {
    const url = new URL(request.url);
    url.host = "www.dopplervpn.org";
    return NextResponse.redirect(url, 308);
  }

  // Blog is only translated into 21 of the 44 site locales. Visiting the
  // blog under a non-translated locale used to fall back to English content
  // at a localized URL, creating duplicate pages that Google's "chose
  // different canonical" filter flagged sitewide. Redirect those paths to
  // the English blog so link equity consolidates on one canonical.
  const blogPathMatch = request.nextUrl.pathname.match(
    /^\/([a-z]{2}(?:-[A-Za-z]+)?)(\/blog(?:\/.*)?)$/,
  );
  if (blogPathMatch) {
    const [, pathLocale, blogSuffix] = blogPathMatch;
    if (!isBlogLocale(pathLocale)) {
      const url = request.nextUrl.clone();
      url.pathname = `/en${blogSuffix}`;
      return NextResponse.redirect(url, 308);
    }
  }

  // HTTP 410 Gone for blog posts deleted during the Feb–Apr 2026 cleanup.
  // 410 tells Google "permanently removed, stop re-crawling, drop from index"
  // — recovers crawl budget and speeds de-indexation vs a plain 404.
  const goneSlug = parseBlogSlug(request.nextUrl.pathname);
  if (goneSlug && GONE_BLOG_SLUGS.has(goneSlug)) {
    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><title>410 Gone</title><meta name="robots" content="noindex"></head><body><h1>410 Gone</h1><p>This post has been permanently removed.</p></body></html>`,
      {
        status: 410,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex",
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      },
    );
  }

  // Public routes — i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // i18n routes — must match all locales in src/i18n/routing.ts
    "/",
    "/(en|ru|es|pt|fr|zh|zh-Hant|de|he|fa|ar|hi|id|tr|vi|th|ms|ko|ja|tl|ur|sw|az|pl|uk|bg|bn|ca|cs|da|el|et|fi|hr|hu|it|lt|lv|nb|nl|ro|sk|sl|sv)/:path*",
  ],
};
