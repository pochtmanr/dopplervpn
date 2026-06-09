"use client";

import { SpeedInsights } from "@vercel/speed-insights/react";
import { useCookieConsent } from "@/components/cookie-consent";

export function SpeedInsightsConsent() {
  const consent = useCookieConsent();

  if (!consent?.analytics) return null;

  return <SpeedInsights />;
}
