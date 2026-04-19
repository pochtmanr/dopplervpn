"use client";

import type { ReactNode, AnchorHTMLAttributes } from "react";
import { trackCta, type CtaPlatform, type CtaVariant } from "@/lib/track-cta";

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onClick"> {
  platform: CtaPlatform;
  variant?: CtaVariant;
  children: ReactNode;
}

export function TrackedDownloadLink({
  platform,
  variant,
  children,
  ...anchorProps
}: Props) {
  return (
    <a
      {...anchorProps}
      onClick={() => trackCta("downloads-page", platform, variant)}
    >
      {children}
    </a>
  );
}
