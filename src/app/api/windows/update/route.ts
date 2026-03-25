import { NextResponse } from "next/server";

/**
 * GET /api/windows/update
 *
 * Returns the latest Windows client version information.
 * The Windows app checks this on startup and shows an update banner if a newer version is available.
 *
 * To release a new version:
 * 1. Set WINDOWS_LATEST_VERSION env var (e.g. "1.0.1")
 * 2. Set WINDOWS_DOWNLOAD_URL env var to point to the new installer
 * 3. Deploy the landing site
 */

export async function GET() {
  const version = process.env.WINDOWS_LATEST_VERSION;
  if (!version) {
    throw new Error("WINDOWS_LATEST_VERSION environment variable is not set");
  }

  const url = process.env.WINDOWS_DOWNLOAD_URL;
  if (!url) {
    throw new Error("WINDOWS_DOWNLOAD_URL environment variable is not set");
  }

  return NextResponse.json(
    {
      version,
      url,
    },
    {
      headers: {
        // Cache for 1 hour — the app only checks once per session
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}
