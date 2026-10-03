"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  PLUS_BODY,
  PLUS_BTN,
  PLUS_ICON,
  PLUS_ICON_TONE,
  PLUS_META,
  PLUS_TITLE,
  PLUS_TITLE_SM,
} from "../design-lab/plus-recipes";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal-light";
const INPUT =
  "w-full min-h-11 rounded-xl border border-overlay/10 bg-bg-primary/50 px-4 py-3 text-base text-text-primary " +
  "placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-colors";

/** Calm+ preview: a filled inset field, no border; the ring only on focus. */
const PLUS_INPUT =
  "w-full min-h-11 rounded-xl bg-(--c-inset) px-4 py-3 text-base text-(--c-text) " +
  "placeholder:text-(--c-tert) focus:ring-2 focus:ring-(--c-accent) outline-none transition-shadow";

/** Calm+ glyphs (heroicons outline paths), drawn duotone by `.plus-duo`. */
function Glyph({ d, className = "h-6 w-6" }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}
const SHIELD_CHECK =
  "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z";
const CHECK_CIRCLE = "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
const CLOCK = "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
const WARNING =
  "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z";

/** A field's label, the hint under it, then the control. */
function PlusField({ id, label, hint, children }: { id: string; label: string; hint: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[15px] font-bold text-(--c-text)">
        {label}
      </label>
      <p id={`${id}-hint`} className={`mt-0.5 mb-2 ${PLUS_META}`}>
        {hint}
      </p>
      {children}
    </div>
  );
}

/**
 * A support-contact removal request. It posts to the gated removal route and
 * never calls account deletion.
 */
