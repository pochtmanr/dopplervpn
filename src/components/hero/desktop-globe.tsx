"use client";

import { DotGlobe } from "./dot-globe";
import { useMediaQuery } from "@/lib/use-media-query";

interface DesktopGlobeProps {
  label: string;
  nodeLabels: string[];
}

/**
 * The hero globe, mounted only at lg+. Its setup (land mask, observers) is heavy,
 * and a `hidden` parent alone would still run it on phones during hydration.
 * The sized box is always rendered, so the desktop column never shifts.
 */
export function DesktopGlobe({ label, nodeLabels }: DesktopGlobeProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="relative w-full max-w-[620px] aspect-square">
      {isDesktop && (
        <DotGlobe
          className="relative w-full h-full"
          label={label}
          nodeLabels={nodeLabels}
        />
      )}
    </div>
  );
}
