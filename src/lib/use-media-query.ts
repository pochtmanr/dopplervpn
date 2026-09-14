"use client";

import { useEffect, useState } from "react";

/**
 * false on the server and on the first client render, then the live match.
 * For mounting heavy, breakpoint-only artwork: a CSS `hidden` class still runs
 * the component's effects, this keeps it from mounting at all.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
