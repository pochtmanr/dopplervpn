"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PlatformLogo, type PlatformIcon } from "@/components/glyph/platform-icons";
import { PricingBackdrop } from "@/components/glyph/pricing-glyphs";
import { TrackedDownloadLink } from "./tracked-download-link";
import { useDetectedPlatform } from "./detected-platform";
import { Link } from "@/i18n/navigation";
import {
  PLUS_CTA_BTN,
  PLUS_CTA_LEAD,
  PLUS_CTA_LINK,
  PLUS_CTA_TITLE,
  PlusCtaCard,
} from "@/components/landing/plus-cta-card";
import type { CtaPlatform, CtaVariant } from "@/lib/track-cta";

/**
 * "How to set up VPN on …" — one platform at a time, in the home page's notched
 * download card (sections/cta.tsx): copy, steps and the download on the left,
 * that card's own picture on the right, the bottom-end corner cut.
 *
 * The steps are a plain numbered list: no autoplay, no highlighted step (Roman,
 * 2026-11-16). The picture is the chosen platform's own device.
 *
 * Every string arrives resolved from the server: the heading is the platform
 * page's own `howItWorks.title`/`subtitle` and the steps are
 * `apps.<platform>.step1-4`, so the `vpnFor*` namespaces stay out of the bundle.
 */

export interface SetupPlatform {
  key: CtaPlatform;
  icon: PlatformIcon;
  /** Tab label — the platform's short name. */
  name: string;
  title: string;
  subtitle: string;
  steps: string[];
  cta: {
    href: string;
    label: string;
    variant?: CtaVariant;
    external: boolean;
    download: boolean;
    /** The mark on the button: the store's (App Store, Google Play), not the platform's. */
    logo: PlatformIcon;
  };
  /** The platform page, linked beside the download in the Calm+ card. */
  learn?: { href: string; label: string };
  /** That platform's device: iPhone, Mac display, Galaxy phone, the Windows window. */
  image: { src: string; bg?: string; alt: string; fit?: "cover" | "contain" };
}

const BTN =
  "cta-key inline-flex w-full sm:w-auto items-center justify-center gap-2.5 px-6 py-3 rounded-xl " +
  "text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-accent-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary";

/*
 * Calm+ (CALM_PLUS_PREVIEW): the app pages' closing card (landing/plus-cta-card)
 * with the tabs as a segmented pill and the steps inside it. No glass, no glyph
 * backdrop: the picture bleeds to the card's end edge, as on /vpn-for-macos.
 */

