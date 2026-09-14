"use client";

import { useEffect, useMemo, useRef } from "react";
import { GlyphField } from "./glyph-field";
import { backdropScene } from "./price-scene";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * Section ground for pricing: grain across the whole section, dimmed everywhere
 * except a spotlight that trails the pointer (`.glyph-spotlight` in globals.css;
 * the lag comes from transitioning the registered --spot-x/--spot-y properties).
 *
 * Must be the first child of a `relative overflow-hidden` section — it listens
 * on its parent so the spotlight follows the pointer across the whole section,
 * including over the card. Hidden below md, where there is no pointer to follow
 * and the section is too tall for the grid to read as fine grain.
 */
export function PricingBackdrop() {
  // Not mounted below md at all: even hidden, the field paints once on mount.
  const isWide = useMediaQuery("(min-width: 768px)");
  return isWide ? <PricingBackdropField /> : null;
}

function PricingBackdropField() {
  const hostRef = useRef<HTMLDivElement>(null);
  const scene = useMemo(() => backdropScene(), []);

  useEffect(() => {
    const host = hostRef.current;
    const area = host?.parentElement;
    if (!host || !area) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;

    const move = (e: PointerEvent) => {
      const rect = area.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        host.style.setProperty("--spot-x", `${x}px`);
        host.style.setProperty("--spot-y", `${y}px`);
      });
    };
    // Back to the resting position from the stylesheet.
    const leave = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      host.style.removeProperty("--spot-x");
      host.style.removeProperty("--spot-y");
    };

    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={hostRef} aria-hidden="true" className="glyph-spotlight pointer-events-none absolute inset-0 opacity-50">
      <GlyphField scene={scene} loop={false} />
    </div>
  );
}

// Portrait grid for a phone-shaped hero: 90·0.6 / 100·1.15 ≈ 0.47, close to 390×844.
const HERO_MOBILE_COLS = 90;
const HERO_MOBILE_ROWS = 100;
// 5fps: sparks swap one at a time and the grain drifts slowly, so a low rate
// still reads as alive. At 20fps this field cost ~40% of a throttled phone core.
const HERO_MOBILE_FRAME_MS = 200;

/**
 * The pricing ground reused as the hero's backdrop below lg, where the globe is
 * dropped. Mounted only below lg. The mask is static (edge fade only) — an
 * animated mask re-rasterises the whole viewport every frame on a phone — and
 * the field fades in once its first frame is painted instead of popping.
 * Same placement contract as PricingBackdrop.
 */
export function HeroMobileBackdrop() {
  const isMobile = useMediaQuery("(max-width: 1023.98px)");
  return isMobile ? <HeroMobileBackdropField /> : null;
}

function HeroMobileBackdropField() {
  const scene = useMemo(() => backdropScene(HERO_MOBILE_COLS, HERO_MOBILE_ROWS), []);

  return (
    <div aria-hidden="true" className="glyph-edge-fade hero-backdrop-in pointer-events-none absolute inset-0">
      <GlyphField scene={scene} loop={false} frameMs={HERO_MOBILE_FRAME_MS} />
    </div>
  );
}
