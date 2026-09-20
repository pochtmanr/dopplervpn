"use client";

import { useEffect } from "react";
// Plain next/link, not the next-intl one: the locale context is exactly what
// may be broken here. "/" is re-localized by middleware.
import Link from "next/link";

/**
 * Route-level error boundary for every localized page.
 *
 * Before this existed a single render throw anywhere under `[locale]` fell
 * through to Next's default error screen — unstyled, untranslated and with no
 * way back into the site. Deliberately not translated itself: the most likely
 * cause of a throw here is next-intl failing to load messages, and calling
 * `useTranslations` in that state would throw again inside the boundary.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[locale-error]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg text-center">
        <p className="font-mono text-sm text-accent-teal mb-4">Doppler VPN</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4">
          Something went wrong
        </h1>
        <p className="text-text-muted leading-relaxed mb-10">
          This page failed to load. Your VPN connection and subscription are unaffected.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="cta-key inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border border-overlay/15 text-text-primary hover:border-accent-teal/30 transition-colors"
          >
            Go home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-10 text-xs text-text-muted">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </main>
  );
}
