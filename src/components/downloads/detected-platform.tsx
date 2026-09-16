"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { detectPlatform, type Platform } from "@/lib/detect-platform";

/**
 * The visitor's own platform, for the downloads page.
 *
 * It resolves after mount — the page is prerendered, so the server cannot know —
 * and everything that reads it changes colour only (a card's border, the setup
 * card's default tab), never layout, so the late answer moves nothing.
 */
const DetectedPlatformContext = createContext<Platform | null>(null);

export function DetectedPlatformProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  useEffect(() => setPlatform(detectPlatform()), []);
  return (
    <DetectedPlatformContext.Provider value={platform}>{children}</DetectedPlatformContext.Provider>
  );
}

export function useDetectedPlatform() {
  return useContext(DetectedPlatformContext);
}

/**
 * Wraps a server-rendered platform card and marks it when it is the visitor's
 * device. The styling lives on the card (`data-[detected=true]:` and `group-data-[detected=true]:`), so
 * this stays a bare attribute toggle.
 */
export function DetectedCard({
  platform,
  id,
  className,
  children,
}: {
  platform: string;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const detected = useDetectedPlatform() === platform;
  return (
    <div id={id} data-detected={detected} className={className}>
      {children}
    </div>
  );
}
