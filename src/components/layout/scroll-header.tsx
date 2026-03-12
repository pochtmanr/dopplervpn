"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface ScrollHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ScrollHeader({ children, className }: ScrollHeaderProps) {
  const [compact, setCompact] = useState(false);
  const lastScrollY = useRef(0);
  const isDesktop = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    isDesktop.current = mq.matches;

    const handleMediaChange = (e: MediaQueryListEvent) => {
      isDesktop.current = e.matches;
      if (!e.matches) setCompact(false);
    };
    mq.addEventListener("change", handleMediaChange);

    const handleScroll = () => {
      if (!isDesktop.current) return;

      const currentY = window.scrollY;
      if (currentY < 80) {
        setCompact(false);
      } else if (currentY > lastScrollY.current) {
        setCompact(true);
      } else {
        setCompact(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      mq.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return (
    <header
      className={`group ${className ?? ""}`}
      data-compact={compact || undefined}
    >
      {children}
    </header>
  );
}
