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
  // Blog index filter/pagination variants. They all canonicalise to the bare
  // /<locale>/blog (see [locale]/blog/page.tsx) and every post is already
  // listed in the sitemap shards, so crawling them adds nothing but requests.
  "/*?tag=",
  "/*?page=",
];

// AI agents that send traffic back: they answer a user's question and cite the
// source, so a crawl can turn into a referral. These stay welcome.
//
// Note the split within each vendor — the training crawler and the answering
// agent are different user agents:
//   OpenAI      GPTBot (training)  vs  OAI-SearchBot / ChatGPT-User (answers)
//   Anthropic   ClaudeBot (training) vs Claude-User / Claude-SearchBot (answers)
// Blocking the training half costs zero referral traffic.
const AI_USER_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Claude-User",
  "Claude-SearchBot",
];

// Crawlers that take the whole site and send nothing back. They scrape for
// training corpora rather than for answers with citations, so there is no AEO
// upside to offset the crawl.
//
// The site is a 44-locale surface of ~3,600 URLs. In Aug 2026 these bots were
// sweeping all of it repeatedly — 36K middleware invocations and ~4,000
// distinct URLs in 24h against ~9 real human visitors a day, which is what
// drove the Vercel bill. On 2026-08-12 GPTBot alone burned ~$2 in 12h, which
// is why it moved from the allow list to this one. Bytespider in particular is
// known for ignoring crawl-delay and bursting.
//
// `Google-Extended` governs Gemini *training* only — it has no effect on
// Google Search crawling, indexing, or ranking, which is driven by Googlebot
// under the `*` rule below.
//
// Meta documents five crawlers; only the three AI ones are listed here:
//   meta-externalagent    AI training                    → blocked
//   meta-externalfetcher  agentic AI, user-requested     → blocked
//   meta-webindexer       Meta AI search quality         → blocked
//   meta-externalads      ad + business products         → NOT blocked, we run
//                         paid campaigns and this crawler reviews landing pages
//   facebookexternalhit   link-preview unfurler          → NOT blocked, this is
//                         what renders the card when someone shares a URL on
//                         Facebook / Messenger / WhatsApp
// Blocking either of the last two would break something we actually use.
//
// robots.txt is advisory: this stops only the polite instances. Enforcement is
// the Vercel WAF's AI Bots managed ruleset (Deny) plus a bypass custom rule for
// the AI_USER_AGENTS above — keep the two lists in sync.
const BLOCKED_AI_USER_AGENTS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "meta-externalfetcher",
  "meta-webindexer",
  "Amazonbot",
  "Applebot-Extended",
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
      // Citation agents get the English surface only (~130 URLs instead of
      // ~3,600). The other 43 locales are machine translations of the same
      // pages — no extra citation value, 43× the crawl. Longest-match wins in
      // robots.txt, so `Allow: /en/` overrides the blanket `Disallow: /`.
      // Search engines are unaffected: this rule does not apply to `*`.
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: ["/en/", "/$", ...AGENT_ALLOW],
        disallow: ["/", ...DEFAULT_DISALLOW],
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
