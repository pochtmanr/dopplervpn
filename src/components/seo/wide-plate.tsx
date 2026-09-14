"use client";

import { useMemo } from "react";
import { GlyphField } from "@/components/glyph/glyph-field";
import { useMediaQuery } from "@/lib/use-media-query";
import { plateAspect, plateScene, TRAFFIC_COLS, type PlateArt } from "@/components/glyph/traffic-scene";
import { BYPASS_STATUS_ART, CRYPTO_ID_ART, VLESS_SPEED_ART } from "@/components/glyph/seo-scene";
import { useMountOnView } from "@/components/glyph/use-mount-on-view";

const WIDE_COLS = 96;

const ART: Record<"vless-speed" | "bypass-status" | "crypto-id", PlateArt> = {
  "vless-speed": VLESS_SPEED_ART,
  "bypass-status": BYPASS_STATUS_ART,
  "crypto-id": CRYPTO_ID_ART,
};

/** Wide foot plate for a recipe-B band. Same sizing as NoRegIdentityPlate. */
export function SeoWidePlate({ kind }: { kind: keyof typeof ART }) {
  const [hostRef, mounted] = useMountOnView<HTMLDivElement>();
  const wide = useMediaQuery("(min-width: 768px)");
  const cols = wide ? WIDE_COLS : TRAFFIC_COLS;
  const scene = useMemo(() => plateScene(ART[kind], cols), [kind, cols]);

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
