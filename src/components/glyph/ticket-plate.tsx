"use client";

import { useMemo } from "react";
import { GlyphField } from "./glyph-field";
import { kv, plateScene, SUPPORT_WELL_COLS, SUPPORT_WELL_ROWS, type PlateArt } from "./traffic-scene";
import { useMountOnView } from "./use-mount-on-view";

/**
 * The terminal plate on the support page's featured card — a ticket being
 * filed. Artwork only (aria-hidden, English terminal words); the translated
 * claim is the card's own text. The Telegram card beside it plays a chat
 * instead (support/telegram-chat.tsx).
 *
 * Lives in a side well, not a foot band: same 64×16 lattice as the Telegram
 * grain so both featured cards keep ~11px glyphs.
 */

const TICKET: PlateArt = {
  label: "ticket",
  cursor: true,
  lines: () => [kv("topic", "▸ connection"), kv("status", "● open"), kv("reply", "< 24h")],
};

export function TicketPlate() {
  const [hostRef, mounted] = useMountOnView<HTMLDivElement>();
  const scene = useMemo(
    () => plateScene(TICKET, SUPPORT_WELL_COLS, SUPPORT_WELL_ROWS),
    [],
  );

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {mounted && <GlyphField scene={scene} loop={false} hover />}
    </div>
  );
}
