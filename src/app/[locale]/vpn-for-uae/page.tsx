import { SeoLandingPage } from "@/components/landing/seo-landing-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SLUG = "vpn-for-uae";
const NAMESPACE = "vpnForUae";

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
      dateModified="2026-06-09"
      related={[
        { href: "/vpn-for-telegram-calls-uae", titleKey: "telegramCallsTitle", descKey: "telegramCallsDesc" },
        { href: "/vpn-for-whatsapp-calls-uae", titleKey: "whatsappCallsTitle", descKey: "whatsappCallsDesc" },
        { href: "/bypass-censorship", titleKey: "censorshipTitle", descKey: "censorshipDesc" },
      ]}
    />
  );
}
