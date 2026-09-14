"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GlyphField } from "@/components/glyph/glyph-field";
import { TRAFFIC_ASPECT, trafficScene } from "@/components/glyph/traffic-scene";

/**
 * One step of the traffic flow: the prose, and under it the ASCII terminal
 * plate for that stage, standing where the ghost numeral used to.
 *
 * The field is mounted when the card first scrolls into view, not at page load.
 * A scene assembles once from its own start (`loop={false}`), so mounting early
 * would spend that assembly off-screen and leave nothing but a settled plate to
 * scroll down to. After that the field's own observer parks the loop whenever
 * the card leaves the viewport.
 */

interface TrafficStepCardProps {
  /** Position in the flow — picks the scene. */
  index: number;
  title: string;
  description: string;
}

export function TrafficStepCard({ index, title, description }: TrafficStepCardProps) {
  const [mounted, setMounted] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const scene = useMemo(() => trafficScene(index), [index]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        // A callback can batch several entries for one target; the last is current.
        if (!entries[entries.length - 1].isIntersecting) return;
        setMounted(true);
        io.disconnect(); // One-way. Pausing offscreen is the field's own job.
      },
      { rootMargin: "120px" },
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] p-6 overflow-hidden backdrop-blur-sm hover:border-accent-teal/30 transition-colors duration-300">
      <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />
      <div className="absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
        <p className="text-sm text-text-muted mt-1">{description}</p>
      </div>

      {/* mt-auto pins the plate to the card's foot, so the four line up on one
          baseline however far the description above them runs; the negative
          margins cancel the card's p-6 so the field runs border to border and
          sits flush with the bottom edge, clipped by the card's own rounded
          overflow. The spacing is on this wrapper, never on the host: an
          absolutely positioned child resolves inset-0 against the padding box,
          so padding on the host would inflate its aspect-ratio without moving
          the field inside it. */}
      <div className="mt-auto -mx-6 -mb-6 pt-5">
        <div
          ref={hostRef}
          style={{ aspectRatio: TRAFFIC_ASPECT }}
          className={`relative w-full transition-opacity duration-700 motion-reduce:transition-none ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* `hover` is what warms the lattice to teal under the group. */}
          {mounted && <GlyphField scene={scene} loop={false} hover />}
        </div>
      </div>
    </div>
  );
}
