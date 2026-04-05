"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DeleteAccountForm() {
  const t = useTranslations("deleteAccount");
  const [accountId, setAccountId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedAccountId = accountId.toUpperCase().trim();
  const isValidAccountId = ACCOUNT_ID_REGEX.test(normalizedAccountId);
  const isValidEmail = EMAIL_REGEX.test(email.trim());
  const canSubmit = isValidAccountId && isValidEmail && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/account/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: normalizedAccountId,
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("genericError"));
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">{t("successTitle")}</h1>
          <p className="text-text-muted">{t("successMessage")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="font-display text-3xl font-semibold text-text-primary mb-2">
          {t("title")}
        </h1>
        <p className="text-text-muted mb-8">{t("description")}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="account-id" className="block text-sm font-medium text-text-primary mb-1.5">
              {t("accountIdLabel")}
            </label>
            <input
              id="account-id"
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value.toUpperCase())}
              placeholder="VPN-XXXX-XXXX-XXXX"
              className="w-full rounded-xl border border-overlay/10 bg-bg-secondary px-4 py-3 text-text-primary font-mono placeholder:text-text-muted/50 focus:border-accent-teal focus:outline-none transition-colors"
              autoComplete="off"
              spellCheck={false}
            />
            {accountId && !isValidAccountId && (
              <p className="text-red-400 text-xs mt-1">{t("invalidAccountId")}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
              {t("emailLabel")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-overlay/10 bg-bg-secondary px-4 py-3 text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t("submitting") : t("submitButton")}
          </button>
        </form>

        <p className="text-text-muted text-xs mt-4">{t("disclaimer")}</p>
      </div>
    </div>
  );
}
