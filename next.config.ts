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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fzlrhmjdjjzcgstaeblu.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "**.pexels.com",
      },
      // Blog source sites (OG images)
      {
        protocol: "https",
        hostname: "**.asiatimes.com",
      },
      {
        protocol: "https",
        hostname: "**.eff.org",
      },
      {
        protocol: "https",
        hostname: "**.restofworld.org",
      },
      {
        protocol: "https",
        hostname: "**.torrentfreak.com",
      },
      {
        protocol: "https",
        hostname: "**.therecord.media",
      },
      {
        protocol: "https",
        hostname: "**.freedomhouse.org",
      },
      {
        protocol: "https",
        hostname: "**.meduza.io",
      },
      {
        protocol: "https",
        hostname: "**.novayagazeta.eu",
      },
      {
        protocol: "https",
        hostname: "**.theins.ru",
      },
      // Common CDNs used by news sites for OG images
      {
        protocol: "https",
        hostname: "**.wp.com",
      },
      {
        protocol: "https",
        hostname: "**.wordpress.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.techcrunch.com",
      },
      {
        protocol: "https",
        hostname: "techcrunch.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
