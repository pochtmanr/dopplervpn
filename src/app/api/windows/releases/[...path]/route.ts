import { NextResponse } from 'next/server';

/**
 * GET /api/windows/releases/releases.stable.json
 * (or any path under /api/windows/releases/)
 *
 * Serves the Velopack release manifest consumed by UpdateService.cs
 * via `new UpdateManager(new SimpleWebSource(ReleasesUrl))`.
 *
 * Velopack fetches `{baseUrl}/releases.{channel}.json` — so requests land here.
 *
 * To publish a new release:
 *   1. Run `vpk pack` to produce the .nupkg and releases.stable.json
 *   2. Upload the .nupkg to the download server
 *   3. Set WINDOWS_RELEASES_JSON in Vercel env vars to the full JSON content
 *   4. Deploy — users will be prompted to update on next app start
 *
 * To roll back: clear WINDOWS_RELEASES_JSON → endpoint returns empty releases.
 */
export async function GET() {
  const rawJson = process.env.WINDOWS_RELEASES_JSON;

  if (rawJson) {
    try {
      // Validate it parses as JSON before serving
      JSON.parse(rawJson);
      return new NextResponse(rawJson, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      });
    } catch {
      console.error('WINDOWS_RELEASES_JSON is set but not valid JSON — falling back to empty releases');
    }
  }

  // No release configured — Velopack interprets empty Assets as "up to date"
  const empty = JSON.stringify({ SchemaVersion: 2, Channel: 'stable', Assets: [] });
  return new NextResponse(empty, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
