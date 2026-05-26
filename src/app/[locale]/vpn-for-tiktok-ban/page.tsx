import { SeoLandingPage } from "@/components/landing/seo-landing-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SLUG = "vpn-for-tiktok-ban";
const NAMESPACE = "vpnForTiktokBan";

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
      related={[
        { href: "/bypass-censorship", titleKey: "censorshipTitle", descKey: "censorshipDesc" },
        { href: "/vpn-for-ios", titleKey: "iosTitle", descKey: "iosDesc" },
        { href: "/vpn-for-android", titleKey: "androidTitle", descKey: "androidDesc" },
      ]}
    />
  );
}
