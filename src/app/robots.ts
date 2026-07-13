import type { MetadataRoute } from "next";

const DEFAULT_DISALLOW = [
  "/admin-dvpn",
  "/checkout",
  "/api/admin/",
  "/api/blog/create",
  "/api/blog/translate",
  "/api/blog/status",
  "/api/checkout/",
  "/api/oxapay/",
  "/api/revolut/",
  "/api/subscribe/",
  "/api/support/",
  "/api/vpn/",
  "/api/account/",
  "/api/promo/",
  "/api/dev/",
  "/api/windows/",
  "/api/waitlist",
  "/auth/",
  "/*?sort=",
  "/*?os=",
  "/*?utm_*",
];

// AI crawlers we want indexing the marketing site so we surface in
// ChatGPT Search, Claude, Perplexity, and Google AI Overviews.
const AI_USER_AGENTS = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "OAI-SearchBot",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  // Explicitly invite crawlers to the agent surface (AEO entry points).
  const AGENT_ALLOW = ["/agents", "/api/agents/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...AGENT_ALLOW],
        disallow: DEFAULT_DISALLOW,
      },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: ["/", ...AGENT_ALLOW],
        disallow: DEFAULT_DISALLOW,
      })),
    ],
    sitemap: "https://www.dopplervpn.org/sitemap.xml",
    host: "https://www.dopplervpn.org",
  };
}
