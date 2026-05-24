import { NextResponse } from "next/server";

/**
 * GET /api/android/latest
 *
 * Returns the latest standalone (sideload) Android release published on
 * GitHub Releases. Consumed by:
 *   - the landing-site hero CTA (replaces the hard-coded download link)
 *   - the in-app "Update available" banner in the standalone flavor
 *
 * Set GITHUB_TOKEN to lift the unauthenticated rate limit (60/hr → 5000/hr).
 */

export const revalidate = 300;

const GITHUB_OWNER = "pochtmanr";
const GITHUB_REPO = "DopplerAndroid";
const TAG_PREFIX = "android-v";

type GitHubAsset = {
  name?: string;
  size?: number;
  browser_download_url?: string;
};

type GitHubRelease = {
  tag_name?: string;
  published_at?: string;
  html_url?: string;
  assets?: GitHubAsset[];
};

export async function GET() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "doppler-landing",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

  const res = await fetch(url, {
    headers,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "upstream-error", status: res.status },
      { status: 502 }
    );
  }

  const release = (await res.json()) as GitHubRelease;
  const tag = release.tag_name ?? "";
  if (!tag.startsWith(TAG_PREFIX)) {
    return NextResponse.json({ error: "no-android-release" }, { status: 404 });
  }

  const apk = release.assets?.find((a) => a.name?.toLowerCase().endsWith(".apk"));
  if (!apk?.browser_download_url) {
    return NextResponse.json({ error: "no-apk-asset" }, { status: 404 });
  }

  return NextResponse.json(
    {
      version: tag.slice(TAG_PREFIX.length),
      tag,
      url: apk.browser_download_url,
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
