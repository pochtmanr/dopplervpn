import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/windows/download/:file
 *
 * Redirects to the Windows installer hosted on a public GitHub release.
 * Same-origin path is kept so download links, analytics, and the native
 * app's expectations stay stable even if the hosting location changes.
 *
 * Supported files:
 *   /api/windows/download/DopplerVPN-1.0.0-x64-Setup.exe
 *   /api/windows/download/DopplerVPN-1.0.0-arm64-Setup.exe
 */

const RELEASE_BASE =
  "https://github.com/pochtmanr/dopplervpn/releases/download/windows-v1.0.0";

const ALLOWED_FILES = new Set([
  "DopplerVPN-1.0.0-x64-Setup.exe",
  "DopplerVPN-1.0.0-arm64-Setup.exe",
]);

type RouteContext = { params: Promise<{ file: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { file } = await context.params;

  if (!ALLOWED_FILES.has(file)) {
    return NextResponse.json(
      { error: `File "${file}" not found` },
      { status: 404 }
    );
  }

  // Never stream the binary through Vercel — it burns Fast Origin Transfer quota.
  return NextResponse.redirect(`${RELEASE_BASE}/${file}`, 302);
}
