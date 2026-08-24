"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PROBE_TARGETS,
  APK_DOWNLOAD_URL,
  type ProbeTarget,
} from "@/lib/cn-check-targets";

/**
 * How the probes work, and what they can and cannot tell us.
 *
 * A browser cannot read a cross-origin response without CORS, but it does not
 * need to: `fetch(url, { mode: "no-cors" })` resolves with an opaque response
 * when the connection completed and rejects when it did not. That distinction —
 * completed vs. never completed — is exactly the question being asked, so an
 * opaque success is a perfectly good "reachable" signal.
 *
 * The catch that bit the first deploy: a Content-Security-Policy refusal rejects
 * the promise in the *same shape* as a network block, so with the site-wide
 * `connect-src` in force every row read "blocked" regardless of the network. The
 * targets and the route's CSP are now generated from one list — see
 * lib/cn-check-targets.ts — so they cannot drift apart again.
 *
 * Two honest limits, stated on the page itself rather than hidden:
 *   - "Reachable" means the TCP + TLS + HTTP exchange finished. It does not mean
 *     the endpoint returned 200, and it says nothing about throughput. A host
 *     that resolves in 300 ms can still crawl when you pull 56 MB through it,
 *     which is why the download at the top of the page is the real measurement.
 *   - A browser extension or content blocker rejects a request the same way a
 *     national firewall does. Hence the control rows.
 */

const REQUEST_TIMEOUT_MS = 8000;

type Status = "pending" | "running" | "reachable" | "blocked" | "timeout";

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
        PROBE_TARGETS.map((t) => [t.id, { status: "running" as Status, ms: null }]),
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
      PROBE_TARGETS.map(async (target) => {
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
      ...PROBE_TARGETS.map((t) => {
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

  // The controls are written for a mainland China network, where they are
  // expected to fail. Opened from anywhere else they pass, which is correct and
  // uninteresting — so say where the tester actually is instead of flagging
  // every control row as an anomaly.
  const outsideChina = geo?.country != null && geo.country !== "CN";

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 font-sans">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Doppler VPN for Android</h1>
        <p className="mt-1 text-xl text-zinc-300">Doppler VPN 安卓版</p>
      </header>

      {/* ── 1. The app itself. This is what the page is for; the test is secondary. ── */}
      <section className="rounded-2xl bg-zinc-900/70 p-5 ring-1 ring-zinc-800">
        <a
          href={APK_DOWNLOAD_URL}
          className="block rounded-xl bg-emerald-500 px-5 py-4 text-center text-base font-semibold text-zinc-950"
        >
          Download the app · 下载安装包
        </a>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          56 MB · Android 8.0 or newer. Your phone will ask you to allow installs
          from this source — that is normal for an app that does not come from
          Google Play. It installs alongside the Play version, it does not replace
          it.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          56 MB · 需要 Android 8.0 或更高版本。手机会提示你允许从此来源安装 —
          非 Google Play 应用都会这样，属于正常现象。它不会覆盖 Play 商店版本，可以同时安装。
        </p>
        <p className="mt-4 rounded-lg bg-zinc-800/60 px-4 py-3 text-sm leading-relaxed text-zinc-300">
          <strong className="font-semibold">Please tell us how fast it downloads.</strong>{" "}
          That number is the one thing we cannot measure from outside China, and it
          decides where we host the app. If it never starts, tell us that too.
          <br />
          <strong className="font-semibold">请告诉我们下载速度有多快。</strong>{" "}
          这个数字是我们在中国境外无法测量的，它将决定我们把安装包放在哪里。
          如果根本无法开始下载，也请告诉我们。
        </p>
      </section>

      {/* ── 2. The diagnostic. ─────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-base font-semibold text-zinc-100">
          Connectivity test · 连通性检测
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          This checks which of the servers the app needs can be reached from your
          network. It runs by itself and sends nothing but the tests — no account,
          no personal data.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          这项检测会确认 App 所需的各个服务器在你的网络下是否可以访问。
          它会自动运行，除检测请求外不发送任何内容 — 不涉及账号，也不收集个人信息。
        </p>

        {geo && (
          <div className="mt-5 rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
            <span className="text-zinc-500">Your network 你的网络: </span>
            <span className="text-zinc-200">
              {geo.country ?? "?"}
              {geo.city ? ` · ${geo.city}` : ""}
              {geo.asn ? ` · AS${geo.asn}` : ""}
            </span>
            {outsideChina && (
              <p className="mt-2 text-zinc-500">
                You are not on a mainland China network, so the two control rows
                below will pass rather than fail. That is expected here and does
                not mean anything is wrong. · 你当前不在中国大陆网络，因此下面两个
                对照项会显示为可访问，这在此处属于正常情况。
              </p>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
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

        <ol className="mt-5 space-y-3">
          {PROBE_TARGETS.map((target: ProbeTarget) => {
            const result = results[target.id] ?? {
              status: "pending" as Status,
              ms: null,
            };
            return (
              <li
                key={target.id}
                className="rounded-xl bg-zinc-900/70 p-4 ring-1 ring-zinc-800"
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
                      {STATUS_LABEL[result.status].en} /{" "}
                      {STATUS_LABEL[result.status].zh}
                    </span>
                    {result.ms != null && result.status !== "running" && (
                      <p className="mt-1 text-xs text-zinc-500">{result.ms} ms</p>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {target.en}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {target.zh}
                </p>
              </li>
            );
          })}
        </ol>
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
