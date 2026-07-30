import { NextResponse } from "next/server";

/**
 * GET /api/windows/update
 *
 * Returns the latest Windows client version information.
 * The Windows app checks this on startup and shows an update banner if a newer version is available.
 *
 * To release a new version: set WINDOWS_LATEST_VERSION (e.g. "1.0.2") and deploy.
 * The download URL needs no change — it points at the latest-x64 alias, which
 * resolves the newest release on its own.
 *
 * WINDOWS_DOWNLOAD_URL still overrides that URL, but only with a value on
 * https://www.dopplervpn.org/ — see the guard in GET below.
 *
 * Falls back to the current public release when the env vars are unset,
 * so the endpoint keeps working without configuration.
 */

// IMPORTANT: the URL must stay on https://www.dopplervpn.org/. The Windows client
// refuses to open an update link from any other origin (SettingsPage.xaml.cs and
// HomePage.xaml.cs both check the prefix), so serving a raw github.com asset URL
// makes the in-app "Update" button silently do nothing — which is why bumping this
// to the windows-v1.0.1 GitHub asset in 01b3461 did not revive the button.
// The same-origin download route resolves the real release asset, so this
// indirection costs nothing and keeps the version out of the URL entirely.
const DEFAULT_VERSION = "1.0.1";
const DEFAULT_DOWNLOAD_URL =
  "https://www.dopplervpn.org/api/windows/download/latest-x64";

const REQUIRED_URL_PREFIX = "https://www.dopplervpn.org/";

export async function GET() {
  const version = process.env.WINDOWS_LATEST_VERSION ?? DEFAULT_VERSION;

  // Guard the env override too, not just the default. WINDOWS_DOWNLOAD_URL has been
  // set to a github.com asset URL in production, which the client silently refuses
  // to open — the update banner appears and the button does nothing. Rather than
  // depend on the env var being fixed by hand, ignore any value the client cannot use.
  const configuredUrl = process.env.WINDOWS_DOWNLOAD_URL;
  const url =
    configuredUrl?.startsWith(REQUIRED_URL_PREFIX)
      ? configuredUrl
      : DEFAULT_DOWNLOAD_URL;

  if (configuredUrl && configuredUrl !== url) {
    console.warn(
      "[windows-update] ignoring WINDOWS_DOWNLOAD_URL — the client only opens " +
        `${REQUIRED_URL_PREFIX} links, got: ${configuredUrl}`
    );
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
