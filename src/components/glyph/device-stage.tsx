"use client";

import { useMemo } from "react";
import { GlyphField } from "./glyph-field";
import { useMountOnView } from "./use-mount-on-view";
import { DEVICE_ASPECT, deviceScene, type DeviceKind } from "./device-scene";

/**
 * The device art on a platform card.
 *
 * A Scene carries methods and cannot cross the Server→Client boundary, so the
 * page hands over a plain `kind` and the Scene is built here. The field mounts
 * when the card first comes near the viewport: a settle-once scene assembles
 * from its own start, so mounting at page load would spend that assembly
 * off-screen and leave nothing but a finished picture to scroll down to.
 */
export function DeviceStage({ kind }: { kind: DeviceKind }) {
  const [hostRef, mounted] = useMountOnView<HTMLDivElement>();
  const scene = useMemo(() => deviceScene(kind), [kind]);

  return (
    <div
      ref={hostRef}
      style={{ aspectRatio: DEVICE_ASPECT }}
      className={`relative w-full transition-opacity duration-700 motion-reduce:transition-none ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* `hover` is what warms the lattice to teal under the card's group. */}
      {mounted && <GlyphField scene={scene} loop={false} hover />}
    </div>
  );
}
