import { getLocale } from "next-intl/server";
import { NotFoundContent } from "@/components/not-found-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function LocaleNotFound() {
  const locale = await getLocale();
  return <NotFoundContent locale={locale} />;
}
