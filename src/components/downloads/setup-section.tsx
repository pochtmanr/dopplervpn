"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PlatformLogo, type PlatformIcon } from "@/components/glyph/platform-icons";
import { PricingBackdrop } from "@/components/glyph/pricing-glyphs";
import { TrackedDownloadLink } from "./tracked-download-link";
import { useDetectedPlatform } from "./detected-platform";
import type { CtaPlatform, CtaVariant } from "@/lib/track-cta";

/**
 * "How to set up VPN on …" — one platform at a time, in the home page's notched
 * download card (sections/cta.tsx): copy, steps and the download on the left,
 * that card's own picture on the right, the bottom-end corner cut.
 *
 * The steps play through on their own while the card is on screen, a teal bar
 * timing each one; the bar's `animationend` is the clock, so pausing the
 * animation (off screen, hidden tab) pauses the walk-through with it. Choosing a
 * step hands control to the reader and the autoplay stops for good. Reduced
 * motion never starts it.
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
  };
}

/** How long each step holds while the walk-through plays. */
const STEP_MS = 3200;

const BTN =
  "cta-key inline-flex w-full sm:w-auto items-center justify-center gap-2.5 px-6 py-3 rounded-xl " +
  "text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-accent-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary";

export function SetupSection({
  platforms,
  ratings,
}: {
  platforms: SetupPlatform[];
  /** Pre-rendered ratings row, shared with the hero. */
  ratings: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [running, setRunning] = useState(false);
  const touched = useRef(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const detected = useDetectedPlatform();
  const current = platforms[active];

  // Open on the visitor's own platform, unless they have already picked one.
  useEffect(() => {
    if (touched.current || !detected) return;
    const i = platforms.findIndex((p) => p.key === detected);
    if (i >= 0) {
      setActive(i);
      setStep(0);
    }
  }, [detected, platforms]);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAutoplay(true);
  }, []);

  // The bar only advances while the card is on screen and the tab is visible.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !autoplay) return;
    let inView = false;
    const sync = () => setRunning(inView && !document.hidden);
    const io = new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [autoplay]);

  const selectTab = (i: number) => {
    touched.current = true;
    setActive(i);
    setStep(0);
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

  const chooseStep = (i: number) => {
    setAutoplay(false);
    setStep(i);
  };

  return (
    <section className="section relative overflow-hidden bg-bg-secondary/30">
      <PricingBackdrop />

      <div ref={cardRef} className="relative mx-auto max-w-site">
        <div className="notch-card relative overflow-hidden rounded-2xl border border-accent-teal/20 bg-gradient-to-br from-accent-teal/[0.08] via-bg-primary/60 to-bg-primary/75 backdrop-blur-md">
          <div
            className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-[6fr_5fr]">
            {/* ── Copy column ─────────────────────────────────── */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12 text-center lg:text-start">
              <div
                role="tablist"
                onKeyDown={moveTab}
                className="flex flex-wrap justify-center lg:justify-start gap-2"
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
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selected
                          ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/30"
                          : "cta-flat hover:text-accent-teal"
                      }`}
                    >
                      <PlatformLogo icon={platform.icon} className="w-4 h-4" />
                      {platform.name}
                    </button>
                  );
                })}
              </div>

              <div id="setup-panel" role="tabpanel" aria-labelledby={`setup-tab-${current.key}`}>
                <h2 className="mt-7 text-3xl sm:text-4xl lg:text-[clamp(2rem,2.8vw,2.75rem)] font-semibold text-text-primary leading-tight">
                  {current.title}
                </h2>
                <p className="mt-3 text-text-muted text-base md:text-lg max-w-md mx-auto lg:mx-0">
                  {current.subtitle}
                </p>

                <ol key={current.key} className="mt-7 space-y-1.5 text-start max-w-md mx-auto lg:mx-0">
                  {current.steps.map((text, i) => {
                    const isActive = i === step;
                    const done = autoplay && i < step;
                    const upcoming = autoplay && i > step;
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => chooseStep(i)}
                          aria-current={isActive ? "step" : undefined}
                          className={`group/step relative flex w-full items-start gap-3 overflow-hidden rounded-xl border px-3.5 py-3 text-start transition-colors duration-300 ${
                            isActive
                              ? "border-accent-teal/25 bg-accent-teal/[0.06]"
                              : "border-transparent hover:bg-overlay/5"
                          }`}
                        >
                          <span
                            className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center transition-colors duration-300 ${
                              isActive
                                ? "bg-accent-teal text-white"
                                : "bg-accent-teal/10 border border-accent-teal/20 text-accent-teal"
                            }`}
                          >
                            {done ? (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            ) : (
                              i + 1
                            )}
                          </span>
                          <span
                            className={`pt-0.5 text-sm md:text-base leading-snug transition-colors duration-300 ${
                              isActive
                                ? "text-text-primary"
                                : upcoming
                                  ? "text-text-tertiary group-hover/step:text-text-muted"
                                  : "text-text-muted"
                            }`}
                          >
                            {text}
                          </span>

                          {/* The walk-through's clock: when this bar fills, the next step opens. */}
                          {isActive && autoplay && (
                            <span
                              key={`${current.key}-${step}`}
                              className="setup-step-bar absolute bottom-0 inset-inline-start-0 h-0.5 w-full bg-accent-teal/60"
                              style={{
                                animationDuration: `${STEP_MS}ms`,
                                animationPlayState: running ? "running" : "paused",
                              }}
                              onAnimationEnd={() => setStep((s) => (s + 1) % current.steps.length)}
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-8 flex flex-col items-center lg:items-start gap-4">
                  <TrackedDownloadLink
                    location="downloads-page"
                    platform={current.key}
                    {...(current.cta.variant ? { variant: current.cta.variant } : {})}
                    href={current.cta.href}
                    {...(current.cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    {...(current.cta.download ? { download: true } : {})}
                    className={BTN}
                  >
                    <PlatformLogo icon={current.icon} className="w-5 h-5" />
                    {current.cta.label}
                  </TrackedDownloadLink>
                  {ratings}
                </div>
              </div>
            </div>

            {/* ── Image column ────────────────────────────────── */}
            {/* The home CTA card's picture, the same for every platform. It
                bleeds to the card edges and the notch cuts its bottom-end corner;
                the spacer holds the image's own aspect, so a taller copy column
                only crops it sideways. */}
            <div className="relative overflow-hidden border-t lg:border-t-0 lg:border-s border-overlay/5">
              <div className="aspect-[1009/794]" aria-hidden="true" />
              <Image
                src="/images/dopplerdownload.avif"
                alt="Doppler VPN app interface"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <span className="notch-edge" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
