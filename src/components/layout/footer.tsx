import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DopplerLogo } from "./doppler-logo";

export async function Footer() {
  const t = await getTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary/50 border-t border-overlay/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4" dir="ltr">
              <DopplerLogo className="w-8 h-8" />
              <span className="font-display text-xl font-semibold text-text-primary">
                Doppler VPN
              </span>
            </Link>
            <p className="text-text-muted text-sm max-w-sm mb-6">
              {t("description")}
            </p>
            {/* App Store Badges */}
            <div className="flex flex-wrap gap-3">
              <a
                href="https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-overlay/5 rounded-lg hover:bg-overlay/10 transition-colors"
                dir="ltr"
              >
                <svg
                  className="w-5 h-5 text-text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="text-sm text-text-primary">App Store</span>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=org.dopplervpn.android"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-overlay/5 rounded-lg hover:bg-overlay/10 transition-colors"
                dir="ltr"
              >
                <svg
                  className="w-5 h-5 text-text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <span className="text-sm text-text-primary">Google Play</span>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">
              {t("product")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#pricing"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("pricing")}
                </Link>
              </li>
              <li>
                <Link
                  href="/downloads"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("download")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/bypass-censorship"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("bypassCensorship")}
                </Link>
              </li>
              <li>
                <Link
                  href="/vless-vpn"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("vlessVpn")}
                </Link>
              </li>
              <li>
                <Link
                  href="/no-registration-vpn"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("noRegistration")}
                </Link>
              </li>
              <li>
                <Link
                  href="/vpn-for-ios"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("vpnForIos")}
                </Link>
              </li>
              <li>
                <Link
                  href="/vpn-for-android"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("vpnForAndroid")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">
              {t("supportTitle")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/support"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                >
                  {t("about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-text-primary mb-4">
              {t("connect")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://t.me/dopplercreatebot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm inline-flex items-center gap-1.5"
                  dir="ltr"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  {t("telegram")}
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@simnetiq.store"
                  className="text-text-muted hover:text-text-primary transition-colors text-sm"
                  dir="ltr"
                >
                  {t("email")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-overlay/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-text-muted text-sm">
              &copy; {currentYear} {t("copyright")}
            </p>

            <div className="flex items-center gap-4">
              {/* LinkedIn Links */}
              <a
                href="https://www.linkedin.com/company/109536645/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Doppler VPN on LinkedIn"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/95724818/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Simnetiq on LinkedIn"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                </svg>
              </a>
            </div>

            <p className="text-text-muted text-sm" dir="ltr">
              Made by{" "}
              <a
                href="https://simnetiq.store"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-teal hover:text-accent-gold transition-colors"
              >
                simnetiq.store
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
