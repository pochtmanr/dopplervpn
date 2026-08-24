"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * How the probes work, and what they can and cannot tell us.
 *
 * A browser cannot read a cross-origin response without CORS, but it does not
 * need to: `fetch(url, { mode: "no-cors" })` resolves with an opaque response
 * when the connection completed and rejects when it did not. That distinction —
 * completed vs. never completed — is exactly the question being asked, so an
 * opaque success is a perfectly good "reachable" signal.
 *
 * Two honest limits, stated on the page itself rather than hidden:
 *   - "Reachable" means the TCP + TLS + HTTP exchange finished. It does not mean
 *     the endpoint returned 200, and it says nothing about throughput. A host
 *     that resolves in 300 ms can still crawl when you pull 45 MB through it,
 *     which is why the manual download test below exists.
 *   - A browser extension or content blocker rejects a request the same way a
 *     national firewall does. Hence the control row.
 */

const REQUEST_TIMEOUT_MS = 8000;

type Role = "control" | "core";
type Status = "pending" | "running" | "reachable" | "blocked" | "timeout";

interface Target {
  id: string;
  label: string;
  url: string;
  role: Role;
  /** What breaks in the app if this host is unreachable. */
  en: string;
  zh: string;
  /** For controls: the outcome that means the test environment is trustworthy. */
  expect?: "reachable" | "blocked";
}

const SUPABASE_HOST = "https://fzlrhmjdjjzcgstaeblu.supabase.co";

