import type { Metadata } from "next";
import { PlatformAppPage } from "@/components/landing/platform-app-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";
import { linuxApp } from "@/config/platforms/linux";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSeoLandingMetadata({
    locale,
    slug: linuxApp.slug,
    namespace: linuxApp.namespace,
    ogType: "website",
    ogImageAlt: linuxApp.ogImageAlt,
  });
}

export default async function VpnForLinuxPage({ params }: PageProps) {
  const { locale } = await params;
  return <PlatformAppPage locale={locale} config={linuxApp} />;
}