export function ContactRemovalPanel({ plus = false }: { plus?: boolean }) {
  const t = useTranslations("support");
  const [accountId, setAccountId] = useState("");
  const [method, setMethod] = useState<"email" | "telegram">("email");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "recorded" | "unavailable" | "error">("idle");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/support/contact-removal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: accountId.trim(),
          contact_method: method,
          contact_value: value.trim(),
        }),
      });
      if (res.status === 404) {
        setStatus("unavailable");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("recorded");
    } catch {
      setStatus("error");
    }
  };

  if (plus) {
    const p = (key: string) => t(`removalPlus.${key}`);
    const result =
      status === "recorded"
        ? { tone: "teal", glyph: CHECK_CIRCLE, title: p("recordedTitle"), body: p("recorded"), role: "status" }
        : status === "unavailable"
          ? { tone: "neutral", glyph: CLOCK, title: p("unavailableTitle"), body: p("unavailable"), role: "status" }
          : status === "error"
            ? { tone: "danger", glyph: WARNING, title: p("errorTitle"), body: p("error"), role: "alert" }
            : null;
    return (
      <section
        id="contact-removal"
        tabIndex={-1}
        aria-labelledby="contact-removal-title"
        className="@container scroll-mt-28 mt-10 rounded-[22px] bg-(--c-card) p-5 outline-none sm:p-7"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          {/* What it is: title, intro, and the one thing it does not do. */}
          <div>
            <h2 id="contact-removal-title" className={PLUS_TITLE}>
              {p("title")}
            </h2>
            <p className={`mt-2 ${PLUS_BODY}`}>{p("intro")}</p>
            <div className="mt-5 flex gap-3 rounded-2xl bg-(--c-accent-tint) p-4">
              <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal} mt-0.5`}>
                <Glyph d={SHIELD_CHECK} />
              </span>
              <div>
                <p className={PLUS_TITLE_SM}>{p("keepsTitle")}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-(--c-muted)">{p("keeps")}</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} noValidate aria-busy={status === "sending"} className="space-y-5">
            <PlusField id="removal-account" label={p("accountLabel")} hint={p("accountHint")}>
              <input
                id="removal-account"
                dir="ltr"
                value={accountId}
                autoComplete="off"
                placeholder="VPN-XXXX-XXXX-XXXX"
                aria-describedby="removal-account-hint"
                onChange={(event) => setAccountId(event.target.value.toUpperCase())}
                className={PLUS_INPUT}
                style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
              />
            </PlusField>
            <fieldset aria-describedby="removal-method-hint">
              <legend className="block text-[15px] font-bold text-(--c-text)">{p("methodLabel")}</legend>
              <p id="removal-method-hint" className={`mt-0.5 mb-2 ${PLUS_META}`}>
                {p("methodHint")}
              </p>
              <div className="inline-grid grid-cols-2 gap-1 rounded-full bg-(--c-inset) p-1">
                {(["email", "telegram"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={method === key}
                    onClick={() => setMethod(key)}
                    className={`min-h-10 rounded-full px-5 text-sm font-bold transition-colors ${FOCUS} ${
                      method === key ? "bg-(--c-card) text-(--c-text) shadow-sm" : "text-(--c-muted) hover:text-(--c-text)"
                    }`}
                  >
                    {key === "email" ? p("methodEmail") : t("removal.methodTelegram")}
                  </button>
                ))}
              </div>
            </fieldset>
            <PlusField id="removal-value" label={p("valueLabel")} hint={p("valueHint")}>
              <input
                id="removal-value"
                dir="ltr"
                value={value}
                type={method === "email" ? "email" : "text"}
                autoComplete={method === "email" ? "email" : "username"}
                placeholder={method === "email" ? "name@example.com" : "@username"}
                aria-describedby="removal-value-hint"
                onChange={(event) => setValue(event.target.value)}
                className={PLUS_INPUT}
              />
            </PlusField>
            {result && (
              <div
                role={result.role}
                className={`flex gap-3 rounded-2xl p-4 ${
                  result.tone === "danger" ? "bg-(--c-danger-tint)" : result.tone === "teal" ? "bg-(--c-accent-tint)" : "bg-(--c-inset)"
                }`}
              >
                <span className={`${PLUS_ICON} ${PLUS_ICON_TONE[result.tone as "teal" | "neutral" | "danger"]} mt-0.5`}>
                  <Glyph d={result.glyph} />
                </span>
                <div>
                  <p className={PLUS_TITLE_SM}>{result.title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-(--c-muted)">{result.body}</p>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={status === "sending" || !accountId.trim() || !value.trim()}
              className={`${PLUS_BTN} w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto`}
            >
              {status === "sending" ? p("submitting") : p("submit")}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contact-removal"
      tabIndex={-1}
      aria-labelledby="contact-removal-title"
      className="@container scroll-mt-28 mt-10 rounded-2xl border border-overlay/10 bg-bg-secondary p-4 outline-none sm:p-6"
    >
      <h2 id="contact-removal-title" className="font-display text-xl font-semibold text-text-primary">
        {t("removal.title")}
      </h2>
      <p className="mt-2 text-sm text-text-muted">{t("removal.intro")}</p>
      <p className="mt-2 text-sm text-text-muted">{t("removal.notDeletion")}</p>
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        <div>
          <label htmlFor="removal-account" className="mb-1.5 block text-xs font-medium text-text-muted">
            {t("removal.accountLabel")}
          </label>
          <input
            id="removal-account"
            dir="ltr"
            value={accountId}
            autoComplete="off"
            placeholder="VPN-XXXX-XXXX-XXXX"
            onChange={(event) => setAccountId(event.target.value.toUpperCase())}
            className={INPUT}
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
          />
        </div>
        <fieldset>
          <legend className="mb-1.5 text-xs font-medium text-text-muted">{t("removal.methodLabel")}</legend>
          <div className="grid grid-cols-1 gap-2 @min-[22rem]:grid-cols-2 sm:grid-cols-2">
            {(["email", "telegram"] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={method === key}
                onClick={() => setMethod(key)}
                className={`min-h-11 rounded-xl border px-3 text-sm font-medium ${FOCUS} ${
                  method === key
                    ? "border-accent-teal/50 bg-accent-teal/10 text-text-primary"
                    : "border-overlay/10 text-text-muted"
                }`}
              >
                {key === "email" ? t("removal.methodEmail") : t("removal.methodTelegram")}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="removal-value" className="mb-1.5 block text-xs font-medium text-text-muted">
            {t("removal.valueLabel")}
          </label>
          <input
            id="removal-value"
            dir="ltr"
            value={value}
            autoComplete={method === "email" ? "email" : "username"}
            placeholder={t("removal.valuePlaceholder")}
            onChange={(event) => setValue(event.target.value)}
            className={INPUT}
          />
        </div>
        {status === "unavailable" && (
          <p role="status" className="text-sm text-text-muted">
            {t("removal.unavailable")}
          </p>
        )}
        {status === "recorded" && (
          <p role="status" className="text-sm text-text-primary">
            {t("removal.recorded")}
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="text-sm text-danger">
            {t("removal.error")}
          </p>
        )}
        <button
          type="submit"
          disabled={status === "sending" || !accountId.trim() || !value.trim()}
          className={`cta-key min-h-11 rounded-xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`}
        >
          {status === "sending" ? t("removal.submitting") : t("removal.submit")}
        </button>
      </form>
    </section>
  );
}
