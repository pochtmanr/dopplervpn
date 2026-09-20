import {
  AppleIcon,
  BoltIcon,
  DevicesIcon,
  LockIcon,
  MonitorIcon,
  NoSymbolIcon,
  ShieldIcon,
  StorefrontIcon,
} from "@/components/icons/platform";
import type { PlatformLandingConfig } from "@/components/landing/platform-landing-config";

export const macosPlatform: PlatformLandingConfig = {
  slug: "vpn-for-macos",
  namespace: "vpnForMacos",
  operatingSystem: "macOS",
  trackPlatform: "mac",
  downloadUrl: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
  ogImageAlt: "Doppler VPN for Mac",
  ratingChip: { storeKey: "appStore" },
  heroCtaIcon: AppleIcon,
  heroCtaKey: "hero.cta",
  heroGapClass: "gap-12 lg:gap-20",
  // No Mac screenshot yet — the brand panel stands in.
  heroVisual: { kind: "brandPanel", icon: AppleIcon },
  features: [
    { key: "nativeMac", featured: true, icon: MonitorIcon },
    { key: "macAppStore", icon: StorefrontIcon },
    { key: "oneClickConnect", icon: BoltIcon },
    { key: "vlessEncryption", featured: true, icon: LockIcon },
    { key: "noRegistration", icon: NoSymbolIcon },
    { key: "noLogs", icon: ShieldIcon },
    { key: "bypassCensorship", featured: true, icon: ShieldIcon },
    { key: "crossDevice", featured: true, icon: DevicesIcon },
  ],
  stepKeys: ["step1", "step2", "step3", "step4"],
  faqKeys: ["q1", "q2", "q3", "q4", "q5", "q6"],
  related: [
    { href: "/no-registration-vpn", title: "noRegistration", desc: "noRegistrationDesc" },
    { href: "/vless-vpn", title: "vless", desc: "vlessDesc" },
    { href: "/vpn-for-windows", title: "windows", desc: "windowsDesc" },
    { href: "/vpn-for-ios", title: "ios", desc: "iosDesc" },
    { href: "/vpn-for-android", title: "android", desc: "androidDesc" },
  ],
  ctaDownloadKey: "cta.downloadMac",
};
