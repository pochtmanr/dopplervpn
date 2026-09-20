import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BreadcrumbSchema, FAQSchema, PlatformAppSchema } from "@/components/seo/json-ld";
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/reveal";
import { Accordion } from "@/components/ui/accordion";
import { TrackedDownloadLink } from "@/components/downloads/tracked-download-link";
import { ArrowIcon, CheckIcon, ShieldExclamationIcon, Stars } from "@/components/icons/platform";
import { SITE_URL } from "@/lib/facts";
import type { PlatformLandingConfig } from "./platform-landing-config";

type T = Awaited<ReturnType<typeof getTranslations>>;

/**
 * Windows-only heads-up about the SmartScreen warning. Sits immediately under
 * the download button, which is where someone who just clicked looks next.
 */
function SmartScreenNotice({ t }: { t: T }) {
  return (
    <div className="mt-6 rounded-xl border border-accent-gold/25 bg-accent-gold/[0.06] p-4 text-start">
      <div className="flex items-center gap-2 text-sm font-semibold text-accent-gold">
        <ShieldExclamationIcon />
        {t("smartScreen.title")}
      </div>
      <p className="mt-2 text-xs text-text-muted leading-relaxed">{t("smartScreen.body")}</p>
      <ol className="mt-3 space-y-1.5 text-xs text-text-primary">
        <li className="flex gap-2">
          <span className="text-accent-gold font-semibold shrink-0">1.</span>
          {t("smartScreen.step1")}
        </li>
        <li className="flex gap-2">
          <span className="text-accent-gold font-semibold shrink-0">2.</span>
          {t("smartScreen.step2")}
        </li>
      </ol>
      <p className="mt-3 text-xs text-text-muted leading-relaxed">{t("smartScreen.why")}</p>
    </div>
  );
}

/**
 * The shared body of the four platform landing pages.
 *
 * Section order — hero, feature bento, optional gallery, how-it-works,
 * FAQ, related, final CTA — is fixed; everything that varies comes in through
 * {@link PlatformLandingConfig}. The markup is a verbatim lift from
 * `vpn-for-ios/page.tsx`, with the Windows-only gallery and SmartScreen notice
 * folded in as optional slots, so all four pages render exactly as before.
 */
