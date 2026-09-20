import {
  ArrowPathIcon,
  ComputerIcon,
  DownloadIcon,
  LockIcon,
  NoSymbolIcon,
  ServerIcon,
  ShieldIcon,
} from "@/components/icons/platform";
import type { PlatformLandingConfig } from "@/components/landing/platform-landing-config";

export const windowsPlatform: PlatformLandingConfig = {
  slug: "vpn-for-windows",
  namespace: "vpnForWindows",
  operatingSystem: "Windows",
  trackPlatform: "windows",
  // We serve the installer ourselves, so this is a same-origin `download` link
  // rather than an outbound store URL.
  downloadUrl: "/api/windows/download/latest-x64",
  downloadVariant: "windows-x64",
  directDownload: true,
  ogImageAlt: "Doppler VPN for Windows",
  // No store rating chip: the installer ships outside the Microsoft Store.
  heroCtaIcon: DownloadIcon,
  heroCtaKey: "hero.ctaX64",
  heroGapClass: "gap-12 lg:gap-16",
  heroVisual: {
    kind: "image",
    src: "/images/windows-hero.avif",
    alt: { tKey: "gallery.heroAlt" },
    width: 986,
    height: 693,
    roundedClass: "rounded-2xl",
  },
  smartScreenNotice: true,
  features: [
    { key: "nativeWindows", featured: true, icon: ComputerIcon },
    { key: "fullDeviceTunnel", icon: ShieldIcon },
    { key: "autoUpdates", icon: ArrowPathIcon },
    { key: "vlessEncryption", featured: true, icon: LockIcon },
    { key: "noRegistration", icon: NoSymbolIcon },
    { key: "noLogs", icon: ShieldIcon },
    { key: "bypassCensorship", featured: true, icon: ShieldIcon },
    { key: "globalServers", featured: true, icon: ServerIcon },
  ],
  stepKeys: ["step1", "step2", "step3", "step4"],
  faqKeys: ["q1", "q2", "q3", "q4", "q5", "q6"],
  gallery: [
    { key: "accountId", src: "/images/windows-account-id.avif" },
    { key: "settings", src: "/images/windows-settings.avif" },
    { key: "devices", src: "/images/windows-devices.avif" },
  ],
  related: [
    { href: "/no-registration-vpn", title: "noRegistration", desc: "noRegistrationDesc" },
    { href: "/vless-vpn", title: "vless", desc: "vlessDesc" },
    { href: "/vpn-for-macos", title: "macos", desc: "macosDesc" },
    { href: "/vpn-for-ios", title: "ios", desc: "iosDesc" },
    { href: "/vpn-for-android", title: "android", desc: "androidDesc" },
  ],
  ctaDownloadKey: "cta.downloadX64",
};
