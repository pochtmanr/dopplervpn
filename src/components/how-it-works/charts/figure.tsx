import type { ReactNode } from "react";

export interface ChartSource {
  label: string;
  url: string;
}

/**
 * The frame every article chart sits in: a quiet plate, a title, the chart,
 * and a caption that always names its source. A number without a source does
 * not go on these pages.
 */
export function ChartFigure({
  title,
  note,
  source,
  sourceLabel,
  children,
}: {
  title: string;
  note?: string;
  source: ChartSource | ChartSource[];
  /** Translated caption prefix. The source labels themselves stay English. */
  sourceLabel: string;
  children: ReactNode;
}) {
  const sources = Array.isArray(source) ? source : [source];
  return (
    <figure className="not-prose my-10 rounded-2xl border border-overlay/10 bg-bg-secondary/40 p-5 sm:p-7">
      <p className="font-display text-base sm:text-lg font-semibold text-text-primary mb-5">{title}</p>
      {children}
      <figcaption className="mt-5 border-t border-overlay/10 pt-3 text-xs leading-relaxed text-text-tertiary">
        {note && <span className="block mb-1 text-text-muted">{note}</span>}
        {sourceLabel}
        {": "}
        {sources.map((s, i) => (
          <span key={i}>
            {i > 0 && "; "}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-accent-teal">
              {s.label}
            </a>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
