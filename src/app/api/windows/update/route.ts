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
 *
 * Falls back to the current public release when the env vars are unset,
 * so the endpoint keeps working without configuration.
 */

const DEFAULT_VERSION = "1.0.0";
const DEFAULT_DOWNLOAD_URL =
  "https://github.com/pochtmanr/dopplervpn/releases/download/windows-v1.0.0/DopplerVPN-1.0.0-x64-Setup.exe";

export async function GET() {
  const version = process.env.WINDOWS_LATEST_VERSION ?? DEFAULT_VERSION;
  const url = process.env.WINDOWS_DOWNLOAD_URL ?? DEFAULT_DOWNLOAD_URL;

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
