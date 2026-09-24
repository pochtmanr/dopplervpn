import { Fragment } from "react";
import { ChartFigure, type ChartSource } from "./figure";

export interface SchemaNode {
  label: string;
  detail?: string;
  /** accent: Doppler's own path. muted: the branch that goes nowhere useful. */
  tone?: "accent" | "muted";
}

export interface SchemaLane {
  title: string;
  nodes: SchemaNode[];
  /** Someone on this stretch of the path who can observe it, and what they get. */
  watcher?: { who: string; sees: string };
}

/**
 * An architecture schema: lanes of boxes joined by labelled arrows, the way the
 * support-plan flowcharts are drawn, but in the site's own tokens. Lanes run
 * left to right from md up and stack top to bottom below it, like the home
 * section's step cards. `links[i]` labels the arrow from lane i to lane i+1.
 */
export function FlowSchema({
  title,
  note,
  source,
  lanes,
  links,
}: {
  title: string;
  note?: string;
  source: ChartSource | ChartSource[];
  lanes: SchemaLane[];
  links: string[];
}) {
  return (
    <ChartFigure title={title} note={note} source={source}>
      <div className="flex flex-col md:flex-row md:items-stretch">
        {lanes.map((lane, i) => (
          <Fragment key={lane.title}>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-1 flex-col gap-2 rounded-xl border border-dashed border-overlay/20 p-2.5">
                <p className="px-1 font-mono text-[11px] uppercase tracking-wider text-text-tertiary">{lane.title}</p>
                {lane.nodes.map((n) => (
                  <div
                    key={n.label}
                    className={`rounded-lg border px-3 py-2 ${
                      n.tone === "accent"
                        ? "border-accent-teal/50 bg-accent-teal/[0.07]"
                        : n.tone === "muted"
                          ? "border-overlay/10 bg-transparent opacity-80"
                          : "border-overlay/15 bg-bg-secondary/60"
                    }`}
                  >
                    <p className={`text-sm font-semibold leading-snug ${n.tone === "accent" ? "text-accent-teal-light" : "text-text-primary"}`}>
                      {n.label}
                    </p>
                    {n.detail && <p className="mt-0.5 text-xs leading-snug text-text-muted">{n.detail}</p>}
                  </div>
                ))}
              </div>
              {lane.watcher && (
                // Neutral, not a second accent: DESIGN.md keeps teal as the only one.
                <div className="rounded-lg border border-overlay/15 bg-overlay/[0.03] px-3 py-2">
                  <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    {lane.watcher.who}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-text-muted">{lane.watcher.sees}</p>
                </div>
              )}
            </div>
            {i < lanes.length - 1 && (
              <div className="flex shrink-0 items-center justify-center gap-2 py-2 md:w-24 md:flex-col md:gap-1 md:py-0 md:self-start md:pt-10">
                <svg className="h-4 w-4 text-accent-teal md:hidden" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0 6.75-6.75M12 19.5l-6.75-6.75" />
                </svg>
                <span className="text-center font-mono text-[11px] leading-tight text-text-tertiary">{links[i]}</span>
                <svg className="hidden h-4 w-full text-accent-teal md:block rtl:rotate-180" viewBox="0 0 96 16" fill="none" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M4 8h84m0 0-6-5m6 5-6 5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </ChartFigure>
  );
}
