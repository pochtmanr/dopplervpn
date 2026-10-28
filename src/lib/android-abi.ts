/**
 * ABI handling for the standalone (sideload) Android download.
 *
 * 1.8.1 to 1.8.3 shipped two single-ABI APKs; after 1.8.3 the sideload build
 * is arm64-only again (see DopplerAndroid/app/build.gradle.kts and
 * [LAST_ARM32_VERSION]). The ABI stays in the asset name, and old 32-bit
 * installs still send theirs, so the mapping lives in one place.
 */

export const ARM64 = "arm64-v8a";
export const ARM32 = "armeabi-v7a";

export type AndroidAbi = typeof ARM64 | typeof ARM32;

/** First release whose assets carry the ABI in the file name. */
export const SPLIT_APK_MIN_VERSION = "1.8.1";

/**
 * The last release that shipped an armeabi-v7a APK. From the next release the
 * sideload build is arm64-only (DopplerAndroid/app/build.gradle.kts); 32-bit
 * phones are pointed at Google Play, which still ships 32-bit. A 32-bit request
 * is pinned here instead of resolved against the newest release, which has no
 * file for it: the old "32-bit APK" links keep downloading something that
 * installs, and the update banner on a 32-bit device stays quiet because no
 * newer release carries its ABI.
 */
export const LAST_ARM32_VERSION = "1.8.3";

/**
 * Maps whatever a caller sends to one of the two ABIs we publish.
 *
 * The in-app banner sends `Build.SUPPORTED_ABIS[0]` verbatim, which is already
 * one of these two on every device that can run the app; the website sends a
 * hand-written `?abi=` on its 32-bit link. Everything else — an absent
 * parameter, an x86 emulator, a typo — resolves to arm64, which is the correct
 * default for effectively every device made since 2019 and is what the old
 * single-file link served.
 */
export function normalizeAbi(raw: string | null | undefined): AndroidAbi {
  const v = (raw ?? "").trim().toLowerCase();
  if (
    v === ARM32 ||
    v === "armeabi" ||
    v === "armv7" ||
    v === "armv7a" ||
    v === "arm32" ||
    v === "v7a" ||
    v === "32"
  ) {
    return ARM32;
  }
  return ARM64;
}

/** True when [version] is >= [SPLIT_APK_MIN_VERSION] on a plain x.y.z compare. */
export function hasSplitApks(version: string): boolean {
  const a = version.split(".").map(Number);
  const b = SPLIT_APK_MIN_VERSION.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (Number.isNaN(x)) return false;
    if (x !== y) return x > y;
  }
  return true;
}

/**
 * The published asset name for a version + ABI, e.g.
 * `doppler-vpn-android-v1.8.1-arm64-v8a.apk`. Must stay in step with the
 * staging step in DopplerAndroid/.github/workflows/release.yml.
 */
export function apkAssetName(tagPrefix: string, version: string, abi: AndroidAbi): string {
  return `doppler-vpn-${tagPrefix}${version}-${abi}.apk`;
}

/**
 * The pre-1.8.1 asset name: one arm64 APK with no ABI in the file name.
 * Kept so a rollback to an older release still resolves to a real file.
 */
export function legacyApkAssetName(tagPrefix: string, version: string): string {
  return `doppler-vpn-${tagPrefix}${version}.apk`;
}

/**
 * Picks the asset for [abi] out of a release's published asset names.
 *
 * @param assetNames Asset file names from the GitHub release. Pass an empty
 *                   array when the listing is unavailable (GitHub down, and we
 *                   are running on the hardcoded fallback version) — the name
 *                   is then derived by convention from the version instead.
 * @returns The asset file name, or null when this release has nothing for that
 *          ABI. That is a real state, not an error to paper over: every release
 *          before 1.8.1 genuinely contains no 32-bit APK, and inventing a URL
 *          for it would turn a diagnosable 404 here into a broken download at
 *          the CDN.
 */
export function pickApkAsset(
  assetNames: string[],
  tagPrefix: string,
  version: string,
  abi: AndroidAbi
): string | null {
  if (assetNames.length > 0) {
    const exact = assetNames.find((n) => n.toLowerCase().endsWith(`-${abi}.apk`));
    if (exact) return exact;
    if (abi === ARM32) return null;
    // arm64: the single unsuffixed APK of a pre-1.8.1 release was arm64.
    return (
      assetNames.find(
        (n) => n.toLowerCase().endsWith(".apk") && !n.toLowerCase().includes(ARM32)
      ) ?? null
    );
  }

  if (hasSplitApks(version)) return apkAssetName(tagPrefix, version, abi);
  return abi === ARM64 ? legacyApkAssetName(tagPrefix, version) : null;
}
