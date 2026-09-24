import type { ComponentType } from "react";
import { BarChart } from "./bar-chart";
import { FlowSchema } from "./flow-schema";
import { LineChart } from "./line-chart";
import { Timeline } from "./timeline";
import { chartCopy } from "./copy";
import { isSecurityLocale } from "@/i18n/security-locales";
import { SITE_URL } from "@/lib/facts";

/**
 * Every chart an article can place with a ```chart <id>``` fence. The data
 * lives here, next to its source, so a figure is never typed into prose without
 * the citation it came from.
 *
 * The words live in ./copy/<locale>.ts, keyed by locale the same way the
 * markdown files are. Source labels stay English on purpose: a citation a
 * reader can match against the page it points at is worth more than a
 * translated one.
 */

const pct = (v: number) => `${v}%`;

/** The /security page exists in its own locale subset; fall back to /en. */
function securitySource(locale: string) {
  const loc = isSecurityLocale(locale) ? locale : "en";
  return { label: "Doppler, Security and no-logs architecture", url: `${SITE_URL}/${loc}/security` };
}

/** The whole journey on one schema; the hub page shows it above the four steps. */
export function JourneySchema({ locale }: { locale: string }) {
  const c = chartCopy(locale);
  return (
    <FlowSchema
      sourceLabel={c["figure.sourceLabel"]}
      title={c["journey.title"]}
      source={[securitySource(locale), { label: "XTLS REALITY README", url: "https://github.com/XTLS/REALITY" }]}
      links={[c["journey.link1"], c["journey.link2"], c["journey.link3"]]}
      lanes={[
        {
          title: c["journey.lane1.title"],
          nodes: [
            { label: c["journey.lane1.node1.label"], detail: c["journey.lane1.node1.detail"], tone: "accent" },
            { label: c["journey.lane1.node2.label"], detail: c["journey.lane1.node2.detail"] },
          ],
          watcher: { who: c["journey.lane1.watcher.who"], sees: c["journey.lane1.watcher.sees"] },
        },
        {
          title: c["journey.lane2.title"],
          nodes: [
            { label: c["journey.lane2.node1.label"], detail: c["journey.lane2.node1.detail"], tone: "accent" },
            { label: c["journey.lane2.node2.label"], detail: c["journey.lane2.node2.detail"], tone: "muted" },
          ],
          watcher: { who: c["journey.lane2.watcher.who"], sees: c["journey.lane2.watcher.sees"] },
        },
        {
          title: c["journey.lane3.title"],
          nodes: [
            { label: c["journey.lane3.node1.label"], detail: c["journey.lane3.node1.detail"], tone: "accent" },
            { label: c["journey.lane3.node2.label"], detail: c["journey.lane3.node2.detail"] },
            { label: c["journey.lane3.node3.label"], detail: c["journey.lane3.node3.detail"], tone: "muted" },
          ],
        },
        {
          title: c["journey.lane4.title"],
          nodes: [{ label: c["journey.lane4.node1.label"], detail: c["journey.lane4.node1.detail"] }],
          watcher: { who: c["journey.lane4.watcher.who"], sees: c["journey.lane4.watcher.sees"] },
        },
      ]}
    />
  );
}

