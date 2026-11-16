"use client";

import { useMemo } from "react";
import { GlyphField } from "./glyph-field";
import { phaseOffsets, platformScene, rainFieldScene } from "./glyph-scene";

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
  /**
   * Fill a large tray edge to edge (the app pages' glyph trays) instead of the downloads
   * card's short strip: a finer grid, so the digits stay small across the whole tray.
   */
  fill?: boolean;
}

// A 3:2 tray at the strip's glyph size: about twice the columns, half again the rows.
const FILL_COLS = 48;
const FILL_ROWS = 18;

export function PlatformGlyphBand({ index, fill = false }: PlatformGlyphBandProps) {
  // The artwork is the same for every platform; the logo tells them apart.
  // Memoised only to keep the Scene identity stable across re-renders.
  const scene = useMemo(() => {
    const offset = OFFSETS[index % OFFSETS.length];
    return fill ? rainFieldScene(FILL_COLS, FILL_ROWS, offset) : platformScene(offset);
  }, [index, fill]);

  // Resolves out of the grain once and then rains for good — no dissolve and
  // re-open. The offset lives in the scene, not in `phaseMs`, so every card
  // still plays that opening. The rain sits behind the logo, so its digits are
  // trails are held at half strength; the teal heads stay full, the strip's colour.
  return <GlyphField scene={scene} loop={false} hover dimContent />;
}
