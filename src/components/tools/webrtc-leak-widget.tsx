"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CARD_HAIRLINE, CARD_SURFACE } from "@/components/ui/card-recipes";

const STUN_URL = "stun:stun.l.google.com:19302";
/** STUN normally answers in well under a second; a blocked UDP path never does. */
const GATHER_TIMEOUT_MS = 5000;

type Kind = "leak" | "public" | "local";

interface Candidate {
  address: string;
  /** ICE candidate type: host, srflx (what the STUN server saw), prflx, relay. */
  type: string;
  kind: Kind;
}

type Verdict = "unsupported" | "clean" | "leak" | "error";

interface Result {
  verdict: Verdict;
  publicIp: string | null;
  candidates: Candidate[];
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

function isIPv6(value: string): boolean {
  return value.includes(":") && /^[0-9a-f:.]+$/i.test(value);
}

/** Eight 16-bit groups, or null if the text is not an IPv6 address. Handles `::` and a dotted IPv4 tail. */
function ipv6Groups(ip: string): number[] | null {
  let text = ip.toLowerCase().split("%")[0];
  const tail = /(\d+\.\d+\.\d+\.\d+)$/.exec(text);
  if (tail) {
    if (!IPV4.test(tail[1])) return null;
    const [a, b, c, d] = tail[1].split(".").map(Number);
    text = `${text.slice(0, -tail[1].length)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  const parse = (s: string) => (s ? s.split(":") : []);
  const head = parse(halves[0]);
  const rest = halves.length === 2 ? parse(halves[1]) : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 2 ? missing < 1 : missing !== 0) return null;
  const all = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill("0"), ...rest];
  if (all.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return all.map((g) => parseInt(g, 16));
}

/** Canonical form for comparing addresses: IPv4 as-is, IPv4-mapped IPv6 unwrapped, IPv6 fully expanded. */
function normalize(ip: string): string | null {
  const value = ip.trim().replace(/^\[|\]$/g, "").toLowerCase();
  if (IPV4.test(value)) return value;
  if (!isIPv6(value)) return null;
  const g = ipv6Groups(value);
  if (!g) return null;
  if (g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff) {
    return [g[6] >> 8, g[6] & 255, g[7] >> 8, g[7] & 255].join(".");
  }
  return g.map((x) => x.toString(16).padStart(4, "0")).join(":");
}

/** Addresses that only mean something on the local network (or nothing at all). Expects normalize() output. */
function isLocal(ip: string): boolean {
  if (IPV4.test(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) || // CGNAT / Tailscale
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  const first = parseInt(ip.slice(0, 4), 16);
  return (
    ip === "0000:0000:0000:0000:0000:0000:0000:0001" ||
    (first & 0xffc0) === 0xfe80 || // link-local
    (first & 0xfe00) === 0xfc00 || // unique-local
    (first & 0xff00) === 0xff00 // multicast
  );
}

/** Same address, or — for IPv6 — the same /64, i.e. the network the website already sees. */
function sameNetwork(a: string, b: string): boolean {
  if (a === b) return true;
  return a.includes(":") && b.includes(":") && a.slice(0, 19) === b.slice(0, 19);
}

interface RawCandidate {
  address: string;
  type: string;
}

/**
 * Pulls addresses out of one `a=candidate` / `candidate:` line:
 * `candidate:<foundation> <component> <proto> <priority> <address> <port> typ <type> [raddr <addr> rport <port>] …`
 */
function parseCandidateLine(line: string): RawCandidate[] {
  const parts = line.replace(/^a=/, "").trim().split(/\s+/);
  if (parts.length < 8 || !parts[0].startsWith("candidate:")) return [];
  const typeAt = parts.indexOf("typ");
  const type = typeAt > 0 ? (parts[typeAt + 1] ?? "host") : "host";
  const out: RawCandidate[] = [{ address: parts[4], type }];
  const raddrAt = parts.indexOf("raddr");
  // raddr is the local base of a srflx/relay candidate; Chrome masks it as 0.0.0.0.
  if (raddrAt > 0 && parts[raddrAt + 1]) out.push({ address: parts[raddrAt + 1], type: "host" });
  return out;
}

/**
 * Gathers ICE candidates from a throwaway peer connection. Resolves with null
 * when the browser has no WebRTC at all (Firefox with
 * media.peerconnection.enabled=false, some privacy browsers, old WebViews).
 * STUN runs over UDP inside RTCPeerConnection, so the page CSP's connect-src
 * does not apply to it.
 */
function gatherCandidates(signal: { cancelled: boolean }): Promise<RawCandidate[] | null> {
  if (typeof window === "undefined" || typeof window.RTCPeerConnection !== "function") {
    return Promise.resolve(null);
  }
  let pc: RTCPeerConnection;
  try {
    pc = new RTCPeerConnection({ iceServers: [{ urls: STUN_URL }] });
  } catch {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const found: RawCandidate[] = [];
    let done = false;

    // Declared before the timers that call it; only ever invoked asynchronously.
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearInterval(poll);
      // Firefox (and Safari on some versions) also writes the gathered
      // candidates into the local SDP; reading it catches any event we missed.
      try {
        const sdp = pc.localDescription?.sdp ?? "";
        for (const line of sdp.split(/\r?\n/)) {
          if (line.startsWith("a=candidate:")) found.push(...parseCandidateLine(line));
        }
      } catch {
        // localDescription can throw on a closed connection.
      }
      pc.onicecandidate = null;
      pc.onicegatheringstatechange = null;
      try {
        pc.close();
      } catch {
        // Already closed.
      }
      resolve(found);
    };

    const timer = setTimeout(finish, GATHER_TIMEOUT_MS);
    // Lets an unmount or a newer run stop this one without waiting for the timeout.
    const poll = setInterval(() => signal.cancelled && finish(), 150);

    pc.onicecandidate = (event) => {
      const c = event.candidate;
      if (!c) {
        finish(); // null candidate = end of gathering (all browsers)
        return;
      }
      // `address` is set in Chrome/Safari/Firefox ≥ 68; older engines only
      // have the SDP line, so parse that as well and let dedup merge them.
      if (c.address) found.push({ address: c.address, type: c.type ?? "host" });
      if (c.candidate) found.push(...parseCandidateLine(c.candidate));
    };
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === "complete") finish();
    };

    pc.createDataChannel("probe");
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(finish);
  });
}

async function fetchPublicIp(): Promise<string | null> {
  try {
    const res = await fetch("/api/ip", { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return ((await res.json()) as { ip?: string }).ip ?? null;
  } catch {
    return null;
  }
}

/**
 * The visitor's IPv4 and IPv6 as websites see them (ipify's single-stack hosts,
 * allowed in connect-src). /api/ip only reveals one family, so without these a
 * VPN that tunnels IPv6 would have its own IPv6 exit flagged as a leak.
 */
async function familyIp(host: "api4" | "api6"): Promise<string | null> {
  try {
    const res = await fetch(`https://${host}.ipify.org?format=json`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok ? (((await res.json()) as { ip?: string }).ip ?? null) : null;
  } catch {
    return null;
  }
}

function classify(raw: RawCandidate[], siteVisible: string[]): Candidate[] {
  const visible = siteVisible.map(normalize).filter((v): v is string => !!v);
  const byAddress = new Map<string, Candidate>();
  for (const { address, type } of raw) {
    const display = address.trim().toLowerCase();
    if (!display) continue;
    let kind: Kind;
    let key: string;
    if (display.endsWith(".local")) {
      // Chrome/Safari/Firefox mDNS obfuscation: a random name only resolvable on the LAN.
      kind = "local";
      key = display;
    } else {
      const norm = normalize(display);
      // 0.0.0.0 / :: is a placeholder (Chrome's masked raddr), not an address.
      if (!norm || norm === "0.0.0.0" || /^[0:]+$/.test(norm)) continue;
      key = norm;
      if (isLocal(norm)) kind = "local";
      else kind = visible.some((v) => sameNetwork(norm, v)) ? "public" : "leak";
    }
    const existing = byAddress.get(key);
    // Keep the most telling type seen for this address (srflx beats host).
    if (!existing || (existing.type === "host" && type !== "host")) {
      byAddress.set(key, { address: display, type, kind });
    }
  }
  const order: Record<Kind, number> = { leak: 0, public: 1, local: 2 };
  return [...byAddress.values()].sort((a, b) => order[a.kind] - order[b.kind]);
}

export function WebRtcLeakWidget() {
  const t = useTranslations("toolsWebrtcLeak.widget");
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(true);

  // A re-run bumps the id and cancels the previous probe; a slower answer from
  // an earlier run must never overwrite a newer one.
  const runId = useRef(0);
  const cancelRef = useRef<{ cancelled: boolean } | null>(null);

  const run = useCallback(async () => {
    const id = ++runId.current;
    if (cancelRef.current) cancelRef.current.cancelled = true;
    const signal = { cancelled: false };
    cancelRef.current = signal;
    setRunning(true);

    const [raw, publicIp, v4, v6] = await Promise.all([
      gatherCandidates(signal),
      fetchPublicIp(),
      familyIp("api4"),
      familyIp("api6"),
    ]);
    if (id !== runId.current) return;

    let next: Result;
    if (raw === null) {
      next = { verdict: "unsupported", publicIp, candidates: [] };
    } else {
      const candidates = classify(
        raw,
        [publicIp, v4, v6].filter((ip): ip is string => !!ip),
      );
      const exposed = candidates.some((c) => c.kind !== "local");
      // Without the address websites see, a public candidate can't be judged.
      if (exposed && !publicIp) next = { verdict: "error", publicIp, candidates };
      else
        next = {
          verdict: candidates.some((c) => c.kind === "leak") ? "leak" : "clean",
          publicIp,
          candidates,
        };
    }
    setResult(next);
    setRunning(false);
  }, []);

  useEffect(() => {
    const ids = runId;
    const cancel = cancelRef;
    run();
    return () => {
      ids.current++; // drop the in-flight run's result
      if (cancel.current) cancel.current.cancelled = true;
    };
  }, [run]);

  const loading = !result;
  const verdict = result?.verdict;
  const hasLocal = !!result?.candidates.some((c) => c.kind === "local");

  return (
    <div className={CARD_SURFACE}>
      <div className={CARD_HAIRLINE} />
      <div className="grid lg:grid-cols-5">
        {/* Public IP + verdict */}
        <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10 flex flex-col">
          <span className="text-xs md:text-sm uppercase tracking-wider text-text-tertiary">
            {t("publicIp")}
          </span>

          <div
            className={`mt-3 min-h-[3rem] sm:min-h-[3.75rem] font-mono text-3xl sm:text-5xl font-medium text-text-primary break-all leading-tight transition-opacity ${
              running && result ? "opacity-50" : ""
            }`}
            aria-busy={running}
          >
            {loading ? (
              <>
                <span className="sr-only">{t("loading")}</span>
                <span className="block h-10 sm:h-12 w-4/5 max-w-sm rounded-lg bg-overlay/[0.06] animate-pulse" />
              </>
            ) : result.publicIp ? (
              <bdi dir="ltr">{result.publicIp}</bdi>
            ) : (
              <span className="text-text-tertiary">{t("unknown")}</span>
            )}
          </div>

          <div
            className={`mt-6 min-h-[8.5rem] transition-opacity ${running && result ? "opacity-50" : ""}`}
            aria-live="polite"
          >
            {loading ? (
              <div className="h-[8.5rem] rounded-xl border border-overlay/5 bg-overlay/[0.03] p-5">
                <span className="block h-5 w-56 max-w-full rounded bg-overlay/[0.06] animate-pulse" />
                <span className="mt-4 block h-3.5 w-full rounded bg-overlay/[0.06] animate-pulse" />
                <span className="mt-2 block h-3.5 w-3/4 rounded bg-overlay/[0.06] animate-pulse" />
              </div>
            ) : verdict === "leak" ? (
              <VerdictBox tone="danger" title={t("leakedTitle")} body={t("leakedBody")} />
            ) : verdict === "clean" ? (
              <VerdictBox tone="teal" title={t("safeTitle")} body={t("safeBody")} />
            ) : verdict === "unsupported" ? (
              <VerdictBox tone="teal" title={t("noWebrtcTitle")} body={t("noWebrtc")} />
            ) : (
              <div className="rounded-xl border border-overlay/10 bg-overlay/[0.03] p-5 text-text-muted">
                {t("error")}
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={run}
              disabled={running}
              className="cta-key inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
            >
              <RefreshIcon spinning={running} />
              {running ? t("refreshing") : t("refresh")}
            </button>
          </div>
        </div>

        {/* Receipt: every address ICE gathering produced */}
        <div className="lg:col-span-2 border-t lg:border-t-0 lg:border-s border-overlay/5 bg-bg-secondary/30 p-6 sm:p-8 lg:p-10 flex flex-col">
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
              ice candidates
            </span>
            <span className="h-px flex-1 border-t border-dashed border-overlay/20" />
          </div>
          <h2 className="mt-4 text-sm text-text-muted">{t("webrtcIps")}</h2>

          <ul className="mt-2 min-h-[7.5rem] divide-y divide-dashed divide-overlay/10 text-sm">
            {loading ? (
              [0, 1, 2].map((i) => (
                <li key={i} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="inline-block h-3.5 w-32 rounded bg-overlay/[0.06] animate-pulse" />
                  <span className="inline-block h-3.5 w-12 rounded bg-overlay/[0.06] animate-pulse" />
                </li>
              ))
            ) : result.candidates.length === 0 ? (
              <li className="py-2.5 font-mono text-text-tertiary">—</li>
            ) : (
              result.candidates.map((c) => (
                <li key={c.address} className="flex items-center justify-between gap-3 py-2.5">
                  <span
                    className={`min-w-0 font-mono text-[13px] break-all ${
                      c.kind === "leak" ? "text-danger" : c.kind === "public" ? "text-text-primary" : "text-text-muted"
                    }`}
                  >
                    <bdi dir="ltr">{c.address}</bdi>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-[11px] text-text-tertiary" dir="ltr">
                      {c.type}
                    </span>
                    <Tag kind={c.kind} label={t(c.kind === "leak" ? "tagLeak" : c.kind === "public" ? "tagPublic" : "tagLocal")} />
                  </span>
                </li>
              ))
            )}
          </ul>

          {hasLocal && <p className="mt-3 text-xs text-text-tertiary leading-relaxed">{t("localNote")}</p>}

          <div className="mt-auto pt-5 font-mono text-xs text-text-tertiary" aria-hidden="true">
            <p dir="ltr" className="text-start">
              stun <span className="text-text-muted">stun.l.google.com:19302</span>
            </p>
            <p className="mt-1">
              <span className="text-accent-teal-light">{running ? "…" : "✓"}</span> gathering{" "}
              {running ? "running" : "complete"}
              <span className="terminal-cursor ms-1 text-accent-teal-light">▌</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerdictBox({ tone, title, body }: { tone: "teal" | "danger"; title: string; body: string }) {
  const danger = tone === "danger";
  return (
    <div
      className={`rounded-xl border p-5 ${
        danger ? "border-danger/30 bg-danger/10" : "border-accent-teal/25 bg-accent-teal/[0.06]"
      }`}
    >
      <p
        className={`flex items-center gap-2.5 font-display text-lg font-semibold leading-snug ${
          danger ? "text-danger" : "text-accent-teal-light"
        }`}
      >
        {danger ? <AlertIcon /> : <CheckShieldIcon />}
        {title}
      </p>
      <p className="mt-2 text-sm text-text-muted leading-relaxed">{body}</p>
    </div>
  );
}

function Tag({ kind, label }: { kind: Kind; label: string }) {
  const tone =
    kind === "leak"
      ? "border-danger/30 bg-danger/10 text-danger"
      : kind === "public"
        ? "border-accent-teal/25 bg-accent-teal/10 text-accent-teal-light"
        : "border-overlay/10 text-text-tertiary";
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] leading-none ${tone}`}>{label}</span>;
}

const iconProps = {
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.75,
  stroke: "currentColor",
  "aria-hidden": true,
} as const;

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg className={`w-4 h-4 ${spinning ? "motion-safe:animate-spin" : ""}`} {...iconProps} strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

function CheckShieldIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" {...iconProps}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" {...iconProps}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  );
}
