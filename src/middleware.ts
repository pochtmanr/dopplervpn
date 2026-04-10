import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

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
