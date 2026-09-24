import { ChartFigure, type ChartSource } from "./figure";

export interface LinePoint {
  x: number;
  y: number;
  label?: string;
}

/**
 * A single-series line or scatter plot in plain SVG. A plot has a physical
 * x-axis, so it stays left-to-right in RTL locales (direction="ltr" on the svg);
 * the surrounding caption still follows the page direction.
 */
export function LineChart({
  title,
  note,
  source,
  points,
  xLabel,
  yLabel,
  xMax,
  yMax,
  xTicks,
  yTicks,
  line = true,
  reference,
}: {
  title: string;
  note?: string;
  source: ChartSource | ChartSource[];
  points: LinePoint[];
  xLabel: string;
  yLabel: string;
  xMax: number;
  yMax: number;
  xTicks: number[];
  yTicks: number[];
  /** false draws only the labelled dots (measured samples, not a model). */
  line?: boolean;
  /** A dashed y = slope * x guide, e.g. the physical floor measured dots sit above. */
  reference?: { slope: number; label: string };
}) {
  const W = 640;
  const H = 320;
  const pad = { l: 52, r: 16, t: 12, b: 44 };
  const sx = (x: number) => pad.l + (x / xMax) * (W - pad.l - pad.r);
  const sy = (y: number) => H - pad.b - (y / yMax) * (H - pad.t - pad.b);
  const d = points.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");

  return (
    <ChartFigure title={title} note={note} source={source}>
      <svg viewBox={`0 0 ${W} ${H}`} direction="ltr" role="img" aria-label={title} className="w-full h-auto overflow-visible">
        <title>{title}</title>
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={pad.l} x2={W - pad.r} y1={sy(t)} y2={sy(t)} className="stroke-overlay/10" strokeWidth={1} />
            <text x={pad.l - 8} y={sy(t) + 4} textAnchor="end" className="fill-text-tertiary font-mono text-[11px]">
              {t}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={`x${t}`} x={sx(t)} y={H - pad.b + 18} textAnchor="middle" className="fill-text-tertiary font-mono text-[11px]">
            {t.toLocaleString("en-US")}
          </text>
        ))}
        <text x={(pad.l + W - pad.r) / 2} y={H - 4} textAnchor="middle" className="fill-text-muted text-[12px]">
          {xLabel}
        </text>
        <text x={14} y={(pad.t + H - pad.b) / 2} textAnchor="middle" transform={`rotate(-90 14 ${(pad.t + H - pad.b) / 2})`} className="fill-text-muted text-[12px]">
          {yLabel}
        </text>
        {reference && (
          <g>
            <line
              x1={sx(0)}
              y1={sy(0)}
              x2={sx(Math.min(xMax, yMax / reference.slope))}
              y2={sy(Math.min(yMax, xMax * reference.slope))}
              className="stroke-text-tertiary"
              strokeWidth={1.5}
              strokeDasharray="4 5"
            />
            <text
              x={sx(xMax) - 4}
              y={sy(Math.min(yMax, xMax * reference.slope)) - 10}
              textAnchor="end"
              className="fill-text-tertiary text-[11px]"
            >
              {reference.label}
            </text>
          </g>
        )}
        {line && <path d={d} fill="none" className="stroke-accent-teal" strokeWidth={2} strokeLinejoin="round" />}
        {points.map((p) => (
          <g key={`${p.x}-${p.y}`}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={p.label ? 4.5 : 3} className="fill-accent-teal-light" />
            {p.label && (
              // Labels past the middle hang to the left of their dot so they stay inside the plot.
              <text
                x={sx(p.x) + (sx(p.x) > W * 0.55 ? -8 : 8)}
                y={sy(p.y) - 8}
                textAnchor={sx(p.x) > W * 0.55 ? "end" : "start"}
                className="fill-text-primary text-[11px]"
              >
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </ChartFigure>
  );
}
