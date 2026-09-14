"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  COLS,
  ROWS,
  CYCLE_MS,
  HOLD_MS,
  RESOLVE_MS,
  cellReveal,
  createFrame,
  envelope,
  settle,
  type Frame,
  type Scene,
} from "./glyph-scene";

/**
 * An animated ASCII glyph field — ported from the Argus landing site
 * (components/proof/GlyphField.tsx).
 *
 * A <pre> can only hold one colour per text node, and this lattice needs five at
 * once. So the field is FIVE absolutely-positioned <pre> elements on identical
 * grid metrics, and every cell is written to exactly one of them and blanked in
 * the other four. Each frame is five textContent assignments — no spans, no
 * per-cell DOM, nothing for React to diff. React never re-renders after mount.
 *
 * Perf contract: 20fps, and the loop runs only while the field is on screen AND
 * the tab is foregrounded. Under prefers-reduced-motion it paints one resolved
 * frame and never starts a loop at all.
 */

const RAMP = " .:-=+*#%@";

// 20fps, not 60. A character field at 60fps reads as television static; at 20 it
// reads as a terminal, and it costs a third as much.
const FRAME_MS = 50;

// Set as an inline style rather than a Tailwind font utility: the layers must
// share an identical advance width or the five lattices desynchronise, and a
// proportional fallback would break registration visibly on a cold load.
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

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

interface Rendered {
  grain: string;
  grainHot: string;
  grainAccent: string;
  content: string;
  accent: string;
}

function render(scene: Scene, tMs: number, env: number, loop: boolean): Rendered {
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

interface GlyphFieldProps {
  scene: Scene;
  /** Backdates the clock so sibling fields stagger against each other. */
  phaseMs?: number;
  /** false = resolve once and hold, never dissolve. */
  loop?: boolean;
  /** Emit the group-hover: warm classes. Requires a `group` ancestor. */
  hover?: boolean;
  /** Paint interval. Large, phone-sized fields pass a slower rate to stay cheap. */
  frameMs?: number;
}

export function GlyphField({
  scene,
  phaseMs = 0,
  loop = true,
  hover = false,
  frameMs = FRAME_MS,
}: GlyphFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLPreElement>(null);
  const grainHotRef = useRef<HTMLPreElement>(null);
  const grainAccentRef = useRef<HTMLPreElement>(null);
  const contentRef = useRef<HTMLPreElement>(null);
  const accentRef = useRef<HTMLPreElement>(null);

  // Read the scene from a ref, not the closure, so a parent that rebuilds the
  // Scene object never tears down the rAF loop, the observer and the clock.
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const stillRef = useRef(false);

  // Mid-hold, where every tick has landed and the envelope is pinned at 1. The
  // phase offset is excluded on purpose: it exists to stagger cards against each
  // other, and a static frame has nothing to stagger.
  const stillMs = loop ? RESOLVE_MS + HOLD_MS * 0.8 : RESOLVE_MS;

  const paint = useCallback(
    (tMs: number) => {
      const frame = render(sceneRef.current, tMs, loop ? envelope(tMs) : settle(tMs), loop);
      if (grainRef.current) grainRef.current.textContent = frame.grain;
      if (grainHotRef.current) grainHotRef.current.textContent = frame.grainHot;
      if (grainAccentRef.current) grainAccentRef.current.textContent = frame.grainAccent;
      if (contentRef.current) contentRef.current.textContent = frame.content;
      if (accentRef.current) accentRef.current.textContent = frame.accent;
    },
    [loop],
  );

  useEffect(() => {
    // The site's global reduced-motion rule only zeroes CSS durations; a rAF loop
    // is not covered by it, so this has to be checked here.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      stillRef.current = true;
      paint(stillMs);
      return;
    }
    stillRef.current = false;

    let raf = 0;
    let last = 0;
    let visible = false;
    const start = performance.now() - phaseMs;

    const tick = (now: number) => {
      // Self-schedule BEFORE the throttle, so the chain never breaks — it just
      // skips paints.
      raf = requestAnimationFrame(tick);
      if (now - last < frameMs) return;
      last = now;
      paint(now - start);
    };

    const run = () => {
      if (raf || !visible || document.hidden) return;
      last = 0; // force an immediate paint on resume
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Nothing burns CPU unseen: needs both on-screen and foregrounded.
    const io = new IntersectionObserver((entries) => {
      // A callback can batch several entries for one target; the last is current.
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) run();
      else stop();
    });
    if (hostRef.current) io.observe(hostRef.current);

    const onVisibility = () => (document.hidden ? stop() : run());
    document.addEventListener("visibilitychange", onVisibility);

    paint(phaseMs); // never blank between mount and the first rAF

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paint, phaseMs, stillMs, frameMs]);

  // Colour and opacity only — never `all`, which would also animate the
  // container-query font size on resize and read as lag.
  const warm = hover
    ? "transition-[color,opacity] duration-300 ease-out motion-reduce:transition-none"
    : "";

  const layer =
    "pointer-events-none m-0 whitespace-pre leading-[1.15] tracking-normal " +
    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";

  // The scene owns its grid; the platform band's dimensions are just the default.
  const cols = scene.cols ?? COLS;
  const rows = scene.rows ?? ROWS;

  // Font size derived from the grid: a mono advance is ~0.6em, so the lattice is
  // cols*0.6 em wide and rows*1.15 em tall (see leading-[1.15] above).
  //
  // Cover both axes: take whichever derived size is larger and let the other run
  // past the edge, clipped by the host. max() not min() — min would letterbox.
  // Which axis wins is therefore decided by grid aspect vs host aspect, and it
  // is why a scene picks a grid shaped like the box it will sit in.
  const size = useMemo(
    () => ({
      fontSize: `max(5px,max(${(100 / (cols * 0.6)).toFixed(2)}cqw,${(
        100 /
        (rows * 1.15)
      ).toFixed(2)}cqh))`,
      fontFamily: MONO,
    }),
    [cols, rows],
  );

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      // The lattice is a picture, not prose: every line is built left to right
      // and the box art is asymmetric. Under an RTL page the bidi algorithm
      // would reorder the neutrals in each <pre> and take the plates apart, so
      // the field opts out of direction entirely.
      dir="ltr"
      // container-type: size, not inline-size — cqh only resolves against a
      // container queried on both axes. That makes the host's height independent
      // of its content, so the PARENT must supply a resolved height.
      className="absolute inset-0 select-none overflow-hidden [container-type:size]"
    >
      <pre ref={grainRef} style={size} className={`${layer} text-text-tertiary opacity-40`} />
      <pre
        ref={grainHotRef}
        style={size}
        className={`${layer} ${warm} text-text-tertiary opacity-40 ${
          hover ? "group-hover:text-accent-teal group-hover:opacity-70" : ""
        }`}
      />
      <pre
        ref={grainAccentRef}
        style={size}
        className={`${layer} ${warm} text-accent-teal opacity-60 ${
          hover ? "group-hover:text-accent-teal-light group-hover:opacity-100" : ""
        }`}
      />
      <pre
        ref={contentRef}
        style={size}
        className={`${layer} ${warm} text-text-muted ${
          hover ? "group-hover:text-accent-teal" : ""
        }`}
      />
      {/* Never warms: the verdict marks must stay the loudest thing in both states. */}
      <pre ref={accentRef} style={size} className={`${layer} text-accent-teal-light`} />
    </div>
  );
}
