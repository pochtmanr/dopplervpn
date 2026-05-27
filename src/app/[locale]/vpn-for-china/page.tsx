import { SeoLandingPage } from "@/components/landing/seo-landing-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SLUG = "vpn-for-china";
const NAMESPACE = "vpnForChina";

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
      datePublished="2026-05-26"
      related={[
        { href: "/vpn-for-travelers-china", titleKey: "travelersTitle", descKey: "travelersDesc" },
        { href: "/vless-vpn", titleKey: "vlessTitle", descKey: "vlessDesc" },
        { href: "/bypass-censorship", titleKey: "censorshipTitle", descKey: "censorshipDesc" },
      ]}
    />
  );
}
