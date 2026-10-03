import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SignupClient } from "./signup-client";
// Calm+ switch (design-lab/home-preview.tsx).
import { calmPlusPreview } from "../../design-lab/home-preview";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SignupPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SignupClient plus={calmPlusPreview} />;
}
