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
import { AppleIcon, Stars } from "@/components/icons/platform";
import { AppStoreMark } from "@/components/glyph/platform-icons";
import { Link } from "@/i18n/navigation";
import { PLANS, SITE_URL, TERMS } from "@/lib/facts";
import { GUIDE_COVERS, type AppleAppConfig, type AppleChapter } from "@/config/platforms/apple";
import { AppleTour, MacFrame, PhoneFrame } from "./apple-tour";

/** Guides are English-only for now (lib/guides.ts), so every guide link goes to /en. */
const GUIDE_LOCALE = "en";

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

const ICON = {
  phone: "M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  tablet: "M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-15a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 4.5v15a2.25 2.25 0 0 0 2.25 2.25Z",
  laptop: "M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z",
  watch: "M8.25 6.75h7.5A2.25 2.25 0 0 1 18 9v6a2.25 2.25 0 0 1-2.25 2.25h-7.5A2.25 2.25 0 0 1 6 15V9a2.25 2.25 0 0 1 2.25-2.25ZM9 6.75 9.75 3h4.5L15 6.75M9 17.25 9.75 21h4.5l.75-3.75",
  id: "M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z",
  lock: "M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z",
  eyeOff: "M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88",
  gift: "M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z",
  check: "m4.5 12.75 6 6 9-13.5",
};

/** The App Store button: the page's one primary action, repeated at the end. */
function StoreButton({
  config,
  label,
  large = false,
}: {
  config: AppleAppConfig;
  label: string;
  large?: boolean;
}) {
  return (
    <TrackedDownloadLink
      location={config.trackLocation}
      platform={config.trackPlatform}
      href={config.downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`plus-btn inline-flex items-center justify-center gap-2.5 rounded-full bg-(--c-accent-fill) font-bold text-white hover:bg-(--c-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--c-bg) ${
        large ? "h-14 px-8 text-base" : "h-12 px-6 text-[15px]"
      }`}
    >
      <AppStoreMark className={large ? "h-5 w-5" : "h-[18px] w-[18px]"} />
      {label}
    </TrackedDownloadLink>
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

function GuideLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      locale={GUIDE_LOCALE}
      className="group mt-6 inline-flex items-center gap-1.5 text-[15px] font-bold text-(--c-accent) hover:underline hover:underline-offset-4"
    >
      {children}
      <ArrowGlyph className="h-4 w-4" />
    </Link>
  );
}

