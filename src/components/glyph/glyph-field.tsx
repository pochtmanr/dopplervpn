"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { COLS, HOLD_MS, RESOLVE_MS, ROWS, envelope, settle, type Scene } from "./glyph-scene";
import { render, type Rendered } from "./glyph-render";

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
 *
 * The frame maths lives in ./glyph-render, which is deliberately NOT a client
 * module: a field that gates LCP can pass `initialFrame` (see the prop) so its
 * first frame arrives in the HTML instead of waiting for hydration.
 */

// 20fps, not 60. A character field at 60fps reads as television static; at 20 it
// reads as a terminal, and it costs a third as much.
const FRAME_MS = 50;

// Set as an inline style rather than a Tailwind font utility: the layers must
// share an identical advance width or the five lattices desynchronise, and a
// proportional fallback would break registration visibly on a cold load.
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

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
  /**
   * A t=0 frame (from `frameZero`) rendered as the <pre> children, so the
   * lattice is in the HTML and paints at FCP instead of after hydration. Pass it
   * for any field big enough to be the page's LCP element — a full-bleed
   * backdrop, not a card strip. Requires `loop={false}` and `phaseMs={0}`: it is
   * literally the frame the clock starts on, and with an offset it would not be.
   */
  initialFrame?: Rendered;
}

export function GlyphField({
  scene,
  phaseMs = 0,
  loop = true,
  hover = false,
  frameMs = FRAME_MS,
  initialFrame,
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
      // A field hidden at this breakpoint has no box, and painting one costs a
      // full fbm sweep. The loop below gets this for free from the observer;
      // this branch never reaches the observer, so it has to ask directly.
      if (hostRef.current?.offsetParent !== null) paint(stillMs);
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

    // Never blank between mount and the first rAF — unless the server already
    // shipped exactly this frame, in which case repainting it would cost a full
    // fbm sweep (~180k Math.sin at 90x100) to produce the pixels already on
    // screen. On a viewport where the field is display:none this is the whole
    // mount cost, and the observer below never fires to spend any more.
    if (!initialFrame) paint(phaseMs);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paint, phaseMs, stillMs, frameMs, initialFrame]);

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
      {/* The children are the server frame and nothing else: from the first rAF
          onwards every layer is written imperatively via textContent, which is
          safe only because this component never re-renders after mount. */}
      <pre ref={grainRef} style={size} className={`${layer} text-text-tertiary opacity-40`}>
        {initialFrame?.grain}
      </pre>
      <pre
        ref={grainHotRef}
        style={size}
        className={`${layer} ${warm} text-text-tertiary opacity-40 ${
          hover ? "group-hover:text-accent-teal group-hover:opacity-70" : ""
        }`}
      >
        {initialFrame?.grainHot}
      </pre>
      <pre
        ref={grainAccentRef}
        style={size}
        className={`${layer} ${warm} text-accent-teal opacity-60 ${
          hover ? "group-hover:text-accent-teal-light group-hover:opacity-100" : ""
        }`}
      >
        {initialFrame?.grainAccent}
      </pre>
      <pre
        ref={contentRef}
        style={size}
        className={`${layer} ${warm} text-text-muted ${
          hover ? "group-hover:text-accent-teal" : ""
        }`}
      >
        {initialFrame?.content}
      </pre>
      {/* Never warms: the verdict marks must stay the loudest thing in both states. */}
      <pre ref={accentRef} style={size} className={`${layer} text-accent-teal-light`}>
        {initialFrame?.accent}
      </pre>
    </div>
  );
}
