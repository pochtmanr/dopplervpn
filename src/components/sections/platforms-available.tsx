import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/reveal";
import { PlatformGlyphBand } from "@/components/glyph/platform-glyph-band";
import { PlatformLogo } from "@/components/glyph/platform-icons";

const platforms = [
  { key: "ios", href: "/vpn-for-ios", store: "appStore", icon: "apple" },
  { key: "android", href: "/vpn-for-android", store: "googlePlay", icon: "android" },
  { key: "mac", href: "/vpn-for-macos", store: "macAppStore", icon: "apple" },
  { key: "windows", href: "/vpn-for-windows", store: "directDownload", icon: "windows" },
] as const;


export function PlatformsAvailable() {
  const t = useTranslations("platformsAvailable");
  const tApps = useTranslations("apps");

  return (
    <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-bg-secondary/30 border-y border-overlay/5">
      <div className="mx-auto max-w-site">
        <Reveal>
          <div className="text-center mb-6 md:mb-8">
            <p className="text-xs md:text-sm uppercase tracking-wider text-text-tertiary mb-1">
              {t("eyebrow")}
            </p>
            <h3 className="font-display text-xl md:text-2xl text-text-primary font-semibold">
              {t("title")}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {platforms.map(({ key, href, store, icon }, i) => (
              <Link
                key={key}
                href={href}
                className="group relative flex h-[104px] md:h-[112px] flex-row overflow-hidden rounded-xl border border-overlay/10 bg-bg-secondary/40 hover:bg-bg-secondary/70 hover:border-accent-teal/30 transition-colors"
              >
                {/* Glyph strip — the leading third. It bleeds to the card's top,
                    bottom and outer edge on purpose: the padding belongs to the
                    text zone alone, so the field reads as artwork rather than as
                    something pasted into a frame of plain fill. `border-e` is
                    logical, so the strip sits on the correct side under RTL. */}
                <div className="relative w-[38%] md:w-1/3 shrink-0 overflow-hidden border-e border-overlay/5">
                  <PlatformGlyphBand index={i} />
                  {/* The scene leaves its middle empty, so the logo sits on
                      quiet ground inside the bracket frame. */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-bg-secondary/80 backdrop-blur-sm border border-accent-teal/20 flex items-center justify-center text-accent-teal group-hover:bg-accent-teal/15 group-hover:border-accent-teal/40 transition-colors">
                      <PlatformLogo icon={icon} />
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-0.5 px-3 md:px-5 py-3 text-start">
                  <p className="font-display text-base md:text-xl font-semibold leading-tight text-text-primary">
                    {tApps(`${key}.title`)}
                  </p>
                  <p className="text-xs md:text-sm leading-tight text-text-muted">
                    {t(`stores.${store}`)}
                  </p>
                </div>

                {/* The row's "go" mark, where a store listing puts its button.
                    Dropped in the two-up grid, which has no width to spare. */}
                <svg
                  className="hidden md:block me-4 w-4 h-4 shrink-0 self-center text-text-tertiary transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