function ChapterVisual({ chapter, alt, compact }: { chapter: AppleChapter; alt: string; compact: boolean }) {
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
  // Phone: the screen rises out of a tray and is cut by its bottom edge, so a tall capture
  // never towers over the copy beside it.
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-(--c-card)">
      <div
        className={`flex justify-center px-6 ${
          compact ? "h-[360px] pt-8 sm:h-[420px] sm:pt-10" : "h-[440px] pt-10 sm:h-[520px] sm:pt-14"
        }`}
      >
        <PhoneFrame
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
 * The iPhone and Mac app pages. Section order: hero, app tour (raw screens, no
 * marketing words in the images), four feature chapters, the Apple-devices band,
 * privacy facts, guides, setup, FAQ, related platforms, final CTA.
 */
export async function AppleAppPage({ locale, config }: { locale: string; config: AppleAppConfig }) {
  setRequestLocale(locale);
  const [t, s, mt, tHero] = await Promise.all([
    getTranslations(`${config.namespace}.apple`),
    getTranslations("applePage"),
    getTranslations({ locale, namespace: `${config.namespace}.metadata` }),
    getTranslations({ locale, namespace: "hero" }),
  ]);

  const isMac = config.tourDevice === "mac";
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

  const hero = (
    <>
      <span className={`${PLUS_CHIP} bg-(--c-accent-tint) text-(--c-accent)`}>
        <AppleIcon className="h-3.5 w-3.5" />
        {t("hero.eyebrow")}
      </span>
      <h1 className="mt-5 font-display text-[40px] font-bold leading-[1.06] tracking-tight text-(--c-text) sm:text-5xl xl:text-6xl">
        {t("hero.title")}
      </h1>
      <p className={`mt-5 max-w-xl text-lg leading-relaxed text-(--c-muted) md:text-xl ${isMac ? "mx-auto" : "mx-auto lg:mx-0"}`}>
        {t("hero.subtitle")}
      </p>
      <div className={`mt-8 flex flex-col items-center gap-4 sm:flex-row ${isMac ? "justify-center" : "justify-center lg:justify-start"}`}>
        <StoreButton config={config} label={t("hero.cta")} large />
        <span className="flex items-center gap-1.5">
          <Stars />
          <span className="text-sm font-bold text-(--c-text)">{tHero("socialProof.rating")}</span>
          <span className={PLUS_META}>{tHero("socialProof.appStore")}</span>
        </span>
      </div>
      <p className={`mt-5 ${PLUS_META}`}>{t("hero.note", { days: TERMS.freeTrialDays })}</p>
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
      <PlatformAppSchema
        name="Doppler VPN"
        description={mt("description")}
        operatingSystem={config.operatingSystem}
        applicationCategory="UtilitiesApplication"
        downloadUrl={config.downloadUrl}
      />
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
                </>
              ) : (
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
                  <div className="text-center lg:text-start">{hero}</div>
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
                      <ChapterVisual chapter={chapter} alt={t(`${k}.alt`)} compact={compact} />
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
                        <GuideLink href={`/guides/${chapter.guide}`}>{s(`guides.items.${chapter.guide}.cta`)}</GuideLink>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </PlusContainer>

          {/* ── Every Apple device ───────────────────────────────── */}
          <PlusContainer className={SECTION}>
            <div className="overflow-hidden rounded-[32px] bg-(--c-card)">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative aspect-[3/2] lg:aspect-auto lg:min-h-[560px]" style={{ backgroundColor: config.ecosystem.image.bg }}>
                  <Image
                    src={config.ecosystem.image.src}
                    alt={s(`ecosystem.${config.ecosystem.altKey}`)}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
                  <p className={KICKER}>{s("ecosystem.kicker")}</p>
                  <h2 className={`mt-3 ${H2}`}>{s("ecosystem.title")}</h2>
                  <p className="mt-4 text-lg leading-relaxed text-(--c-muted)">{s("ecosystem.body")}</p>
                  <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {(
                      [
                        ["iphone", ICON.phone],
                        ["ipad", ICON.tablet],
                        ["mac", ICON.laptop],
                        ["watch", ICON.watch],
                      ] as const
                    ).map(([key, d]) => (
                      <li key={key} className="flex gap-3">
                        <Glyph d={d} />
                        <span>
                          <span className={`block ${PLUS_TITLE_SM}`}>{s(`ecosystem.${key}.title`)}</span>
                          <span className={`mt-1 block ${PLUS_META}`}>{s(`ecosystem.${key}.body`)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex flex-wrap gap-x-6">
                    <GuideLink href="/guides/vpn-on-apple-watch">{s("guides.items.vpn-on-apple-watch.cta")}</GuideLink>
                    <GuideLink href="/guides/one-account-every-apple-device">
                      {s("guides.items.one-account-every-apple-device.cta")}
                    </GuideLink>
                  </div>
                </div>
              </div>
            </div>
          </PlusContainer>

          {/* ── Privacy facts ────────────────────────────────────── */}
          <PlusContainer className={SECTION}>
            <SectionHead title={s("privacy.title")} lead={s("privacy.subtitle")} />
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ["noEmail", ICON.id],
                  ["vless", ICON.lock],
                  ["noLogs", ICON.eyeOff],
                  ["trial", ICON.gift],
                ] as const
              ).map(([key, d]) => (
                <li key={key} className={PLUS_CARD}>
                  <Glyph d={d} className="h-7 w-7" />
                  <h3 className={`mt-4 ${PLUS_TITLE_SM}`}>{s(`privacy.${key}.title`, { days: TERMS.freeTrialDays })}</h3>
                  <p className={`mt-2 ${PLUS_BODY}`}>{s(`privacy.${key}.body`, { days: TERMS.freeTrialDays })}</p>
                </li>
              ))}
            </ul>
          </PlusContainer>

          {/* ── Guides ───────────────────────────────────────────── */}
          <PlusContainer className={SECTION}>
            <SectionHead kicker={s("guides.kicker")} title={s("guides.title")} lead={s("guides.subtitle")} />
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {config.guides.map((slug) => (
                <li key={slug}>
                  <Link href={`/guides/${slug}`} locale={GUIDE_LOCALE} className={`${PLUS_CARD_HOVER} overflow-hidden !p-0`}>
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
            <Link href="/how-it-works" className={`${PLUS_CARD_HOVER} mt-4 !flex-row items-center justify-between gap-4 sm:!p-8`}>
              <span>
                <span className={`block ${PLUS_TITLE_SM}`}>{s("guides.hub.title")}</span>
                <span className={`mt-1.5 block max-w-3xl ${PLUS_BODY}`}>{s("guides.hub.desc")}</span>
              </span>
              <ArrowGlyph className="h-6 w-6 shrink-0 text-(--c-tert) group-hover:text-(--c-accent)" />
            </Link>
            {locale !== GUIDE_LOCALE && <p className={`mt-4 text-center ${PLUS_META}`}>{s("guides.englishNote")}</p>}
          </PlusContainer>

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
            <div className="grid grid-cols-1 overflow-hidden rounded-[32px] bg-(--c-card) lg:grid-cols-[5fr_6fr]">
              <div className="flex flex-col justify-center gap-6 p-6 text-center sm:p-10 lg:p-14 lg:text-start">
                <h2 className={H2}>{t("cta.title")}</h2>
                <p className="mx-auto max-w-md text-lg text-(--c-muted) lg:mx-0">
                  {t("cta.subtitle", { days: TERMS.freeTrialDays })}
                </p>
                <div id="blog-cta-sentinel" aria-hidden="true" />
                <div className="flex flex-col items-center gap-4 sm:flex-row lg:items-center">
                  <StoreButton config={config} label={t("hero.cta")} large />
                  <Link href="/downloads" className="text-[15px] font-bold text-(--c-accent) hover:underline hover:underline-offset-4">
                    {s("cta.downloads")}
                  </Link>
                </div>
              </div>
              <div className="relative aspect-[3/2] lg:aspect-auto" style={{ backgroundColor: GUIDE_COVERS["doppler-on-iphone-and-mac"].bg }}>
                <Image
                  src={GUIDE_COVERS["doppler-on-iphone-and-mac"].src}
                  alt={s("cta.imageAlt")}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>

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
        <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation={config.trackLocation} plus />
      </PlusPageShell>
      <Footer />
    </>
  );
}
