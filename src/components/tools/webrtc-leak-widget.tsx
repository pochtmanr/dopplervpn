"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Status = "loading" | "loaded" | "error" | "no-webrtc";

interface IpInfo {
  ip: string;
}

// Matches IPv4 (4 dotted octets) or shortest non-trivial IPv6 (two colon-separated
// hex groups). Used to extract candidates from SDP strings produced by
// RTCPeerConnection.createOffer — those candidates include every interface
// the browser can find, including the real address behind a VPN.
const IP_REGEX = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){2,})/gi;

// Local-network addresses we don't surface as "leaks". A real-IP leak only
// matters if the address is routable on the public internet.
function isPrivateAddress(ip: string): boolean {
  if (ip === "0.0.0.0" || ip === "127.0.0.1" || ip.startsWith("::1")) return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip.startsWith("fe80:")) return true; // IPv6 link-local
  if (ip.startsWith("fc00:") || ip.startsWith("fd")) return true; // IPv6 unique-local
  // 172.16.0.0/12
  const m = /^172\.(\d{1,3})\./.exec(ip);
  if (m) {
    const second = parseInt(m[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  // mDNS obfuscation (Chrome) — these end in .local and aren't real IPs.
  if (ip.endsWith(".local")) return true;
  return false;
}

async function probeWebRtcIps(timeoutMs = 2500): Promise<string[]> {
  if (typeof RTCPeerConnection === "undefined") {
    return [];
  }
  const ips = new Set<string>();
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  pc.createDataChannel("");

  return new Promise<string[]>((resolve) => {
    const finish = () => {
      try {
        pc.close();
      } catch {
        // closing a closed connection throws in some browsers; ignore.
      }
      resolve([...ips]);
    };

    const timer = setTimeout(finish, timeoutMs);

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        clearTimeout(timer);
        finish();
        return;
      }
      const matches = event.candidate.candidate.matchAll(IP_REGEX);
      for (const match of matches) {
        const ip = match[0].toLowerCase();
        if (!isPrivateAddress(ip)) ips.add(ip);
      }
    };

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => {
        clearTimeout(timer);
        finish();
      });
  });
}

export function WebRtcLeakWidget() {
  const t = useTranslations("toolsWebrtcLeak.widget");
  const [publicIp, setPublicIp] = useState<string | null>(null);
  const [webrtcIps, setWebrtcIps] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [refreshing, setRefreshing] = useState(false);

  async function runTest() {
    setStatus("loading");
    try {
      const [ipRes, ips] = await Promise.all([
        fetch("/api/ip", { cache: "no-store" }).then((r) =>
          r.ok ? (r.json() as Promise<IpInfo>) : Promise.reject(new Error("ip-fetch"))
        ),
        probeWebRtcIps(),
      ]);
      setPublicIp(ipRes.ip);
      setWebrtcIps(ips);
      setStatus(ips.length === 0 ? "no-webrtc" : "loaded");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    runTest();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await runTest();
    setRefreshing(false);
  }

  const leakedIps = webrtcIps.filter((ip) => ip !== publicIp);
  const isLeaking = status === "loaded" && leakedIps.length > 0;
  const isSafe = status === "loaded" && leakedIps.length === 0;
  const isNoWebrtc = status === "no-webrtc";

  return (
    <div className="rounded-2xl bg-bg-secondary/60 backdrop-blur-sm border border-overlay/5 p-6 sm:p-8">
      {status === "error" ? (
        <p className="text-text-muted text-center py-8">{t("error")}</p>
      ) : status === "loading" ? (
        <p className="text-text-muted text-center py-8" aria-live="polite">
          {t("loading")}
        </p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-overlay/5">
            <div>
              <div className="text-text-muted text-xs uppercase tracking-wider mb-2">
                {t("publicIp")}
              </div>
              <div className="font-mono text-xl text-text-primary break-all">
                {publicIp || t("unknown")}
              </div>
            </div>
            <div>
              <div className="text-text-muted text-xs uppercase tracking-wider mb-2">
                {t("webrtcIps")}
              </div>
              {webrtcIps.length > 0 ? (
                <ul className="font-mono text-sm text-text-primary space-y-1">
                  {webrtcIps.map((ip) => (
                    <li key={ip} className={ip !== publicIp ? "text-red-400" : ""}>
                      {ip}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="font-mono text-sm text-text-muted">—</div>
              )}
            </div>
          </div>

          {isLeaking && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-5 mb-4">
              <h3 className="font-display text-lg text-red-400 mb-2">{t("leakedTitle")}</h3>
              <p className="text-text-secondary text-sm">{t("leakedBody")}</p>
            </div>
          )}
          {isSafe && (
            <div className="rounded-xl bg-accent-teal/10 border border-accent-teal/30 p-5 mb-4">
              <h3 className="font-display text-lg text-accent-teal mb-2">{t("safeTitle")}</h3>
              <p className="text-text-secondary text-sm">{t("safeBody")}</p>
            </div>
          )}
          {isNoWebrtc && (
            <div className="rounded-xl bg-accent-gold/10 border border-accent-gold/30 p-5 mb-4">
              <p className="text-text-secondary text-sm">{t("noWebrtc")}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors disabled:opacity-50"
            >
              {refreshing ? t("refreshing") : t("refresh")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
