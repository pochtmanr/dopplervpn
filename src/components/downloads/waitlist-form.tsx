"use client";

import { useId, useState } from "react";

export interface WaitlistLabels {
  /** Accessible name of the email field. */
  label: string;
  placeholder: string;
  button: string;
  success: string;
  error: string;
  /** One quiet line under the form: what the address is used for. */
  privacy: string;
}

interface WaitlistFormProps {
  platform: "linux" | "windows";
  locale: string;
  /**
   * Words come from the server page as props, so the page's namespace stays server-only and
   * needs no entry in i18n/client-namespaces.ts.
   */
  labels: WaitlistLabels;
  /** The surface the form sits on: the field takes the next tone up so it reads as a well. */
  tone?: "page" | "card";
  /** Row alignment at desktop width. */
  align?: "center" | "start";
}

/** Email capture for a platform that is announced and not yet downloadable. Calm+ only. */
export function WaitlistForm({ platform, locale, labels, tone = "page", align = "center" }: WaitlistFormProps) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), platform, locale }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  const edge = align === "center" ? "mx-auto" : "mx-auto lg:mx-0";

  if (status === "success") {
    return (
      <p
        role="status"
        className={`${edge} flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-(--c-accent-tint) px-5 py-3.5 text-[15px] font-bold text-(--c-accent)`}
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.25} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        {labels.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${edge} w-full max-w-md`}>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor={id} className="sr-only">
          {labels.label}
        </label>
        <input
          id={id}
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={labels.placeholder}
          className={`h-14 w-full min-w-0 shrink-0 rounded-full sm:w-auto sm:flex-1 sm:shrink px-6 text-base text-(--c-text) placeholder:text-(--c-tert) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) ${
            tone === "card" ? "bg-(--c-inset)" : "bg-(--c-card)"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="plus-btn inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-(--c-accent-fill) px-8 text-base font-bold text-white hover:bg-(--c-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--c-bg) disabled:opacity-60"
        >
          {labels.button}
        </button>
      </div>
      <p role={status === "error" ? "alert" : undefined} className={`mt-3 text-[13px] leading-snug ${status === "error" ? "text-(--c-danger)" : "text-(--c-tert)"}`}>
        {status === "error" ? labels.error : labels.privacy}
      </p>
    </form>
  );
}
