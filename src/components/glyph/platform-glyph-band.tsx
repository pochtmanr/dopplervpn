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

// Evenly spaced rain positions for the four platform cards, so no two match.
const OFFSETS = phaseOffsets(4);

interface PlatformGlyphBandProps {
  /** Position in the grid — picks the rain offset. */
  index: number;
}

export function PlatformGlyphBand({ index }: PlatformGlyphBandProps) {
  // The artwork is the same for every platform; the logo tells them apart.
  // Memoised only to keep the Scene identity stable across re-renders.
  const scene = useMemo(() => platformScene(OFFSETS[index % OFFSETS.length]), [index]);

  // Resolves out of the grain once and then rains for good — no dissolve and
  // re-open. The offset lives in the scene, not in `phaseMs`, so every card
  // still plays that opening. The rain sits behind the logo, so its digits are
  // trails are held at half strength; the teal heads stay full, the strip's colour.
  return <GlyphField scene={scene} loop={false} hover dimContent />;
}
