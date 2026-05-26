import { SeoLandingPage } from "@/components/landing/seo-landing-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const SLUG = "vpn-for-telegram-calls-uae";
const NAMESPACE = "vpnForTelegramCallsUae";

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
        { href: "/vpn-for-uae", titleKey: "uaeHubTitle", descKey: "uaeHubDesc" },
        { href: "/vpn-for-whatsapp-calls-uae", titleKey: "whatsappCallsTitle", descKey: "whatsappCallsDesc" },
        { href: "/bypass-censorship", titleKey: "censorshipTitle", descKey: "censorshipDesc" },
      ]}
    />
  );
}
