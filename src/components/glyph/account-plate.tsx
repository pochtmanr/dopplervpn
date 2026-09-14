"use client";

import { useMemo } from "react";
import { GlyphField } from "./glyph-field";
import { useMediaQuery } from "@/lib/use-media-query";
import { kv, plateAspect, plateScene, TRAFFIC_COLS } from "./traffic-scene";
import { useMountOnView } from "./use-mount-on-view";

/**
 * The account card's terminal plate: one key, fanning out to devices.
 *
 * The key is masked on purpose. The plate is decoration, and the real ID already
 * sits in large type above it — printing it again into an aria-hidden lattice
 * would only put the credential somewhere screenshots and screen recordings pick
 * it up without the user noticing.
 */

function deviceRow(done: number): string {
  const mark = (i: number) => (done > i ? "✓" : "·");
  return `▸ phone ${mark(0)}  ▸ mac ${mark(1)}  ▸ pc ${mark(2)}`;
}

// Glyph size follows the host width, so a wide card needs a wider grid to keep the
// lattice at roughly the traffic plates' ~11px instead of blowing it up. Phones
// keep the traffic grid.
const WIDE_COLS = 96;

export function AccountPlate() {
  const [hostRef, mounted] = useMountOnView<HTMLDivElement>();
  const wide = useMediaQuery("(min-width: 768px)");
  const cols = wide ? WIDE_COLS : TRAFFIC_COLS;
  const scene = useMemo(
    () =>
      plateScene({
        label: "account",
        lines: (t) => [
          kv("key", "VPN-····-····-····"),
          // Fills, then clears and fills again — the plate's own motion.
          deviceRow(Math.floor(t / 420) % 4),
          kv("sync", "1 id · all devices"),
        ],
      }, cols),
    [cols],
  );

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
