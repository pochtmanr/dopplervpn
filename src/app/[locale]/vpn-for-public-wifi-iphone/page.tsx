import { SeoLandingPage } from "@/components/landing/seo-landing-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SLUG = "vpn-for-public-wifi-iphone";
const NAMESPACE = "vpnForPublicWifiIphone";

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
      primaryPlatform="ios"
      datePublished="2026-05-26"
      related={[
        { href: "/vpn-for-ios", titleKey: "iosTitle", descKey: "iosDesc" },
        { href: "/no-registration-vpn", titleKey: "noRegTitle", descKey: "noRegDesc" },
        { href: "/vless-vpn", titleKey: "vlessTitle", descKey: "vlessDesc" },
      ]}
    />
  );
}
