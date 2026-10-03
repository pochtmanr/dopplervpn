'use client';

import { useId, useState } from 'react';
import { PLUS_BODY } from '../plus-recipes';

export interface PlusFaqItem {
  question: string;
  answer: string;
}

function Chevron() {
  return (
    <svg
      className="plus-faq-chevron h-4 w-4 shrink-0 text-(--c-tert) rtl:-scale-x-100"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

/**
 * Calm+ FAQ: one card per column, one row open across all of them (the first by
 * default, like the shipped FAQ). Live element: the open row's teal start bar.
 */
export function PlusFaqAccordion({ items, columns = 1 }: { items: PlusFaqItem[]; columns?: 1 | 2 }) {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();
  const per = Math.ceil(items.length / columns);
  const groups = Array.from({ length: columns }, (_, c) => items.slice(c * per, (c + 1) * per));

  return (
    <div className={`grid grid-cols-1 items-start gap-4 ${columns === 2 ? 'lg:grid-cols-2' : ''}`}>
      {groups.map((group, c) => (
        <div key={c} className="overflow-hidden rounded-[22px] bg-(--c-card)">
          {group.map((item, j) => {
            const i = c * per + j;
            const isOpen = open === i;
            return (
              <div key={i} data-open={isOpen} className={`plus-faq-row ${j > 0 ? 'border-t border-(--c-separator)' : ''}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`${uid}-${i}`}
                  className="flex w-full items-center gap-3 px-5 py-4 text-start text-[16px] font-bold text-(--c-text) transition-colors hover:bg-(--c-accent-tint) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--c-accent)"
                >
                  <span className="flex-1">{item.question}</span>
                  <Chevron />
                </button>
                <div
                  id={`${uid}-${i}`}
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className={`px-5 pb-5 ${PLUS_BODY}`}>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
