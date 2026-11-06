import { NextRequest, NextResponse } from "next/server";
import { resolveSiteUrl } from "@/lib/site-url";

/**
 * GET /api/ios/latest
 *
 * Version metadata for the direct (TestFlight) iPhone build, bundle
 * com.simnetiq.vpnreact.direct. Consumed by the in-app "Check for Updates" in
 * Settings, which compares version/build with its own CFBundleShortVersionString
 * / CFBundleVersion and, if newer, opens testflightUrl (or installUrl).
 *
 * There is no store API to ask, so the numbers are set by hand in the environment
 * when a build is uploaded and processed:
 *
 *   IOS_LATEST_VERSION   marketing version, e.g. "3.3.0"   (null when unset)
 *   IOS_LATEST_BUILD     CFBundleVersion, e.g. "412"       (null when unset)
 *   IOS_TESTFLIGHT_URL   the public TestFlight link        (null when unset)
 *   IOS_MIN_OS           minimum iOS version (default "18.0", the
 *                        IPHONEOS_DEPLOYMENT_TARGET of the Xcode project)
 *
 * Unset version/build come back as null: "we do not know", which the app must
 * treat as "no update", never as an error. installUrl is always present: the
 * install guide works with or without a TestFlight link.
 */

const DEFAULT_MIN_OS = "18.0";

function clean(v: string | undefined): string | null {
  const s = v?.trim();
  return s ? s : null;
}

export async function GET(req: NextRequest) {
  const site = resolveSiteUrl(req);
  return NextResponse.json(
    {
      version: clean(process.env.IOS_LATEST_VERSION),
      build: clean(process.env.IOS_LATEST_BUILD),
      testflightUrl: clean(process.env.IOS_TESTFLIGHT_URL),
      installUrl: `${site}/en/install#iphone`,
      minOS: clean(process.env.IOS_MIN_OS) ?? DEFAULT_MIN_OS,
    },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } }
  );
}
