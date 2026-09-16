/**
 * Scenes for the "How Doppler VPN Protects Your Traffic" cards.
 *
 * Same lattice as the platform band, deliberately not the same picture. That
 * one is wordless drifting grain with a mark scanning its edge, holding still
 * under a logo; this one is a wide terminal plate that prints itself left to
 * right and then keeps working. A card mounts its field when it first scrolls
 * into view and keeps it, so these resolve once (`loop={false}`) and then live
 * on their own content — the scramble, the travelling node, the filling
 * checkmarks — instead of dissolving back to noise every cycle.
 */
import { stamp, type Frame, type Scene } from "./glyph-scene";

/**
 * A long, low band: the plate sits under the card's text rather than behind it,
 * so it is far wider than it is tall.
 *
 * The grid aspect (cols*0.6 : rows*1.15) against the host's aspect is what
 * decides which axis overflows and gets clipped — see the size comment in
 * glyph-field.tsx. Rather than budget for that clipping, the host adopts
 * TRAFFIC_ASPECT as its own aspect-ratio: the two then match at every card
 * width and nothing is ever cut, which matters because four cards across a
 * 1600px row and one card on a phone differ by more than a factor of two.
 */
export const TRAFFIC_COLS = 52;
export const TRAFFIC_ROWS = 9;

/** Side well on the support featured cards (ticket plate + Telegram grain). */
export const SUPPORT_WELL_COLS = 64;
export const SUPPORT_WELL_ROWS = 16;
export const SUPPORT_WELL_ASPECT =
  (SUPPORT_WELL_COLS * 0.6) / (SUPPORT_WELL_ROWS * 1.15);

/** The grid's shape. A host that does not adopt it will clip the lattice. */
export const TRAFFIC_ASPECT = (TRAFFIC_COLS * 0.6) / (TRAFFIC_ROWS * 1.15);

// 36 wide in a 52 grid leaves eight columns of open field either side, and rows
// 2..6 of 9 centre the plate exactly, on two rows of open field above and below.
const PLATE_W = 36;
const PLATE_X = 8;
const PLATE_TOP = 2;
/** Usable width between the plate's border and its one-space inner padding. */
const INNER_W = PLATE_W - 4;

function plateTop(label: string): string {
  const head = `┌─ ${label} `;
  return head + "─".repeat(Math.max(0, PLATE_W - head.length - 1)) + "┐";
}

/**
 * A padded whole row, never a fragment: a cell holding a space is content, and
 * content is what stops the noise field bleeding through the plate's middle.
 */
function plateLine(text: string): string {
  const t = text.length > INNER_W ? text.slice(0, INNER_W) : text;
  return "│ " + t + " ".repeat(INNER_W - t.length) + " │";
}

function plateBottom(): string {
  return "└" + "─".repeat(PLATE_W - 2) + "┘";
}

/** Key/value readout. 12 is the widest column that still leaves room for the
 *  longest value below without tripping plateLine's truncation. */
export function kv(key: string, value: string): string {
  return key.padEnd(12) + value;
}

// Block glyphs only — the scramble has to read as ciphertext, so it must not
// share an alphabet with the ramp the surrounding noise field draws from.
const CIPHER = "░▒▓█▚▞";

function scramble(width: number, tick: number): string {
  let s = "";
  for (let i = 0; i < width; i++) {
    // Deterministic in (cell, tick): the field can be paused and resumed at any
    // point without the picture jumping.
    const h = Math.sin((i + 1) * 91.7 + tick * 37.3) * 43758.5453;
    s += CIPHER[Math.floor((h - Math.floor(h)) * CIPHER.length)];
  }
  return s;
}

function nodeRow(active: number): string {
  return [0, 1, 2].map((i) => (i === active ? "●" : "○")).join("────") + "   doppler edge";
}

function siteRow(name: string, done: boolean): string {
  return "▸ " + name.padEnd(14) + (done ? "✓" : "·");
}

/** One plate's content. Exported so other surfaces (the account dashboard) can
 *  print their own plate on this exact grid and timing. */
export interface PlateArt {
  label: string;
  /** Exactly three plate lines. `tMs` is the field clock. */
  lines(tMs: number): string[];
  /** Ride a mark down the right-hand edge. Off where the lines already move. */
  cursor?: boolean;
}

const STEPS: readonly PlateArt[] = [
  {
    label: "device",
    cursor: true,
    lines: () => [kv("account", "none"), kv("email", "none"), kv("keys", "on-device")],
  },
  {
    label: "tunnel",
    cursor: true,
    lines: (t) => [
      scramble(15, Math.floor(t / 110)) + "  encrypted",
      "looks like ordinary https",
      kv("sni", "real · dpi blind"),
    ],
  },
  {
    label: "edge node",
    cursor: true,
    lines: (t) => [
      nodeRow(Math.floor(t / 520) % 3),
      kv("logs", "0"),
      kv("retention", "none"),
    ],
  },
  {
    label: "open internet",
    lines: (t) => {
      // Cycles back through 0, so the marks clear and fill again — the one
      // scene whose own content carries the motion.
      const done = Math.floor(t / 380) % 4;
      return [
        siteRow("site.com", done > 0),
        siteRow("messenger", done > 1),
        siteRow("video", done > 2),
      ];
    },
  },
];

export function trafficScene(index: number): Scene {
  return plateScene(STEPS[index % STEPS.length]);
}

/** Grid aspect for a plate scene. A host must adopt it or the lattice clips. */
export function plateAspect(cols: number, rows: number = TRAFFIC_ROWS): number {
  return (cols * 0.6) / (rows * 1.15);
}

/**
 * A terminal plate: prints left to right, then keeps working. `cols` widens the
 * grid around a centred plate, so a wide host keeps the glyphs small instead of
 * scaling them up to fill its width. `rows` does the same on the vertical axis
 * for a side slot (the traffic band stays 9).
 */
export function plateScene(
  art: PlateArt,
  cols: number = TRAFFIC_COLS,
  rows: number = TRAFFIC_ROWS,
): Scene {
  const originX = cols === TRAFFIC_COLS ? PLATE_X : Math.floor((cols - PLATE_W) / 2);
  const originY = rows === TRAFFIC_ROWS ? PLATE_TOP : Math.floor((rows - 5) / 2);
  /** Column of the last usable cell inside the plate — where the cursor rides. */
  const cursorX = originX + PLATE_W - 3;

  return {
    cols,
    rows,

    paint(f: Frame, tMs: number) {
      stamp(f, originY, originX, plateTop(art.label));
      art.lines(tMs).forEach((line, i) => stamp(f, originY + 1 + i, originX, plateLine(line)));
      stamp(f, originY + 4, originX, plateBottom());

      if (art.cursor) {
        stamp(f, originY + 1 + (Math.floor(tMs / 450) % 3), cursorX, "▸", "accent");
      }
    },

    order(row, col) {
      // Left to right, so the plate reads as a line printing. The band's radial
      // order is that picture's signature and is not borrowed here; the row term
      // is small, just enough to stop the sweep looking like a rigid wipe.
      const sweep = (col / (cols - 1)) * 0.85 + (row / (rows - 1)) * 0.15;
      return Math.min(1, Math.max(0, sweep));
    },
  };
}
