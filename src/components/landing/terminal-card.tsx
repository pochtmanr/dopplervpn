import type { TerminalLine } from "@/config/platforms/app-page";

/**
 * A terminal session on the Calm+ ramp: an inset tray in a card, the same nesting as the glyph
 * trays on the app pages. Always left-to-right, in every locale: it is a terminal. Long lines
 * scroll inside the tray, so the page never scrolls sideways.
 */
export function TerminalCard({
  lines,
  label,
  caption,
  className = "",
}: {
  lines: TerminalLine[];
  /** Accessible name for the block. */
  label: string;
  /** One quiet line under the session ("a preview; details may change"). */
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={`rounded-[28px] bg-(--c-card) p-3 ${className}`}>
      <div className="overflow-hidden rounded-[20px] bg-(--c-bg)">
        <div className="flex items-center gap-1.5 px-5 pt-4" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-(--c-inset)" />
          <span className="h-2.5 w-2.5 rounded-full bg-(--c-inset)" />
          <span className="h-2.5 w-2.5 rounded-full bg-(--c-inset)" />
        </div>
        <pre
          dir="ltr"
          aria-label={label}
          tabIndex={0}
          className="overflow-x-auto px-5 pt-4 pb-5 text-start font-mono text-[13px] leading-[1.75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--c-accent) sm:text-sm sm:leading-[1.75]"
        >
          {lines.map((line, i) => (
            <span key={i} className={`block ${line.kind === "cmd" ? "text-(--c-text)" : "text-(--c-muted)"}`}>
              {line.kind === "cmd" && (
                <span className="select-none text-(--c-accent)" aria-hidden="true">
                  {"$ "}
                </span>
              )}
              {line.text}
            </span>
          ))}
          <span className="block" aria-hidden="true">
            <span className="select-none text-(--c-accent)">{"$ "}</span>
            <span className="terminal-cursor text-(--c-accent)">▌</span>
          </span>
        </pre>
      </div>
      {caption && <figcaption className="px-3 pt-3 pb-1 text-[13px] leading-snug text-(--c-tert)">{caption}</figcaption>}
    </figure>
  );
}
