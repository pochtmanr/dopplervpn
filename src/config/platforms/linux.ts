import { SITE_URL } from "@/lib/facts";
import type { AppImage, AppPageConfig, TerminalLine } from "./app-page";

/**
 * /vpn-for-linux: the announcement page. Doppler for Linux is planned, not shipped (briefs
 * L0–L11 in doppler-product/briefs/2026-11-16-linux-client), so the page has no download:
 * `waitlist` swaps the buttons for an email form and drops the SoftwareApplication schema.
 *
 * There are no screens to show, so every visual is a terminal card or a glyph tray. The
 * commands follow the CLI in brief L1 and are a preview; the caption under each card says so.
 * Words live in messages under `vpnForLinux.app.*`; command lines stay here, untranslated.
 *
 * When the first build ships: add `primary`, remove `waitlist`, and add "Linux" to PLATFORMS in
 * lib/facts.ts. Until then facts.ts, llms.txt and the JSON-LD must not list Linux as available.
 */

const cmd = (text: string): TerminalLine => ({ kind: "cmd", text });
const out = (text: string): TerminalLine => ({ kind: "out", text });

const LINK = `${SITE_URL}/link?code=WXYZ-1234`;

/**
 * The glass photos behind the App Store screenshots (doppler-apple/fastlane/screenshot-studio,
 * assets/bg), under the glyph rain in the two trays that have no terminal to show.
 */
const glass = (n: 0 | 1): AppImage => ({ src: `/images/linux/glass-${n}-1232.avif`, width: 1232, height: 928, bg: "#0B1016" });

export const linuxApp: AppPageConfig = {
  copyKey: "app",
  family: "linux",
  slug: "vpn-for-linux",
  namespace: "vpnForLinux",
  operatingSystem: "Linux",
  trackLocation: "vpn-for-linux",
  trackPlatform: "linux",
  waitlist: { platform: "linux" },
  ogImageAlt: "Doppler VPN for Linux",
  heroTerminal: [
    cmd("sudo apt install dopplervpn"),
    cmd("dopplervpn login"),
    out("Open this link on any device:"),
    out(LINK),
    out("Linked. Plan: Pro"),
    cmd("dopplervpn connect de"),
    out("Connected · Frankfurt, Germany"),
  ],
  tourDevice: "mac",
  tour: [],
  chapters: [
    { key: "app", frame: "glyph", glyph: "laptop", backdrop: glass(1) },
    {
      key: "cli",
      frame: "terminal",
      lines: [
        cmd("dopplervpn connect de"),
        out("Connected · Frankfurt, Germany"),
        cmd("dopplervpn status"),
        out("State        connected"),
        out("Location     Frankfurt, Germany"),
        out("Kill switch  on"),
        cmd("dopplervpn status --json"),
        out('{"state":"connected","location":"de-fra","killswitch":true}'),
      ],
    },
    {
      key: "login",
      frame: "terminal",
      lines: [
        cmd("dopplervpn login"),
        out("Open this link on any device:"),
        out(LINK),
        out("Waiting for approval..."),
        out("Linked. Plan: Pro"),
      ],
    },
    {
      key: "servers",
      frame: "terminal",
      lines: [
        cmd("dopplervpn profile add 'vless://...' --name my-server"),
        out('Added "my-server" (1 server)'),
        cmd("dopplervpn connect my-server"),
        out("Connected · my-server (your server)"),
      ],
    },
    {
      key: "automation",
      frame: "terminal",
      lines: [
        cmd("dopplervpn proxy add de"),
        out("de  http://127.0.0.1:41080"),
        cmd("dopplervpn proxy add us"),
        out("us  http://127.0.0.1:41081"),
        cmd("curl -x http://127.0.0.1:41081 https://ifconfig.co/country"),
        out("United States"),
      ],
    },
    {
      key: "safe",
      frame: "terminal",
      lines: [
        cmd("dopplervpn connect nl --confirm 60"),
        out("Connected · Amsterdam, Netherlands"),
        out('Run "dopplervpn confirm" within 60 s, or this is undone.'),
        cmd("dopplervpn confirm"),
        out("Confirmed. Incoming SSH kept its own route."),
      ],
    },
  ],
  ctaBackdrop: glass(0),
  privacy: ["noEmail", "vless", "noLogs", "page:pay"],
  guides: [],
  faqKeys: ["q1", "q2", "q3", "q4", "q5", "q6", "q7"],
  related: [
    { href: "/vpn-for-macos", key: "macos" },
    { href: "/vpn-for-windows", key: "windows" },
    { href: "/vpn-for-android", key: "android" },
  ],
};
