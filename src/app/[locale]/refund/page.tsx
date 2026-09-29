import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReadingArticle, type ReadingSection } from "@/components/help/reading-article";
import { legalMetadata } from "@/lib/support/legal-metadata";
import { publishedRefundPolicyLabel } from "@/lib/support/published-policy";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SECTIONS: { key: string; id: string }[] = [
  { key: "euRights", id: "eu-rights" },
  { key: "ukRights", id: "uk-rights" },
  { key: "goodwill", id: "goodwill" },
  { key: "revolutCard", id: "revolut-card" },
  { key: "oxapay", id: "oxapay" },
  { key: "appStore", id: "app-store" },
  { key: "googlePlay", id: "google-play" },
  { key: "renewals", id: "renewals" },
  { key: "exclusions", id: "exclusions" },
  { key: "howTo", id: "how-to" },
  { key: "contact", id: "contact" },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "refund" });
  return legalMetadata(locale, "/refund", t("title"), t("intro"));
}

export default async function RefundPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("refund");

  const sections: ReadingSection[] = SECTIONS.map((section) => {
    const links =
      section.key === "appStore"
        ? [
            { href: "https://support.apple.com/en-gb/118223", label: t("appleInstructions") },
            { href: "https://reportaproblem.apple.com", label: t("appleReport") },
          ]
        : section.key === "googlePlay"
          ? [{ href: "https://support.google.com/googleplay/answer/2479637?hl=en", label: t("googleInstructions") }]
          : undefined;
    return {
      id: section.id,
      title: t(`sections.${section.key}.title`),
      content: t(`sections.${section.key}.content`),
      links,
    };
  });

  return (
    <ReadingArticle
      title={t("title")}
      updated={`${t("lastUpdated")} · ${publishedRefundPolicyLabel()}`}
      intro={t("intro")}
      sections={sections}
    />
  );
}
