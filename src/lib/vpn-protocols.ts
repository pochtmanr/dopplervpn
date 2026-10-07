import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ArticleSource } from "@/lib/how-it-works";

/**
 * The /vpn-protocols reference: one article per protocol a reader meets in VPN
 * app settings, plus "why-vless", the account of why Doppler runs
 * VLESS-Reality. Same storage as /how-it-works (see lib/how-it-works.ts):
 *   content/vpn-protocols/<slug>/<locale>.md         the body
 *   content/vpn-protocols/<slug>/<locale>.meta.json  title, meta, card, apps, FAQ, sources
 * Hand-written and hand-translated; locales are gated by
 * i18n/vpn-protocols-locales.ts.
 */

/** Hub order: what most readers have heard of first, then the circumvention family. */
export const PROTOCOL_SLUGS = [
  "wireguard",
  "openvpn",
  "ikev2",
  "shadowsocks",
  "vmess",
  "trojan",
  "vless-reality",
  "hysteria2",
  "amneziawg",
] as const;
export const ARTICLE_SLUGS = [...PROTOCOL_SLUGS, "why-vless"] as const;
export type ProtocolArticleSlug = (typeof ARTICLE_SLUGS)[number];

export function isProtocolArticleSlug(slug: string): slug is ProtocolArticleSlug {
  return (ARTICLE_SLUGS as readonly string[]).includes(slug);
}

/** 1 = low, 2 = medium, 3 = high. Ratings are editorial, explained in each article. */
export type Rating = 1 | 2 | 3;

export interface ProtocolCard {
  /** First public release or proposal, e.g. "2015". */
  year: string;
  /** Transport on the wire, e.g. "UDP", "TCP + TLS", "QUIC". */
  transport: string;
  /** What an observer sees, e.g. "A VPN handshake", "HTTPS to a real site". */
  looksLike: string;
  /** How hard the protocol is for a censor to identify and block. */
  censorshipResistance: Rating;
  /** Throughput and latency on a normal, unfiltered network. */
  speed: Rating;
  /** Where the protocol is built into the operating system, if anywhere. */
  builtIn: string;
}

export interface ProtocolApp {
  name: string;
  url: string;
  platforms: string;
}

export interface ProtocolArticleMeta {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  navLabel: string;
  datePublished: string;
  dateModified: string;
  readingMinutes: number;
  /** Absent on why-vless, which is not a protocol of its own. */
  card?: ProtocolCard;
  /** Apps that speak this protocol. Independent projects, not endorsements. */
  apps?: ProtocolApp[];
  faq: Array<{ question: string; answer: string }>;
  sources: ArticleSource[];
}

export interface ProtocolArticle {
  slug: ProtocolArticleSlug;
  meta: ProtocolArticleMeta;
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "vpn-protocols");

export async function getProtocolArticle(slug: ProtocolArticleSlug, locale: string): Promise<ProtocolArticle> {
  const dir = path.join(CONTENT_DIR, slug);
  const [body, metaRaw] = await Promise.all([
    readFile(path.join(dir, `${locale}.md`), "utf8"),
    readFile(path.join(dir, `${locale}.meta.json`), "utf8"),
  ]);
  return { slug, meta: JSON.parse(metaRaw) as ProtocolArticleMeta, body };
}

export async function getAllProtocolMeta(locale: string) {
  return Promise.all(
    PROTOCOL_SLUGS.map(async (slug) => ({ slug, meta: (await getProtocolArticle(slug, locale)).meta })),
  );
}

/** Next article in hub order; the last protocol hands off to why-vless, which hands back to the hub. */
export function nextProtocolSlug(slug: ProtocolArticleSlug): ProtocolArticleSlug | null {
  const i = ARTICLE_SLUGS.indexOf(slug);
  return i < ARTICLE_SLUGS.length - 1 ? ARTICLE_SLUGS[i + 1] : null;
}
