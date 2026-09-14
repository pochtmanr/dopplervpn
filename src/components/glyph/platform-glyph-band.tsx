"use client";

import { useMemo } from "react";
import { GlyphField } from "./glyph-field";
import { phaseOffsets, platformScene } from "./glyph-scene";

/**
 * Client wrapper so the platform strip can stay a Server Component.
 *
 * A Scene carries `paint`/`order` methods, and functions cannot be passed from a
 * Server Component to a Client Component — so the server side hands over a plain
 * index and the Scene is built here.
 */

// Evenly spaced starts for the four platform cards, so no two churn at once.
const OFFSETS = phaseOffsets(4);

interface PlatformGlyphBandProps {
  /** Position in the grid — picks the phase offset. */
  index: number;
}

export function PlatformGlyphBand({ index }: PlatformGlyphBandProps) {
  // The artwork is the same for every platform; the logo and the phase tell them
  // apart. Memoised only to keep the Scene identity stable across re-renders.
  const scene = useMemo(() => platformScene(), []);

  return <GlyphField scene={scene} phaseMs={OFFSETS[index % OFFSETS.length]} hover />;
}
