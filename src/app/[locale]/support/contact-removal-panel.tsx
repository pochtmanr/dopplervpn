"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal-light";
const INPUT =
  "w-full min-h-11 rounded-xl border border-overlay/10 bg-bg-primary/50 px-4 py-3 text-base text-text-primary " +
  "placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-colors";

/**
 * A support-contact removal request. It posts to the gated removal route and
 * never calls account deletion.
 */
export function ContactRemovalPanel() {
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
