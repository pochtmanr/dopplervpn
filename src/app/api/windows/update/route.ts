import { NextResponse } from "next/server";

/**
 * GET /api/windows/update
 *
 * Returns the latest Windows client version information.
 * The Windows app checks this on startup and shows an update banner if a newer version is available.
 *
 * To release a new version:
 * 1. Update LATEST_VERSION below
 * 2. Update DOWNLOAD_URL to point to the new installer
 * 3. Deploy the landing site
 */

const LATEST_VERSION = "1.0.0";
const DOWNLOAD_URL = "https://www.dopplervpn.org/download/doppler-vpn-windows.exe";

export async function GET() {
  return NextResponse.json(
    {
      version: LATEST_VERSION,
      url: DOWNLOAD_URL,
    },
    {
      headers: {
        // Cache for 1 hour — the app only checks once per session
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}
