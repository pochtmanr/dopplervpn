import type { ReactNode } from "react";

/**
 * Recipe B glass shell without a terminal plate. Hairline + hover orb only.
 * Sequential "how it works" cards use GlyphPlateCard instead.
 */
export function GlassCard({
  children,
  className = "",
  padded = true,
  hoverOrb = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  hoverOrb?: boolean;
}) {
  return (
    <div
      className={[
        "group relative h-full overflow-hidden rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] backdrop-blur-sm hover:border-accent-teal/30 transition-colors duration-300",
        padded ? "p-6" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />
      {hoverOrb && (
        <div className="absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      <div className="relative h-full">{children}</div>
    </div>
  );
}

export function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-accent-teal shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
