/** Curated set of allowed blog tags. Slugs must match Supabase blog_tags.slug. */
export const CURATED_BLOG_TAGS = [
  { slug: "privacy", name: "Privacy" },
  { slug: "vpn-guide", name: "VPN Guide" },
  { slug: "security", name: "Security" },
  { slug: "censorship", name: "Censorship" },
  { slug: "streaming", name: "Streaming" },
  { slug: "travel", name: "Travel" },
  { slug: "speed", name: "Speed" },
  { slug: "protocol", name: "Protocol" },
  { slug: "setup-guide", name: "Setup Guide" },
  { slug: "news", name: "News" },
  { slug: "comparison", name: "Comparison" },
  { slug: "mobile", name: "Mobile" },
  { slug: "desktop", name: "Desktop" },
  { slug: "router", name: "Router" },
  { slug: "business", name: "Business" },
  { slug: "free-vpn", name: "Free VPN" },
  { slug: "no-logs", name: "No-Logs" },
  { slug: "encryption", name: "Encryption" },
  { slug: "server-network", name: "Server Network" },
  { slug: "tips-and-tricks", name: "Tips & Tricks" },
  { slug: "ai", name: "AI & Technology" },
  { slug: "regulation", name: "Laws & Policy" },
  { slug: "internet", name: "Internet & Networks" },
  { slug: "devices", name: "Apps & Devices" },
  { slug: "vpn", name: "VPN & Encryption" },
] as const;

/** Maps topic_category from editorial pipeline to curated tag slugs */
export const TOPIC_CATEGORY_TAG_MAP: Record<string, string[]> = {
  "vpn-privacy": ["privacy", "vpn", "news"],
  "ai-launches": ["ai", "news"],
  "ai-regulation": ["ai", "regulation", "news"],
  "big-tech": ["ai", "news"],
  "censorship": ["censorship", "privacy", "news"],
  "cybersecurity": ["security", "news"],
  "us-policy": ["regulation", "news"],
};

export const CURATED_TAG_SLUGS: string[] = CURATED_BLOG_TAGS.map((t) => t.slug);
