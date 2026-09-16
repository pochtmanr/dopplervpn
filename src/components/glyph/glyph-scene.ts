/**
 * Glyph-field scene primitives — ported from the Argus landing site
 * (components/proof/scenes.ts), reshaped for a wide, short band.
 *
 * Everything here is a pure function of (frame, tMs): no React, no DOM, and no
 * randomness that isn't derived from the clock. That is what lets the rAF loop
 * be paused and resumed at any point without the picture jumping, and what makes
 * a frame reproducible.
 */

// A squarish strip, to sit down the side third of a platform tile. Font sizing
// downstream is derived from these two numbers — see glyph-field.tsx. A scene
// for a differently-shaped host overrides them via `Scene.cols` / `Scene.rows`;
// these stay the default because the platform band was the first caller.
export const COLS = 24;
export const ROWS = 12;

/**
 * The glyph plane. "" means "no content — draw noise here".
 * Anything else, INCLUDING A SINGLE SPACE, is content.
 *
 * That distinction is the whole reason a box interior reads as solid instead of
 * letting noise bleed through the middle of it, and it is why every scene below
 * stamps padded whole rows rather than separate fragments.
 */
export type Buffer = string[][];

export interface Frame {
  readonly cells: Buffer;
  /** Parallel to `cells`. True only where `cells` holds a visible accent character. */
  readonly accent: boolean[][];
}

export function createFrame(cols: number = COLS, rows: number = ROWS): Frame {
  return {
    cells: Array.from({ length: rows }, () => Array.from({ length: cols }, () => "")),
    accent: Array.from({ length: rows }, () => Array.from({ length: cols }, () => false)),
  };
}

/** Glyphs that colour themselves wherever they land. */
export const ACCENT_GLYPHS: ReadonlySet<string> = new Set(["✓", "▸", "●"]);

export type Hue = "auto" | "accent";

/**
 * The one write primitive. Two rules are load-bearing:
 *
 * - Write-through, not or-in. A later stamp over the same cell takes the hue
 *   back; last writer wins on both planes, always.
 * - A space is never marked accent. That keeps the accent plane an honest map of
 *   things you can actually see, and it means a padded plate colours itself as
 *   its characters arrive, with no separate timing gate.
 *
 * Clipping is silent on both axes: never wraps, never throws.
 */
export function stamp(
  frame: Frame,
  row: number,
  col: number,
  text: string,
  hue: Hue = "auto",
): void {
  // Bounds come from the frame, not the module constants, so a scene on a
  // custom grid clips against its own edges.
  const rows = frame.cells.length;
  const cols = frame.cells[0].length;
  if (row < 0 || row >= rows) return;
  for (let i = 0; i < text.length; i++) {
    const c = col + i;
    if (c < 0 || c >= cols) continue;
    const ch = text[i];
    frame.cells[row][c] = ch;
    frame.accent[row][c] = ch !== " " && (hue === "accent" || ACCENT_GLYPHS.has(ch));
  }
}

/* ── Timing ──────────────────────────────────────────────────────────
 * HOLD is longer than Argus's 5000ms on purpose. Phase offsets must be spaced
 * further apart than RESOLVE + DISSOLVE or two cards churn at once, which caps
 * Argus's 6800ms cycle at three cards. The platform grid has four, so the cycle
 * is stretched to 7400ms → 1850ms per slot, clearing the 1800ms floor.
 */
export const RESOLVE_MS = 1200;
export const HOLD_MS = 5600;
export const DISSOLVE_MS = 600;
export const CYCLE_MS = RESOLVE_MS + HOLD_MS + DISSOLVE_MS; // 7400

/** Evenly spaced starts for `n` sibling fields. Guard: CYCLE_MS / n > 1800. */
export function phaseOffsets(n: number): number[] {
  return Array.from({ length: n }, (_, i) => Math.round((CYCLE_MS * i) / n));
}

