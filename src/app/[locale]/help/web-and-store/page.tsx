import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReadingArticle } from "@/components/help/reading-article";
import { legalMetadata } from "@/lib/support/legal-metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SECTION_KEYS = ["web", "wallets", "stores", "notSold"] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "helpWebAndStore" });
  return legalMetadata(locale, "/help/web-and-store", t("title"), t("intro"));
}

export default async function WebAndStoreHelpPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("helpWebAndStore");

  return (
    <ReadingArticle
      articleId="web-and-store"
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
