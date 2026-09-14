"use client";

import { useEffect, useRef, useState } from "react";

/**
 * One-way "has this come near the viewport yet". A settle-once glyph field
 * assembles from its own start, so mounting it at page load would spend that
 * assembly off-screen; mounting it here means the first print is seen. Pausing
 * after that is the field's own job, so the observer disconnects on first sight.
 */
export function useMountOnView<T extends Element>(rootMargin = "120px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        // A callback can batch several entries for one target; the last is current.
        if (!entries[entries.length - 1].isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return [ref, inView] as const;
}
