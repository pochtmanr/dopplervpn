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

/**
 * The day /vpn-for-windows last changed (2026-11-22: screenshots of the redesigned app).
 * One source for the visible line, the WebPage schema and the sitemap entry. Bump it when
 * the page's content changes, not on every deploy.
 */
export const WINDOWS_PAGE_UPDATED = "2026-11-22";

/** A gallery card titled by a label some other page already carries in every locale. */
const MAC_TOUR = "vpnForMacos.apple.tour.items";

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
    // The VPN (home) page, connected, on a Windows 11 desktop.
    src: "/images/windows-home.avif",
    alt: { tKey: "gallery.heroAlt" },
    width: 1200,
    height: 960,
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
  // Captures of the redesigned app on a Windows 11 PC, cropped to the window. Titles reuse
  // labels that exist in all 44 locales; only the alt text is this page's own.
  gallery: [
    {
      key: "servers",
      src: "/images/windows-servers.avif",
      width: 976,
      height: 686,
      titleKey: "applePage.ecosystem.watchShots.servers.label",
      description: false,
    },
    {
      key: "speedTest",
      src: "/images/windows-speed-test.avif",
      width: 976,
      height: 686,
      titleKey: `${MAC_TOUR}.speed.label`,
      description: false,
    },
    {
      // The app in dark theme beside a browser on an IP lookup site: the browser is
      // another app, and it leaves from the same place. Cropped below the address line.
      key: "everyApp",
      src: "/images/windows-every-app.avif",
      width: 1209,
      height: 849,
      titleKey: "vpnForWindows.features.fullDeviceTunnel.title",
      description: false,
    },
  ],
  lastUpdated: WINDOWS_PAGE_UPDATED,
  related: [
    { href: "/no-registration-vpn", title: "noRegistration", desc: "noRegistrationDesc" },
    { href: "/vless-vpn", title: "vless", desc: "vlessDesc" },
    { href: "/vpn-for-macos", title: "macos", desc: "macosDesc" },
    { href: "/vpn-for-ios", title: "ios", desc: "iosDesc" },
    { href: "/vpn-for-android", title: "android", desc: "androidDesc" },
  ],
  ctaDownloadKey: "cta.downloadX64",
};
