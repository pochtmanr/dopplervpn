"use client";

import { useMemo } from "react";
import { GlyphField } from "./glyph-field";
import { useMediaQuery } from "@/lib/use-media-query";
import { kv, plateAspect, plateScene, TRAFFIC_COLS, type PlateArt } from "./traffic-scene";
import { useMountOnView } from "./use-mount-on-view";

/**
 * The terminal plate on the support page's featured card — a ticket being
 * filed. Artwork only (aria-hidden, English terminal words); the translated
 * claim is the card's own text. The Telegram card beside it plays a chat
 * instead (support/telegram-chat.tsx).
 */

const TICKET: PlateArt = {
  label: "ticket",
  cursor: true,
  lines: () => [kv("topic", "▸ connection"), kv("status", "● open"), kv("reply", "< 24h")],
};

// Glyph size follows the host width, so a wide host needs a wider grid to keep
// the lattice near the traffic plates' ~11px instead of blowing it up. The card
// spans the whole two-up row at md and 8 of 12 columns at lg.
const COLS = { base: TRAFFIC_COLS, md: 96, lg: 128 } as const;

export function TicketPlate() {
  const [hostRef, mounted] = useMountOnView<HTMLDivElement>();
  const md = useMediaQuery("(min-width: 768px)");
  const lg = useMediaQuery("(min-width: 1024px)");
  const cols = lg ? COLS.lg : md ? COLS.md : COLS.base;
  const scene = useMemo(() => plateScene(TICKET, cols), [cols]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{ aspectRatio: plateAspect(cols) }}
      className={`pointer-events-none relative w-full transition-opacity duration-700 motion-reduce:transition-none ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {mounted && <GlyphField key={cols} scene={scene} loop={false} hover />}
    </div>
  );
}
