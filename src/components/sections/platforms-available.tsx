import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/reveal";

const platforms = [
  { key: "ios", href: "/vpn-for-ios", store: "appStore", icon: "apple" },
  { key: "android", href: "/vpn-for-android", store: "googlePlay", icon: "android" },
  { key: "mac", href: "/vpn-for-macos", store: "macAppStore", icon: "apple" },
  { key: "windows", href: "/vpn-for-windows", store: "directDownload", icon: "windows" },
] as const;

const icons: Record<string, React.ReactNode> = {
  apple: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  ),
  android: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.61 15.15c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m-9.22 0c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m9.5-5.09l1.67-2.88a.35.35 0 00-.12-.47.35.35 0 00-.48.12l-1.69 2.93A10.1 10.1 0 0012 8.57c-1.53 0-2.98.34-4.27.95L6.04 6.59a.35.35 0 00-.48-.12.35.35 0 00-.12.47l1.67 2.88C4.44 11.36 2.62 14.09 2.3 17.3h19.4c-.32-3.21-2.14-5.94-4.81-7.24z" />
    </svg>
  ),
  windows: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .08V5.67L20 3zM3 13l6 .09v6.81l-6-1.15V13zm7 .18l10 .08V21l-10-1.76V13.18z" />
    </svg>
  ),
};

export function PlatformsAvailable() {
  const t = useTranslations("platformsAvailable");
  const tApps = useTranslations("apps");

  return (
    <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-bg-secondary/30 border-y border-overlay/5">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-wider text-text-tertiary mb-1">
              {t("eyebrow")}
            </p>
            <h3 className="text-lg md:text-xl text-text-primary font-medium">
              {t("title")}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {platforms.map(({ key, href, store, icon }) => (
              <Link
                key={key}
                href={href}
                className="group flex flex-col items-center text-center gap-2 rounded-xl border border-overlay/10 bg-bg-secondary/40 hover:bg-bg-secondary/70 hover:border-accent-teal/30 px-4 py-5 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal group-hover:bg-accent-teal/15 transition-colors">
                  {icons[icon]}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {tApps(`${key}.title`)}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {t(`stores.${store}`)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
