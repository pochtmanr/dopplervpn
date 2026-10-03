'use client';

import { useState, type ReactNode } from 'react';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export interface LabRow {
  id: string;
  group: (typeof GROUPS)[number];
  title: string;
  source: string;
  /** Full-width card: the panes stack instead of sitting side by side. */
  wide?: boolean;
  current: ReactNode;
  /** Omitted on rows built after Calm was rejected: that pane is skipped. */
  calm?: ReactNode;
  plus: ReactNode;
}

type Kind = 'current' | 'calm' | 'plus';

const KINDS: { kind: Kind; label: string; caption: string; root: string }[] = [
  { kind: 'current', label: 'Current', caption: 'Current · Glyph Terminal', root: 'bg-bg-primary' },
  { kind: 'calm', label: 'Calm', caption: 'Calm · app-like', root: 'lab-calm' },
  { kind: 'plus', label: 'Calm+', caption: 'Calm+ · one live element · Plus Jakarta Sans', root: 'lab-calm lab-plus plus-remap' },
];

const GROUPS = ['Landing', 'Support', 'Dashboard', 'Blog', 'Auth'] as const;

function Pane({ caption, root, wide, children }: { caption: string; root: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-tertiary">{caption}</p>
      <div className={`rounded-3xl border border-overlay/10 ${wide ? 'overflow-hidden' : 'p-5 md:p-6'} ${root}`}>{children}</div>
    </div>
  );
}

export function LabContent({ rows }: { rows: LabRow[] }) {
  const [shown, setShown] = useState<Kind[]>(['current', 'plus']);
  const toggle = (k: Kind) =>
    setShown((s) => (s.includes(k) ? (s.length > 1 ? s.filter((x) => x !== k) : s) : KINDS.map((x) => x.kind).filter((x) => x === k || s.includes(x))));
  const panes = KINDS.filter((k) => shown.includes(k.kind));
  const cols = panes.length === 3 ? 'xl:grid-cols-3' : panes.length === 2 ? 'xl:grid-cols-2' : '';

  return (
    <div className="pt-24 pb-24">
      <div className="sticky top-16 z-30 border-b border-overlay/10 bg-bg-primary/90 backdrop-blur">
        <div className="mx-auto flex max-w-site flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <h1 className="me-auto font-display text-lg font-semibold text-text-primary">
            Design Lab <span className="text-text-tertiary">· cards</span>
          </h1>
          <nav className="hidden md:flex items-center gap-4 text-sm text-text-muted">
            {GROUPS.map((g) => (
              <a key={g} href={`#${g.toLowerCase()}`} className="hover:text-text-primary">
                {g}
              </a>
            ))}
          </nav>
          <div role="group" aria-label="Directions" className="inline-flex rounded-full border border-overlay/10 p-1">
            {KINDS.map(({ kind, label }) => (
              <button
                key={kind}
                type="button"
                aria-pressed={shown.includes(kind)}
                onClick={() => toggle(kind)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  shown.includes(kind) ? 'bg-overlay/10 text-text-primary' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        {GROUPS.map((group) => (
          <section key={group} id={group.toLowerCase()} className="scroll-mt-36 pt-14">
            <h2 className="mb-6 border-b border-overlay/10 pb-3 font-mono text-xs uppercase tracking-[0.2em] text-text-tertiary">
              {group}
            </h2>
            <div className="space-y-14">
              {rows
                .filter((r) => r.group === group)
                .map((r) => (
                  <article key={r.id} id={r.id} className="scroll-mt-36">
                    <div className="mb-4 flex flex-wrap items-baseline gap-x-3">
                      <h3 className="font-display text-xl font-semibold text-text-primary">{r.title}</h3>
                      <code className="text-xs text-text-tertiary">{r.source}</code>
                    </div>
                    <div className={`grid gap-6 ${r.wide ? 'grid-cols-1' : cols}`}>
                      {panes.filter((p) => r[p.kind] !== undefined).map((p) => (
                        <Pane key={p.kind} caption={p.caption} root={p.root} wide={r.wide}>
                          {r[p.kind]}
                        </Pane>
                      ))}
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
