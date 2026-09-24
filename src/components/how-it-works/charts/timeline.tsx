import { ChartFigure, type ChartSource } from "./figure";

export interface TimelineEvent {
  year: string;
  title: string;
  body: string;
  highlight?: boolean;
}

/** A vertical rail of dated events. Reads top to bottom at any width. */
export function Timeline({
  title,
  note,
  source,
  events,
}: {
  title: string;
  note?: string;
  source: ChartSource | ChartSource[];
  events: TimelineEvent[];
}) {
  return (
    <ChartFigure title={title} note={note} source={source}>
      <ol className="relative border-s border-overlay/15 ms-2">
        {events.map((e) => (
          <li key={`${e.year}-${e.title}`} className="relative ps-6 pb-6 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute -start-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-bg-secondary ${
                e.highlight ? "bg-accent-teal-light" : "bg-overlay/30"
              }`}
            />
            <p className="font-mono text-xs tracking-wide text-accent-teal-light">{e.year}</p>
            <p className="mt-0.5 font-semibold text-text-primary">{e.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">{e.body}</p>
          </li>
        ))}
      </ol>
    </ChartFigure>
  );
}
