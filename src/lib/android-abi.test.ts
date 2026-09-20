import { describe, expect, it } from "vitest";
import {
  ARM32,
  ARM64,
  apkAssetName,
  hasSplitApks,
  legacyApkAssetName,
  normalizeAbi,
  pickApkAsset,
} from "./android-abi";

describe("normalizeAbi", () => {
  it("passes through the two ABIs we publish", () => {
    expect(normalizeAbi(ARM64)).toBe(ARM64);
    expect(normalizeAbi(ARM32)).toBe(ARM32);
  });

  it("accepts the 32-bit spellings the website and the in-app banner send", () => {
    for (const raw of ["armeabi", "armv7", "armv7a", "arm32", "v7a", "32", " ARMEABI-V7A "]) {
      expect(normalizeAbi(raw)).toBe(ARM32);
    }
  });

  it("defaults to arm64 for absent, unknown or x86 values", () => {
    for (const raw of [null, undefined, "", "x86_64", "mips", "nonsense"]) {
      expect(normalizeAbi(raw)).toBe(ARM64);
    }
  });
});

describe("hasSplitApks", () => {
  it("is true from 1.8.1 onwards", () => {
    expect(hasSplitApks("1.8.1")).toBe(true);
    expect(hasSplitApks("1.8.2")).toBe(true);
    expect(hasSplitApks("1.9.0")).toBe(true);
    expect(hasSplitApks("2.0.0")).toBe(true);
  });

  it("is false before 1.8.1", () => {
    expect(hasSplitApks("1.8.0")).toBe(false);
    expect(hasSplitApks("1.7.9")).toBe(false);
    expect(hasSplitApks("0.9.0")).toBe(false);
  });

  it("treats a missing patch segment as zero", () => {
    expect(hasSplitApks("1.8")).toBe(false);
    expect(hasSplitApks("1.9")).toBe(true);
  });

  it("refuses an unparseable version rather than guessing", () => {
    expect(hasSplitApks("not-a-version")).toBe(false);
  });
});

describe("pickApkAsset", () => {
  const split = [
    "doppler-vpn-v1.8.1-arm64-v8a.apk",
    "doppler-vpn-v1.8.1-armeabi-v7a.apk",
  ];

  it("picks the exact ABI out of a split release", () => {
    expect(pickApkAsset(split, "v", "1.8.1", ARM64)).toBe("doppler-vpn-v1.8.1-arm64-v8a.apk");
    expect(pickApkAsset(split, "v", "1.8.1", ARM32)).toBe("doppler-vpn-v1.8.1-armeabi-v7a.apk");
  });

  it("maps arm64 onto the single unsuffixed APK of a pre-1.8.1 release", () => {
    expect(pickApkAsset(["doppler-vpn-v1.8.0.apk"], "v", "1.8.0", ARM64)).toBe(
      "doppler-vpn-v1.8.0.apk",
    );
  });

  it("returns null rather than inventing a 32-bit URL that would 404 at the CDN", () => {
    expect(pickApkAsset(["doppler-vpn-v1.8.0.apk"], "v", "1.8.0", ARM32)).toBeNull();
    expect(pickApkAsset([], "v", "1.8.0", ARM32)).toBeNull();
  });

  it("falls back to the naming convention when the release listing is unavailable", () => {
    expect(pickApkAsset([], "v", "1.8.1", ARM64)).toBe(apkAssetName("v", "1.8.1", ARM64));
    expect(pickApkAsset([], "v", "1.8.1", ARM32)).toBe(apkAssetName("v", "1.8.1", ARM32));
    expect(pickApkAsset([], "v", "1.8.0", ARM64)).toBe(legacyApkAssetName("v", "1.8.0"));
  });

  it("does not hand an arm64 caller the 32-bit file", () => {
    const only32 = ["doppler-vpn-v1.8.1-armeabi-v7a.apk"];
    expect(pickApkAsset(only32, "v", "1.8.1", ARM64)).toBeNull();
  });
});

describe("apkAssetName", () => {
  it("matches the name the Android release workflow stages", () => {
    expect(apkAssetName("v", "1.8.1", ARM64)).toBe("doppler-vpn-v1.8.1-arm64-v8a.apk");
    expect(legacyApkAssetName("v", "1.8.0")).toBe("doppler-vpn-v1.8.0.apk");
  });
});
