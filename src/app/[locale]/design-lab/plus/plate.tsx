'use client';

import { useMemo } from 'react';
import { GlyphField } from '@/components/glyph/glyph-field';
import { useMountOnView } from '@/components/glyph/use-mount-on-view';
import { TRAFFIC_ASPECT, trafficScene } from '@/components/glyph/traffic-scene';

/**
 * A terminal plate for a Calm+ card, on the traffic grid so every plate in the
 * lab is one glyph size. Scenes hold methods and cannot cross from the server,
 * so the server passes the step index and the scene is built here.
 */
export function PlusPlate({ index }: { index: number }) {
  const [hostRef, mounted] = useMountOnView<HTMLDivElement>();
  const scene = useMemo(() => trafficScene(index), [index]);
  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{ aspectRatio: TRAFFIC_ASPECT }}
      className={`relative w-full transition-opacity duration-700 motion-reduce:transition-none ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      {mounted && <GlyphField scene={scene} loop={false} hover />}
    </div>
  );
}
