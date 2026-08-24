"use client";

import { useState } from "react";

// Layout/typography utility lists live in globals.css (@layer components) as
// .accordion / .accordion-trigger / .accordion-question / .accordion-icon /
// .accordion-panel / .accordion-answer. `group` must stay in the markup (it is
// the hover marker the group-hover: rules key off), and the open/closed
// grid-rows-[…] classes stay utilities because they are genuinely dynamic.

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="accordion-trigger group"
              aria-expanded={isOpen}
            >
              <span className="font-display accordion-question">
                {item.question}
              </span>
              <span
                className="accordion-icon"
                style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </span>
            </button>

            <div
              className={`accordion-panel ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="accordion-answer">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
