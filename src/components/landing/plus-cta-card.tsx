import type { ReactNode } from "react";
import Image from "next/image";

/**
 * The closing download card of the app pages (Mac first, 2026-11-06): one flat
 * `--c-card` slab, copy on the start side, the picture bleeding to the end edge.
 * The app pages, the downloads page's setup card and the home CTA all use it,
 * so the three never drift into three different cards again.
 *
 * Presentational and hook-free, so a server page and a client card can both
 * render it.
 */
export function PlusCtaCard({
  image,
  imageFallback,
  children,
  className = "",
}: {
  /**
   * `fit: "contain"` is for a flat app screenshot (the Windows window): shown
   * whole, inset, on `bg`, instead of cropped to the cell like a device render.
   */
  image?: { src: string; bg?: string; alt: string; fit?: "cover" | "contain" };
  /** Shown in the picture cell when there is no image (the app pages' glyph tray). */
  imageFallback?: ReactNode;
  /** The copy column's contents. */
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 overflow-hidden rounded-[32px] bg-(--c-card) lg:grid-cols-[5fr_6fr] ${className}`}>
      <div className="flex flex-col justify-center gap-6 p-6 text-center sm:p-10 lg:p-14 lg:text-start">{children}</div>
      {image ? (
        <div className="relative aspect-[3/2] lg:aspect-auto" style={{ backgroundColor: image.bg }}>
          {image.fit === "contain" ? (
            <div className="absolute inset-6 sm:inset-10">
              <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 50vw, 90vw" className="object-contain" />
            </div>
          ) : (
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          )}
        </div>
      ) : (
        imageFallback
      )}
    </div>
  );
}

/** The card's headline: the app pages' H2. */
export const PLUS_CTA_TITLE = "font-display text-3xl font-bold leading-tight text-(--c-text) md:text-[40px]";

/** The line under it. */
export const PLUS_CTA_LEAD = "mx-auto max-w-md text-lg text-(--c-muted) lg:mx-0";

/** The large teal pill (the app pages' `StoreButton large`). */
export const PLUS_CTA_BTN =
  "plus-btn inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-(--c-accent-fill) px-8 text-base font-bold text-white hover:bg-(--c-accent) " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--c-bg)";

/** The plain text link beside it ("All downloads"). */
export const PLUS_CTA_LINK = "text-[15px] font-bold text-(--c-accent) hover:underline hover:underline-offset-4";
