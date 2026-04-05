"use client";

import { Analytics } from "@vercel/analytics/react";
import { useCookieConsent } from "@/components/cookie-consent";

export function AnalyticsConsent() {
  const consent = useCookieConsent();

  if (!consent?.analytics) return null;

  return <Analytics />;
}
