"use client";

import { useState, useEffect } from "react";
import { HeroCTAs } from "./hero-ctas";
import { detectPlatform } from "@/lib/detect-platform";
import type { Platform } from "@/lib/detect-platform";

export function HeroCTAsWrapper() {
  const [platform, setPlatform] = useState<Platform>("desktop");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  return <HeroCTAs platform={platform} />;
}
