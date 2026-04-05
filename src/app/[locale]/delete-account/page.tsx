import { setRequestLocale } from "next-intl/server";
import { DeleteAccountForm } from "./delete-account-form";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DeleteAccountPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DeleteAccountForm />;
}
