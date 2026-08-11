import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";

// Static CSP (no nonces — nonces would force dynamic rendering and kill the
// statically generated marketing pages). 'unsafe-inline' is unavoidable:
// Next.js hydration, next-themes' theme script, and JSON-LD all inline
// scripts, and experimental.inlineCss inlines styles. The policy's value is
// origin allowlisting: only self, Vercel Analytics, and Revolut Checkout
// (embed.js + popup iframes; sandbox origin kept for REVOLUT_ENVIRONMENT).
// 'unsafe-eval' is dev-only (React Refresh needs it).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com https://merchant.revolut.com https://sandbox-merchant.revolut.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://va.vercel-scripts.com https://merchant.revolut.com https://sandbox-merchant.revolut.com",
  "frame-src https://merchant.revolut.com https://sandbox-merchant.revolut.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["next-intl"],
    // Inline CSS into the HTML <head> so the two stylesheet requests no longer
    // block first paint (PSI: render-blocking CSS, ~720ms). Also surfaces the
    // @font-face rules immediately, shortening the font critical-path chain.
    inlineCss: true,
  },
  async rewrites() {
    return [
      // /sitemap.xml is the canonical URL referenced by robots.ts + GSC, but
      // serving it from src/app/sitemap.xml/route.ts conflicts in dev with
      // sitemap.ts's metadata route (both share the `sitemap.xml` segment).
      // The custom index handler lives at /sitemap-index and is rewritten
      // here so the public URL stays /sitemap.xml.
      { source: "/sitemap.xml", destination: "/sitemap-index" },
    ];
  },
  async redirects() {
    return [
      {
        source: "/download",
        destination: "/en/downloads",
        permanent: true,
      },
      {
        source: "/checkout/success",
        destination: "/en/checkout/success",
        permanent: true,
      },
      {
        source: "/:locale/download",
        destination: "/:locale/downloads",
        permanent: true,
      },
      {
        source: "/:locale/apps",
        destination: "/:locale/downloads",
        permanent: true,
      },
      // /subscribe was moved to /account (Mar 2026). GSC Coverage
      // 2026-04-17 shows 11 locale variants still being crawled as 404.
      {
        source: "/:locale/subscribe",
        destination: "/:locale/account",
        permanent: true,
      },
      {
        source: "/subscribe",
        destination: "/en/account",
        permanent: true,
      },
      {
        source: "/downloads/doppler-vpn-v1.2.0.apk",
        destination:
          "https://github.com/pochtmanr/dopplerland/releases/download/v1.2.0-android/doppler-vpn-v1.2.0.apk",
        permanent: false,
      },
      // Old URL redirects
      {
        source: "/:locale/guide/:device",
        destination: "/:locale/downloads",
        permanent: true,
      },
      {
        source: "/:locale/guide",
        destination: "/:locale/downloads",
        permanent: true,
      },
      // Non-locale versions
      {
        source: "/guide/:device",
        destination: "/en/downloads",
        permanent: true,
      },
      {
        source: "/guide",
        destination: "/en/downloads",
        permanent: true,
      },
      // Unprefixed page slugs (no /:locale) used to render the English
      // homepage at HTTP 200 (i18n fallback), creating duplicate soft-404
      // clones. 301 them to the canonical /en/* URL to recover any legacy
      // link equity; genuine garbage (not in this list, not a locale) falls
      // through to the [locale] layout's notFound() → 404. Keep this slug set
      // in sync with the top-level page dirs under app/[locale] (and the
      // staticPages list in sitemap.ts).
      {
        source:
          "/:slug(downloads|privacy|terms|refund|dpa|subprocessors|blog|support|about|security|bypass-censorship|giveaway|no-registration-vpn|pay-with-crypto|vless-vpn|vless-vpn-android|vpn-for-ios|vpn-for-android|vpn-for-macos|vpn-for-windows|vpn-for-uae|vpn-for-iran|vpn-for-china|vpn-for-russia|vpn-for-turkey|vpn-for-telegram-calls-uae|vpn-for-whatsapp-calls-uae|vpn-for-instagram-russia|vpn-for-travelers-china|vpn-for-tiktok-ban|vpn-for-public-wifi-iphone|tools)",
        destination: "/en/:slug",
        permanent: true,
      },
      {
        source:
          "/:slug(downloads|privacy|terms|refund|dpa|subprocessors|blog|support|about|security|bypass-censorship|giveaway|no-registration-vpn|pay-with-crypto|vless-vpn|vless-vpn-android|vpn-for-ios|vpn-for-android|vpn-for-macos|vpn-for-windows|vpn-for-uae|vpn-for-iran|vpn-for-china|vpn-for-russia|vpn-for-turkey|vpn-for-telegram-calls-uae|vpn-for-whatsapp-calls-uae|vpn-for-instagram-russia|vpn-for-travelers-china|vpn-for-tiktok-ban|vpn-for-public-wifi-iphone|tools)/:rest+",
        destination: "/en/:slug/:rest+",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
      {
        // Apple Pay domain verification (served from public/.well-known/)
        source: "/.well-known/apple-developer-merchantid-domain-association",
        headers: [
          { key: "Content-Type", value: "text/plain" },
        ],
      },
      // Vercel serves everything in public/ as `max-age=0, must-revalidate` by
      // default, so the browser re-validates every file on every navigation.
      // A 304 is still a billed edge request, and `x-vercel-cache: HIT` does
      // not change that. With ~44 flag SVGs rendered per page (see
      // layout/desktop-nav.tsx) this was the dominant per-view request
      // multiplier. These files are not content-hashed, so anything given a
      // long TTL must be renamed rather than edited in place to roll out.
      // Order matters: every matching rule is applied and the LAST value for a
      // given header key wins, so the broad rule goes first and the narrower
      // /flags override goes after it.
      {
        // Art and icons change occasionally — a day of browser caching kills
        // the revalidation storm while keeping edits visible within 24h.
        source: "/:path(images/.*|fonts/.*|.*\\.(?:png|jpg|jpeg|webp|avif|svg|woff2?))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        // Flag SVGs are keyed by ISO code and never change content, so they can
        // be cached indefinitely. Adding a flag means adding a new filename,
        // which sidesteps the no-content-hash caveat above.
        source: "/flags/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Security headers for all routes
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
  images: {
    // Every optimized <Image> in the app points at a local /images/* file.
    // The only remote images are blog OG art, and those render with
    // `unoptimized` (see [locale]/blog/[slug]/page.tsx and blog/blog-card.tsx),
    // which bypasses /_next/image entirely — the live blog already serves
    // images from hosts that were never in this list. So the 19 external
    // hostnames that used to live here were dead config.
    //
    // They were not harmless dead config. Every hostname here is a host an
    // attacker can hand to /_next/image, and the list included **.cloudfront.net,
    // **.amazonaws.com, **.wp.com and **.wordpress.com — anyone can get a
    // subdomain on all four. That made the optimizer an open image proxy with
    // an unbounded URL space: every unique URL is a cache MISS, a billed edge
    // request, and a transformation. Verified Aug 2026 (a fabricated
    // cloudfront URL returned 502 "tried to fetch" rather than 400 "rejected")
    // and it is the best explanation for the 4.1K-requests-in-50-minutes spike.
    //
    // Keep this list minimal. Do not re-add a wildcard hostname.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fzlrhmjdjjzcgstaeblu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Bound the optimizer's URL space. Left at defaults, `w` and `q` accept a
    // wide range of combinations, so a scripted caller can mint endless unique
    // cache-missing URLs. No component passes a `quality` prop, so 75 (the
    // next/image default) is the only value ever legitimately requested.
    localPatterns: [{ pathname: "/images/**" }],
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [32, 64, 128, 256],
    qualities: [75],
    minimumCacheTTL: 31536000,
  },
};

export default withNextIntl(nextConfig);
