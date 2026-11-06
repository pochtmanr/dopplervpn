import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

const KEYS = ["IOS_LATEST_VERSION", "IOS_LATEST_BUILD", "IOS_TESTFLIGHT_URL", "IOS_MIN_OS", "NEXT_PUBLIC_SITE_URL"];
afterEach(() => KEYS.forEach((k) => delete process.env[k]));

const req = () => new NextRequest("https://www.dopplervpn.org/api/ios/latest");

describe("GET /api/ios/latest", () => {
  it("falls back when env is unset", async () => {
    const res = await GET(req());
    expect(await res.json()).toEqual({
      version: null,
      build: null,
      testflightUrl: null,
      installUrl: "https://www.dopplervpn.org/en/install#iphone",
      minOS: "18.0",
    });
    expect(res.headers.get("cache-control")).toContain("max-age=300");
  });

  it("reads env", async () => {
    process.env.IOS_LATEST_VERSION = "3.3.0";
    process.env.IOS_LATEST_BUILD = " 412 ";
    process.env.IOS_TESTFLIGHT_URL = "https://testflight.apple.com/join/abc";
    process.env.IOS_MIN_OS = "18.2";
    const body = await (await GET(req())).json();
    expect(body).toMatchObject({ version: "3.3.0", build: "412", testflightUrl: "https://testflight.apple.com/join/abc", minOS: "18.2" });
  });
});
