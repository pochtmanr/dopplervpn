import { NextRequest, NextResponse, after } from "next/server";
import { CLICK_ID_SOURCE_COOKIE, readClickIdCookie } from "@/lib/click-id";
import { firePostback } from "@/lib/postback";

/**
 * GET /api/windows/download/:file
 *
 * Redirects to the Windows installer hosted on a public GitHub release.
 * Same-origin path is kept so download links, analytics, and the native
 * app's expectations stay stable even if the hosting location changes.
 *
 * Supported files:
 *   latest-x64                        -> newest windows-v* release, x64
 *   latest-arm64                      -> the SAME x64 installer (see below)
 *   DopplerVPN-<x.y.z>-x64-Setup.exe  -> that exact version (old links keep working)
 *   DopplerVPN-<x.y.z>-arm64-Setup.exe-> that exact version, if it had an ARM64 build
 *
 * ARM64. Doppler for Windows is x64 only from v11 — the data path is xray-core's
 * native tun inbound over Wintun, and no ARM64 build of that payload has been
 * verified on a device. `latest-arm64` therefore resolves to the x64 installer
 * rather than 404ing: Windows 11 on ARM emulates x64, so the download works,
 * whereas an ARM64 asset that does not exist would send the user to a GitHub 404
 * with nothing in our logs to explain it. The alias is kept alive rather than
 * removed because it is baked into links already in the wild.
 *
 * The one group this does not serve: **Windows 10 on ARM before 21H2**, which
 * emulates x86 only, not x64. Those machines cannot run this installer at all.
 * They are pre-2021 ARM devices, they keep whatever build they have installed,
 * and the alternative — shipping an ARM64 tunnel nobody has run on a device —
 * would be worse than leaving them where they are.
 *
 * Exact versioned ARM64 filenames still resolve to their own release, so links
 * minted while ARM64 builds were published keep working.
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
// Keep in step with the newest published windows-v* release — and bump it only
// AFTER that release actually exists on pochtmanr/dopplervpn, or a GitHub outage
// sends every visitor to a download URL for a build nobody published.
const FALLBACK_VERSION = "1.0.1";

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

/**
 * A download click is the conversion event for the paid Windows campaign. Every
 * download button on the site points at this route, so reporting it here covers
 * the homepage hero, /downloads, /vpn-for-windows, the footer and the sticky CTA
 * without touching any button markup.
 *
 * Runs in `after()` so a slow tracker never delays the user's redirect. Returns
 * whether a conversion was reported, because that has to change the caching of
 * the response — see cacheHeaders below.
 */
function reportDownloadConversion(req: NextRequest, arch: Arch): boolean {
  const clickId = readClickIdCookie(req);
  if (!clickId) return false;

  after(() =>
    firePostback({
      clickId,
      goal: "download",
      meta: {
        source: req.cookies.get(CLICK_ID_SOURCE_COOKIE)?.value ?? null,
        arch,
        pagePath: req.headers.get("referer"),
      },
    })
  );
  return true;
}

/**
 * Organic downloads keep the shared 5-minute cache. Attributed ones must not be
 * cached at all: a CDN hit would serve the redirect without running this handler,
 * so every conversion after the first in a window would go unreported — and the
 * response is per-visitor anyway once a click id is involved.
 */
function cacheHeaders(attributed: boolean): Record<string, string> {
  return {
    "Cache-Control": attributed
      ? "private, no-store"
      : "public, max-age=300, s-maxage=300",
  };
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { file } = await context.params;

  const alias = ALIAS_RE.exec(file);
  if (alias) {
    // What the visitor asked for, kept for the conversion report so campaign data
    // still shows which architecture people are on.
    const requested = alias[1] as Arch;
    // What they get: there is one build. See the ARM64 note at the top of the file.
    const arch: Arch = "x64";
    const version = await resolveLatestVersion();
    const attributed = reportDownloadConversion(req, requested);
    // Never stream the binary through Vercel — it burns Fast Origin Transfer quota.
    return NextResponse.redirect(installerUrl(version, arch), {
      status: 302,
      // Short cache: a new release should go live within minutes, not hours.
      headers: cacheHeaders(attributed),
    });
  }

  const exact = INSTALLER_RE.exec(file);
  if (exact) {
    const [, version, arch] = exact;
    const attributed = reportDownloadConversion(req, arch as Arch);
    // Version-derived tag, so links minted for older releases keep resolving.
    return NextResponse.redirect(installerUrl(version, arch as Arch), {
      status: 302,
      headers: cacheHeaders(attributed),
    });
  }

  return NextResponse.json({ error: `File "${file}" not found` }, { status: 404 });
}
