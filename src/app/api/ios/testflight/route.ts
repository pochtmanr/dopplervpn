import { NextRequest, NextResponse, after } from "next/server";
import { sendServerEvent } from "@/lib/ga-server";

/**
 * GET /api/ios/testflight
 *
 * The iPhone route for people whose App Store has no Doppler (Russia, China):
 * the public TestFlight link of the separate "direct" App Store Connect record
 * (bundle com.simnetiq.vpnreact.direct), which pays through the web checkout.
 *
 * Same-origin indirection, like the APK and DMG routes: the link on the website,
 * in the support bot and in the install guide never changes, and the public link
 * can be rotated by changing `IOS_TESTFLIGHT_URL` alone. Unset means the route
 * sends the visitor to the install guide instead of a dead link.
 */
export async function GET(req: NextRequest) {
  const target = process.env.IOS_TESTFLIGHT_URL;
  if (!target) {
    return NextResponse.redirect(new URL("/en/install#iphone", req.url), {
      status: 302,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  after(() =>
    sendServerEvent(
      {
        name: "ios_testflight_redirect",
        params: { page_path: req.headers.get("referer") ?? "" },
      },
      req.cookies.get("_ga")?.value
    )
  );

  return NextResponse.redirect(target, {
    status: 302,
    headers: { "Cache-Control": "private, no-store" },
  });
}
