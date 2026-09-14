"use client";

import { useState, useEffect } from "react";
import { HeroCTAs } from "./hero-ctas";
import { detectPlatform } from "@/lib/detect-platform";
import type { Platform } from "@/lib/detect-platform";
import type { CtaLocation } from "@/lib/track-cta";

interface HeroCTAsWrapperProps {
  location?: CtaLocation;
  secondaryHref?: string;
  secondaryLabel?: string;
  centered?: boolean;
}

export function HeroCTAsWrapper({
  location,
  secondaryHref,
  secondaryLabel,
  centered,
}: HeroCTAsWrapperProps) {
  // null until detected on the client: the primary button stays invisible (its
  // box still reserved) so its label and icon never visibly swap.
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  return (
    <HeroCTAs
      platform={platform ?? "desktop"}
      ready={platform !== null}
      location={location}
      secondaryHref={secondaryHref}
      secondaryLabel={secondaryLabel}
      centered={centered}
    />
  );
}
