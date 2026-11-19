import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
// Calm+ scope and recipes (design-lab/*). This template is Calm+ only: it was written after
// Calm+ went live and has no Glyph Terminal branch, so it always renders inside PlusPageShell.
import { PlusPageShell } from "@/app/[locale]/design-lab/home-preview";
import { PlusFaqAccordion } from "@/app/[locale]/design-lab/plus/faq";
import {
  ArrowGlyph,
  PLUS_BODY,
  PLUS_CARD,
  PLUS_CARD_HOVER,
  PLUS_CHIP,
  PLUS_ICON,
  PLUS_ICON_TONE,
  PLUS_META,
  PLUS_TITLE,
  PLUS_TITLE_SM,
  PlusContainer,
} from "@/app/[locale]/design-lab/plus-recipes";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BreadcrumbSchema, FAQSchema, PlatformAppSchema } from "@/components/seo/json-ld";
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
import { TrackedDownloadLink } from "@/components/downloads/tracked-download-link";
import { WaitlistForm, type WaitlistLabels } from "@/components/downloads/waitlist-form";
import { AppleIcon, Stars } from "@/components/icons/platform";
import { AppGalleryMark, AppStoreMark, HuaweiMark, PlatformLogo } from "@/components/glyph/platform-icons";
import { PlatformGlyphBand } from "@/components/glyph/platform-glyph-band";
import { Link } from "@/i18n/navigation";
import { PLANS, SITE_URL, TERMS } from "@/lib/facts";
import { isHowItWorksLocale } from "@/i18n/how-it-works-locales";
import { isGuidesLocale } from "@/lib/guides";
import { GUIDE_COVERS } from "@/config/platforms/apple";
import type {
  AndroidInstallRow,
  AppButton,
  AppChapter,
  AppGlyph,
  AppImage,
  AppPageConfig,
  StoreMark,
} from "@/config/platforms/app-page";
import { AndroidFrame, AppleTour, MacFrame, PhoneFrame } from "./apple-tour";
import { ANDROID_APK32_BUTTON, ANDROID_APK_BUTTON } from "@/config/platforms/android";
import { PLUS_CTA_LEAD, PLUS_CTA_LINK, PLUS_CTA_TITLE, PlusCtaCard } from "./plus-cta-card";
import { TerminalCard } from "./terminal-card";

const SECTION = "py-12 md:py-20";
const H2 = "font-display text-3xl font-bold leading-tight text-(--c-text) md:text-[40px]";
const LEAD = "mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-(--c-muted)";
const KICKER = "text-[13px] font-bold uppercase tracking-[0.08em] text-(--c-accent)";
/** Chapter headline on compact pages (iOS, iPad): one step under H2. */
const H2_COMPACT = "font-display text-[28px] font-bold leading-tight text-(--c-text) md:text-[34px]";

