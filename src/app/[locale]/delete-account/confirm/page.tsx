import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { DeleteConfirmContent } from "./delete-confirm-content";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DeleteConfirmPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense>
      <DeleteConfirmContent />
    </Suspense>
  );
}
