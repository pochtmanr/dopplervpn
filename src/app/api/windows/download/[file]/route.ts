import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/windows/download/:file
 *
 * Proxies download of Windows installer files from a private GitHub repo.
 * Uses a GitHub PAT to fetch a temporary redirect URL for the release asset,
 * then redirects the user to it.
 *
 * Supported files:
 *   /api/windows/download/DopplerVPN-1.0.0-x64-Setup.exe
 *   /api/windows/download/DopplerVPN-1.0.0-arm64-Setup.exe
 *
 * Required env vars:
 *   GITHUB_RELEASES_TOKEN — GitHub PAT with `repo` scope (read access to private repo)
 *   GITHUB_RELEASES_REPO  — e.g. "pochtmanr/dopplervpn"
 *   GITHUB_RELEASES_TAG   — e.g. "windows-v1.0.0"
 */

type RouteContext = { params: Promise<{ file: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { file } = await context.params;

  const token = process.env.GITHUB_RELEASES_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Download service not configured" },
      { status: 503 }
    );
  }

  const repo = process.env.GITHUB_RELEASES_REPO;
  if (!repo) {
    return NextResponse.json(
      { error: "Download service not configured" },
      { status: 503 }
    );
  }

  const tag = process.env.GITHUB_RELEASES_TAG;
  if (!tag) {
    return NextResponse.json(
      { error: "Download service not configured" },
      { status: 503 }
    );
  }

  // Fetch release by tag to find the asset
  const releaseRes = await fetch(
    `https://api.github.com/repos/${repo}/releases/tags/${tag}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 300 },
    }
  );

  if (!releaseRes.ok) {
    console.error(`GitHub API error: ${releaseRes.status}`);
    return NextResponse.json(
      { error: "Release not found" },
      { status: 404 }
    );
  }

  const release = await releaseRes.json();
  const asset = release.assets?.find(
    (a: { name: string }) => a.name === file
  );

  if (!asset) {
    return NextResponse.json(
      { error: `File "${file}" not found in release ${tag}` },
      { status: 404 }
    );
  }

  // Request the asset with Accept: application/octet-stream to get a redirect URL
  const assetRes = await fetch(asset.url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/octet-stream",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    redirect: "manual",
  });

  // GitHub returns 302 with a temporary signed URL
  const redirectUrl = assetRes.headers.get("location");
  if (redirectUrl) {
    return NextResponse.redirect(redirectUrl);
  }

  // Fallback: if no redirect, stream the response directly
  if (assetRes.ok && assetRes.body) {
    return new NextResponse(assetRes.body, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file}"`,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }

  return NextResponse.json(
    { error: "Failed to fetch download" },
    { status: 502 }
  );
}
