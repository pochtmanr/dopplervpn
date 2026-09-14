import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LoginClient } from "./login-client";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginClient />;
}
