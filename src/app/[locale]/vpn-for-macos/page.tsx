import type { Metadata } from "next";
import { PlatformAppPage } from "@/components/landing/platform-app-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";
import { macosApple } from "@/config/platforms/apple";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSeoLandingMetadata({
    locale,
    slug: macosApple.slug,
    namespace: macosApple.namespace,
    ogType: "website",
    ogImageAlt: macosApple.ogImageAlt,
  });
}

export default async function VpnForMacosPage({ params }: PageProps) {
  const { locale } = await params;
  return <PlatformAppPage locale={locale} config={macosApple} />;
}
