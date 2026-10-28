import { NextRequest, NextResponse } from "next/server";
import { resolveSiteUrl } from "@/lib/site-url";
import { MAC_MIN_SYSTEM_VERSION, fetchLatestMacRelease } from "@/lib/mac-release";

/**
 * GET /api/mac/appcast.xml
 *
 * The Sparkle feed for the direct-download Mac build (SUFeedURL in
 * doppler-apple/DopplerVPNDirect/Info.plist). One item: the newest mac-v*
 * release that carries a signature line — see lib/mac-release.ts for where the
 * signature comes from and why an unsigned release is left out.
 *
 * The enclosure points at our own /api/mac/download/latest, not at GitHub, so
 * the MAC_DMG_SOURCE=proxy switch reaches already-installed apps too.
 */

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET(req: NextRequest) {
  const latest = await fetchLatestMacRelease().catch(() => null);
  const site = resolveSiteUrl(req);

  const item =
    latest?.edSignature && latest.signedLength
      ? `
    <item>
      <title>Doppler VPN ${xmlEscape(latest.version)}</title>
      ${latest.publishedAt ? `<pubDate>${new Date(latest.publishedAt).toUTCString()}</pubDate>` : ""}
      <sparkle:version>${xmlEscape(latest.build ?? latest.version)}</sparkle:version>
      <sparkle:shortVersionString>${xmlEscape(latest.version)}</sparkle:shortVersionString>
      <sparkle:minimumSystemVersion>${MAC_MIN_SYSTEM_VERSION}</sparkle:minimumSystemVersion>
      ${latest.notesUrl ? `<sparkle:fullReleaseNotesLink>${xmlEscape(latest.notesUrl)}</sparkle:fullReleaseNotesLink>` : ""}
      <enclosure url="${xmlEscape(`${site}/api/mac/download/latest`)}"
                 sparkle:edSignature="${xmlEscape(latest.edSignature)}"
                 length="${latest.signedLength}"
                 type="application/octet-stream" />
    </item>`
      : "";

  const body = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle">
  <channel>
    <title>Doppler VPN for Mac</title>
    <link>${xmlEscape(`${site}/api/mac/appcast.xml`)}</link>${item}
  </channel>
</rss>
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