function Glyph({ d, className = "h-6 w-6" }: { d: string; className?: string }) {
  return (
    <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal}`}>
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    </span>
  );
}

const ICON: Record<AppGlyph | "eyeOff" | "gift" | "lock" | "check", string> = {
  phone: "M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  tablet: "M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-15a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25Z",
  laptop: "M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z",
  watch: "M8.25 6.75h7.5A2.25 2.25 0 0 1 18 9v6a2.25 2.25 0 0 1-2.25 2.25h-7.5A2.25 2.25 0 0 1 6 15V9a2.25 2.25 0 0 1 2.25-2.25ZM9 6.75 9.75 3h4.5L15 6.75M9 17.25 9.75 21h4.5l.75-3.75",
  id: "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z",
  lock: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z",
  eyeOff: "M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88",
  gift: "M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z",
  check: "m4.5 12.75 6 6 9-13.5",
  tv: "M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z",
  shield: "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
  // One road splitting in two, arrowheads up: Smart Route's own symbol in the app.
  route: "M12 21v-8.25m0 0L6.75 7.5M12 12.75l5.25-5.25M6.75 7.5v3.75m0-3.75h3.75m6.75 0v3.75m0-3.75H13.5",
  killSwitch: "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636",
  download: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3",
  card: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z",
};

const PRIVACY_ICON: Record<string, string> = {
  noEmail: ICON.id,
  vless: ICON.lock,
  noLogs: ICON.eyeOff,
  trial: ICON.gift,
  pay: ICON.card,
};

function Mark({ mark, className }: { mark: StoreMark; className: string }) {
  if (mark === "appStore") return <AppStoreMark className={className} />;
  if (mark === "appGallery") return <AppGalleryMark className={className} />;
  if (mark === "googlePlay") return <PlatformLogo icon="googlePlay" className={className} />;
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={ICON.download} />
    </svg>
  );
}

/**
 * A download button. The primary is the page's one teal action, repeated at the end; the
 * secondary (the APK beside Google Play) is a quiet inset pill. A file downloads in place,
 * a store opens in a new tab.
 */
function StoreButton({
  config,
  button,
  label,
  large = false,
  quiet = false,
}: {
  config: AppPageConfig;
  button: AppButton;
  label: string;
  large?: boolean;
  quiet?: boolean;
}) {
  const file = button.mark === "file";
  return (
    <TrackedDownloadLink
      location={config.trackLocation}
      platform={config.trackPlatform}
      {...(button.variant ? { variant: button.variant } : {})}
      href={button.href}
      {...(file ? { download: true } : { target: "_blank", rel: "noopener noreferrer" })}
      className={`plus-btn inline-flex items-center justify-center gap-2.5 rounded-full font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--c-bg) ${
        quiet
          ? "bg-(--c-card) text-(--c-text) hover:bg-(--c-accent-tint) hover:text-(--c-accent)"
          : "bg-(--c-accent-fill) text-white hover:bg-(--c-accent)"
      } ${large ? "h-14 px-8 text-base" : "h-12 px-6 text-[15px]"}`}
    >
      <Mark mark={button.mark} className={large ? "h-5 w-5" : "h-[18px] w-[18px]"} />
      {label}
    </TrackedDownloadLink>
  );
}

/**
 * Where a platform has no caption-free screens yet: an inset tray with one mark, and the
 * downloads cards' glyph rain falling behind it across the whole tray (on a finer grid than
 * the downloads strip, so the digits keep their size). Honest by construction: it never
 * pretends to be a capture.
 */
function GlyphTray({
  index,
  children,
  backdrop,
  className = "aspect-[3/2]",
}: {
  index: number;
  children: ReactNode;
  /** A photo under the rain. It is dark in both themes, so the tray stops following the theme. */
  backdrop?: AppImage;
  className?: string;
}) {
  return (
    <div className={`rounded-[28px] bg-(--c-card) p-3 ${className}`}>
      <div
        className="relative h-full overflow-hidden rounded-[20px] bg-(--c-bg)"
        style={backdrop ? { backgroundColor: backdrop.bg } : undefined}
        aria-hidden="true"
      >
        {backdrop && (
          <Image src={backdrop.src} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        )}
        <span className={`absolute inset-0 block ${backdrop ? "opacity-70 mix-blend-screen" : "opacity-80"}`}>
          <PlatformGlyphBand index={index} fill />
        </span>
        <span className="absolute inset-0 flex items-center justify-center">{children}</span>
      </div>
    </div>
  );
}

function BigGlyph({ d }: { d: string }) {
  return (
    <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal} rounded-[28px] bg-(--c-card) p-6 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.45)]`}>
      <svg className="h-16 w-16 md:h-20 md:w-20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    </span>
  );
}

function SectionHead({ kicker, title, lead }: { kicker?: string; title: string; lead?: string }) {
  return (
    <div className="mb-10 text-center md:mb-14">
      {kicker && <p className={`mb-3 ${KICKER}`}>{kicker}</p>}
      <h2 className={H2}>{title}</h2>
      {lead && <p className={LEAD}>{lead}</p>}
    </div>
  );
}

/** Guide articles ship in GUIDES_LOCALES only; other locales keep linking to /en. */
function guideLocaleFor(locale: string): string {
  return isGuidesLocale(locale) ? locale : "en";
}

/** /how-it-works ships in HOW_IT_WORKS_LOCALES only; other locales link to /en. */
function howItWorksLocaleFor(locale: string): string {
  return isHowItWorksLocale(locale) ? locale : "en";
}

function GuideLink({ href, locale, children }: { href: string; locale: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      locale={guideLocaleFor(locale)}
      className="group mt-6 inline-flex items-center gap-1.5 text-[15px] font-bold text-(--c-accent) hover:underline hover:underline-offset-4"
    >
      {children}
      <ArrowGlyph className="h-4 w-4" />
    </Link>
  );
}