/** The charts an article can place, bound to one locale's copy. */
export function chartsFor(locale: string): Record<string, ComponentType> {
  const c = chartCopy(locale);
  const SECURITY = securitySource(locale);

  return {
    /* ── Step 1: your device ───────────────────────────────────────────── */
    "schema-device": () => (
      <FlowSchema
      sourceLabel={c["figure.sourceLabel"]}
        title={c["schema-device.title"]}
        source={SECURITY}
        links={[c["schema-device.link1"], c["schema-device.link2"]]}
        lanes={[
          {
            title: c["schema-device.lane1.title"],
            nodes: [
              { label: c["schema-device.lane1.node1.label"], detail: c["schema-device.lane1.node1.detail"], tone: "accent" },
              { label: c["schema-device.lane1.node2.label"], detail: c["schema-device.lane1.node2.detail"], tone: "muted" },
            ],
            watcher: { who: c["schema-device.lane1.watcher.who"], sees: c["schema-device.lane1.watcher.sees"] },
          },
          {
            title: c["schema-device.lane2.title"],
            nodes: [
              { label: c["schema-device.lane2.node1.label"], detail: c["schema-device.lane2.node1.detail"] },
              { label: c["schema-device.lane2.node2.label"], detail: c["schema-device.lane2.node2.detail"] },
            ],
          },
          {
            title: c["schema-device.lane3.title"],
            nodes: [
              { label: c["schema-device.lane3.node1.label"], detail: c["schema-device.lane3.node1.detail"], tone: "accent" },
            ],
            watcher: { who: c["schema-device.lane3.watcher.who"], sees: c["schema-device.lane3.watcher.sees"] },
          },
        ]}
      />
    ),
    "fingerprint-uniqueness": () => (
      <BarChart
      sourceLabel={c["figure.sourceLabel"]}
        title={c["fingerprint-uniqueness.title"]}
        note={c["fingerprint-uniqueness.note"]}
        source={[
          { label: "EFF Panopticlick (2010)", url: "https://www.eff.org/press/archives/2010/05/13" },
          { label: "Laperdrix et al., IEEE S&P (2016)", url: "https://www.semanticscholar.org/paper/fe2f4faec5cf209ae7d8a73100db9cce46ce53d4" },
        ]}
        max={100}
        format={pct}
        bars={[
          { label: c["fingerprint-uniqueness.bar1"], value: 83.6 },
          { label: c["fingerprint-uniqueness.bar2"], value: 94.2 },
          { label: c["fingerprint-uniqueness.bar3"], value: 89.4, highlight: true },
        ]}
      />
    ),
    "dbir-2026": () => (
      <BarChart
      sourceLabel={c["figure.sourceLabel"]}
        title={c["dbir-2026.title"]}
        note={c["dbir-2026.note"]}
        source={{ label: "Verizon, 2026 Data Breach Investigations Report", url: "https://www.verizon.com/business/resources/executivebriefs/2026-dbir-executive-summary.pdf" }}
        max={100}
        format={pct}
        bars={[
          { label: c["dbir-2026.bar1"], value: 62 },
          { label: c["dbir-2026.bar2"], value: 48 },
          { label: c["dbir-2026.bar3"], value: 48 },
          { label: c["dbir-2026.bar4"], value: 31 },
          { label: c["dbir-2026.bar5"], value: 26, highlight: true },
        ]}
      />
    ),

    /* ── Step 2: the VLESS-Reality tunnel ──────────────────────────────── */
    "schema-reality": () => (
      <FlowSchema
      sourceLabel={c["figure.sourceLabel"]}
        title={c["schema-reality.title"]}
        source={{ label: "XTLS REALITY README", url: "https://github.com/XTLS/REALITY" }}
        links={[c["schema-reality.link1"], c["schema-reality.link2"]]}
        lanes={[
          {
            title: c["schema-reality.lane1.title"],
            nodes: [
              { label: c["schema-reality.lane1.node1.label"], detail: c["schema-reality.lane1.node1.detail"], tone: "accent" },
              { label: c["schema-reality.lane1.node2.label"], detail: c["schema-reality.lane1.node2.detail"], tone: "muted" },
            ],
          },
          {
            title: c["schema-reality.lane2.title"],
            nodes: [{ label: c["schema-reality.lane2.node1.label"], detail: c["schema-reality.lane2.node1.detail"] }],
            watcher: { who: c["schema-reality.lane2.watcher.who"], sees: c["schema-reality.lane2.watcher.sees"] },
          },
          {
            title: c["schema-reality.lane3.title"],
            nodes: [
              { label: c["schema-reality.lane3.node1.label"], detail: c["schema-reality.lane3.node1.detail"], tone: "accent" },
              { label: c["schema-reality.lane3.node2.label"], detail: c["schema-reality.lane3.node2.detail"], tone: "muted" },
            ],
          },
        ]}
      />
    ),
    "detection-rates": () => (
      <BarChart
      sourceLabel={c["figure.sourceLabel"]}
        title={c["detection-rates.title"]}
        note={c["detection-rates.note"]}
        source={[
          { label: "Xue et al., USENIX Security 2022", url: "https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen" },
          { label: "Xue et al., USENIX Security 2024", url: "https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting" },
        ]}
        max={100}
        format={pct}
        bars={[
          { label: c["detection-rates.bar1"], value: 85 },
          { label: c["detection-rates.bar2"], value: 83 },
          { label: c["detection-rates.bar3"], value: 70, highlight: true },
        ]}
      />
    ),
    "protocol-timeline": () => (
      <Timeline
      sourceLabel={c["figure.sourceLabel"]}
        title={c["protocol-timeline.title"]}
        source={[
          { label: "Tor Project", url: "https://www.torproject.org/about/history/" },
          { label: "GFW Report", url: "https://gfw.report/publications/usenixsecurity23/en/" },
          { label: "Project X chronicle", url: "https://xtls.github.io/en/about/news.html" },
          { label: "net4people", url: "https://github.com/net4people/bbs/issues/546" },
        ]}
        events={[
          { year: c["protocol-timeline.e1.year"], title: c["protocol-timeline.e1.title"], body: c["protocol-timeline.e1.body"] },
          { year: c["protocol-timeline.e2.year"], title: c["protocol-timeline.e2.title"], body: c["protocol-timeline.e2.body"] },
          { year: c["protocol-timeline.e3.year"], title: c["protocol-timeline.e3.title"], body: c["protocol-timeline.e3.body"] },
          { year: c["protocol-timeline.e4.year"], title: c["protocol-timeline.e4.title"], body: c["protocol-timeline.e4.body"] },
          { year: c["protocol-timeline.e5.year"], title: c["protocol-timeline.e5.title"], body: c["protocol-timeline.e5.body"] },
          { year: c["protocol-timeline.e6.year"], title: c["protocol-timeline.e6.title"], body: c["protocol-timeline.e6.body"] },
          { year: c["protocol-timeline.e7.year"], title: c["protocol-timeline.e7.title"], body: c["protocol-timeline.e7.body"] },
          { year: c["protocol-timeline.e8.year"], title: c["protocol-timeline.e8.title"], body: c["protocol-timeline.e8.body"] },
          { year: c["protocol-timeline.e9.year"], title: c["protocol-timeline.e9.title"], body: c["protocol-timeline.e9.body"], highlight: true },
          { year: c["protocol-timeline.e10.year"], title: c["protocol-timeline.e10.title"], body: c["protocol-timeline.e10.body"] },
          { year: c["protocol-timeline.e11.year"], title: c["protocol-timeline.e11.title"], body: c["protocol-timeline.e11.body"] },
        ]}
      />
    ),

    /* ── Step 3: the edge node ─────────────────────────────────────────── */
    "schema-edge": () => (
      <FlowSchema
      sourceLabel={c["figure.sourceLabel"]}
        title={c["schema-edge.title"]}
        source={[SECURITY, { label: "IETF RFC 3022", url: "https://www.rfc-editor.org/rfc/rfc3022" }]}
        links={[c["schema-edge.link1"], c["schema-edge.link2"]]}
        lanes={[
          {
            title: c["schema-edge.lane1.title"],
            nodes: [{ label: c["schema-edge.lane1.node1.label"], detail: c["schema-edge.lane1.node1.detail"], tone: "accent" }],
          },
          {
            title: c["schema-edge.lane2.title"],
            nodes: [
              { label: c["schema-edge.lane2.node1.label"], detail: c["schema-edge.lane2.node1.detail"], tone: "accent" },
              { label: c["schema-edge.lane2.node2.label"], detail: c["schema-edge.lane2.node2.detail"] },
              { label: c["schema-edge.lane2.node3.label"], detail: c["schema-edge.lane2.node3.detail"], tone: "muted" },
            ],
          },
          {
            title: c["schema-edge.lane3.title"],
            nodes: [{ label: c["schema-edge.lane3.node1.label"], detail: c["schema-edge.lane3.node1.detail"] }],
            watcher: { who: c["schema-edge.lane3.watcher.who"], sees: c["schema-edge.lane3.watcher.sees"] },
          },
        ]}
      />
    ),
    "latency-distance": () => (
      <LineChart
      sourceLabel={c["figure.sourceLabel"]}
        title={c["latency-distance.title"]}
        note={c["latency-distance.note"]}
        source={[
          { label: "WonderNetwork ping statistics", url: "https://wondernetwork.com/pings" },
          { label: "Cloudflare", url: "https://blog.cloudflare.com/fastest-internet/" },
        ]}
        xLabel={c["latency-distance.xLabel"]}
        yLabel={c["latency-distance.yLabel"]}
        xMax={18000}
        yMax={300}
        xTicks={[0, 5000, 10000, 15000]}
        yTicks={[0, 100, 200, 300]}
        line={false}
        reference={{ slope: 0.01, label: c["latency-distance.reference"] }}
        points={[
          { x: 640, y: 17.4, label: c["latency-distance.point1"] },
          { x: 5570, y: 70.0, label: c["latency-distance.point2"] },
          { x: 10260, y: 157.0, label: c["latency-distance.point3"] },
          { x: 16990, y: 266.3, label: c["latency-distance.point4"] },
        ]}
      />
    ),
  };
}
