"use client";

import { useRef, useEffect, useCallback, type ReactNode } from "react";
import Image from "next/image";

interface HeroParallaxProps {
  children: ReactNode;
}

export function HeroParallax({ children }: HeroParallaxProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const androidRef = useRef<HTMLDivElement>(null);
  const iphoneRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const sectionHeight = rect.height;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / sectionHeight));

    const iphoneDrift = progress * sectionHeight * 0.2;
    const androidDrift = progress * sectionHeight * 0.12;

    if (iphoneRef.current) {
      iphoneRef.current.style.transform = `translateY(${iphoneDrift}px)`;
    }
    if (androidRef.current) {
      androidRef.current.style.transform = `translateY(${androidDrift}px)`;
    }
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");

    const toggle = () => {
      if (mql.matches) {
        window.addEventListener("scroll", handleScroll, { passive: true });
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };

    toggle();
    mql.addEventListener("change", toggle);

    return () => {
      mql.removeEventListener("change", toggle);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div ref={wrapperRef} className="hero-animate hero-animate-delay-3 hidden lg:block relative h-[600px] overflow-hidden">
      {children}

      {/* Android device — behind frame, drifts down slower */}
      <div
        ref={androidRef}
        className="absolute will-change-transform"
        style={{ zIndex: 1, bottom: "30px", left: "50%", marginLeft: "-40px" }}
      >
        <div className="relative w-[240px] h-[480px] drop-shadow-2xl">
          <Image
            src="/images/android-hero.png"
            alt="Doppler VPN on Android"
            fill
            className="object-contain"
            sizes="240px"
          />
        </div>
      </div>

      {/* iPhone device — in front of frame, drifts down faster */}
      <div
        ref={iphoneRef}
        className="absolute will-change-transform"
        style={{ zIndex: 2, bottom: "50px", left: "50%", marginLeft: "-210px" }}
      >
        <div className="relative w-[260px] h-[520px] drop-shadow-2xl">
          <Image
            src="/images/iphone1.png"
            alt="Doppler VPN on iPhone — Protected"
            fill
            className="object-contain"
            sizes="260px"
          />
        </div>
      </div>
    </div>
  );
}