export async function PlatformLandingPage({
  locale,
  config,
}: {
  locale: string;
  config: PlatformLandingConfig;
}) {
  setRequestLocale(locale);
  const t = await getTranslations(config.namespace);
  const mt = await getTranslations({ locale, namespace: `${config.namespace}.metadata` });
  const tHero = await getTranslations({ locale, namespace: "hero" });

  const {
    slug,
    trackPlatform,
    downloadUrl,
    downloadVariant,
    directDownload,
    ratingChip,
    heroCtaIcon: HeroCtaIcon,
    heroCtaKey,
    heroGapClass,
    heroVisual,
    smartScreenNotice,
    features,
    stepKeys,
    faqKeys,
    gallery,
    related,
    ctaDownloadKey,
  } = config;

  // How the download anchor behaves: our own file vs. an outbound store link.
  const linkBehaviour = directDownload
    ? ({ download: true } as const)
    : ({ target: "_blank", rel: "noopener noreferrer" } as const);

  // Word-by-word blur-up cascade (same timing as the homepage hero).
  // Only the last word takes the gradient; the rest is plain text. Split rather
  // than one span because `bg-clip-text` would otherwise ramp across the whole
  // headline instead of the final word.
  const headlineWords = t("hero.title").split(/\s+/).filter(Boolean);
  const headlineLast = headlineWords[headlineWords.length - 1] ?? "";
  const headlineLead = headlineWords.slice(0, -1).join(" ");

  const faqItems = faqKeys.map((key) => ({
    question: t(`faq.${key}.question`),
    answer: t(`faq.${key}.answer`),
  }));

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_URL}/${locale}` },
          { name: t("hero.title"), url: `${SITE_URL}/${locale}/${slug}` },
        ]}
      />
      <PlatformAppSchema
        name="Doppler VPN"
        description={mt("description")}
        operatingSystem={config.operatingSystem}
        applicationCategory="UtilitiesApplication"
        downloadUrl={downloadUrl}
      />
      <FAQSchema items={faqItems} />
      <Navbar />
      <main className="overflow-x-clip">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 -end-20 w-[24rem] h-[24rem] bg-accent-gold/10 rounded-full blur-3xl" />
            {/* Faint dot field — echoes the homepage DotGlobe motif */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage: "radial-gradient(circle, var(--color-overlay) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
                opacity: 0.05,
                maskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black, transparent)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black, transparent)",
              }}
            />
          </div>
          <div className="relative z-10 mx-auto max-w-site">
            <div className={`grid grid-cols-1 lg:grid-cols-2 ${heroGapClass} items-center`}>
              {/* Text */}
              <div className="text-center lg:text-start">
                {ratingChip && (
                  <TrackedDownloadLink
                    location={slug}
                    platform={trackPlatform}
                    href={downloadUrl}
                    {...linkBehaviour}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm bg-accent-teal/10 border border-accent-teal/20 hover:bg-accent-teal/20 hover:border-accent-teal/40 transition-colors"
                  >
                    <Stars />
                    <span className="font-semibold text-text-primary">{tHero("socialProof.rating")}</span>
                    <span className="text-text-muted">{tHero(`socialProof.${ratingChip.storeKey}`)}</span>
                  </TrackedDownloadLink>
                )}

                {/* Headline — rounded heading font, last word in gradient. Static: it
                    is this page's LCP element, so it carries no entrance. */}
                <h1
                  className={`${ratingChip ? "mt-6 " : ""}text-5xl md:text-6xl xl:text-7xl font-semibold text-text-primary leading-[1.05]`}
                >
                  {headlineLead}
                  {headlineLead && " "}
                  <span className="bg-gradient-to-t from-text-muted to-text-primary bg-clip-text text-transparent">
                    {headlineLast}
                  </span>
                </h1>

                <p className="mt-6 text-text-muted text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {t("hero.subtitle")}
                </p>

                {smartScreenNotice ? (
                  <>
                    <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                      <TrackedDownloadLink
                        location={slug}
                        platform={trackPlatform}
                        variant={downloadVariant}
                        href={downloadUrl}
                        {...linkBehaviour}
                        className="cta-key inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white"
                      >
                        <HeroCtaIcon />
                        {t(heroCtaKey)}
                      </TrackedDownloadLink>
                    </div>
                    <SmartScreenNotice t={t} />
                    <p className="mt-5 text-xs text-text-muted">{tHero("socialProof.users")}</p>
                  </>
                ) : (
                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <TrackedDownloadLink
                      location={slug}
                      platform={trackPlatform}
                      variant={downloadVariant}
                      href={downloadUrl}
                      {...linkBehaviour}
                      className="cta-key inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white"
                    >
                      <HeroCtaIcon />
                      {t(heroCtaKey)}
                    </TrackedDownloadLink>
                    <span className="text-xs text-text-muted">{tHero("socialProof.users")}</span>
                  </div>
                )}

                {/* Trust badges — same trio as the homepage hero */}
                <ul className="mt-7 hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-text-muted">
                  <li className="flex items-center gap-1.5">
                    <CheckIcon />
                    {tHero("trustBadges.noData")}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckIcon />
                    {tHero("trustBadges.noLogs")}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckIcon />
                    {tHero("trustBadges.vless")}
                  </li>
                </ul>
              </div>

              {/* Screenshot — layered glow presentation */}
              <div className="relative flex justify-center lg:justify-end">
                {heroVisual.kind === "image" ? (
                  <Image
                    src={heroVisual.src}
                    alt={
                      typeof heroVisual.alt === "string" ? heroVisual.alt : t(heroVisual.alt.tKey)
                    }
                    width={heroVisual.width}
                    height={heroVisual.height}
                    className={`relative w-full max-w-lg lg:max-w-2xl ${heroVisual.roundedClass} ring-1 ring-overlay/10 shadow-2xl shadow-black/40`}
                    priority
                  />
                ) : (
                  /* Brand panel — layered glow with the platform mark (no screenshot yet) */
                  <div className="relative w-full max-w-lg lg:max-w-xl aspect-[4/3] rounded-[2rem] ring-1 ring-overlay/10 shadow-2xl shadow-black/40 bg-gradient-to-br from-accent-teal/20 via-bg-secondary to-accent-gold/10 overflow-hidden flex items-center justify-center">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, var(--color-overlay) 1px, transparent 1px)",
                        backgroundSize: "22px 22px",
                        opacity: 0.06,
                      }}
                      aria-hidden="true"
                    />
                    <div
                      className="absolute w-48 h-48 bg-accent-teal/20 rounded-full blur-2xl"
                      aria-hidden="true"
                    />
                    <heroVisual.icon className="relative w-32 h-32 text-text-muted/40" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Bento Grid ───────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-site">
            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4 text-center">
                {t("features.title")}
              </h2>
              <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-14 leading-relaxed">
                {t("features.subtitle")}
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map(({ key, featured, icon: Icon }, i) => (
                <Reveal
                  key={key}
                  delay={(i % 4) * 60}
                  className={featured ? "md:col-span-2 h-full" : "h-full"}
                >
                  <div
                    className={`group relative h-full overflow-hidden rounded-2xl border border-overlay/10 bg-bg-secondary/50 transition-all duration-300 hover:border-accent-teal/30 hover:bg-bg-secondary/70 ${
                      featured ? "p-7 sm:p-8" : "p-6"
                    }`}
                  >
                    {featured && (
                      <>
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-accent-teal/[0.07] via-transparent to-transparent pointer-events-none"
                          aria-hidden="true"
                        />
                        <div
                          className="absolute -bottom-4 -end-4 scale-[5] origin-bottom-right rtl:origin-bottom-left text-accent-teal/[0.06] pointer-events-none"
                          aria-hidden="true"
                        >
                          <Icon />
                        </div>
                      </>
                    )}
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-accent-teal/15 border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-4 transition-all duration-300 group-hover:bg-accent-teal/25 group-hover:shadow-[0_0_20px_rgba(0,140,140,0.3)]">
                        <Icon />
                      </div>
                      <h3
                        className={`font-semibold text-text-primary mb-2 ${featured ? "text-xl" : "text-base"}`}
                      >
                        {t(`features.${key}.title`)}
                      </h3>
                      <p
                        className={`text-text-muted leading-relaxed ${featured ? "text-[15px] max-w-xl" : "text-sm"}`}
                      >
                        {t(`features.${key}.description`)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Inside the app — screenshot gallery ──────────────── */}
        {/* Left unbanded so it alternates with the How-It-Works band below. */}
        {gallery && gallery.length > 0 && (
          <section className="pb-20 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-site">
              <Reveal>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4 text-center">
                  {t("gallery.title")}
                </h2>
                <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-14 leading-relaxed">
                  {t("gallery.subtitle")}
                </p>
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map(({ key, src }, i) => (
                  <Reveal key={key} delay={i * 80} className="h-full">
                    <figure className="group h-full flex flex-col rounded-2xl border border-overlay/10 bg-bg-secondary/50 overflow-hidden transition-all duration-300 hover:border-accent-teal/30">
                      <Image
                        src={src}
                        alt={t(`gallery.${key}.alt`)}
                        width={986}
                        height={693}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="w-full h-auto border-b border-overlay/10"
                      />
                      <figcaption className="p-5">
                        <h3 className="text-base font-semibold text-text-primary mb-1.5">
                          {t(`gallery.${key}.title`)}
                        </h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                          {t(`gallery.${key}.description`)}
                        </p>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── How It Works — vertical timeline ─────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-bg-secondary/30 border-y border-overlay/5">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
                {t("howItWorks.title")}
              </h2>
              <p className="text-text-muted text-lg max-w-2xl mx-auto text-center mb-14 leading-relaxed">
                {t("howItWorks.subtitle")}
              </p>
            </Reveal>

            <div>
              {stepKeys.map((step, i) => {
                const isLast = i === stepKeys.length - 1;
                return (
                  <Reveal key={step} delay={i * 80}>
                    <div className="flex gap-5 sm:gap-7">
                      <div className="flex flex-col items-center">
                        <span
                          className="flex w-12 h-12 shrink-0 items-center justify-center rounded-full border border-accent-teal/30 bg-accent-teal/10 text-accent-teal text-lg font-semibold"
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                        {!isLast && (
                          <span
                            className="w-px flex-1 my-2 bg-gradient-to-b from-accent-teal/40 to-overlay/5"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className={isLast ? "pb-0" : "pb-10"}>
                        <h3 className="text-lg font-semibold text-text-primary mb-1.5 pt-2.5">
                          {t(`howItWorks.${step}.title`)}
                        </h3>
                        <p className="text-sm text-text-muted leading-relaxed">
                          {t(`howItWorks.${step}.description`)}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ — interactive accordion ──────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-12 text-center">
                {t("faq.title")}
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/40 px-6 sm:px-8">
                <Accordion items={faqItems} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Related Pages ────────────────────────────────────── */}
        <section className="pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-site">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(({ href, title, desc }, i) => (
                <Reveal key={href} delay={i * 60} className="h-full">
                  <Link
                    href={href}
                    className="group h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/30 hover:bg-bg-secondary/70 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-text-primary">{t(`related.${title}`)}</h3>
                      <span className="text-text-muted group-hover:text-accent-teal transition-all duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                        <ArrowIcon />
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">{t(`related.${desc}`)}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA — glowing panel ────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-site">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-accent-teal/20 bg-gradient-to-b from-accent-teal/10 via-bg-secondary/50 to-bg-secondary/30 px-6 py-16 sm:py-20 text-center">
                <div
                  className="absolute -top-24 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-[30rem] h-[16rem] bg-accent-teal/20 rounded-full blur-3xl pointer-events-none"
                  aria-hidden="true"
                />
                <div className="relative">
                  <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4">
                    {t("cta.title")}
                  </h2>
                  <p className="text-text-muted text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
                    {t("cta.subtitle")}
                  </p>

                  <div id="blog-cta-sentinel" aria-hidden="true" />

                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <TrackedDownloadLink
                      location={slug}
                      platform={trackPlatform}
                      variant={downloadVariant}
                      href={downloadUrl}
                      {...linkBehaviour}
                      className="cta-key inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white"
                    >
                      <HeroCtaIcon />
                      {t(ctaDownloadKey)}
                    </TrackedDownloadLink>
                  </div>

                  <p className="text-sm text-text-muted mb-2">{t("cta.otherPlatforms")}</p>
                  <Link
                    href="/downloads"
                    className="inline-flex items-center gap-2 text-sm text-accent-teal hover:text-accent-gold transition-colors"
                  >
                    <ArrowIcon />
                    {t("cta.downloadsLink")}
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation={slug} />
      <Footer />
    </>
  );
}
