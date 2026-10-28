import { describe, expect, it } from "vitest";
import { pickMacRelease } from "./mac-release";

const dmg = (tag: string) => ({
  name: `DopplerVPN-${tag.replace("mac-v", "")}.dmg`,
  size: 1234,
  browser_download_url: `https://github.com/x/releases/download/${tag}/DopplerVPN.dmg`,
});

describe("pickMacRelease", () => {
  it("picks the newest mac-v* release by semver, ignoring other platforms", () => {
    const r = pickMacRelease([
      { tag_name: "android-v9.9.9", assets: [{ name: "a.apk" }] },
      { tag_name: "mac-v1.2.0", assets: [dmg("mac-v1.2.0")] },
      { tag_name: "mac-v1.10.0", assets: [dmg("mac-v1.10.0")] },
    ]);
    expect(r?.version).toBe("1.10.0");
  });

  it("skips drafts, prereleases and releases without a DMG", () => {
    const r = pickMacRelease([
      { tag_name: "mac-v2.0.0", draft: true, assets: [dmg("mac-v2.0.0")] },
      { tag_name: "mac-v1.9.0", prerelease: true, assets: [dmg("mac-v1.9.0")] },
      { tag_name: "mac-v1.8.0", assets: [{ name: "notes.txt" }] },
      { tag_name: "mac-v1.7.0", assets: [dmg("mac-v1.7.0")] },
    ]);
    expect(r?.version).toBe("1.7.0");
  });

  it("reads the Sparkle signature line and build number from the body", () => {
    const r = pickMacRelease([
      {
        tag_name: "mac-v1.0.0",
        body: 'build=42\nsparkle:edSignature="abc+/=" length="98765"',
        assets: [dmg("mac-v1.0.0")],
      },
    ]);
    expect(r).toMatchObject({ build: "42", edSignature: "abc+/=", signedLength: 98765 });
  });

  it("leaves the signature null when the body has none", () => {
    const r = pickMacRelease([{ tag_name: "mac-v1.0.0", body: "", assets: [dmg("mac-v1.0.0")] }]);
    expect(r?.edSignature).toBeNull();
    expect(r?.build).toBeNull();
  });
});
