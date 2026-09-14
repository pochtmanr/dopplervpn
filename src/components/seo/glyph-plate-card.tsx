"use client";

import { useMemo } from "react";
import { GlyphField } from "@/components/glyph/glyph-field";
import { TRAFFIC_ASPECT } from "@/components/glyph/traffic-scene";
import { noRegHowScene } from "@/components/glyph/no-reg-scene";
import { cryptoHowScene, toolsHowScene, vlessHowScene } from "@/components/glyph/seo-scene";
import { useMountOnView } from "@/components/glyph/use-mount-on-view";

export type PlateKind = "noreg" | "vless" | "crypto" | "tools";

/**
 * Recipe B card with a settle-once terminal plate. Same shell as TrafficStepCard.
 */
export function GlyphPlateCard({
  kind,
  index,
  title,
  description,
  cta,
}: {
  kind: PlateKind;
  index: number;
  title: string;
  description: string;
  cta?: string;
}) {
  const [hostRef, mounted] = useMountOnView<HTMLDivElement>();
  const scene = useMemo(() => {
    if (kind === "vless") return vlessHowScene(index);
    if (kind === "crypto") return cryptoHowScene(index);
    if (kind === "tools") return toolsHowScene(index);
    return noRegHowScene(index);
  }, [kind, index]);

  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] p-6 overflow-hidden backdrop-blur-sm hover:border-accent-teal/30 transition-colors duration-300">
      <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />
      <div className="absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
        <p className="text-sm text-text-muted mt-1">{description}</p>
        {cta ? (
          <div className="mt-4 inline-flex items-center gap-1.5 text-accent-teal text-sm font-medium">
            {cta}
            <svg
              className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </div>
        ) : null}
      </div>

      <div className="mt-auto -mx-6 -mb-6 pt-5">
        <div
          ref={hostRef}
          style={{ aspectRatio: TRAFFIC_ASPECT }}
          className={`relative w-full transition-opacity duration-700 motion-reduce:transition-none ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          {mounted && <GlyphField scene={scene} loop={false} hover />}
        </div>
      </div>
    </div>
  );
}
