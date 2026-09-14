import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SignupClient } from "./signup-client";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SignupPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SignupClient />;
}
