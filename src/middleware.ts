import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_PAGE_PREFIX = "/admin-dvpn";
const ADMIN_API_PREFIX = "/api/admin";
const ADMIN_LOGIN_PATH = "/admin-dvpn/login";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Force non-www to www with a permanent redirect (308).
  // IMPORTANT: This middleware branch is the ACTUAL workhorse for apex-root
  // redirection. vercel.json has two redirect rules, but the second uses
  // `/:path((?!api/).*)` which does NOT match the empty root path `/`.
  // The first rule in vercel.json covers `/`, but has been returning 307 in
  // practice (see SEO audit 2026-04). If you touch either file, keep the
  // other in sync — see vercel.json and this block together.
  const host = request.headers.get("host") || "";
  if (host === "dopplervpn.org") {
    const url = new URL(request.url);
    url.host = "www.dopplervpn.org";
    return NextResponse.redirect(url, 308);
  }

  const isAdminPage = pathname.startsWith(ADMIN_PAGE_PREFIX);
  const isAdminApi = pathname.startsWith(ADMIN_API_PREFIX);

  if (isAdminPage || isAdminApi) {
    // Allow the login page through without a session
    if (pathname === ADMIN_LOGIN_PATH) {
      return NextResponse.next();
    }

    let response = NextResponse.next({ request });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (isAdminApi) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        );
      }
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the authenticated user is an allowed admin
    const allowedAdmins = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (allowedAdmins.length > 0 && !allowedAdmins.includes((user.email ?? "").toLowerCase())) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Prevent indexing of admin pages
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

    return response;
  }

  // Public routes — i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Admin routes
    "/admin-dvpn/:path*",
    "/api/admin/:path*",
    // i18n routes — must match all locales in src/i18n/routing.ts
    "/",
    "/(en|ru|es|pt|fr|zh|zh-Hant|de|he|fa|ar|hi|id|tr|vi|th|ms|ko|ja|tl|ur|sw|az|pl|uk|bg|bn|ca|cs|da|el|et|fi|hr|hu|it|lt|lv|nb|nl|ro|sk|sl|sv)/:path*",
  ],
};
