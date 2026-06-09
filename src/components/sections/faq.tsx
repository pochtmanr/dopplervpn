"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";

const faqKeys = [
  "what",
  "noLogs",
  "adBlocker",
  "categories",
  "devices",
  "platforms",
  "whatIsIncluded",
  "plans",
  "trial",
  "cancel",
  "restore",
  "refund",
] as const;

function FaqItem({
  faqKey,
  isOpen,
  onToggle,
  t,
}: {
  faqKey: string;
  isOpen: boolean;
  onToggle: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="border-b border-overlay/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-start gap-4 group"
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${faqKey}`}
      >
        <span className="font-display text-lg md:text-xl font-medium text-text-primary group-hover:text-accent-gold transition-colors">
          {t(`items.${faqKey}.question`)}
        </span>
        <span
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-text-muted group-hover:text-accent-gold transition-all duration-200"
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
        id={`faq-panel-${faqKey}`}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-6 text-text-muted leading-relaxed">
            {t(`items.${faqKey}.answer`)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const mid = Math.ceil(faqKeys.length / 2);
  const leftKeys = faqKeys.slice(0, mid);
  const rightKeys = faqKeys.slice(mid);

  return (
    <Section id="faq">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
        <div>
          {leftKeys.map((key, index) => (
            <FaqItem
              key={key}
              faqKey={key}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              t={t}
            />
          ))}
        </div>
        <div>
          {rightKeys.map((key, i) => {
            const index = mid + i;
            return (
              <FaqItem
                key={key}
                faqKey={key}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                t={t}
              />
            );
          })}
        </div>
      </div>
    </Section>
  );
}
