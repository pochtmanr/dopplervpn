"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: catches throws in the root layout itself, which the
 * per-route `error.tsx` cannot. It replaces the whole document, so it has to
 * render its own <html> and <body> and cannot rely on the app's fonts, theme
 * provider or Tailwind layer being available — hence the inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141414",
          color: "#F5F5F5",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p style={{ color: "#00ABAB", fontSize: "14px", margin: "0 0 16px" }}>Doppler VPN</p>
          <h1 style={{ fontSize: "28px", fontWeight: 600, margin: "0 0 16px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#8A8A8A", lineHeight: 1.6, margin: "0 0 32px" }}>
            The site failed to load. Your VPN connection and subscription are unaffected.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#008C8C",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "14px 28px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ marginTop: "32px", fontSize: "12px", color: "#8A8A8A" }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
