"use client";

import { useState, useEffect } from "react";
import { HeroCTAs } from "./hero-ctas";
import { detectPlatform } from "@/lib/detect-platform";
import type { Platform } from "@/lib/detect-platform";

export function HeroCTAsWrapper() {
  // null until detected on the client: the primary button stays invisible (its
  // box still reserved) so its label and icon never visibly swap.
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  return <HeroCTAs platform={platform ?? "desktop"} ready={platform !== null} />;
}
