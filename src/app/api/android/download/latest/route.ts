import { NextRequest, NextResponse, after } from "next/server";
import { CLICK_ID_SOURCE_COOKIE, readClickIdCookie } from "@/lib/click-id";
import { firePostback } from "@/lib/postback";
import { sendServerEvent } from "@/lib/ga-server";
import {
  ARM32,
  type AndroidAbi,
  normalizeAbi,
  pickApkAsset,
} from "@/lib/android-abi";

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
 *
 * ## `?abi=` — which architecture
 *
 * Since 1.8.1 a release carries two APKs, one per ABI. `?abi=` selects; anything
 * unrecognised or absent means arm64-v8a, which is what this link always served.
 * The in-app update banner sends Build.SUPPORTED_ABIS[0]; the website's 32-bit
 * link sends armeabi-v7a explicitly, because nothing in an HTTP request from a
 * browser reliably states the device's CPU architecture.
 *
 * `ANDROID_APK_ORIGIN_URL` (proxy mode) is a single URL and therefore serves the
 * arm64 file only; a 32-bit request falls back to the GitHub redirect rather
 * than being handed the wrong binary.
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

/**
 * The asset NAMES are cached alongside the version, not just the version.
 * Constructing the file name from the version by hand is what made the old
 * single-APK assumption invisible; reading it off the release is what lets a
 * pre-1.8.1 tag (one unsuffixed APK) and a 1.8.1+ tag (two suffixed ones) both
 * resolve without a special case at the call site.
 */
type LatestRelease = { version: string; assetNames: string[] };

let cachedRelease: { release: LatestRelease; at: number } | null = null;

/** Newest android-v* release by semver, with its asset names, or null. */
async function fetchLatestRelease(): Promise<LatestRelease | null> {
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
    assets?: Array<{ name?: string }>;
  }> = await res.json();

  // The Windows installers live on this same repo under windows-v* tags, so the
  // tag prefix — not "the newest release" — is what identifies an Android build.
  const candidates = releases
    .filter((r) => !r.draft && !r.prerelease)
    .map((r) => ({
      release: r,
      version: new RegExp(`^${TAG_PREFIX}(\\d+\\.\\d+\\.\\d+)$`).exec(r.tag_name ?? "")?.[1],
    }))
    .filter((c): c is { release: (typeof releases)[number]; version: string } =>
      Boolean(c.version)
    );

  if (candidates.length === 0) return null;

  // GitHub orders by creation date; sort by semver so a late-published patch of an
  // older line can't masquerade as the newest.
  candidates.sort((a, b) => {
    const pa = a.version.split(".").map(Number);
    const pb = b.version.split(".").map(Number);
    return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
  });

  const top = candidates[0];
  return {
    version: top.version,
    assetNames: (top.release.assets ?? [])
      .map((a) => a.name)
      .filter((n): n is string => Boolean(n)),
  };
}

async function resolveLatestRelease(): Promise<LatestRelease | null> {
  const now = Date.now();
  if (cachedRelease && now - cachedRelease.at < CACHE_TTL_MS) {
    return cachedRelease.release;
  }

  try {
    const release = await fetchLatestRelease();
    if (release) {
      cachedRelease = { release, at: now };
      return release;
    }
  } catch {
    // fall through
  }

  if (cachedRelease) return cachedRelease.release;
  // No listing at all: fall back to the pinned version and derive the file name
  // by convention (empty asset list) rather than answering 503.
  return FALLBACK_VERSION ? { version: FALLBACK_VERSION, assetNames: [] } : null;
}

function githubUrl(version: string, assetName: string): string {
  return `${RELEASE_BASE}/${TAG_PREFIX}${version}/${assetName}`;
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
  mode: string,
  abi: AndroidAbi
) {
  after(() =>
    sendServerEvent(
      {
        name: "android_apk_download_served",
        params: {
          version,
          attributed,
          mode,
          // How many people actually need the 32-bit build is unknown — this is
          // the only place the answer can be counted.
          abi,
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
  assetName: string
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
    "Content-Disposition": `attachment; filename="${assetName}"`,
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
  const latest = await resolveLatestRelease();

  if (!latest) {
    // No android-v* release exists yet, or GitHub is down and we have no cached
    // answer. Say so plainly rather than redirecting to a URL that 404s.
    return NextResponse.json(
      { error: "no-android-release" },
      { status: 503, headers: NO_STORE }
    );
  }

  const { version, assetNames } = latest;
  const abi: AndroidAbi = normalizeAbi(req.nextUrl.searchParams.get("abi"));
  const assetName = pickApkAsset(assetNames, TAG_PREFIX, version, abi);

  if (!assetName) {
    // Only reachable for a 32-bit request against a release published before
    // 1.8.1. Answering plainly beats redirecting to a URL that 404s at GitHub,
    // where the visitor has no way to tell our mistake from a dead link.
    return NextResponse.json(
      { error: "no-apk-for-abi", abi, version },
      { status: 404, headers: NO_STORE }
    );
  }

  const mode = process.env.ANDROID_APK_SOURCE === "proxy" ? "proxy" : "github";
  const attributed = reportDownloadConversion(req);
  reportDownloadToGa(req, version, attributed, mode, abi);

  const redirectToGithub = () =>
    NextResponse.redirect(githubUrl(version, assetName), {
      status: 302,
      headers: NO_STORE,
    });

  if (mode === "proxy") {
    const originUrl = process.env.ANDROID_APK_ORIGIN_URL;
    // ANDROID_APK_ORIGIN_URL names one file, and that file is the arm64 build.
    // Serving it to a 32-bit device would produce an APK that installs nowhere,
    // which is worse than the slow-but-correct GitHub path.
    if (!originUrl || abi === ARM32) {
      // Misconfiguration (or a 32-bit request), not a user error: fall back to
      // the redirect rather than handing the visitor a 500 or the wrong binary.
      return redirectToGithub();
    }
    return proxyApk(req, originUrl, assetName);
  }

  return redirectToGithub();
}
