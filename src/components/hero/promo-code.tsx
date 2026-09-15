"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface PromoData {
  code: string;
  discount_percent: number;
}

export function PromoCode() {
  const t = useTranslations("hero");
  const [promo, setPromo] = useState<PromoData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/promo/active")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PromoData | null) => {
        if (data?.code) setPromo(data);
      })
      .catch(() => {});
  }, []);

  if (!promo) return null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center justify-center lg:justify-start">
      <button
        onClick={copyCode}
        aria-label={t("promoCopyLabel", { code: promo.code })}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-all duration-200 ${
          copied
            ? "bg-accent-gold/20 border-accent-gold/40 text-accent-gold"
            : "bg-accent-gold/10 border-accent-gold/20 text-accent-gold hover:bg-accent-gold/15"
        }`}
      >
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6h.008v.008H6V6Z"
          />
        </svg>
        <span className="font-semibold">{promo.code}</span>
        <span>&mdash;</span>
        <span>{t("promoDiscount", { percent: promo.discount_percent })}</span>
        {copied ? (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H8.25m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m6 10.375a2.625 2.625 0 0 1-2.625-2.625"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
