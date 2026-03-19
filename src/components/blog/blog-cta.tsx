"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Platform = "ios" | "android" | "desktop";

interface AppInfo {
  icon: string;
  name: string;
  tagline: string;
  appStoreLabel: string;
  playStoreLabel: string;
  appStoreHref: string;
  playStoreHref: string;
  accentColor: "teal" | "gold";
  promo?: { code: string; discount: string };
}

interface BlogCtaProps {
  title: string;
  subtitle: string;
  doppler: {
    name: string;
    tagline: string;
    appStore: string;
    playStore: string;
  };
  simnetiq: {
    name: string;
    tagline: string;
    appStore: string;
    playStore: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform detection
// ─────────────────────────────────────────────────────────────────────────────

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

// ─────────────────────────────────────────────────────────────────────────────
// Store Button Component
// ─────────────────────────────────────────────────────────────────────────────

interface StoreButtonProps {
  store: "apple" | "google";
  label: string;
  href: string;
  accent: "teal" | "gold";
}

function StoreButton({ store, label, href, accent }: StoreButtonProps) {
  const colors =
    accent === "teal"
      ? "bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30"
      : "bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${colors}`}
    >
      {store === "apple" ? (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
        </svg>
      )}
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Promo Row with copy button
// ─────────────────────────────────────────────────────────────────────────────

function PromoRow({ code, discount, accent }: { code: string; discount: string; accent: "teal" | "gold" }) {
  const [copied, setCopied] = useState(false);

  const colors = accent === "teal"
    ? { bg: "bg-accent-teal/10", border: "border-accent-teal/20", text: "text-accent-teal" }
    : { bg: "bg-accent-gold/10", border: "border-accent-gold/20", text: "text-accent-gold" };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className={`mb-4 flex items-center justify-between gap-2 px-3 py-2 rounded-lg ${colors.bg} border ${colors.border}`}>
      <div className="flex items-center gap-2 min-w-0">
        <svg className={`w-4 h-4 ${colors.text} flex-shrink-0`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
        </svg>
        <span className={`text-sm ${colors.text}`}>
          <span className="font-semibold">{code}</span>
          {" "}&mdash; {discount}
        </span>
      </div>
      <button
        onClick={copyCode}
        className={`flex-shrink-0 p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
          copied
            ? `${colors.bg} ${colors.text}`
            : `hover:${colors.bg} ${colors.text} opacity-60 hover:opacity-100`
        }`}
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H8.25m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m6 10.375a2.625 2.625 0 0 1-2.625-2.625" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App Promotion Card Component
// ─────────────────────────────────────────────────────────────────────────────

interface AppCardProps {
  app: AppInfo;
  platform: Platform;
}

function AppCard({ app, platform }: AppCardProps) {
  const showApple = platform === "ios" || platform === "desktop";
  const showGoogle = platform === "android" || platform === "desktop";

  return (
    <Card
      hover
      className="min-w-[280px] flex-shrink-0 snap-center md:min-w-0 md:flex-shrink"
    >
      {/* Header: Icon + Name */}
      <div className="flex items-start gap-3 mb-4">
        <Image
          src={app.icon}
          alt={app.name}
          width={56}
          height={56}
          className="w-14 h-14 rounded-[12px] shadow-md"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text-primary">
            {app.name}
          </h3>
          <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
            {app.tagline}
          </p>
        </div>
      </div>

      {/* Promo badge with copy */}
      {app.promo && (
        <PromoRow code={app.promo.code} discount={app.promo.discount} accent={app.accentColor} />
      )}

      {/* Store Buttons — platform-aware */}
      <div className="flex flex-wrap gap-2">
        {showApple && (
          <StoreButton
            store="apple"
            label={app.appStoreLabel}
            href={app.appStoreHref}
            accent={app.accentColor}
          />
        )}
        {showGoogle && (
          <StoreButton
            store="google"
            label={app.playStoreLabel}
            href={app.playStoreHref}
            accent={app.accentColor}
          />
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Carousel Dots Component
// ─────────────────────────────────────────────────────────────────────────────

interface CarouselDotsProps {
  count: number;
  activeIndex: number;
  onDotClick: (index: number) => void;
}

function CarouselDots({ count, activeIndex, onDotClick }: CarouselDotsProps) {
  return (
    <div className="flex justify-center gap-2 mt-4 md:hidden">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`
            w-2 h-2 rounded-full transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal
            ${
              index === activeIndex
                ? "bg-accent-teal w-6"
                : "bg-overlay/30 hover:bg-overlay/50"
            }
          `}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main BlogCta Component
// ─────────────────────────────────────────────────────────────────────────────

export function BlogCta({ title, subtitle, doppler, simnetiq }: BlogCtaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [promo, setPromo] = useState<{ code: string; discount: string } | undefined>(undefined);

  useEffect(() => {
    setPlatform(detectPlatform());

    fetch("/api/promo/active")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { code: string; discount_percent: number } | null) => {
        if (data?.code) {
          setPromo({ code: data.code, discount: `${data.discount_percent}% off` });
        }
      })
      .catch(() => {});
  }, []);

  const apps: AppInfo[] = [
    {
      icon: "/images/iosdopplerlogo.png",
      name: doppler.name,
      tagline: doppler.tagline,
      appStoreLabel: doppler.appStore,
      playStoreLabel: doppler.playStore,
      appStoreHref: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
      playStoreHref: "https://play.google.com/store/apps/details?id=org.dopplervpn.android",
      accentColor: "teal",
      promo,
    },
    {
      icon: "/images/iossimnetiqlogo.png",
      name: simnetiq.name,
      tagline: simnetiq.tagline,
      appStoreLabel: simnetiq.appStore,
      playStoreLabel: simnetiq.playStore,
      appStoreHref: "https://apps.apple.com/gb/app/simnetiq-travel-esim-data/id6755963262",
      playStoreHref: "https://play.google.com/store/apps/details?id=com.simnetiq.storeAndroid&hl=en",
      accentColor: "gold",
      promo,
    },
  ];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let cardWidth = container.offsetWidth * 0.85;

    const handleResize = () => {
      if (scrollRef.current) cardWidth = scrollRef.current.offsetWidth * 0.85;
    };

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(newIndex, apps.length - 1));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [apps.length]);

  const scrollToCard = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>("[data-app-card]");
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  return (
    <Reveal className="mt-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-2">
          {title}
        </h2>
        <p className="text-text-muted max-w-md mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Desktop: Side-by-side grid */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        {apps.map((app) => (
          <AppCard key={app.name} app={app} platform={platform} />
        ))}
      </div>

      {/* Mobile: Horizontal scroll carousel */}
      <div className="md:hidden">
        <div
          ref={scrollRef}
          className="
            flex gap-4 overflow-x-auto snap-x snap-mandatory
            -mx-4 px-4 pb-2
            scrollbar-none
          "
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {apps.map((app) => (
            <div key={app.name} data-app-card className="w-[85%] flex-shrink-0">
              <AppCard app={app} platform={platform} />
            </div>
          ))}
        </div>

        <CarouselDots
          count={apps.length}
          activeIndex={activeIndex}
          onDotClick={scrollToCard}
        />
      </div>
    </Reveal>
  );
}
