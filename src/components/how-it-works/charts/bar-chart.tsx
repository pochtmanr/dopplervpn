import { ChartFigure, type ChartSource } from "./figure";

export interface Bar {
  label: string;
  value: number;
  /** Doppler's own row, or the one the paragraph around it is about. */
  highlight?: boolean;
}

/**
 * Horizontal bars, built from divs rather than SVG so long labels wrap and the
 * bars grow from the reading edge in RTL for free. Width is value / max.
 */
export function BarChart({
  title,
  note,
  source,
  bars,
  unit = "",
  max,
  format = (v: number) => v.toLocaleString("en-US"),
}: {
  title: string;
  note?: string;
  source: ChartSource | ChartSource[];
  bars: Bar[];
  unit?: string;
  max?: number;
  format?: (v: number) => string;
}) {
  const top = max ?? Math.max(...bars.map((b) => b.value));
  return (
    <ChartFigure title={title} note={note} source={source}>
      <ul className="space-y-3.5">
        {bars.map((b) => (
          <li key={b.label} className="grid grid-cols-1 sm:grid-cols-[11rem_minmax(0,1fr)] gap-x-4 gap-y-1 items-center">
            <span className={`text-sm leading-snug ${b.highlight ? "text-text-primary font-semibold" : "text-text-muted"}`}>
              {b.label}
            </span>
            <span className="flex items-center gap-3">
              <span className="relative h-2.5 flex-1 rounded-full bg-overlay/5 overflow-hidden">
                <span
                  className={`absolute inset-y-0 start-0 rounded-full ${b.highlight ? "bg-accent-teal-light" : "bg-accent-teal/55"}`}
                  style={{ width: `${Math.max(1.5, (b.value / top) * 100)}%` }}
                />
              </span>
              <span className="w-20 shrink-0 text-end font-mono text-sm tabular-nums text-text-primary">
                {format(b.value)}
                {unit}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </ChartFigure>
  );
}
