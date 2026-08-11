import type { MetadataRoute } from "next";

const DEFAULT_DISALLOW = [
  "/admin-dvpn",
  "/checkout",
  "/api/admin/",
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
// ChatGPT Search, Claude, Perplexity, and Google AI Overviews. These cite
// sources, so a crawl can turn into a referral.
const AI_USER_AGENTS = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "OAI-SearchBot",
];

// Crawlers that take the whole site and send nothing back. They scrape for
// training corpora rather than for answers with citations, so there is no AEO
// upside to offset the crawl.
//
// The site is a 44-locale surface of ~3,600 URLs. In Aug 2026 these bots were
// sweeping all of it repeatedly — 36K middleware invocations and ~4,000
// distinct URLs in 24h against ~9 real human visitors a day, which is what
// drove the Vercel bill. Bytespider in particular is known for ignoring
// crawl-delay and bursting.
//
// robots.txt is advisory: this stops only the polite instances. The Vercel WAF
// carries the enforcement for the rest — keep the two in sync.
const BLOCKED_AI_USER_AGENTS = ["CCBot", "Bytespider", "meta-externalagent"];

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
      ...BLOCKED_AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        disallow: ["/"],
      })),
    ],
    sitemap: "https://www.dopplervpn.org/sitemap.xml",
    host: "https://www.dopplervpn.org",
  };
}
