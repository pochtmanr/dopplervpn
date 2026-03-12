"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface ScrollHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ScrollHeader({ children, className }: ScrollHeaderProps) {
  const [compact, setCompact] = useState(false);
  const lastScrollY = useRef(0);

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Don't compact while language panel (or other nav element) holds a lock
      if (headerRef.current?.hasAttribute("data-nav-lock")) return;

      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      if (currentY < 80) {
        setCompact(false);
      } else if (delta > 5) {
        setCompact(true);
      } else if (delta < -5) {
        setCompact(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (!compact) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!compact) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <header
      ref={headerRef}
      className={`group ${className ?? ""}`}
      data-compact={compact || undefined}
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      tabIndex={compact ? 0 : undefined}
      role={compact ? "button" : undefined}
      aria-label={compact ? "Scroll to top" : undefined}
      style={{ cursor: compact ? "pointer" : undefined }}
    >
      {children}
    </header>
  );
}