/** 0 = pure noise, 1 = fully resolved. Wraps, so the loop is seamless. */
export function envelope(tMs: number): number {
  const t = ((tMs % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
  if (t < RESOLVE_MS) return t / RESOLVE_MS;
  if (t < RESOLVE_MS + HOLD_MS) return 1;
  return 1 - (t - RESOLVE_MS - HOLD_MS) / DISSOLVE_MS;
}

/** Climbs the same ramp as envelope's resolve phase, then holds forever. */
export function settle(tMs: number): number {
  return Math.min(1, Math.max(0, tMs / RESOLVE_MS));
}

// How much of the envelope is spent sweeping across the grid rather than lifting
// it uniformly. Because a high-order cell needs a higher envelope to reach 1, it
// is also the first to fall when the envelope drops — so a band that resolves
// left-to-right dissolves right-to-left for free.
const SPREAD = 0.45;

export function cellReveal(env: number, order: number): number {
  const shifted = (env - order * SPREAD) / (1 - SPREAD);
  return Math.min(1, Math.max(0, shifted));
}

export interface Scene {
  /** Grid width. Defaults to COLS. Drives the derived font size downstream. */
  readonly cols?: number;
  /** Grid height. Defaults to ROWS. */
  readonly rows?: number;
  paint(frame: Frame, tMs: number): void;
  /** 0..1 — a cell's place in the resolve sequence. 0 resolves first. */
  order(row: number, col: number): number;
}

/* ── The platform scene ──────────────────────────────────────────────
 * Data rain. Columns of 0/1 and the odd hex digit fall down the strip at their
 * own speeds, each led by a teal head; the platform's own SVG logo sits over
 * the middle, on a rectangle kept deliberately empty.
 *
 * Every cell is stamped — a trail glyph or a space — because a "" cell would
 * draw fbm grain, and the rain is meant to replace the grain, not sit on it.
 */

const RAIN_TRAIL = 4;
// A drop falls off the bottom and spends its trail's length out of sight before
// re-entering, so the columns don't all look like they recycle on the spot.
const RAIN_PERIOD = ROWS + RAIN_TRAIL + 3;
// How often a trail glyph re-rolls. Slower than the 50ms paint, so the digits
// flicker like a terminal rather than boil.
const RAIN_FLICKER_MS = 150;
// Mostly 0/1 with the odd hex digit, so it reads as bits first.
const RAIN_GLYPHS = "01".repeat(24) + "0123456789abcdef";

// The ground under the logo (it covers ~45% × 45% of the strip).
const CLEAR_COL_START = 6;
const CLEAR_COL_END = COLS - 6; // exclusive → cols 6..17
const CLEAR_ROW_START = 3;
const CLEAR_ROW_END = ROWS - 3; // exclusive → rows 3..8

function rainHash(x: number, y: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

interface RainColumn {
  /** Whole falls per CYCLE_MS — an integer, so the loop wrap is seamless. */
  falls: number;
  offset: number;
}

// Spatial only, so it is fixed per column. Roughly a third of columns stay dry,
// which is what makes it read as rain rather than a wall of digits.
const RAIN_COLUMNS: ReadonlyArray<RainColumn | null> = Array.from({ length: COLS }, (_, c) => {
  if (rainHash(c, 1.7) < 0.34) return null;
  return {
    falls: 2 + Math.floor(rainHash(c, 5.3) * 4), // 2..5
    offset: Math.floor(rainHash(c, 9.1) * RAIN_PERIOD),
  };
});

/**
 * One shared scene: the platforms are told apart by their logo, not by the
 * artwork. `rainOffsetMs` only shifts where each card's drops are, so sibling
 * cards open together without raining in lockstep.
 */
export function platformScene(rainOffsetMs = 0): Scene {
  return {
    paint(f, sceneMs) {
      const tMs = sceneMs + rainOffsetMs;
      const tick = Math.floor(tMs / RAIN_FLICKER_MS);
      for (let c = 0; c < COLS; c++) {
        const column = RAIN_COLUMNS[c];
        const head = column
          ? (Math.floor((tMs / CYCLE_MS) * column.falls * RAIN_PERIOD) + column.offset) % RAIN_PERIOD
          : -RAIN_PERIOD;
        const clearCol = c >= CLEAR_COL_START && c < CLEAR_COL_END;

        for (let r = 0; r < ROWS; r++) {
          const behind = head - r; // 0 = the head, 1..TRAIL = its trail
          if (
            (clearCol && r >= CLEAR_ROW_START && r < CLEAR_ROW_END) ||
            behind < 0 ||
            behind > RAIN_TRAIL
          ) {
            stamp(f, r, c, " ");
            continue;
          }
          const glyph = RAIN_GLYPHS[Math.floor(rainHash(c * 3.1 + tick, r * 7.3) * RAIN_GLYPHS.length)];
          stamp(f, r, c, glyph, behind === 0 ? "accent" : "auto");
        }
      }
    },
    order(row, col) {
      // Radial: the middle settles first, so the ground under the logo is quiet
      // before the frame arrives, and the frame is first to fall on dissolve.
      const dx = (col - (COLS - 1) / 2) / ((COLS - 1) / 2);
      const dy = (row - (ROWS - 1) / 2) / ((ROWS - 1) / 2);
      return Math.min(1, Math.sqrt(dx * dx + dy * dy) / Math.SQRT2);
    },
  };
}
