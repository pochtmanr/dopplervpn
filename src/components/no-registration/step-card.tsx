"use client";

import { useMemo } from "react";
import { GlyphField } from "@/components/glyph/glyph-field";
import { TRAFFIC_ASPECT } from "@/components/glyph/traffic-scene";
import { noRegHowScene } from "@/components/glyph/no-reg-scene";
import { useMountOnView } from "@/components/glyph/use-mount-on-view";

/**
 * Recipe B card for one "how Doppler works without an account" step.
 * Same shell as TrafficStepCard; a different plate per index.
 */
export function NoRegStepCard({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  const [hostRef, mounted] = useMountOnView<HTMLDivElement>();
  const scene = useMemo(() => noRegHowScene(index), [index]);

  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] p-6 overflow-hidden backdrop-blur-sm hover:border-accent-teal/30 transition-colors duration-300">
      <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />
      <div className="absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
        <p className="text-sm text-text-muted mt-1">{description}</p>
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
