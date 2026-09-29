import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReadingArticle } from "@/components/help/reading-article";
import { legalMetadata } from "@/lib/support/legal-metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SECTION_KEYS = ["what", "recovery", "language", "deletion"] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "helpAccountId" });
  return legalMetadata(locale, "/help/account-id", t("title"), t("intro"));
}

export default async function AccountIdHelpPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("helpAccountId");

  return (
    <ReadingArticle
      articleId="account-id"
      title={t("title")}
      updated={t("lastUpdated")}
      intro={t("intro")}
      sections={SECTION_KEYS.map((key) => ({
        id: key,
        title: t(`sections.${key}.title`),
        content: t(`sections.${key}.content`),
      }))}
    />
  );
}
