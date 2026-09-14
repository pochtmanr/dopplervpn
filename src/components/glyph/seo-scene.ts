/**
 * Terminal plates for the VLESS / crypto / censorship SEO pages.
 * Words stay English lowercase — they are artwork; translated claims sit above.
 */
import { kv, plateScene, trafficScene } from "./traffic-scene";

const VLESS_STEPS = [
  {
    label: "handshake",
    cursor: true as const,
    lines: () => [kv("tls", "1.3"), kv("sni", "real site"), kv("looks", "https")],
  },
  {
    label: "certificate",
    cursor: true as const,
    lines: () => [kv("cert", "borrowed"), kv("chain", "genuine"), kv("dpi", "blind")],
  },
  {
    label: "camouflage",
    cursor: true as const,
    lines: () => [kv("shape", "https"), kv("timing", "human"), kv("entropy", "natural")],
  },
  {
    label: "probe",
    cursor: true as const,
    lines: () => [kv("probe", "website"), kv("vpn", "hidden"), kv("auth", "required")],
  },
];

const CRYPTO_STEPS = [
  {
    label: "plan",
    cursor: true as const,
    lines: () => [kv("term", "1 / 6 / 12"), kv("account", "id only"), kv("email", "none")],
  },
  {
    label: "invoice",
    cursor: true as const,
    lines: () => [kv("btc", "ok"), kv("eth", "ok"), kv("usdt usdc", "ok")],
  },
  {
    label: "payment",
    cursor: true as const,
    lines: () => [kv("wallet", "any"), kv("confirm", "auto"), kv("receipt", "none")],
  },
];

export function vlessHowScene(index: number) {
  if (index === 2) return trafficScene(1);
  return plateScene(VLESS_STEPS[index] ?? VLESS_STEPS[0]);
}

export function cryptoHowScene(index: number) {
  return plateScene(CRYPTO_STEPS[index] ?? CRYPTO_STEPS[0]);
}

const TOOL_STEPS = [
  {
    label: "whoami",
    cursor: true as const,
    lines: () => [kv("addr", "public"), kv("geo", "isp"), kv("stored", "never")],
  },
  {
    label: "webrtc",
    cursor: true as const,
    lines: () => [kv("stun", "probed"), kv("host ice", "listed"), kv("leak", "check")],
  },
  {
    label: "dns",
    cursor: true as const,
    lines: () => [kv("qname", "whoami"), kv("via", "resolver"), kv("leak", "check")],
  },
];

export function toolsHowScene(index: number) {
  return plateScene(TOOL_STEPS[index] ?? TOOL_STEPS[0]);
}

export const VLESS_SPEED_ART = {
  label: "speed",
  cursor: true as const,
  lines: () => [kv("dpi", "blind"), kv("https", "identical"), kv("setup", "one tap")],
};

export const BYPASS_STATUS_ART = {
  label: "status",
  cursor: true as const,
  lines: () => [kv("store", "removed"), kv("service", "up"), kv("access", "telegram")],
};

export const CRYPTO_ID_ART = {
  label: "account",
  cursor: true as const,
  lines: () => [kv("card", "none"), kv("email", "none"), kv("id", "on-device")],
};
