/**
 * The hosts /cn-check probes.
 *
 * This list is imported by TWO places that must agree, which is the whole reason
 * it lives in its own module:
 *
 *   1. src/app/cn-check/cn-check-client.tsx — renders and probes them.
 *   2. next.config.ts — derives the `connect-src` for the /cn-check route's CSP.
 *
 * They have to agree because the site-wide CSP is `connect-src 'self' …` plus a
 * short allowlist. A probe aimed at any other origin is refused by the browser
 * before a packet leaves the machine, and `fetch` rejects exactly as it does for
 * a network-level block — so the page reports "blocked" for every host on Earth
 * and looks like proof of censorship when it is proof of our own header. That is
 * not hypothetical: the first deploy of this page did precisely that, and it read
 * as "everything is blocked" from Germany.
 *
 * If you add a target here, the CSP follows automatically. Do not inline a URL in
 * the client component instead.
 */

export type ProbeRole = "control" | "core";

export interface ProbeTarget {
  id: string;
  label: string;
  /** Absolute URL, or a same-origin path (which 'self' already covers). */
  url: string;
  role: ProbeRole;
  /** What breaks in the app if this host is unreachable. */
  en: string;
  zh: string;
  /** For controls: the outcome that means the test environment is trustworthy. */
  expect?: "reachable" | "blocked";
}

const SUPABASE_HOST = "https://fzlrhmjdjjzcgstaeblu.supabase.co";

export const PROBE_TARGETS: ProbeTarget[] = [
  {
    id: "google",
    label: "www.google.com",
    url: "https://www.google.com/generate_204",
    role: "control",
    expect: "blocked",
    en: "Control. On a mainland China connection this should FAIL. If it says reachable, you are probably already on a VPN or proxy — everything below is then measuring the VPN, not your real network.",
    zh: "对照项。在中国大陆网络下这一项应当失败。如果显示可访问，说明你可能已经在使用 VPN 或代理 — 那么下面所有结果测的是 VPN，而不是你的真实网络。",
  },
  {
    id: "play",
    label: "play.google.com",
    url: "https://play.google.com/",
    role: "control",
    expect: "blocked",
    en: "Control. Google Play is the reason this build exists. Expected to fail.",
    zh: "对照项。正因为 Google Play 无法使用，才有了这个安装包。预期失败。",
  },
  {
    id: "supabase",
    label: "supabase.co",
    url: `${SUPABASE_HOST}/rest/v1/`,
    role: "core",
    en: "Accounts, login and the server list. If this fails, the app cannot start at all — this is the single most important row.",
    zh: "账号、登录和服务器列表。如果这一项失败，App 根本无法启动 — 这是最关键的一项。",
  },
  {
    id: "doppler",
    label: "www.dopplervpn.org",
    url: "/api/ip",
    role: "core",
    en: "The payment page and the update check. If this fails, you cannot subscribe from inside the app.",
    zh: "支付页面和更新检测。如果这一项失败，就无法在 App 内订阅。",
  },
  {
    id: "simnetiq",
    label: "www.simnetiq.store",
    url: "https://www.simnetiq.store/",
    role: "core",
    en: "A second domain of ours on different DNS. Tells us whether a backup domain would survive if the main one is blocked.",
    zh: "我们的另一个域名，使用不同的 DNS。用于判断主域名被封时备用域名是否还能用。",
  },
  {
    id: "github",
    label: "github.com",
    url: "https://github.com/pochtmanr/dopplervpn/releases/latest",
    role: "core",
    en: "Where the APK download link points.",
    zh: "APK 下载链接指向的位置。",
  },
  {
    // Verified by following a real release download: GitHub hands off to
    // release-assets.githubusercontent.com. Probing objects.githubusercontent.com
    // — the host it used to be, and the one most write-ups still name — would
    // have tested a server we do not actually use.
    id: "githubusercontent",
    label: "release-assets.githubusercontent.com",
    url: "https://release-assets.githubusercontent.com/",
    role: "core",
    en: "Where the APK bytes actually come from. github.com can be reachable while this one is not — that combination is the whole reason for this test.",
    zh: "APK 文件实际下载的服务器。github.com 可访问、而这一项不可访问的情况是存在的 — 这正是本次测试的重点。",
  },
  {
    id: "revolut",
    label: "merchant.revolut.com",
    url: "https://merchant.revolut.com/",
    role: "core",
    en: "Bank card payment. If this fails, only crypto payment will work.",
    zh: "银行卡支付。如果这一项失败，就只能使用加密货币支付。",
  },
  {
    id: "oxapay",
    label: "api.oxapay.com",
    url: "https://api.oxapay.com/",
    role: "core",
    en: "Crypto payment.",
    zh: "加密货币支付。",
  },
];

/**
 * Distinct absolute origins the probes connect to, for the /cn-check CSP.
 * Same-origin paths are dropped — `'self'` already covers them.
 *
 * github.com 302s to release-assets.githubusercontent.com and CSP re-checks
 * every redirect hop against connect-src, so both origins must be listed. They
 * both are, as separate targets.
 */
export const PROBE_ORIGINS: string[] = Array.from(
  new Set(
    PROBE_TARGETS.filter((t) => t.url.startsWith("https://")).map(
      (t) => new URL(t.url).origin,
    ),
  ),
);

/**
 * The APK download, through our own route rather than a GitHub URL.
 *
 * Today that route 302s to GitHub's release CDN, so the bytes still come from
 * GitHub and the speed a tester reports is GitHub's speed — which is exactly what
 * we want to measure. But if the China results force us to serve the file
 * ourselves (ANDROID_APK_SOURCE=proxy), this link starts serving from our domain
 * with no edit here and no new link to hand out. A raw GitHub URL would have
 * quietly kept pointing at the host we had just moved away from.
 *
 * It is an <a href> navigation, not a fetch, so connect-src does not apply to it.
 */
export const APK_DOWNLOAD_URL = "/api/android/download/latest";
