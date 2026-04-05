import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["next-intl"],
  },
  async redirects() {
    return [
      {
        source: "/download",
        destination: "/en/downloads",
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
    ],
  },
};

export default withNextIntl(nextConfig);
