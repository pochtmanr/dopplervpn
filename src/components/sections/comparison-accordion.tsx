"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { GlyphField } from "@/components/glyph/glyph-field";
import { COMPARE_ASPECT, comparisonScene } from "@/components/glyph/comparison-scene";
import { useMountOnView } from "@/components/glyph/use-mount-on-view";

/**
 * "Doppler vs. Traditional VPNs" as a terminal accordion. One row open at a
 * time, the first open on load. Opening a row mounts its diff plate, so the
 * plate prints itself in from the left on every open; closing unmounts it, so
 * at most one comparison field is ever running.
 *
 * Panels stay in the DOM (crawlable, find-in-page), and a closed one is `inert`
 * so its text is out of the tab order and the accessibility tree.
 */

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export interface ComparisonRow {
  key: string;
  feature: string;
  traditional: string;
  doppler: string;
  means: string;
  keeps: string;
  why: string;
}

interface ComparisonAccordionProps {
  headers: { feature: string; traditional: string; doppler: string };
  panel: { means: string; keeps: string; why: string };
  rows: ComparisonRow[];
}

function Plate({ rowKey, active }: { rowKey: string; active: boolean }) {
  const [hostRef, inView] = useMountOnView<HTMLDivElement>();
  const scene = useMemo(() => comparisonScene(rowKey), [rowKey]);
  const live = active && inView;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{ aspectRatio: COMPARE_ASPECT }}
      className={`glyph-vignette relative w-full transition-opacity duration-500 motion-reduce:transition-none ${
        live ? "opacity-100" : "opacity-0"
      }`}
    >
      {live && <GlyphField scene={scene} loop={false} hover />}
    </div>
  );
}

export function ComparisonAccordion({ headers, panel, rows }: ComparisonAccordionProps) {
  const [open, setOpen] = useState<string | null>(rows[0]?.key ?? null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  // Enter/Space come free with <button>; this adds the arrow-key roving the
  // WAI accordion pattern recommends.
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = rows.length;
    const target =
      e.key === "ArrowDown" ? (i + 1) % n
      : e.key === "ArrowUp" ? (i - 1 + n) % n
      : e.key === "Home" ? 0
      : e.key === "End" ? n - 1
      : -1;
    if (target < 0) return;
    e.preventDefault();
    buttons.current[target]?.focus();
  };

  const notes = [
    { id: "means", n: "01", label: panel.means },
    { id: "keeps", n: "02", label: panel.keeps },
    { id: "why", n: "03", label: panel.why },
  ] as const;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.06] via-bg-secondary/40 to-bg-secondary/30">
      <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />

      {/* Receipt header. Screen readers get the column names inline on each row. */}
      <div
        aria-hidden="true"
        style={{ fontFamily: MONO }}
        className="hidden md:grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_2rem] gap-x-6 border-b border-dashed border-overlay/15 px-6 py-4 text-[11px] uppercase tracking-[0.2em] text-text-tertiary"
      >
        <span>{headers.feature}</span>
        <span>{headers.traditional}</span>
        <span className="text-accent-teal">{headers.doppler}</span>
      </div>

      {rows.map((row, i) => {
        const isOpen = open === row.key;
        const btnId = `cmp-btn-${row.key}`;
        const panelId = `cmp-panel-${row.key}`;
        return (
          <div key={row.key} className="cmp-row group" data-open={isOpen}>
            <h3>
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : row.key)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="cmp-btn"
              >
                <span className="cmp-feature">{row.feature}</span>
                <span className="cmp-trad">
                  <span aria-hidden="true" className="cmp-tag" style={{ fontFamily: MONO }}>
                    {headers.traditional}
                  </span>
                  <span className="sr-only">{headers.traditional}: </span>
                  {row.traditional}
                </span>
                <span className="cmp-dop">
                  <span aria-hidden="true" className="cmp-tag" style={{ fontFamily: MONO }}>
                    {headers.doppler}
                  </span>
                  <span className="sr-only">{headers.doppler}: </span>
                  {row.doppler}
                  <span aria-hidden="true" className="ms-2 text-accent-teal-light">✓</span>
                </span>
                <span aria-hidden="true" className="cmp-toggle" style={{ fontFamily: MONO }}>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>

            <div id={panelId} role="region" aria-labelledby={btnId} inert={!isOpen} className="cmp-panel">
              <div className="min-h-0 overflow-hidden">
                <div className="cmp-body">
                  <Plate rowKey={row.key} active={isOpen} />
                  <dl className="md:col-span-2">
                    {notes.map((note) => (
                      // Staggered in after the plate starts printing (globals.css).
                      <div key={note.id} className="cmp-note">
                        <dt className="cmp-note-label" style={{ fontFamily: MONO }}>
                          <span className="text-accent-teal">{note.n}</span> · {note.label}
                        </dt>
                        <dd className="text-sm md:text-base text-text-muted leading-relaxed">{row[note.id]}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
