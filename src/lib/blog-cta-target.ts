export type BlogCtaKind = "downloads" | "install" | "landing" | "product";

export interface BlogCtaTarget {
  href: string;
  kind: BlogCtaKind;
}

function target(href: string, kind: BlogCtaKind): BlogCtaTarget {
  return { href, kind };
}

const SLUG_TARGETS: Record<string, BlogCtaTarget> = {
  "how-to-bypass-internet-censorship-2026": target("/bypass-censorship", "product"),
  "what-is-vless": target("/vless-vpn", "product"),
  "vless-reality-explained": target("/vless-vpn", "product"),
  "vless-reality-vs-wireguard": target("/vless-vpn", "product"),
  "vless-uri-format": target("/vless-vpn", "product"),
  "censorship-protocol-history": target("/bypass-censorship", "product"),
};

const TAG_TARGETS: Record<string, BlogCtaTarget> = {
  china: target("/vpn-for-china", "landing"),
  russia: target("/vpn-for-russia", "landing"),
  iran: target("/vpn-for-iran", "landing"),
  uae: target("/vpn-for-uae", "landing"),
  turkey: target("/vpn-for-turkey", "landing"),
  "how-to": target("/install", "install"),
  install: target("/install", "install"),
  setup: target("/install", "install"),
  protocols: target("/vless-vpn", "product"),
  vless: target("/vless-vpn", "product"),
  censorship: target("/bypass-censorship", "product"),
  pricing: target("/#pricing", "product"),
};

const DEFAULT_TARGET = target("/downloads", "downloads");

/** Pick a contextual CTA for a blog post from slug, then tags, then downloads. */
export function resolveBlogCtaTarget(input: {
  slug: string;
  tagSlugs: readonly string[];
}): BlogCtaTarget {
  const bySlug = SLUG_TARGETS[input.slug];
  if (bySlug) return bySlug;

  for (const tag of input.tagSlugs) {
    const byTag = TAG_TARGETS[tag];
    if (byTag) return byTag;
  }

  return DEFAULT_TARGET;
}
