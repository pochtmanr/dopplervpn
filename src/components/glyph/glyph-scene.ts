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
 * No words and no frame. The strip is bare drifting grain with a single accent
 * mark scanning its outer edge; the platform's own SVG logo sits over the
 * middle, on ground left deliberately empty.
 *
 * A cell holding "" draws noise, so leaving the scene almost entirely unstamped
 * is what lets the lattice itself be the artwork.
 */

const SCAN_COL = COLS - 4; // 20
const SCAN_TOP = 3;
const SCAN_BOTTOM = ROWS - 4; // 8
const SCAN_STEP_MS = 420;

/**
 * One shared scene: the platforms are told apart by their logo and by their
 * phase offset, not by the artwork, so there is nothing here to parameterise.
 */
export function platformScene(): Scene {
  return {
    paint(f, tMs) {
      // A mark scanning the outer edge, quantised to its own step so it reads as
      // deliberate motion rather than riding the render rate.
      const span = SCAN_BOTTOM - SCAN_TOP;
      const scanRow = SCAN_TOP + (Math.floor(tMs / SCAN_STEP_MS) % span);
      stamp(f, scanRow, SCAN_COL, "▸", "accent");
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
