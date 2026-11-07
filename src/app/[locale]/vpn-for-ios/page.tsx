import type { Metadata } from "next";
import { PlatformAppPage } from "@/components/landing/platform-app-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";
import { iosApple } from "@/config/platforms/apple";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSeoLandingMetadata({
    locale,
    slug: iosApple.slug,
    namespace: iosApple.namespace,
    ogType: "website",
    ogImageAlt: iosApple.ogImageAlt,
  });
}

export default async function VpnForIosPage({ params }: PageProps) {
  const { locale } = await params;
  return <PlatformAppPage locale={locale} config={iosApple} />;
}
