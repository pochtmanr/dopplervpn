/**
 * The pricing section's ground: bare grain with a sparse plotting grid of
 * marks, revealed by the pointer spotlight (see `.glyph-spotlight`).
 */
import { stamp, type Frame, type Scene } from "./glyph-scene";

/* ── The section backdrop ────────────────────────────────────────────
 * Sized for a full-width section (~1.7:1). Fine enough to read as texture at
 * 1600px, coarse enough to stay a few thousand cells per frame.
 */
export const BACKDROP_COLS = 240;
export const BACKDROP_ROWS = 76;

/**
 * Portrait grid for a phone-shaped hero: 90·0.6 / 100·1.15 ≈ 0.47, close to 390×844.
 *
 * These live HERE, in a plain module, and not next to the component that uses
 * them — that component's file is `"use client"`, and a Server Component
 * importing a plain constant out of a client module gets a client-reference
 * proxy instead of the number. It does not throw: the proxy coerces to NaN, so
 * `Array.from({ length: NaN })` yields zero rows and the server frame comes out
 * silently empty. hero-mobile-backdrop.tsx renders the hero's first frame on the
 * server and needs the real numbers.
 */
export const HERO_MOBILE_COLS = 90;
export const HERO_MOBILE_ROWS = 100;
const MARK_EVERY_COL = 40;
const MARK_EVERY_ROW = 18;

// Bright symbols scattered through the dim grain, so the field has depth: most
// cells sit at the grain layer's low opacity, a few stand forward at full
// strength on the content layer. Each cell keeps its own slow clock (offset by
// its hash), so they fade in and out one at a time instead of flickering as a set.
const SPARK_SHARE = 0.045;
const SPARK_PERIOD_MS = 2600;
const SPARK_GLYPHS = "·:+*=#%";

function cellHash(c: number, r: number, salt: number): number {
  const s = Math.sin(c * 127.1 + r * 311.7 + salt * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Grid defaults to the pricing section; the mobile hero passes a portrait grid. */
export function backdropScene(cols = BACKDROP_COLS, rows = BACKDROP_ROWS): Scene {
  return {
    cols,
    rows,

    paint(f: Frame, tMs: number) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const offset = cellHash(c, r, 1) * SPARK_PERIOD_MS;
          const epoch = Math.floor((tMs + offset) / SPARK_PERIOD_MS);
          const h = cellHash(c, r, epoch + 2);
          if (h < SPARK_SHARE) {
            stamp(f, r, c, SPARK_GLYPHS[Math.floor((h / SPARK_SHARE) * SPARK_GLYPHS.length)]);
          }
        }
      }

      // A sparse plotting grid, strongest under the spotlight, like registration
      // marks under a loupe.
      for (let r = MARK_EVERY_ROW >> 1; r < rows; r += MARK_EVERY_ROW) {
        for (let c = MARK_EVERY_COL >> 1; c < cols; c += MARK_EVERY_COL) {
          stamp(f, r, c, "+", "accent");
        }
      }
    },

    order(row, col) {
      const dx = (col - (cols - 1) / 2) / ((cols - 1) / 2);
      const dy = (row - (rows - 1) / 2) / ((rows - 1) / 2);
      return Math.min(1, Math.sqrt(dx * dx + dy * dy) / Math.SQRT2);
    },
  };
}
