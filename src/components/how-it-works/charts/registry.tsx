import type { ComponentType } from "react";
import { BarChart } from "./bar-chart";
import { FlowSchema } from "./flow-schema";
import { LineChart } from "./line-chart";
import { Timeline } from "./timeline";

/**
 * Every chart an article can place with a ```chart <id>``` fence. The data
 * lives here, next to its source, so a figure is never typed into prose without
 * the citation it came from. English for now: when the articles are translated,
 * key this by locale the same way the markdown files are.
 */

const pct = (v: number) => `${v}%`;
const SECURITY = { label: "Doppler, Security and no-logs architecture", url: "https://www.dopplervpn.org/en/security" };

/** The whole journey on one schema; the hub page shows it above the four steps. */
export function JourneySchema() {
  return (
    <FlowSchema
      title="One connection, end to end"
      source={[SECURITY, { label: "XTLS REALITY README", url: "https://github.com/XTLS/REALITY" }]}
      links={["encrypted", "unwrapped", "node's IP"]}
      lanes={[
        {
          title: "1 · Your device",
          nodes: [
            { label: "Doppler app", detail: "Random account ID, no email", tone: "accent" },
            { label: "DNS and site names", detail: "Sent into the tunnel, not to your ISP" },
          ],
          watcher: { who: "Wi-Fi owner, ISP", sees: "One TLS 1.3 session to what looks like a popular website" },
        },
        {
          title: "2 · VLESS-Reality tunnel",
          nodes: [
            { label: "TLS 1.3 handshake", detail: "Borrowed from a real website", tone: "accent" },
            { label: "Probes", detail: "Forwarded to that real website", tone: "muted" },
          ],
          watcher: { who: "Censor's DPI", sees: "Ordinary HTTPS; a probe finds a genuine site" },
        },
        {
          title: "3 · Doppler edge node",
          nodes: [
            { label: "Address swap", detail: "Your IP becomes the node's", tone: "accent" },
            { label: "DNS resolver", detail: "Queries never logged" },
            { label: "Traffic logs", detail: "None kept", tone: "muted" },
          ],
        },
        {
          title: "4 · Open internet",
          nodes: [{ label: "The site you asked for", detail: "Test what it sees at /tools" }],
          watcher: { who: "The website", sees: "The node's IP, and your browser's own fingerprint" },
        },
      ]}
    />
  );
}

