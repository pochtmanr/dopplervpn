"use client";

import { useMemo } from "react";
import { GlyphField } from "./glyph-field";
import { useMountOnView } from "./use-mount-on-view";
import { VOID_ASPECT, voidScene } from "./void-scene";

/**
 * The query plate for one "What We Don't Store" row card. The server card
 * passes a plain index (a Scene carries methods, so it can't cross the
 * boundary). Settle-once, mounted when it nears the viewport so the first
 * print is seen.
 *
 * Stacked on phones, where the host takes the grid's aspect-ratio; beside the
 * text from sm up, where it fills the strip and the scene's margins absorb the
 * crop.
 */
export function PrivacyVoidBand({ index }: { index: number }) {
  const [hostRef, mounted] = useMountOnView<HTMLDivElement>();
  const scene = useMemo(() => voidScene(index), [index]);

  return (
    <div
      ref={hostRef}
      style={{ "--void-aspect": VOID_ASPECT } as React.CSSProperties}
      className={`relative w-full aspect-[var(--void-aspect)] sm:aspect-auto sm:h-full transition-opacity duration-700 motion-reduce:transition-none ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {mounted && <GlyphField scene={scene} loop={false} hover />}
    </div>
  );
}
