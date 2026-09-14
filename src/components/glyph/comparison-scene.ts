/**
 * Scenes for the open rows of the "Doppler vs. Traditional VPNs" accordion.
 *
 * Each row prints a diff plate: the traditional answer on a muted `-` line,
 * Doppler's on a teal `+` line, and one live line that keeps working after the
 * plate lands. The field is mounted when a row opens and unmounted when it
 * closes, so every open prints the plate again from the left — the accordion's
 * open state IS the print. Terminal words stay English and lowercase, like the
 * traffic plates: they are artwork, and the translated answer sits beside them.
 */
import { stamp, type Frame, type Scene } from "./glyph-scene";

export const COMPARE_COLS = 44;
export const COMPARE_ROWS = 9;

/** The grid's shape. The host adopts it as its aspect-ratio so nothing clips. */
export const COMPARE_ASPECT = (COMPARE_COLS * 0.6) / (COMPARE_ROWS * 1.15);

// 36 wide leaves four columns of grain either side; rows 2..6 centre the plate.
const PLATE_W = 36;
const PLATE_X = 4;
const PLATE_TOP = 2;
const INNER_W = PLATE_W - 4;
const INNER_X = PLATE_X + 2;

function plateTop(label: string): string {
  const head = `┌─ diff · ${label} `;
  return head + "─".repeat(Math.max(0, PLATE_W - head.length - 1)) + "┐";
}

/** A padded whole row: spaces are content, which keeps grain out of the plate. */
function plateLine(text: string): string {
  const t = text.length > INNER_W ? text.slice(0, INNER_W) : text;
  return "│ " + t + " ".repeat(INNER_W - t.length) + " │";
}

function plateBottom(): string {
  return "└" + "─".repeat(PLATE_W - 2) + "┘";
}

// Block glyphs only, so the scramble never shares an alphabet with the grain ramp.
const CIPHER = "░▒▓█▚▞";

function scramble(width: number, tick: number, salt = 0): string {
  let s = "";
  for (let i = 0; i < width; i++) {
    // Deterministic in (cell, tick): pausing and resuming never jumps the picture.
    const h = Math.sin((i + 1 + salt) * 91.7 + tick * 37.3) * 43758.5453;
    s += CIPHER[Math.floor((h - Math.floor(h)) * CIPHER.length)];
  }
  return s;
}

interface RowArt {
  label: string;
  before: string;
  after: string;
  /** The live line. May return accent segments as [col, text] pairs. */
  live(tMs: number): { text: string; accent?: [number, string][] };
}

const ROWS: Readonly<Record<string, RowArt>> = {
  account: {
    label: "account",
    before: "email + password",
    after: "anonymous id",
    live: (t) => ({ text: "id   VPN-7F3A-" + scramble(4, Math.floor(t / 140)) + "-" + scramble(4, Math.floor(t / 140), 9) }),
  },
  fingerprint: {
    label: "fingerprint",
    before: "vpn signature",
    after: "plain https",
    live: (t) => ({ text: scramble(14, Math.floor(t / 110)) + "  looks like tls" }),
  },
  protocol: {
    label: "protocol",
    before: "openvpn / wireguard",
    after: "vless-reality",
    live: (t) => {
      const span = 14;
      const at = Math.floor(t / 160) % span;
      const path = "─".repeat(at) + "●" + "─".repeat(span - at - 1);
      return { text: "client " + path + " site.com" };
    },
  },
  dns: {
    label: "dns",
    before: "plain dns · isp sees it",
    after: "inside the tunnel",
    live: (t) => {
      // Fill, hold on "discarded", clear, repeat.
      const step = Math.floor(t / 180) % 14;
      const filled = Math.min(8, step);
      const bar = "█".repeat(filled) + "░".repeat(8 - filled);
      const done = step >= 8;
      return {
        text: "lookup [" + bar + "] " + (done ? "∅ discarded" : "resolving"),
        accent: done ? [[18, "∅"]] : undefined,
      };
    },
  },
  censorship: {
    label: "censorship",
    before: "blocked by dpi",
    after: "passes dpi",
    live: (t) => {
      const step = Math.floor(t / 260) % 7;
      const dots = ".".repeat(Math.min(3, step)).padEnd(3);
      return { text: "dpi scan " + dots + (step >= 4 ? "  pass ✓" : "") };
    },
  },
  logs: {
    label: "logs",
    before: "varies by provider",
    after: "none written",
    live: (t) => ({
      text: "written   0 bytes",
      accent: Math.floor(t / 530) % 2 ? undefined : [[18, "▌"]],
    }),
  },
};

export function comparisonScene(key: string): Scene {
  const art = ROWS[key] ?? ROWS.account;

  return {
    cols: COMPARE_COLS,
    rows: COMPARE_ROWS,

    paint(f: Frame, tMs: number) {
      stamp(f, PLATE_TOP, PLATE_X, plateTop(art.label));
      stamp(f, PLATE_TOP + 1, PLATE_X, plateLine("- " + art.before));
      stamp(f, PLATE_TOP + 2, PLATE_X, plateLine("+ " + art.after + "  ✓"));
      // The verdict line is the loudest thing on the plate.
      stamp(f, PLATE_TOP + 2, INNER_X, "+ " + art.after, "accent");

      const live = art.live(tMs);
      stamp(f, PLATE_TOP + 3, PLATE_X, plateLine(live.text));
      live.accent?.forEach(([col, text]) => stamp(f, PLATE_TOP + 3, INNER_X + col, text, "accent"));

      stamp(f, PLATE_TOP + 4, PLATE_X, plateBottom());
    },

    order(row, col) {
      // Left to right, like a line printing — the traffic plates' signature.
      const sweep = (col / (COMPARE_COLS - 1)) * 0.85 + (row / (COMPARE_ROWS - 1)) * 0.15;
      return Math.min(1, Math.max(0, sweep));
    },
  };
}
