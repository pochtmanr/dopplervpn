import type { Metadata } from "next";
import { PlatformLandingPage } from "@/components/landing/platform-landing-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";
import { iosPlatform } from "@/config/platforms/ios";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSeoLandingMetadata({
    locale,
    slug: iosPlatform.slug,
    namespace: iosPlatform.namespace,
    ogType: "website",
    ogImageAlt: iosPlatform.ogImageAlt,
  });
}

export default async function VpnForIosPage({ params }: PageProps) {
  const { locale } = await params;
  return <PlatformLandingPage locale={locale} config={iosPlatform} />;
}
