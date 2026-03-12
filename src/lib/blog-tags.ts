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
] as const;

export const CURATED_TAG_SLUGS: string[] = CURATED_BLOG_TAGS.map((t) => t.slug);