const TARGETS: Target[] = [
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
    en: "Where the APK download link would point.",
    zh: "APK 下载链接将指向的位置。",
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
 * The actual APK, fetched by its actual URL. Measuring the real file rather than
 * a stand-in matters: this is a 56 MB download from GitHub's asset CDN, and
 * whether THAT completes at a usable speed is the entire question this page
 * exists to answer.
 */
const SPEED_TEST_URL =
  "https://github.com/pochtmanr/dopplervpn/releases/download/android-v1.8.0/doppler-vpn-android-v1.8.0.apk";

interface Result {
  status: Status;
  ms: number | null;
}

interface Geo {
  ip: string;
  country: string | null;
  city: string | null;
  asn: string | null;
}

async function probe(url: string): Promise<Result> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = performance.now();
  try {
    await fetch(url, {
      mode: "no-cors",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    return { status: "reachable", ms: Math.round(performance.now() - started) };
  } catch {
    const ms = Math.round(performance.now() - started);
    return { status: controller.signal.aborted ? "timeout" : "blocked", ms };
  } finally {
    clearTimeout(timer);
  }
}

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-zinc-800 text-zinc-500",
  running: "bg-zinc-800 text-zinc-300",
  reachable: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  blocked: "bg-red-500/15 text-red-300 ring-1 ring-red-500/30",
  timeout: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30",
};

const STATUS_LABEL: Record<Status, { en: string; zh: string }> = {
  pending: { en: "waiting", zh: "等待中" },
  running: { en: "testing…", zh: "检测中…" },
  reachable: { en: "reachable", zh: "可访问" },
  blocked: { en: "blocked", zh: "无法访问" },
  timeout: { en: "timed out", zh: "超时" },
};

export function CnCheckClient() {
  const [results, setResults] = useState<Record<string, Result>>({});
  const [geo, setGeo] = useState<Geo | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const runAll = useCallback(async () => {
    setRunning(true);
    setDone(false);
    setResults(
      Object.fromEntries(
        TARGETS.map((t) => [t.id, { status: "running" as Status, ms: null }]),
      ),
    );

    // Same-origin, so this one can actually be read — it tells us which country
    // and network the tester is really on, which is the context every other row
    // has to be read against.
    fetch("/api/ip", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Geo | null) => setGeo(data))
      .catch(() => setGeo(null));

    await Promise.all(
      TARGETS.map(async (target) => {
        const result = await probe(target.url);
        setResults((prev) => ({ ...prev, [target.id]: result }));
      }),
    );

    setRunning(false);
    setDone(true);
  }, []);

  useEffect(() => {
    void runAll();
  }, [runAll]);

  const asText = useCallback(() => {
    const lines = [
      `Doppler connectivity check — ${new Date().toISOString()}`,
      geo
        ? `Network: ${geo.country ?? "?"} ${geo.city ?? ""} AS${geo.asn ?? "?"} (${geo.ip})`
        : "Network: unknown",
      `UA: ${navigator.userAgent}`,
      "",
      ...TARGETS.map((t) => {
        const r = results[t.id];
        const status = r ? STATUS_LABEL[r.status].en : "not run";
        const ms = r?.ms != null ? ` ${r.ms}ms` : "";
        return `${status === "reachable" ? "OK  " : "FAIL"} ${t.label} — ${status}${ms}`;
      }),
    ];
    return lines.join("\n");
  }, [geo, results]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(asText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API is unavailable on insecure origins and in some in-app
      // browsers (WeChat, QQ). The <pre> block below is always selectable, so
      // there is a working fallback rather than a dead button.
      setCopied(false);
    }
  }, [asText]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 font-sans">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Doppler connectivity check
        </h1>
        <p className="mt-1 text-xl text-zinc-300">Doppler 连通性检测</p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          This page tests which servers the Doppler Android app needs are
          reachable from your network. It sends nothing but the tests themselves
          — no account, no personal data. Takes about 10 seconds.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          本页面检测 Doppler 安卓版所需的各个服务器在你的网络下是否可以访问。
          除检测请求外不会发送任何内容 — 不涉及账号，也不收集个人信息。大约需要 10 秒。
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void runAll()}
          disabled={running}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
        >
          {running ? "Testing… 检测中…" : "Run again 重新检测"}
        </button>
        {done && (
          <button
            type="button"
            onClick={() => void copy()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-200 ring-1 ring-zinc-700"
          >
            {copied ? "Copied 已复制" : "Copy results 复制结果"}
          </button>
        )}
      </div>

      {geo && (
        <div className="mb-6 rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
          <span className="text-zinc-500">Your network 你的网络: </span>
          <span className="text-zinc-200">
            {geo.country ?? "?"}
            {geo.city ? ` · ${geo.city}` : ""}
            {geo.asn ? ` · AS${geo.asn}` : ""}
          </span>
        </div>
      )}

      <ol className="space-y-3">
        {TARGETS.map((target) => {
          const result = results[target.id] ?? { status: "pending" as Status, ms: null };
          const unexpected =
            target.expect != null &&
            result.status !== "pending" &&
            result.status !== "running" &&
            (target.expect === "reachable") !== (result.status === "reachable");

          return (
            <li
              key={target.id}
              className={`rounded-xl bg-zinc-900/70 p-4 ring-1 ${
                unexpected ? "ring-amber-500/40" : "ring-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-zinc-200">
                    {target.label}
                  </p>
                  {target.role === "control" && (
                    <span className="mt-1 inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-zinc-400">
                      control 对照
                    </span>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${STATUS_STYLE[result.status]}`}
                  >
                    {STATUS_LABEL[result.status].en} / {STATUS_LABEL[result.status].zh}
                  </span>
                  {result.ms != null && result.status !== "running" && (
                    <p className="mt-1 text-xs text-zinc-500">{result.ms} ms</p>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{target.en}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">{target.zh}</p>
            </li>
          );
        })}
      </ol>

      <section className="mt-10 rounded-xl bg-zinc-900/70 p-5 ring-1 ring-zinc-800">
        <h2 className="text-base font-semibold text-zinc-100">
          Manual download test · 手动下载测速
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          The rows above only prove a connection can be opened. They cannot
          measure speed. The link below downloads the real Doppler Android app
          (56 MB) from the server we would distribute it from. Watch the speed
          your browser reports for about 10 seconds, then cancel — or let it
          finish and install it, if you are on Android and want to try it. Tell
          us roughly what speed you saw, or if it never started at all.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          上面的检测只能证明连接可以建立，无法测出速度。下面的链接会从我们实际分发的服务器
          下载真正的 Doppler 安卓安装包（56 MB）。观察浏览器显示的下载速度约 10 秒后取消即可 —
          如果你用的是安卓手机，也可以让它下载完并安装试用。请告诉我们大致的速度，
          或者它是否根本无法开始。
        </p>
        <a
          href={SPEED_TEST_URL}
          className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium text-zinc-200 ring-1 ring-zinc-700"
        >
          Start download test 开始下载测速
        </a>
      </section>

      {done && (
        <section className="mt-10">
          <h2 className="text-base font-semibold text-zinc-100">
            Results to send back · 请把这段结果发回
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-300 ring-1 ring-zinc-800">
            {asText()}
          </pre>
        </section>
      )}

      <p className="mt-10 text-xs leading-relaxed text-zinc-600">
        &ldquo;Reachable&rdquo; means the connection completed — not that the
        server returned a successful response, and not that it is fast. An ad
        blocker or privacy extension can also make a row show as blocked; the
        control rows are there to catch that.
      </p>
    </main>
  );
}
