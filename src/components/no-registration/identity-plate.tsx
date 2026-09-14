"use client";

import { useMemo } from "react";
import { GlyphField } from "@/components/glyph/glyph-field";
import { useMediaQuery } from "@/lib/use-media-query";
import { kv, plateAspect, plateScene, TRAFFIC_COLS } from "@/components/glyph/traffic-scene";
import { useMountOnView } from "@/components/glyph/use-mount-on-view";

const WIDE_COLS = 96;

const ART = {
  label: "identity",
  cursor: true as const,
  lines: () => [kv("email", "none"), kv("phone", "none"), kv("key", "on-device")],
};

/**
 * Identity plate at the foot of "Your Data, Your Device". Wide hosts keep a
 * denser lattice so the glyphs stay traffic-plate sized instead of blowing up.
 */
export function NoRegIdentityPlate() {
  const [hostRef, mounted] = useMountOnView<HTMLDivElement>();
  const wide = useMediaQuery("(min-width: 768px)");
  const cols = wide ? WIDE_COLS : TRAFFIC_COLS;
  const scene = useMemo(() => plateScene(ART, cols), [cols]);

  return (
    <div
      ref={hostRef}
      style={{ aspectRatio: plateAspect(cols) }}
      className={`relative w-full transition-opacity duration-700 motion-reduce:transition-none ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {mounted && <GlyphField key={cols} scene={scene} loop={false} hover />}
    </div>
  );
}