const HUAWEI_PAGE_BTN =
  "plus-btn inline-flex h-12 items-center justify-center rounded-full bg-(--c-inset) px-5 text-[15px] font-bold text-(--c-text) hover:bg-(--c-accent-tint) hover:text-(--c-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--c-bg)";

/** CTA cell for one Android install-matrix row (`#get`). */
function AndroidGetCta({
  row,
  config,
  t,
}: {
  row: AndroidInstallRow;
  config: AppPageConfig;
  t: (key: string) => string;
}) {
  if (row.status === "coming") {
    return <span className={`${PLUS_CHIP} bg-(--c-inset) text-(--c-tert)`}>{t("get.coming")}</span>;
  }

  const label = t(`get.rows.${row.key}.cta`);
  if (row.cta === "primary" && config.primary) {
    return <StoreButton config={config} button={config.primary} label={label} />;
  }
  if (row.cta === "secondary" && config.secondary) {
    return <StoreButton config={config} button={config.secondary} label={label} quiet />;
  }
  if (row.cta === "apk") {
    return (
      <>
        <StoreButton config={config} button={ANDROID_APK_BUTTON} label={label} quiet />
        <StoreButton
          config={config}
          button={ANDROID_APK32_BUTTON}
          label={t(`get.rows.${row.key}.cta32`)}
          quiet
        />
      </>
    );
  }
  if (row.cta === "huawei") {
    return (
      <>
        <Link href="/vpn-for-huawei" className={`${HUAWEI_PAGE_BTN} gap-2`}>
          <HuaweiMark className="h-[18px] w-[18px]" />
          {label}
        </Link>
        <StoreButton
          config={config}
          button={ANDROID_APK_BUTTON}
          label={t(`get.rows.${row.key}.ctaApk`)}
          quiet
        />
      </>
    );
  }
  return null;
}

