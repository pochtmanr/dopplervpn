import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/windows/download/:file
 *
 * Redirects to the Windows installer hosted on a public GitHub release.
 * Same-origin path is kept so download links, analytics, and the native
 * app's expectations stay stable even if the hosting location changes.
 *
 * Supported files:
 *   latest-x64                        -> newest windows-v* release, x64
 *   latest-arm64                      -> newest windows-v* release, ARM64
 *   DopplerVPN-<x.y.z>-x64-Setup.exe  -> that exact version (old links keep working)
 *   DopplerVPN-<x.y.z>-arm64-Setup.exe
 *
 * Releasing a new version needs no change here: tag windows-v<x.y.z> on the
 * Windows repo, publish the installers to a windows-v<x.y.z> release on
 * pochtmanr/dopplervpn, and the latest-* aliases pick it up within 5 minutes.
 */

// Canonical host for PUBLIC installer downloads. The Windows sources live on the
// private pochtmanr/dopplerWindows repo, but its release assets need auth, so the
// installers are published to this public repo's releases.
const REPO = "pochtmanr/dopplervpn";
const RELEASE_BASE = `https://github.com/${REPO}/releases/download`;

// Used only if the GitHub API is unreachable while resolving a latest-* alias.
const FALLBACK_VERSION = "1.0.0";

const INSTALLER_RE = /^DopplerVPN-(\d+\.\d+\.\d+)-(x64|arm64)-Setup\.exe$/;
const ALIAS_RE = /^latest-(x64|arm64)$/;

const CACHE_TTL_MS = 5 * 60 * 1000;

type Arch = "x64" | "arm64";

let cachedVersion: { version: string; at: number } | null = null;

/** Highest x.y.z among the repo's windows-v* releases, or null if none resolved. */
async function fetchLatestVersion(): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/releases?per_page=30`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "dopplervpn-landing",
      },
      // Belt and braces alongside the module-level cache: this also keeps us well
      // under GitHub's 60 req/h unauthenticated limit.
      next: { revalidate: 300 },
    }
  );
  if (!res.ok) return null;

  const releases: Array<{
    tag_name?: string;
    draft?: boolean;
    prerelease?: boolean;
  }> = await res.json();

  const versions = releases
    .filter((r) => !r.draft && !r.prerelease)
    .map((r) => /^windows-v(\d+\.\d+\.\d+)$/.exec(r.tag_name ?? "")?.[1])
    .filter((v): v is string => Boolean(v));

  if (versions.length === 0) return null;

  // GitHub orders by creation date; sort by semver so a late-published patch of an
  // older line can't masquerade as the newest.
  versions.sort((a, b) => {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
  });

  return versions[0];
}

async function resolveLatestVersion(): Promise<string> {
  const now = Date.now();
  if (cachedVersion && now - cachedVersion.at < CACHE_TTL_MS) {
    return cachedVersion.version;
  }

  try {
    const version = await fetchLatestVersion();
    if (version) {
      cachedVersion = { version, at: now };
      return version;
    }
  } catch {
    // fall through
  }

  // Never break downloads because the GitHub API had a bad minute. Serve a stale
  // hit if we have one, otherwise the last known-good release.
  return cachedVersion?.version ?? FALLBACK_VERSION;
}

function installerUrl(version: string, arch: Arch): string {
  return `${RELEASE_BASE}/windows-v${version}/DopplerVPN-${version}-${arch}-Setup.exe`;
}

type RouteContext = { params: Promise<{ file: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { file } = await context.params;

  const alias = ALIAS_RE.exec(file);
  if (alias) {
    const arch = alias[1] as Arch;
    const version = await resolveLatestVersion();
    // Never stream the binary through Vercel — it burns Fast Origin Transfer quota.
    return NextResponse.redirect(installerUrl(version, arch), {
      status: 302,
      // Short cache: a new release should go live within minutes, not hours.
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
  }

  const exact = INSTALLER_RE.exec(file);
  if (exact) {
    const [, version, arch] = exact;
    // Version-derived tag, so links minted for older releases keep resolving.
    return NextResponse.redirect(installerUrl(version, arch as Arch), 302);
  }

  return NextResponse.json({ error: `File "${file}" not found` }, { status: 404 });
}
