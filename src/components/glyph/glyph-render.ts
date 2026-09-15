/**
 * The glyph field's pure renderer — extracted from glyph-field.tsx so it can run
 * on the SERVER as well as in the rAF loop.
 *
 * Nothing here touches the DOM, React, `window`, `Math.random` or the wall
 * clock: `render(scene, t, env, loop)` is a pure function of its arguments, so
 * the server and the client compute byte-identical frames for the same `t`.
 * That is what lets a field ship its first frame in the HTML (see
 * `frameZero` below) and hydrate without a mismatch.
 */

import {
  COLS,
  ROWS,
  CYCLE_MS,
  cellReveal,
  createFrame,
  settle,
  type Frame,
  type Scene,
} from "./glyph-scene";

const RAMP = " .:-=+*#%@";

// One hash, three bands: below ACCENT_SHARE is always tinted, between the two is
// "hot" (grey until the card is hovered), above HOT_SHARE is plain grey. Slicing
// a single hash keeps the hover set a superset of the resting one, so a hover
// only ever ADDS hue — nothing that was teal a moment ago turns grey.
//
// The pattern is spatial only, with no time term, so a tinted cell stays tinted.
// The ramp glyph inside it keeps churning either way, so the field still reads as
// alive, while a set that reshuffled would add a second competing rhythm.
const GRAIN_ACCENT_SHARE = 0.22;
const GRAIN_HOT_SHARE = 0.5;

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function noise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx); // smoothstep
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  const top = a + (b - a) * ux;
  const bottom = c + (d - c) * ux;
  return top + (bottom - top) * uy;
}

/** Five octaves, lacunarity 2.03 (off-integer so octaves never align). */
function fbm(x: number, y: number): number {
  let v = 0;
  let amp = 0.5;
  let px = x;
  let py = y;
  for (let i = 0; i < 5; i++) {
    v += amp * noise(px, py);
    px = px * 2.03 + 17.0;
    py = py * 2.03 + 9.2;
    amp *= 0.5;
  }
  return v;
}

type GrainLayer = "grain" | "hot" | "accent";

function grainLayer(col: number, row: number): GrainLayer {
  // Decorrelating multipliers: without the offsets the hash of small integers clumps.
  const h = hash(col * 3.7 + 11.3, row * 5.1 + 4.7);
  if (h < GRAIN_ACCENT_SHARE) return "accent";
  if (h < GRAIN_HOT_SHARE) return "hot";
  return "grain";
}

// The layer split is spatial only (see above), so it is computed once per grid
// size instead of hashing every cell on every frame.
const layerMaps = new Map<string, GrainLayer[][]>();
function grainLayers(cols: number, rows: number): GrainLayer[][] {
  const key = `${cols}x${rows}`;
  let map = layerMaps.get(key);
  if (!map) {
    map = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => grainLayer(c, r)));
    layerMaps.set(key, map);
  }
  return map;
}

export interface Rendered {
  grain: string;
  grainHot: string;
  grainAccent: string;
  content: string;
  accent: string;
}

export function render(scene: Scene, tMs: number, env: number, loop: boolean): Rendered {
  const cols = scene.cols ?? COLS;
  const rows = scene.rows ?? ROWS;
  const frame: Frame = createFrame(cols, rows);
  const layers = grainLayers(cols, rows);
  // The wrap IS the loop. A settling field must not wrap, or it would replay its
  // assembly every cycle.
  scene.paint(frame, loop ? ((tMs % CYCLE_MS) + CYCLE_MS) % CYCLE_MS : Math.max(0, tMs));

  const drift = tMs / 4000;
  const grain: string[] = [];
  const grainHot: string[] = [];
  const grainAccent: string[] = [];
  const content: string[] = [];
  const accent: string[] = [];

  for (let r = 0; r < rows; r++) {
    let grainRow = "";
    let grainHotRow = "";
    let grainAccentRow = "";
    let contentRow = "";
    let accentRow = "";

    for (let c = 0; c < cols; c++) {
      const cell = frame.cells[r][c];
      const reveal = cell === "" ? 0 : cellReveal(env, scene.order(r, c));

      if (reveal > 0.5) {
        grainRow += " ";
        grainHotRow += " ";
        grainAccentRow += " ";
        if (frame.accent[r][c]) {
          contentRow += " ";
          accentRow += cell;
        } else {
          contentRow += cell;
          accentRow += " ";
        }
        continue;
      }

      // Not yet content: draw the field. Mid-transition cells ride the ramp
      // upward, so a cell visibly thickens before its character lands.
      //
      // Sampling is anisotropic (0.18 across vs 0.34 down) to compensate for the
      // 0.6em advance against 1.15 line-height, so blobs read round not stretched.
      // Drift is on the y axis only, so the field scrolls upward through the lattice.
      const f = fbm(c * 0.18, r * 0.34 + drift);
      const lifted = Math.min(0.999, f * (1 - reveal) + reveal);
      const ramp = RAMP[Math.floor(lifted * RAMP.length)];
      const layer = layers[r][c];
      grainRow += layer === "grain" ? ramp : " ";
      grainHotRow += layer === "hot" ? ramp : " ";
      grainAccentRow += layer === "accent" ? ramp : " ";
      contentRow += " ";
      accentRow += " ";
    }

    grain.push(grainRow);
    grainHot.push(grainHotRow);
    grainAccent.push(grainAccentRow);
    content.push(contentRow);
    accent.push(accentRow);
  }

  return {
    grain: grain.join("\n"),
    grainHot: grainHot.join("\n"),
    grainAccent: grainAccent.join("\n"),
    content: content.join("\n"),
    accent: accent.join("\n"),
  };
}

// A lattice of nothing but spaces paints exactly like an empty <pre>, and at
// 90x100 it is 9 KB of HTML per layer. At t=0 nothing has resolved yet, so the
// content and accent planes are always blank — dropping them is most of the
// saving on a server-rendered frame.
function blankIfEmpty(layer: string): string {
  return /\S/.test(layer) ? layer : "";
}

/**
 * The frame a field shows before its clock starts, ready to be embedded in
 * server-rendered HTML and handed straight back to `<GlyphField initialFrame>`.
 *
 * Only for `loop={false}` fields: a looping field's phase offset means t=0 is
 * not where it starts.
 */
export function frameZero(scene: Scene): Rendered {
  const f = render(scene, 0, settle(0), false);
  return {
    grain: blankIfEmpty(f.grain),
    grainHot: blankIfEmpty(f.grainHot),
    grainAccent: blankIfEmpty(f.grainAccent),
    content: blankIfEmpty(f.content),
    accent: blankIfEmpty(f.accent),
  };
}
