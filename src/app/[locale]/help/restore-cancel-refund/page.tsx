import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReadingArticle } from "@/components/help/reading-article";
import { legalMetadata } from "@/lib/support/legal-metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SECTION_KEYS = ["restore", "cancel", "refund"] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "helpRestoreCancelRefund" });
  return legalMetadata(locale, "/help/restore-cancel-refund", t("title"), t("intro"));
}

export default async function RestoreCancelRefundHelpPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("helpRestoreCancelRefund");

  return (
    <ReadingArticle
      articleId="restore-cancel-refund"
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
