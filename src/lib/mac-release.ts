/**
 * The direct-download (Developer ID) Mac build: where it is published and how
 * the two routes that hand it out read it.
 *
 * Published as `mac-v<x.y.z>` releases on the PUBLIC pochtmanr/dopplervpn repo,
 * next to the android-v* and windows-v* ones, by doppler-apple/scripts/release-mac.sh.
 * Each release carries one `.dmg` and, in its body, the line Sparkle's
 * `sign_update` prints for that file:
 *
 *   sparkle:edSignature="<base64>" length="<bytes>"
 *
 * The appcast (/api/mac/appcast.xml) needs both values and cannot compute the
 * signature itself — the EdDSA private key lives only in the release machine's
 * Keychain — so the release body is where they travel. A release without that
 * line is still downloadable from the website; it is simply never offered as an
 * in-app update, because an unsigned enclosure is one Sparkle refuses anyway.
 */

export const MAC_REPO = "pochtmanr/dopplervpn";
export const MAC_TAG_PREFIX = "mac-v";
export const MAC_MIN_SYSTEM_VERSION = "15.0";

const VERSION_RE = new RegExp(`^${MAC_TAG_PREFIX}(\\d+\\.\\d+\\.\\d+)$`);
const SIGNATURE_RE = /sparkle:edSignature="([^"]+)"\s+length="(\d+)"/;

export type MacRelease = {
  version: string;
  /** CFBundleVersion of the build, from `build=<n>` in the release body; null if absent. */
  build: string | null;
  dmgName: string;
  dmgUrl: string;
  size: number | null;
  edSignature: string | null;
  signedLength: number | null;
  publishedAt: string | null;
  notesUrl: string | null;
};

type GitHubRelease = {
  tag_name?: string;
  draft?: boolean;
  prerelease?: boolean;
  body?: string | null;
  published_at?: string;
  html_url?: string;
  assets?: Array<{ name?: string; size?: number; browser_download_url?: string }>;
};

/** Pure: newest non-draft mac-v* release with a .dmg asset, or null. Exported for tests. */
export function pickMacRelease(releases: GitHubRelease[]): MacRelease | null {
  const candidates = releases
    .filter((r) => !r.draft && !r.prerelease)
    .map((r) => ({ r, version: VERSION_RE.exec(r.tag_name ?? "")?.[1] }))
    .filter((c): c is { r: GitHubRelease; version: string } => Boolean(c.version))
    .sort((a, b) => {
      const pa = a.version.split(".").map(Number);
      const pb = b.version.split(".").map(Number);
      return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
    });

  for (const { r, version } of candidates) {
    const dmg = (r.assets ?? []).find((a) => a.name?.toLowerCase().endsWith(".dmg"));
    if (!dmg?.name) continue;
    const sig = SIGNATURE_RE.exec(r.body ?? "");
    const build = /\bbuild=(\d+)\b/.exec(r.body ?? "")?.[1] ?? null;
    return {
      version,
      build,
      dmgName: dmg.name,
      dmgUrl:
        dmg.browser_download_url ??
        `https://github.com/${MAC_REPO}/releases/download/${r.tag_name}/${dmg.name}`,
      size: dmg.size ?? null,
      edSignature: sig?.[1] ?? null,
      signedLength: sig ? Number(sig[2]) : null,
      publishedAt: r.published_at ?? null,
      notesUrl: r.html_url ?? null,
    };
  }
  return null;
}

export async function fetchLatestMacRelease(): Promise<MacRelease | null> {
  const res = await fetch(`https://api.github.com/repos/${MAC_REPO}/releases?per_page=30`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "dopplervpn-landing",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return pickMacRelease((await res.json()) as GitHubRelease[]);
}
