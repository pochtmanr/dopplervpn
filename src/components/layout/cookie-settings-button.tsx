"use client";

import { openCookiePreferences } from "@/components/cookie-consent";

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      onClick={openCookiePreferences}
      className="text-text-muted hover:text-text-primary transition-colors text-sm cursor-pointer"
    >
      {label}
    </button>
  );
}
