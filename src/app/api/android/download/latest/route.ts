import { NextRequest, NextResponse, after } from "next/server";
import { CLICK_ID_SOURCE_COOKIE, readClickIdCookie } from "@/lib/click-id";
import { firePostback } from "@/lib/postback";
import { sendServerEvent } from "@/lib/ga-server";

/**
 * GET /api/android/download/latest
 *
 * Serves the standalone (sideload) Android APK — the build that pays through
 * the web checkout instead of Play Billing, for users who have no Google Play.
 *
 * Same-origin by design, exactly like /api/windows/download/*: the link handed
 * to users, printed in the Telegram bot and counted in analytics never changes,
 * whatever is actually storing the bytes.
 *
 * ## Two delivery modes, switched by env, no code change
 *
 * `ANDROID_APK_SOURCE`:
 *   - `github` (default) — 302 to a release asset on the PUBLIC pochtmanr/dopplervpn
 *     repo. Costs us nothing; GitHub's CDN does the work.
 *   - `proxy` — stream the bytes from `ANDROID_APK_ORIGIN_URL` through this
 *     domain.
 *
 * The reason both exist: the sideload build's whole audience is behind national
 * filtering, and GitHub's asset host is throttled or blocked in some of exactly
 * those places. A redirect to a host the user cannot reach is a broken download,
 * so `proxy` trades money for reachability — the visitor only has to be able to
 * reach www.dopplervpn.org, which they demonstrably can, since they just loaded
 * the page with the button on it.
 *
 * `proxy` is deliberately NOT the default. Streaming ~45 MB per download through
 * Vercel burns Fast Origin Transfer, which is the same class of mistake that
 * once put an open image proxy on this site's bill. Turn it on only against
 * evidence that GitHub does not work for the audience, and point
 * ANDROID_APK_ORIGIN_URL at the cheapest host that is actually reachable.
 */

const REPO = "pochtmanr/dopplervpn";
const RELEASE_BASE = `https://github.com/${REPO}/releases/download`;
const TAG_PREFIX = "android-v";

/**
 * Used only if the GitHub API is unreachable while resolving the latest tag.
 *
 * Keep in step with the newest published android-v* release — and bump it only
 * AFTER that release actually exists on pochtmanr/dopplervpn, or a GitHub outage
 * sends every visitor to a download URL for a build nobody published. Null is a
 * legitimate value here: it makes the route answer 503 rather than hand out a
 * link that 404s.
 */
const FALLBACK_VERSION: string | null = "1.8.0";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedVersion: { version: string; at: number } | null = null;

/** Highest x.y.z among the repo's android-v* releases, or null if none resolved. */
async function fetchLatestVersion(): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/releases?per_page=30`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "dopplervpn-landing",
      },
      next: { revalidate: 300 },
    }
  );
  if (!res.ok) return null;

  const releases: Array<{
    tag_name?: string;
    draft?: boolean;
    prerelease?: boolean;
  }> = await res.json();

  // The Windows installers live on this same repo under windows-v* tags, so the
  // tag prefix — not "the newest release" — is what identifies an Android build.
  const versions = releases
    .filter((r) => !r.draft && !r.prerelease)
    .map((r) => new RegExp(`^${TAG_PREFIX}(\\d+\\.\\d+\\.\\d+)$`).exec(r.tag_name ?? "")?.[1])
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

async function resolveLatestVersion(): Promise<string | null> {
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

  return cachedVersion?.version ?? FALLBACK_VERSION;
}

function apkFileName(version: string): string {
  return `doppler-vpn-${TAG_PREFIX}${version}.apk`;
}

function githubUrl(version: string): string {
  return `${RELEASE_BASE}/${TAG_PREFIX}${version}/${apkFileName(version)}`;
}

/** See the identical note in the Windows route — same funnel, same reasoning. */
function reportDownloadConversion(req: NextRequest): boolean {
  const clickId = readClickIdCookie(req);
  if (!clickId) return false;

  after(() =>
    firePostback({
      clickId,
      goal: "download",
      meta: {
        source: req.cookies.get(CLICK_ID_SOURCE_COOKIE)?.value ?? null,
        arch: "android",
        pagePath: req.headers.get("referer"),
      },
    })
  );
  return true;
}

function reportDownloadToGa(
  req: NextRequest,
  version: string,
  attributed: boolean,
  mode: string
) {
  after(() =>
    sendServerEvent(
      {
        name: "android_apk_download_served",
        params: {
          version,
          attributed,
          mode,
          page_path: req.headers.get("referer") ?? "",
        },
      },
      req.cookies.get("_ga")?.value
    )
  );
}

/**
 * Never cached, for the same reason as the Windows route: a CDN hit would serve
 * the response without running this handler, and every conversion report inside
 * it would silently go missing after the first request in the window.
 */
const NO_STORE = { "Cache-Control": "private, no-store" };

/**
 * Streams the APK through this origin, forwarding Range so a download that dies
 * halfway on a bad mobile connection can resume instead of restarting. Resuming
 * matters more here than anywhere else on the site — this is a ~45 MB file being
 * pulled over exactly the networks that make it necessary in the first place.
 */
async function proxyApk(
  req: NextRequest,
  originUrl: string,
  version: string
): Promise<NextResponse> {
  const range = req.headers.get("range");
  const upstream = await fetch(originUrl, {
    headers: range ? { Range: range } : undefined,
    cache: "no-store",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json(
      { error: "origin-unavailable", status: upstream.status },
      { status: 502, headers: NO_STORE }
    );
  }

  const headers = new Headers({
    "Content-Type": "application/vnd.android.package-archive",
    "Content-Disposition": `attachment; filename="${apkFileName(version)}"`,
    "Accept-Ranges": "bytes",
    ...NO_STORE,
  });
  for (const header of ["content-length", "content-range", "etag"]) {
    const value = upstream.headers.get(header);
    if (value) headers.set(header, value);
  }

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const version = await resolveLatestVersion();

  if (!version) {
    // No android-v* release exists yet, or GitHub is down and we have no cached
    // answer. Say so plainly rather than redirecting to a URL that 404s.
    return NextResponse.json(
      { error: "no-android-release" },
      { status: 503, headers: NO_STORE }
    );
  }

  const mode = process.env.ANDROID_APK_SOURCE === "proxy" ? "proxy" : "github";
  const attributed = reportDownloadConversion(req);
  reportDownloadToGa(req, version, attributed, mode);

  if (mode === "proxy") {
    const originUrl = process.env.ANDROID_APK_ORIGIN_URL;
    if (!originUrl) {
      // Misconfiguration, not a user error: fall back to the redirect rather
      // than handing the visitor a 500. A slow download beats no download.
      return NextResponse.redirect(githubUrl(version), {
        status: 302,
        headers: NO_STORE,
      });
    }
    return proxyApk(req, originUrl, version);
  }

  return NextResponse.redirect(githubUrl(version), {
    status: 302,
    headers: NO_STORE,
  });
}
