import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReadingArticle, type ReadingSection } from "@/components/help/reading-article";
import { legalMetadata } from "@/lib/support/legal-metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * How to install Doppler where the store does not carry it (Russia, China).
 *
 * The page exists to break a refund loop: people bought on the website, then
 * found no app in their App Store and asked for their money back. So the guide
 * leads with "install first, buy inside the app", and the downloads page, the
 * account checkout notice and the support bot all link here by anchor — keep
 * the section ids stable.
 */
const SECTIONS = [
  { key: "installFirst", id: "install-first" },
  { key: "iphone", id: "iphone" },
  { key: "appleIdRegion", id: "apple-id-region" },
  { key: "mac", id: "mac" },
  { key: "android", id: "android" },
] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "install" });
  return legalMetadata(locale, "/install", t("title"), t("intro"));
}

export default async function InstallGuidePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("install");

  const links: Partial<Record<(typeof SECTIONS)[number]["key"], ReadingSection["links"]>> = {
    iphone: [
      { href: "https://apps.apple.com/app/testflight/id899247664", label: t("links.testflightApp") },
      // Same gates as the downloads page: no link until the build exists.
      ...(process.env.IOS_TESTFLIGHT_URL
        ? [{ href: "/api/ios/testflight", label: t("links.testflightInvite") }]
        : []),
    ],
    appleIdRegion: [{ href: "https://support.apple.com/118283", label: t("links.appleRegionHelp") }],
    mac:
      process.env.MAC_DMG_ENABLED === "1"
        ? [{ href: "/api/mac/download/latest", label: t("links.macDmg") }]
        : undefined,
    android: [{ href: "/api/android/download/latest", label: t("links.androidApk") }],
  };

  return (
    <ReadingArticle
      articleId="install"
      title={t("title")}
      updated={t("lastUpdated")}
      intro={t("intro")}
      sections={SECTIONS.map(({ key, id }) => ({
        id,
        title: t(`sections.${key}.title`),
        content: t(`sections.${key}.content`),
        links: links[key],
      }))}
    />
  );
}
