"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

interface WaitlistFormProps {
  platform: string;
}

export function WaitlistForm({ platform }: WaitlistFormProps) {
  const t = useTranslations("apps.waitlist");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), platform, locale }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl bg-accent-teal/10 border border-accent-teal/20 px-4 py-3 text-center">
        <p className="text-sm text-accent-teal font-medium">
          <CheckIcon />
          {t("success")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 min-w-0 rounded-lg border border-overlay/15 bg-bg-primary/50 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-teal/40 focus:ring-1 focus:ring-accent-teal/20 transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-accent-teal text-bg-primary px-4 py-2.5 text-sm font-medium hover:bg-accent-teal/90 transition-colors disabled:opacity-50"
        >
          {status === "loading" ? (
            <LoadingSpinner />
          ) : (
            <BellIcon />
          )}
          {t("button")}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-400">{t("error")}</p>
      )}
    </form>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 inline-block me-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
