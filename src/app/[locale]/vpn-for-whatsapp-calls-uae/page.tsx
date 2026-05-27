import { SeoLandingPage } from "@/components/landing/seo-landing-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SLUG = "vpn-for-whatsapp-calls-uae";
const NAMESPACE = "vpnForWhatsappCallsUae";

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
        { href: "/vpn-for-uae", titleKey: "uaeHubTitle", descKey: "uaeHubDesc" },
        { href: "/vpn-for-telegram-calls-uae", titleKey: "telegramCallsTitle", descKey: "telegramCallsDesc" },
        { href: "/bypass-censorship", titleKey: "censorshipTitle", descKey: "censorshipDesc" },
      ]}
    />
  );
}