export function SetupSection({
  platforms,
  ratings,
  plus = false,
}: {
  platforms: SetupPlatform[];
  /** Pre-rendered ratings row, shared with the hero. */
  ratings: React.ReactNode;
  plus?: boolean;
}) {
  const [active, setActive] = useState(0);
  const touched = useRef(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const detected = useDetectedPlatform();
  const current = platforms[active];

  // Open on the visitor's own platform, unless they have already picked one.
  useEffect(() => {
    if (touched.current || !detected) return;
    const i = platforms.findIndex((p) => p.key === detected);
    if (i >= 0) setActive(i);
  }, [detected, platforms]);

  const selectTab = (i: number) => {
    touched.current = true;
    setActive(i);
  };

  const moveTab = (event: React.KeyboardEvent) => {
    const last = platforms.length - 1;
    // Arrow keys follow the reading direction, so they still mean "the next tab
    // along" on an RTL page rather than jumping the wrong way.
    const rtl = document.documentElement.dir === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";

    let next: number;
    if (event.key === forward) next = active === last ? 0 : active + 1;
    else if (event.key === back) next = active === 0 ? last : active - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;

    event.preventDefault();
    selectTab(next);
    tabRefs.current[next]?.focus();
  };

  const tabs = (
    <div
      role="tablist"
      onKeyDown={moveTab}
      className={
        plus
          ? "inline-flex flex-wrap justify-center self-center lg:self-start gap-1 rounded-[22px] bg-(--c-inset) p-1"
          : "flex flex-wrap justify-center lg:justify-start gap-2"
      }
    >
      {platforms.map((platform, i) => {
        const selected = i === active;
        return (
          <button
            key={platform.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`setup-tab-${platform.key}`}
            aria-selected={selected}
            aria-controls="setup-panel"
            // Roving tabindex: one stop for the whole set, arrows move within it.
            tabIndex={selected ? 0 : -1}
            onClick={() => selectTab(i)}
            className={
              plus
                ? `inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) ${
                    selected ? "bg-(--c-accent-fill) text-white" : "text-(--c-muted) hover:text-(--c-text)"
                  }`
                : `inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selected
                      ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/30"
                      : "cta-flat hover:text-accent-teal"
                  }`
            }
          >
            <PlatformLogo icon={platform.icon} className="w-4 h-4" />
            {platform.name}
          </button>
        );
      })}
    </div>
  );

  const steps = (
    <ol key={current.key} className={`${plus ? "mt-6" : "mt-7"} space-y-1.5 text-start max-w-md mx-auto lg:mx-0`}>
      {current.steps.map((text, i) => (
        <li key={i} className="flex items-start gap-3 px-3.5 py-3">
          <span
            className={`flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center ${
              plus
                ? "bg-(--c-accent-tint) text-(--c-accent) font-bold"
                : "bg-accent-teal/10 border border-accent-teal/20 text-accent-teal font-semibold"
            }`}
          >
            {i + 1}
          </span>
          <span className="pt-0.5 text-sm md:text-base leading-snug text-text-muted">{text}</span>
        </li>
      ))}
    </ol>
  );

  const download = (className: string, iconClass: string) => (
    <TrackedDownloadLink
      location="downloads-page"
      platform={current.key}
      {...(current.cta.variant ? { variant: current.cta.variant } : {})}
      href={current.cta.href}
      {...(current.cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...(current.cta.download ? { download: true } : {})}
      className={className}
    >
      <PlatformLogo icon={current.cta.logo} className={iconClass} />
      {current.cta.label}
    </TrackedDownloadLink>
  );

  if (plus) {
    return (
      <section className="section relative overflow-hidden">
        {/* The ASCII field behind the card, as before the Mac-card restyle. */}
        <PricingBackdrop />
        <div className="relative mx-auto max-w-site">
          <PlusCtaCard key={current.key} image={current.image}>
            {tabs}
            <div id="setup-panel" role="tabpanel" aria-labelledby={`setup-tab-${current.key}`}>
              <h2 className={PLUS_CTA_TITLE}>{current.title}</h2>
              <p className={`mt-4 ${PLUS_CTA_LEAD}`}>{current.subtitle}</p>
              {steps}
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                {download(`${PLUS_CTA_BTN} w-full sm:w-auto`, "h-5 w-5")}
                {current.learn && (
                  <Link href={current.learn.href} className={PLUS_CTA_LINK}>
                    {current.learn.label}
                  </Link>
                )}
              </div>
              <div className="mt-6">{ratings}</div>
            </div>
          </PlusCtaCard>
        </div>
      </section>
    );
  }

  return (
    <section className="section relative overflow-hidden bg-bg-secondary/30">
      <PricingBackdrop />

      <div className="relative mx-auto max-w-site">
        <div className="notch-card relative overflow-hidden rounded-2xl border border-accent-teal/20 bg-gradient-to-br from-accent-teal/[0.08] via-bg-primary/60 to-bg-primary/75 backdrop-blur-md">
          <div
            className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-[6fr_5fr]">
            {/* ── Copy column ─────────────────────────────────── */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12 text-center lg:text-start">
              {tabs}

              <div id="setup-panel" role="tabpanel" aria-labelledby={`setup-tab-${current.key}`}>
                <h2 className="mt-7 text-3xl sm:text-4xl lg:text-[clamp(2rem,2.8vw,2.75rem)] font-semibold text-text-primary leading-tight">
                  {current.title}
                </h2>
                <p className="mt-3 text-text-muted text-base md:text-lg max-w-md mx-auto lg:mx-0">
                  {current.subtitle}
                </p>

                {steps}

                <div className="mt-8 flex flex-col items-center lg:items-start gap-4">
                  {download(BTN, "w-5 h-5")}
                  {ratings}
                </div>
              </div>
            </div>

            {/* ── Image column ────────────────────────────────── */}
            {/* The chosen platform's device. It bleeds to the card edges and the
                notch cuts its bottom-end corner; the spacer holds a fixed aspect,
                so a taller copy column only crops it sideways. */}
            <div
              className="relative overflow-hidden border-t lg:border-t-0 lg:border-s border-overlay/5"
              style={{ backgroundColor: current.image.bg }}
            >
              <div className="aspect-[1009/794]" aria-hidden="true" />
              <Image
                key={current.key}
                src={current.image.src}
                alt={current.image.alt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className={current.image.fit === "contain" ? "object-contain p-8" : "object-cover"}
              />
            </div>
          </div>

          <span className="notch-edge" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
