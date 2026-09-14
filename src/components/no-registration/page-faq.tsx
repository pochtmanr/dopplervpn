"use client";

import { useState } from "react";

export function PageFaq({
  title,
  items,
  idPrefix = "page-faq",
}: {
  title: string;
  items: { id: string; question: string; answer: string }[];
  idPrefix?: string;
}) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-display section-title text-center mb-10 md:mb-12">{title}</h2>
      <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/40 overflow-hidden">
        {items.map((item) => {
          const isOpen = open === item.id;
          const panelId = `${idPrefix}-${item.id}`;
          return (
            <div key={item.id} className="border-b border-overlay/10 last:border-b-0">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="w-full py-5 px-5 md:px-6 flex items-center justify-between text-start gap-4 group"
                >
                  <span className="font-display text-base md:text-lg font-medium text-text-primary group-hover:text-accent-teal transition-colors">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-text-tertiary group-hover:text-accent-teal transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                inert={!isOpen}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="px-5 md:px-6 pb-5 text-sm md:text-base text-text-muted leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