function ChapterVisual({
  chapter,
  index,
  alt,
  compact,
  terminal,
}: {
  chapter: AppChapter;
  index: number;
  alt: string;
  compact: boolean;
  /** Words around a terminal card; only pages with terminal chapters pass them. */
  terminal?: { label: string; caption: string };
}) {
  if (chapter.frame === "terminal") {
    return <TerminalCard lines={chapter.lines} label={terminal?.label ?? ""} {...(terminal ? { caption: terminal.caption } : {})} />;
  }
  if (chapter.frame === "glyph") {
    return (
      <GlyphTray index={index} {...(chapter.backdrop ? { backdrop: chapter.backdrop } : {})}>
        <BigGlyph d={ICON[chapter.glyph]} />
      </GlyphTray>
    );
  }
  if (chapter.frame === "photo") {
    return (
      <div className="relative aspect-[3/2] overflow-hidden rounded-[28px]" style={{ backgroundColor: chapter.image.bg }}>
        <Image
          src={chapter.image.src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }
  if (chapter.frame === "mac") {
    return (
      <div className="rounded-[28px] bg-(--c-card) px-[9%] pt-[9%] pb-[7%]">
        <MacFrame image={chapter.image} alt={alt} sizes="(min-width: 1024px) 40vw, 85vw" />
      </div>
    );
  }
  // Phone / Android: the screen rises out of a tray and is cut by its bottom edge, so a tall
  // capture never towers over the copy beside it. Android uses a hole-punch bezel for Play captures.
  const Frame = chapter.frame === "android" ? AndroidFrame : PhoneFrame;
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-(--c-card)">
      <div
        className={`flex justify-center px-6 ${
          compact ? "h-[360px] pt-8 sm:h-[420px] sm:pt-10" : "h-[440px] pt-10 sm:h-[520px] sm:pt-14"
        }`}
      >
        <Frame
          image={chapter.image}
          alt={alt}
          sizes={compact ? "(min-width: 640px) 240px, 60vw" : "(min-width: 640px) 300px, 70vw"}
          className={`self-start ${compact ? "w-[60%] max-w-[240px]" : "w-[70%] max-w-[300px]"}`}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-(--c-card) to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * The app pages: iPhone, iPad, Mac, Android, Huawei, and the Linux announcement (a waitlist
 * in place of the download button, terminal cards in place of screens). Section order: hero, app tour (raw
 * screens, no marketing words in the images), four feature chapters, the devices band,
 * privacy facts, guides, setup, FAQ, final CTA, related platforms. A section the config
 * leaves empty (tour, devices band, guides) is skipped.
 */
export async function PlatformAppPage({ locale, config }: { locale: string; config: AppPageConfig }) {
  setRequestLocale(locale);
  const [t, s, mt, tHero] = await Promise.all([
    getTranslations(`${config.namespace}.${config.copyKey}`),
    getTranslations("applePage"),
    getTranslations({ locale, namespace: `${config.namespace}.metadata` }),
    getTranslations({ locale, namespace: "hero" }),
  ]);

  const isMac = config.tourDevice === "mac";
  const isApple = config.family === "apple";
  const primary = config.primary;
  // An announced platform: an email form stands where the download button would be.
  const waitlistLabels: WaitlistLabels | null = config.waitlist
    ? {
        label: t("waitlist.label"),
        placeholder: t("waitlist.placeholder"),
        button: t("waitlist.button"),
        success: t("waitlist.success"),
        error: t("waitlist.error"),
        privacy: t("waitlist.privacy"),
      }
    : null;
  const terminal = config.family === "linux" ? { label: t("terminal.label"), caption: t("terminal.caption") } : undefined;
  // The devices band: Apple's lives in the shared namespace (three pages show it), the
  // Android family's in each page's own copy.
  const eco = (key: string) => (isApple ? s(`ecosystem.${key}`) : t(`ecosystem.${key}`));
  const compact = !!config.compact;
  const priceFrom = `$${PLANS.annual.monthly.toFixed(2)}`;
  const faqItems = config.faqKeys.map((k) => ({
    question: t(`faq.${k}.question`),
    answer: t(`faq.${k}.answer`, { days: TERMS.freeTrialDays, price: priceFrom }),
  }));
  const tourShots = config.tour.map(({ key, image }) => ({
    key,
    ...image,
    label: t(`tour.items.${key}.label`),
    alt: t(`tour.items.${key}.alt`),
  }));

  const rating = config.rating && (
    <span className="flex items-center gap-1.5">
      <Stars />
      <span className="text-sm font-bold text-(--c-text)">
        {tHero(config.rating === "appStore" ? "socialProof.rating" : "socialProof.ratingGooglePlay")}
      </span>
      <span className={PLUS_META}>{tHero(`socialProof.${config.rating}`)}</span>
    </span>
  );

  const hero = (
    <>
      <span className={`${PLUS_CHIP} bg-(--c-accent-tint) text-(--c-accent)`}>
        {isApple ? (
          <AppleIcon className="h-3.5 w-3.5" />
        ) : config.family === "linux" ? (
          <PlatformLogo icon="linux" className="h-3.5 w-3.5" />
        ) : config.slug === "vpn-for-huawei" ? (
          <HuaweiMark className="h-3.5 w-3.5" />
        ) : (
          <PlatformLogo icon="android" className="h-3.5 w-3.5" />
        )}
        {t("hero.eyebrow")}
      </span>
      <h1 className="mt-5 font-display text-[40px] font-bold leading-[1.06] tracking-tight text-(--c-text) sm:text-5xl xl:text-6xl">
        {t("hero.title")}
      </h1>
      <p className={`mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted) md:text-xl ${isMac ? "mx-auto" : "mx-auto lg:mx-0"}`}>
        {t("hero.subtitle")}
      </p>
      {config.waitlist && waitlistLabels && (
        <div className="mt-8">
          <WaitlistForm
            platform={config.waitlist.platform}
            locale={locale}
            labels={waitlistLabels}
            align={isMac ? "center" : "start"}
          />
        </div>
      )}
      {primary && (
        <div className={`mt-8 flex flex-col items-center gap-4 sm:flex-row ${isMac ? "justify-center" : "justify-center lg:justify-start"}`}>
          <StoreButton config={config} button={primary} label={t(`hero.${primary.labelKey}`)} large />
          {config.secondary ? (
            <StoreButton config={config} button={config.secondary} label={t(`hero.${config.secondary.labelKey}`)} large quiet />
          ) : (
            rating
          )}
        </div>
      )}
      {/* Two buttons fill the row, so the rating drops to its own line. */}
      {config.secondary && rating && (
        <div className={`mt-5 flex ${isMac ? "justify-center" : "justify-center lg:justify-start"}`}>{rating}</div>
      )}
      <p className={`mt-5 ${PLUS_META}`}>{t("hero.note", { days: TERMS.freeTrialDays })}</p>
      {config.heroNote2 && <p className={`mt-1.5 ${PLUS_META}`}>{t(config.heroNote2)}</p>}
    </>
  );

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_URL}/${locale}` },
          ...(config.parent
            ? [{ name: s(`related.${config.parent.key}.title`), url: `${SITE_URL}/${locale}${config.parent.href}` }]
            : []),
          { name: t("hero.title"), url: `${SITE_URL}/${locale}/${config.slug}` },
        ]}
      />
      {/* No build, no SoftwareApplication node: it would state the app is in stock. */}
      {primary && (
        <PlatformAppSchema
          name="Doppler VPN"
          description={mt("description")}
          operatingSystem={config.operatingSystem}
          applicationCategory="UtilitiesApplication"
          downloadUrl={primary.href.startsWith("/") ? `${SITE_URL}${primary.href}` : primary.href}
        />
      )}
      <FAQSchema items={faqItems} />
      <Navbar />
      <PlusPageShell>
        <main className="overflow-x-clip">
          {/* ── Hero ─────────────────────────────────────────────── */}
          <section className="px-4 pt-28 pb-8 sm:px-6 sm:pt-32 md:pb-12 lg:px-8">
            <div className="mx-auto max-w-site">
              {isMac ? (
                <>
                  <div className="mx-auto max-w-3xl text-center">{hero}</div>
                  {config.hero && (
                    <div
                      className="relative mt-12 aspect-[3/2] w-full overflow-hidden rounded-[32px] md:mt-16 md:aspect-[16/9]"
                      style={{ backgroundColor: config.hero.bg }}
                    >
                      <Image
                        src={config.hero.src}
                        alt={config.hero.alt}
                        fill
                        sizes="(min-width: 1400px) 1340px, 100vw"
                        priority
                        className="object-cover"
                      />
                    </div>
                  )}
                  {config.heroTerminal && terminal && (
                    <TerminalCard
                      lines={config.heroTerminal}
                      label={terminal.label}
                      caption={terminal.caption}
                      className="mx-auto mt-12 max-w-3xl md:mt-16"
                    />
                  )}
                </>
              ) : (
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
                  <div className="text-center lg:text-start">{hero}</div>
                  {config.hero && (
                    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[32px]" style={{ backgroundColor: config.hero.bg }}>
                      <Image
                        src={config.hero.src}
                        alt={config.hero.alt}
                        fill
                        sizes="(min-width: 1024px) 46vw, 100vw"
                        priority
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ── App tour (skipped when the config has no screens) ── */}
          {tourShots.length > 0 && (
            <PlusContainer className={SECTION}>
              <SectionHead kicker={t("tour.kicker")} title={t("tour.title")} lead={t("tour.subtitle")} />
              <AppleTour device={config.tourDevice} shots={tourShots} prevLabel={s("prev")} nextLabel={s("next")} />
            </PlusContainer>
          )}

          {/* ── Feature chapters ─────────────────────────────────── */}
          <PlusContainer className={SECTION}>
            <div className={compact ? "space-y-12 md:space-y-20" : "space-y-16 md:space-y-28"}>
              {config.chapters.map((chapter, i) => {
                const k = `chapters.${chapter.key}`;
                return (
                  <article
                    key={chapter.key}
                    className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 ${compact ? "lg:gap-12" : "lg:gap-16"}`}
                  >
                    {/* Compact pages cap the visual so the cards read smaller than the Mac page's. */}
                    <div
                      className={`w-full ${compact ? "mx-auto max-w-[540px]" : ""} ${
                        i % 2 === 1 ? `lg:order-2 ${compact ? "lg:me-0" : ""}` : compact ? "lg:ms-0" : ""
                      }`}
                    >
                      <ChapterVisual
                        chapter={chapter}
                        index={i}
                        alt={chapter.frame === "glyph" || chapter.frame === "terminal" ? "" : t(`${k}.alt`)}
                        compact={compact}
                        {...(terminal ? { terminal } : {})}
                      />
                    </div>
                    <div className="max-w-xl">
                      <p className={KICKER}>{t(`${k}.kicker`)}</p>
                      <h2 className={`mt-3 ${compact ? H2_COMPACT : H2}`}>{t(`${k}.title`)}</h2>
                      <p className={`mt-4 leading-relaxed text-(--c-muted) ${compact ? "text-base md:text-[17px]" : "text-lg"}`}>
                        {t(`${k}.body`)}
                      </p>
                      <ul className="mt-6 space-y-3">
                        {(["p1", "p2", "p3"] as const).map((p) => (
                          <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-(--c-text)">
                            <Glyph d={ICON.check} className="mt-0.5 h-5 w-5" />
                            <span>{t(`${k}.points.${p}`)}</span>
                          </li>
                        ))}
                      </ul>
                      {chapter.guide && (
                        <GuideLink href={`/guides/${chapter.guide}`} locale={locale}>
                          {s(`guides.items.${chapter.guide}.cta`)}
                        </GuideLink>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </PlusContainer>

          {/* ── Devices band (every Apple device / Android everywhere) ── */}
          {config.ecosystem && (
            <PlusContainer className={SECTION}>
              <div className="overflow-hidden rounded-[32px] bg-(--c-card)">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {config.ecosystem.image ? (
                    <div
                      className="group relative aspect-[3/2] overflow-hidden lg:aspect-auto lg:min-h-[560px]"
                      style={{ backgroundColor: config.ecosystem.image.bg }}
                    >
                      <Image
                        src={config.ecosystem.image.src}
                        alt={config.ecosystem.altKey ? eco(config.ecosystem.altKey) : ""}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover object-top transition-transform duration-500 ease-out group-hover:translate-y-3 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                      />
                    </div>
                  ) : (
                    <GlyphTray index={2} className="aspect-[3/2] lg:aspect-auto lg:min-h-[560px]">
                      <span className="text-(--c-text)">
                        <PlatformLogo icon="android" className="h-24 w-24 md:h-32 md:w-32" />
                      </span>
                    </GlyphTray>
                  )}
                  <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
                    <p className={KICKER}>{eco("kicker")}</p>
                    <h2 className={`mt-3 ${H2}`}>{eco("title")}</h2>
                    <p className="mt-4 text-lg leading-relaxed text-(--c-muted)">{eco("body")}</p>
                    <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {config.ecosystem.devices.map(({ key, glyph }) => (
                        <li key={key} className="flex gap-3">
                          <Glyph d={ICON[glyph]} />
                          <span>
                            <span className={`block ${PLUS_TITLE_SM}`}>{eco(`${key}.title`)}</span>
                            <span className={`mt-1 block ${PLUS_META}`}>{eco(`${key}.body`)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    {config.ecosystem.guides.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-x-6">
                        {config.ecosystem.guides.map((slug) => (
                          <GuideLink key={slug} href={`/guides/${slug}`} locale={locale}>
                            {s(`guides.items.${slug}.cta`)}
                          </GuideLink>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </PlusContainer>
          )}

          {/* ── Android install: specs, device list, Play / APK / Huawei ── */}
          {config.androidGet && (
            <PlusContainer className={SECTION}>
              <div id="get" className="scroll-mt-28">
                <SectionHead kicker={t("get.kicker")} title={t("get.title")} lead={t("get.subtitle")} />
                <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
                  {config.androidGet.specs.map(({ key }) => (
                    <div key={key} className="rounded-2xl bg-(--c-card) px-4 py-4 text-center sm:px-5">
                      <dt className={PLUS_META}>{t(`get.specs.${key}.label`)}</dt>
                      <dd className={`mt-1 ${PLUS_TITLE_SM}`}>{t(`get.specs.${key}.value`, { days: TERMS.freeTrialDays })}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mb-8 rounded-[28px] bg-(--c-card) px-5 py-6 sm:px-8 sm:py-7">
                  <p className={`mb-5 text-center ${KICKER}`}>{t("get.devices.kicker")}</p>
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {config.androidGet.devices.map(({ key, glyph }) => (
                      <li key={key} className="flex flex-col items-center gap-2 text-center">
                        <Glyph d={ICON[glyph]} className="h-6 w-6" />
                        <span className={PLUS_TITLE_SM}>{t(`get.devices.${key}.title`)}</span>
                        <span className={PLUS_META}>{t(`get.devices.${key}.body`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="overflow-hidden rounded-[28px] bg-(--c-card)">
                  <div className="hidden border-b border-(--c-inset) px-6 py-3 text-[12px] font-bold uppercase tracking-[0.06em] text-(--c-tert) md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(13rem,1fr)] md:gap-6">
                    <span>{t("get.headers.channel")}</span>
                    <span>{t("get.headers.bestFor")}</span>
                    <span>{t("get.headers.requires")}</span>
                    <span className="text-end">{t("get.headers.action")}</span>
                  </div>
                  <ul>
                    {config.androidGet.rows.map((row, i) => {
                      const rowKey = `get.rows.${row.key}`;
                      return (
                        <li
                          key={row.key}
                          className={`grid grid-cols-1 gap-3 px-5 py-5 sm:px-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(13rem,1fr)] md:items-center md:gap-6 ${
                            i > 0 ? "border-t border-(--c-inset)" : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            {row.key === "huawei" ? (
                              <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal}`}>
                                <HuaweiMark className="h-5 w-5" />
                              </span>
                            ) : row.key === "play" ? (
                              <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal}`}>
                                <PlatformLogo icon="googlePlay" className="h-5 w-5" />
                              </span>
                            ) : (
                              <Glyph d={ICON[row.glyph]} className="h-5 w-5" />
                            )}
                            <div>
                              <p className={PLUS_TITLE_SM}>{t(`${rowKey}.title`)}</p>
                              <p className={`mt-1 md:hidden ${PLUS_META}`}>{t(`${rowKey}.bestFor`)}</p>
                            </div>
                          </div>
                          <p className={`hidden md:block ${PLUS_BODY}`}>{t(`${rowKey}.bestFor`)}</p>
                          <p className={PLUS_META}>{t(`${rowKey}.requires`)}</p>
                          <div className="flex flex-wrap items-center gap-2 md:justify-end">
                            <AndroidGetCta row={row} config={config} t={t} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <p className={`mx-auto mt-5 max-w-3xl text-center ${PLUS_META}`}>{t("get.footnote")}</p>
              </div>
            </PlusContainer>
          )}

          {/* ── Privacy facts ────────────────────────────────────── */}
          <PlusContainer className={SECTION}>
            <SectionHead title={s("privacy.title")} lead={s("privacy.subtitle")} />
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {config.privacy.map((item) => {
                const own = item.startsWith("page:");
                const key = own ? item.slice(5) : item;
                const tr = own ? t : s;
                return (
                  <li key={item} className={PLUS_CARD}>
                    <Glyph d={PRIVACY_ICON[key] ?? ICON.check} className="h-7 w-7" />
                    <h3 className={`mt-4 ${PLUS_TITLE_SM}`}>{tr(`privacy.${key}.title`, { days: TERMS.freeTrialDays })}</h3>
                    <p className={`mt-2 ${PLUS_BODY}`}>{tr(`privacy.${key}.body`, { days: TERMS.freeTrialDays })}</p>
                  </li>
                );
              })}
            </ul>
          </PlusContainer>

          {/* ── Guides ───────────────────────────────────────────── */}
          {config.guides.length > 0 && (
          <PlusContainer className={SECTION}>
            <SectionHead kicker={s("guides.kicker")} title={s("guides.title")} lead={s("guides.subtitle")} />
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {config.guides.map((slug) => (
                <li key={slug}>
                  <Link href={`/guides/${slug}`} locale={guideLocaleFor(locale)} className={`${PLUS_CARD_HOVER} overflow-hidden !p-0`}>
                    <span className="relative block aspect-[3/2]" style={{ backgroundColor: GUIDE_COVERS[slug].bg }}>
                      <Image
                        src={GUIDE_COVERS[slug].src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover"
                      />
                    </span>
                    <span className="flex flex-1 flex-col p-5">
                      <span className={`block ${PLUS_TITLE_SM}`}>{s(`guides.items.${slug}.title`)}</span>
                      <span className={`mt-2 block ${PLUS_BODY}`}>{s(`guides.items.${slug}.desc`)}</span>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-(--c-accent)">
                        {s("readGuide")}
                        <ArrowGlyph className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/how-it-works" locale={howItWorksLocaleFor(locale)} className={`${PLUS_CARD_HOVER} mt-4 !flex-row items-center justify-between gap-4 sm:!p-8`}>
              <span>
                <span className={`block ${PLUS_TITLE_SM}`}>{s("guides.hub.title")}</span>
                <span className={`mt-1.5 block max-w-3xl ${PLUS_BODY}`}>{s("guides.hub.desc")}</span>
              </span>
              <ArrowGlyph className="h-6 w-6 shrink-0 text-(--c-tert) group-hover:text-(--c-accent)" />
            </Link>
            {!isGuidesLocale(locale) && <p className={`mt-4 text-center ${PLUS_META}`}>{s("guides.englishNote")}</p>}
          </PlusContainer>
          )}

          {/* ── Setup ────────────────────────────────────────────── */}
          <PlusContainer className={SECTION}>
            <SectionHead title={t("setup.title")} lead={t("setup.subtitle")} />
            <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {(["s1", "s2", "s3"] as const).map((step, i) => (
                <li key={step} className={PLUS_CARD}>
                  <span className="font-display text-2xl font-bold tabular-nums text-(--c-accent)">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className={`mt-3 ${PLUS_TITLE_SM}`}>{t(`setup.${step}.title`)}</h3>
                  <p className={`mt-2 ${PLUS_BODY}`}>
                    {t(`setup.${step}.body`, { days: TERMS.freeTrialDays, price: priceFrom })}
                  </p>
                </li>
              ))}
            </ol>
          </PlusContainer>

          {/* ── FAQ ──────────────────────────────────────────────── */}
          <PlusContainer className={SECTION}>
            <div className="mx-auto max-w-3xl">
              <h2 className={`mb-8 text-center ${PLUS_TITLE} md:text-3xl`}>{t("faq.title")}</h2>
              <PlusFaqAccordion items={faqItems} />
            </div>
          </PlusContainer>

          {/* ── Final CTA ────────────────────────────────────────── */}
          <PlusContainer className="py-10 md:py-16">
            <PlusCtaCard
              {...(config.ctaImage ? { image: { ...config.ctaImage, alt: s("cta.imageAlt") } } : {})}
              imageFallback={
                <GlyphTray
                  index={3}
                  className="aspect-[3/2] lg:aspect-auto lg:min-h-[420px]"
                  {...(config.ctaBackdrop ? { backdrop: config.ctaBackdrop } : {})}
                >
                  <span className={config.ctaBackdrop ? "text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)]" : "text-(--c-text)"}>
                    {config.slug === "vpn-for-huawei" ? (
                      <HuaweiMark className="h-20 w-20 md:h-24 md:w-24" />
                    ) : primary ? (
                      <Mark mark={primary.mark} className="h-20 w-20 md:h-24 md:w-24" />
                    ) : (
                      <PlatformLogo icon="linux" className="h-20 w-20 md:h-24 md:w-24" />
                    )}
                  </span>
                </GlyphTray>
              }
            >
              <h2 className={PLUS_CTA_TITLE}>{t("cta.title")}</h2>
              <p className={PLUS_CTA_LEAD}>{t("cta.subtitle", { days: TERMS.freeTrialDays })}</p>
              <div id="blog-cta-sentinel" aria-hidden="true" />
              {config.waitlist && waitlistLabels && (
                <WaitlistForm
                  platform={config.waitlist.platform}
                  locale={locale}
                  labels={waitlistLabels}
                  tone="card"
                  align="start"
                />
              )}
              <div className="flex flex-col items-center gap-4 sm:flex-row lg:items-center">
                {primary && <StoreButton config={config} button={primary} label={t(`hero.${primary.labelKey}`)} large />}
                <Link href="/downloads" className={PLUS_CTA_LINK}>
                  {s("cta.downloads")}
                </Link>
              </div>
            </PlusCtaCard>

            {/* Other platforms */}
            <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {config.related.map(({ href, key }) => (
                <li key={href}>
                  <Link href={href} className={`${PLUS_CARD_HOVER} !flex-row items-center justify-between gap-3 !p-5`}>
                    <span>
                      <span className={`block ${PLUS_TITLE_SM}`}>{s(`related.${key}.title`)}</span>
                      <span className={`mt-1 block ${PLUS_META}`}>{s(`related.${key}.desc`)}</span>
                    </span>
                    <ArrowGlyph className="h-5 w-5 shrink-0 text-(--c-tert) group-hover:text-(--c-accent)" />
                  </Link>
                </li>
              ))}
            </ul>
          </PlusContainer>
        </main>
        {/* The sticky bar offers a download; a waitlist page has none to offer. */}
        {!config.waitlist && <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation={config.trackLocation} plus />}
      </PlusPageShell>
      <Footer />
    </>
  );
}
