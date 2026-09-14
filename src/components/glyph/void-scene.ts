/**
 * Scenes for the "What We Don't Store" cards: data that isn't there.
 *
 * Each card is a query plate. A command types itself in, the record slots it
 * would read from scan for a moment, and the answer comes back empty. The slots
 * are the point: their insides are left unstamped, and an unstamped cell is
 * where GlyphField draws its drifting grain. So each record is a frame with
 * nothing in it but noise, and it never resolves into anything.
 *
 * Like the traffic plates, the words are English terminal vocabulary: artwork,
 * with the translated claim printed beside the plate.
 */
import { stamp, type Frame, type Scene } from "./glyph-scene";

/**
 * The plate sits in the leading strip of a row card, whose height follows the
 * text beside it. Six columns of grain either side and two rows above and
 * below are margin the field's cover sizing may crop, so the plate itself
 * survives any strip shape the card produces.
 */
export const VOID_COLS = 50;
export const VOID_ROWS = 10;

/** The grid's shape, for hosts that size themselves from it (stacked phones). */
export const VOID_ASPECT = (VOID_COLS * 0.6) / (VOID_ROWS * 1.15);

const PLATE_W = 38;
const PLATE_X = 6;
const PLATE_TOP = 2;
const INNER_W = PLATE_W - 4;
const INNER_X = PLATE_X + 2;
const KEY_W = 6;
const SLOT_W = INNER_W - KEY_W - 2;

/** The field settles in 1200ms; the first command starts typing after that. */
const START_MS = 1300;
const CYCLE_MS = 8000;
const TYPE_MS = 45;
const SCAN_MS = 900;
const CURSOR_MS = 530;

function plateTop(label: string): string {
  const head = `┌─ ${label} `;
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

/** Hand a run of cells back to the grain. */
function clear(f: Frame, row: number, col: number, width: number): void {
  for (let c = col; c < col + width; c++) {
    f.cells[row][c] = "";
    f.accent[row][c] = false;
  }
}

const SCAN = "░▒";

function scan(width: number, tick: number, salt: number): string {
  let s = "";
  for (let i = 0; i < width; i++) {
    const h = Math.sin((i + 1) * 91.7 + tick * 37.3 + salt * 13.1) * 43758.5453;
    s += SCAN[Math.floor((h - Math.floor(h)) * SCAN.length)];
  }
  return s;
}

export interface VoidArt {
  label: string;
  command: string;
  keys: [string, string];
  result: string;
}

// Each line must stay true to the privacy policy: the auth log does hold IPs,
// so the ip plate greps it for activity, which it never contains.
const CARDS: readonly VoidArt[] = [
  { label: "browsing", command: "cat history.log", keys: ["url", "time"], result: "no such file" },
  { label: "ip", command: "grep site= auth.log", keys: ["ip", "site"], result: "0 matches" },
  { label: "dns", command: "dig --history", keys: ["query", "when"], result: "nothing kept" },
  { label: "account", command: "select email from accounts", keys: ["email", "name"], result: "no such column" },
];

export function voidScene(index: number, cards: readonly VoidArt[] = CARDS): Scene {
  const art = cards[index % cards.length];
  // Stagger the cards so sibling commands never type in unison.
  const offset = index * (CYCLE_MS / cards.length);
  const typedAt = art.command.length * TYPE_MS;

  return {
    cols: VOID_COLS,
    rows: VOID_ROWS,

    paint(f: Frame, tMs: number) {
      // Until START_MS the plate holds its answered state, so the first print
      // lands a complete query, and so does the reduced-motion still frame
      // (painted at the end of the settle, before START_MS). Re-runs follow.
      const running = tMs >= START_MS;
      const phase = running ? (tMs - START_MS + offset) % CYCLE_MS : CYCLE_MS - 1;
      const typed = Math.min(art.command.length, Math.floor(phase / TYPE_MS));
      const scanning = phase >= typedAt && phase < typedAt + SCAN_MS;
      const answered = phase >= typedAt + SCAN_MS;
      const blink = Math.floor(tMs / CURSOR_MS) % 2 === 0;

      stamp(f, PLATE_TOP, PLATE_X, plateTop(art.label));

      const prompt = "$ " + art.command.slice(0, typed);
      stamp(f, PLATE_TOP + 1, PLATE_X, plateLine(prompt));
      if (!answered && blink) stamp(f, PLATE_TOP + 1, INNER_X + prompt.length, "▌", "accent");

      art.keys.forEach((key, i) => {
        const row = PLATE_TOP + 2 + i;
        const slotX = INNER_X + KEY_W + 1;
        stamp(f, row, PLATE_X, plateLine(key.padEnd(KEY_W) + "[" + " ".repeat(SLOT_W) + "]"));
        if (scanning) stamp(f, row, slotX, scan(SLOT_W, Math.floor(tMs / 90), i));
        else clear(f, row, slotX, SLOT_W);
      });

      stamp(f, PLATE_TOP + 4, PLATE_X, plateLine(""));
      if (answered) {
        stamp(f, PLATE_TOP + 4, INNER_X, "∅ " + art.result, "accent");
        if (blink) stamp(f, PLATE_TOP + 4, INNER_X + art.result.length + 3, "▌", "accent");
      }

      stamp(f, PLATE_TOP + 5, PLATE_X, plateBottom());
    },

    order(row, col) {
      // Left to right, like a line printing — the same signature as the traffic plates.
      const sweep = (col / (VOID_COLS - 1)) * 0.85 + (row / (VOID_ROWS - 1)) * 0.15;
      return Math.min(1, Math.max(0, sweep));
    },
  };
}
