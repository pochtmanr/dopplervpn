import { SeoLandingPage } from "@/components/landing/seo-landing-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SLUG = "vless-vpn-android";
const NAMESPACE = "vlessVpnAndroid";

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return buildSeoLandingMetadata({ locale, slug: SLUG, namespace: NAMESPACE });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return (
    <SeoLandingPage
      locale={locale}
      slug={SLUG}
      namespace={NAMESPACE}
      primaryPlatform="android"
      datePublished="2026-05-26"
      dateModified="2026-06-09"
      related={[
        { href: "/vless-vpn", titleKey: "vlessTitle", descKey: "vlessDesc" },
        { href: "/vpn-for-android", titleKey: "androidTitle", descKey: "androidDesc" },
        { href: "/bypass-censorship", titleKey: "censorshipTitle", descKey: "censorshipDesc" },
      ]}
    />
  );
}
