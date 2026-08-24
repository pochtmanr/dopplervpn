import { NextRequest, NextResponse } from "next/server";
import { resolveSiteUrl } from "@/lib/site-url";

/**
 * GET /api/android/latest
 *
 * Version metadata for the latest standalone (sideload) Android release.
 * Consumed by the in-app "Update available" banner in the standalone flavor
 * (services/UpdateCheckService.kt), which compares `version` against its own
 * BuildConfig.VERSION_NAME and opens `url` with an ACTION_VIEW intent.
 *
 * ## Two things here are load-bearing
 *
 * **The repo is the PUBLIC one.** This used to point at pochtmanr/DopplerAndroid,
 * where the sources live — but that repo is private, its release assets need
 * auth, and this route runs unauthenticated, so every request returned 502. The
 * APK is published to pochtmanr/dopplervpn instead, the same public repo that
 * already carries the Windows installers.
 *
 * **The tag prefix, not "latest".** Because that repo carries both platforms,
 * GitHub's /releases/latest returns whichever was published most recently —
 * frequently a windows-v* release. Android builds are identified by the
 * android-v* prefix and picked by semver, mirroring the Windows route.
 *
 * `url` is an absolute link to our own /api/android/download/latest rather than
 * a GitHub asset URL. That keeps the update banner pointed at the same
 * indirection the website's download button uses, so switching where the bytes
 * are served from reaches already-installed apps too, with no new release.
 * It must be absolute: the app feeds it straight to Uri.parse() + ACTION_VIEW,
 * and a relative path there has no scheme to resolve.
 */

// Dynamic: the response embeds an absolute URL derived from the request host.
// Freshness comes from the Cache-Control header below and the 5-minute
// revalidate on the GitHub fetch, not from a route-level revalidate (which a
// request-reading route ignores anyway).

const REPO = "pochtmanr/dopplervpn";
const TAG_PREFIX = "android-v";
const VERSION_RE = new RegExp(`^${TAG_PREFIX}(\\d+\\.\\d+\\.\\d+)$`);

type GitHubAsset = {
  name?: string;
  size?: number;
};

type GitHubRelease = {
  tag_name?: string;
  published_at?: string;
  html_url?: string;
  draft?: boolean;
  prerelease?: boolean;
  assets?: GitHubAsset[];
};

export async function GET(req: NextRequest) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/releases?per_page=30`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "doppler-landing",
      },
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "upstream-error", status: res.status },
      { status: 502 }
    );
  }

  const releases = (await res.json()) as GitHubRelease[];

  const android = releases
    .filter((r) => !r.draft && !r.prerelease && VERSION_RE.test(r.tag_name ?? ""))
    .map((r) => ({ release: r, version: VERSION_RE.exec(r.tag_name!)![1] }))
    .sort((a, b) => {
      const pa = a.version.split(".").map(Number);
      const pb = b.version.split(".").map(Number);
      return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
    })[0];

  if (!android) {
    return NextResponse.json({ error: "no-android-release" }, { status: 404 });
  }

  const { release, version } = android;
  const apk = release.assets?.find((a) => a.name?.toLowerCase().endsWith(".apk"));

  if (!apk) {
    return NextResponse.json({ error: "no-apk-asset" }, { status: 404 });
  }

  return NextResponse.json(
    {
      version,
      tag: release.tag_name,
      url: `${resolveSiteUrl(req)}/api/android/download/latest`,
      size: apk.size ?? null,
      publishedAt: release.published_at ?? null,
      releaseUrl: release.html_url ?? null,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
