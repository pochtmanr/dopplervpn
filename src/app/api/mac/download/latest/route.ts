import { NextRequest, NextResponse, after } from "next/server";
import { CLICK_ID_SOURCE_COOKIE, readClickIdCookie } from "@/lib/click-id";
import { firePostback } from "@/lib/postback";
import { sendServerEvent } from "@/lib/ga-server";
import { fetchLatestMacRelease } from "@/lib/mac-release";

/**
 * GET /api/mac/download/latest
 *
 * Serves the direct-download Mac DMG — the Developer ID build that pays through
 * the web checkout, for people whose App Store has no Doppler (Russia, China).
 * It is also the enclosure URL in the Sparkle appcast, so in-app updates and the
 * website button go through the same indirection.
 *
 * Same two delivery modes as /api/android/download/latest, for the same reason
 * (read that route's header before changing either):
 *   - `MAC_DMG_SOURCE=github` (default): 302 to the release asset.
 *   - `MAC_DMG_SOURCE=proxy`: stream from `MAC_DMG_ORIGIN_URL` through this
 *     domain, with Range forwarded so a dropped download resumes.
 */

const NO_STORE = { "Cache-Control": "private, no-store" };

function report(req: NextRequest, version: string, mode: string) {
  const clickId = readClickIdCookie(req);
  if (clickId) {
    after(() =>
      firePostback({
        clickId,
        goal: "download",
        meta: {
          source: req.cookies.get(CLICK_ID_SOURCE_COOKIE)?.value ?? null,
          arch: "mac",
          pagePath: req.headers.get("referer"),
        },
      })
    );
  }
  after(() =>
    sendServerEvent(
      {
        name: "mac_dmg_download_served",
        params: {
          version,
          attributed: Boolean(clickId),
          mode,
          // Sparkle identifies itself; a website click does not.
          via_sparkle: (req.headers.get("user-agent") ?? "").includes("Sparkle"),
          page_path: req.headers.get("referer") ?? "",
        },
      },
      req.cookies.get("_ga")?.value
    )
  );
}

async function proxyDmg(req: NextRequest, originUrl: string, dmgName: string) {
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
    "Content-Type": "application/x-apple-diskimage",
    "Content-Disposition": `attachment; filename="${dmgName}"`,
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
  const latest = await fetchLatestMacRelease().catch(() => null);
  if (!latest) {
    return NextResponse.json({ error: "no-mac-release" }, { status: 503, headers: NO_STORE });
  }

  const mode = process.env.MAC_DMG_SOURCE === "proxy" ? "proxy" : "github";
  report(req, latest.version, mode);

  const originUrl = process.env.MAC_DMG_ORIGIN_URL;
  if (mode === "proxy" && originUrl) {
    return proxyDmg(req, originUrl, latest.dmgName);
  }
  return NextResponse.redirect(latest.dmgUrl, { status: 302, headers: NO_STORE });
}
