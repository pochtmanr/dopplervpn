"use client";

import type { ReactNode, AnchorHTMLAttributes } from "react";

import {
  trackCta,
  type CtaDestination,
  type CtaLocation,
  type CtaPlatform,
  type CtaVariant,
} from "@/lib/track-cta";

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onClick"> {
  /** Where on the site the click happened. Reported as `cta_location`. */
  location: CtaLocation;
  platform: CtaPlatform;
  variant?: CtaVariant;
  /** Override the platform-derived destination (rarely needed). */
  destination?: CtaDestination;
  children: ReactNode;
}

/**
 * The one instrumented <a> for store and installer links.
 *
 * It is a client component with an entirely serialisable prop surface, so
 * server components render it directly — `t("…")` resolves to a plain string on
 * the server and crosses the boundary as `children`. That is what lets the
 * server-rendered footer, the SEO landing pages and the platform pages all
 * report through the same path as the client-side hero CTAs.
 *
 * `href` rides in via `anchorProps` and is forwarded to the tracker so
 * `file_download` can report `link_url`.
 */
export function TrackedDownloadLink({
  location,
  platform,
  variant,
  destination,
  children,
  ...anchorProps
}: Props) {
  return (
    <a
      {...anchorProps}
      onClick={() =>
        trackCta(location, platform, variant, undefined, undefined, {
          destination,
          href: typeof anchorProps.href === "string" ? anchorProps.href : undefined,
        })
      }
    >
      {children}
    </a>
  );
}