export const CHARTS: Record<string, ComponentType> = {
  /* ── Step 1: your device ─────────────────────────────────────────────── */
  "schema-device": () => (
    <FlowSchema
      title="What leaves your device when Doppler connects"
      source={SECURITY}
      links={["1 · sign in", "2 · connect"]}
      lanes={[
        {
          title: "Your device",
          nodes: [
            { label: "Doppler app", detail: "Makes a random VPN-XXXX-XXXX-XXXX ID on first launch", tone: "accent" },
            { label: "No sign-up form", detail: "No email, phone or password", tone: "muted" },
          ],
          watcher: { who: "Wi-Fi owner, ISP", sees: "An HTTPS call to our API, then one TLS session" },
        },
        {
          title: "Doppler API",
          nodes: [
            { label: "Sign-in record", detail: "IP, account ID, device ID, time. Kept up to 90 days" },
            { label: "Server settings", detail: "Delivered over an authenticated API" },
          ],
        },
        {
          title: "Tunnel",
          nodes: [
            { label: "VLESS-Reality opens", detail: "DNS and site names now travel inside it", tone: "accent" },
          ],
          watcher: { who: "Wi-Fi owner, ISP", sees: "No domains, no site names, no pages" },
        },
      ]}
    />
  ),
  "fingerprint-uniqueness": () => (
    <BarChart
      title="Share of browsers with a unique fingerprint"
      note="Panopticlick sampled about 470,000 browsers in 2010. AmIUnique sampled 118,934 in 2016."
      source={[
        { label: "EFF Panopticlick (2010)", url: "https://www.eff.org/press/archives/2010/05/13" },
        { label: "Laperdrix et al., IEEE S&P (2016)", url: "https://www.semanticscholar.org/paper/fe2f4faec5cf209ae7d8a73100db9cce46ce53d4" },
      ]}
      max={100}
      format={pct}
      bars={[
        { label: "Panopticlick, all browsers (2010)", value: 83.6 },
        { label: "Panopticlick, with Flash or Java (2010)", value: 94.2 },
        { label: "AmIUnique (2016)", value: 89.4, highlight: true },
      ]}
    />
  ),
  "dbir-2026": () => (
    <BarChart
      title="What shows up in data breaches (share of confirmed breaches)"
      note="Over 22,000 confirmed breaches across 145 countries. Categories overlap, so they do not add up to 100%."
      source={{ label: "Verizon, 2026 Data Breach Investigations Report", url: "https://www.verizon.com/business/resources/executivebriefs/2026-dbir-executive-summary.pdf" }}
      max={100}
      format={pct}
      bars={[
        { label: "A human element involved", value: 62 },
        { label: "Ransomware", value: 48 },
        { label: "A third party involved", value: 48 },
        { label: "Entry through a software vulnerability", value: 31 },
        { label: "Credentials among the data taken", value: 26, highlight: true },
      ]}
    />
  ),

  /* ── Step 2: the VLESS-Reality tunnel ─────────────────────────────────── */
  "schema-reality": () => (
    <FlowSchema
      title="Where a Reality connection goes, and what each party sees"
      source={{ label: "XTLS REALITY README", url: "https://github.com/XTLS/REALITY" }}
      links={["TLS 1.3", "token check"]}
      lanes={[
        {
          title: "Client",
          nodes: [
            { label: "Doppler app", detail: "Handshake names a real site and carries a hidden x25519 token", tone: "accent" },
            { label: "Anyone else", detail: "Censor's probe, scanner, browser", tone: "muted" },
          ],
        },
        {
          title: "The network",
          nodes: [{ label: "DPI box", detail: "GFW, TSPU or an ISP filter" }],
          watcher: { who: "Censor", sees: "A normal TLS 1.3 visit to a popular website" },
        },
        {
          title: "Reality server",
          nodes: [
            { label: "Valid token", detail: "Tunnel opens, VLESS traffic flows to the edge node", tone: "accent" },
            { label: "No token", detail: "Passed through to the real site and its genuine certificate", tone: "muted" },
          ],
        },
      ]}
    />
  ),
  "detection-rates": () => (
    <BarChart
      title="How often researchers caught disguised traffic"
      note="Three studies on real networks. Each figure is the study's reported floor, so the true rates are at or above these."
      source={[
        { label: "Xue et al., USENIX Security 2022", url: "https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen" },
        { label: "Xue et al., USENIX Security 2024", url: "https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting" },
      ]}
      max={100}
      format={pct}
      bars={[
        { label: "OpenVPN flows identified", value: 85 },
        { label: "\"Obfuscated\" VPN setups caught (34 of 41)", value: 83 },
        { label: "Obfuscated proxies caught by TLS-in-TLS patterns", value: 70, highlight: true },
      ]}
    />
  ),
  "protocol-timeline": () => (
    <Timeline
      title="Twenty years of cat and mouse"
      source={[
        { label: "Tor Project", url: "https://www.torproject.org/about/history/" },
        { label: "GFW Report", url: "https://gfw.report/publications/usenixsecurity23/en/" },
        { label: "Project X chronicle", url: "https://xtls.github.io/en/about/news.html" },
        { label: "net4people", url: "https://github.com/net4people/bbs/issues/546" },
      ]}
      events={[
        { year: "2002", title: "Tor goes live", body: "Onion routing opens to the public. Its traffic is easy to recognise, which later forces the creation of disguised \"pluggable transports\"." },
        { year: "2012", title: "Shadowsocks", body: "A lightweight proxy whose traffic looks like random bytes. It spreads fast in China." },
        { year: "2015", title: "V2Ray and VMess, and a takedown", body: "Project V starts in September. In August the Shadowsocks author had deleted the code after a visit from the police." },
        { year: "2019", title: "Active probing gets documented", body: "Researchers log over 51,000 probes from Chinese IPs testing suspected Shadowsocks servers." },
        { year: "Jul 2020", title: "VLESS proposed", body: "A stripped-down protocol with no encryption of its own, meant to ride inside TLS." },
        { year: "Nov 2020", title: "Xray-core", body: "The XTLS project forks from V2Ray and becomes VLESS's main home." },
        { year: "Nov 2021", title: "China blocks \"fully encrypted\" traffic", body: "Random-looking connections to data-centre IPs start getting cut with a 26% chance each." },
        { year: "Oct 2022", title: "XTLS Vision", body: "Stops encrypting already encrypted web traffic twice, and hides the telltale sizes of TLS nested in TLS." },
        { year: "Mar 2023", title: "REALITY ships", body: "Xray-core 1.8.0. No domain or certificate needed: the server borrows a real website's TLS handshake.", highlight: true },
        { year: "Aug 2023", title: "Russia filters WireGuard and OpenVPN", body: "Users on major mobile carriers report both protocols cut within seconds." },
        { year: "Nov 2025", title: "The next round", body: "Some Russian home ISPs are reported to cut Reality connections. Operators answer with new ports and transports." },
      ]}
    />
  ),

  /* ── Step 3: the edge node ───────────────────────────────────────────── */
  "schema-edge": () => (
    <FlowSchema
      title="Inside a Doppler edge node"
      source={[SECURITY, { label: "IETF RFC 3022", url: "https://www.rfc-editor.org/rfc/rfc3022" }]}
      links={["unwrapped", "node's IP"]}
      lanes={[
        {
          title: "Tunnel",
          nodes: [{ label: "VLESS-Reality stream", detail: "Arrives encrypted from your device", tone: "accent" }],
        },
        {
          title: "Edge node",
          nodes: [
            { label: "Address translation", detail: "Your IP is swapped for the node's", tone: "accent" },
            { label: "DNS resolver", detail: "Answers lookups inside the tunnel" },
            { label: "Not written down", detail: "Sites, DNS queries, bandwidth, session times", tone: "muted" },
          ],
        },
        {
          title: "Open internet",
          nodes: [{ label: "Website", detail: "Receives the request from the node" }],
          watcher: { who: "The website", sees: "The node's IP, not yours. Your browser fingerprint still reaches it" },
        },
      ]}
    />
  ),
  "latency-distance": () => (
    <LineChart
      title="Round-trip time vs distance between cities"
      note="Dots: measured average RTT between city pairs (WonderNetwork, 24 September 2026), plotted at the approximate great-circle distance. Dashed line: the physical floor of about 1 ms per 100 km in fibre."
      source={[
        { label: "WonderNetwork ping statistics", url: "https://wondernetwork.com/pings" },
        { label: "Cloudflare", url: "https://blog.cloudflare.com/fastest-internet/" },
      ]}
      xLabel="Distance (km)"
      yLabel="Round trip (ms)"
      xMax={18000}
      yMax={300}
      xTicks={[0, 5000, 10000, 15000]}
      yTicks={[0, 100, 200, 300]}
      line={false}
      reference={{ slope: 0.01, label: "Light in fibre" }}
      points={[
        { x: 640, y: 17.4, label: "London to Frankfurt, 17 ms" },
        { x: 5570, y: 70.0, label: "London to New York, 70 ms" },
        { x: 10260, y: 157.0, label: "Frankfurt to Singapore, 157 ms" },
        { x: 16990, y: 266.3, label: "London to Sydney, 266 ms" },
      ]}
    />
  ),
};
