"use client";

import { Accordion } from "@/components/ui/accordion";

interface SupportFaqProps {
  items: { question: string; answer: string }[];
}

export function SupportFaq({ items }: SupportFaqProps) {
  return <Accordion items={items} />;
}
