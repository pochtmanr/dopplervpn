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
        source: "/:locale/checkout",
        destination: "/:locale/subscribe",
        permanent: true,
      },
      {
        source: "/:locale/checkout/success",
        destination: "/:locale/subscribe/success",
        permanent: true,
      },
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
      {
        source: "/:locale/delete-account",
        destination: "/:locale/support",
        permanent: true,
      },
      // Non-locale versions
      {
        source: "/checkout",
        destination: "/en/subscribe",
        permanent: true,
      },
      {
        source: "/checkout/success",
        destination: "/en/subscribe/success",
        permanent: true,
      },
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
      {
        source: "/delete-account",
        destination: "/en/support",
        permanent: true,
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
