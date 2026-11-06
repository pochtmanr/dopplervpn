import Image from "next/image";
import { TrackedDownloadLink } from "@/components/downloads/tracked-download-link";
import { AppleIcon } from "@/components/icons/platform";
import { Link } from "@/i18n/navigation";
import { APPLE_APP_STORE_URL, GUIDE_COVERS } from "@/config/platforms/apple";

/**
 * The download card closing every guide: one App Store button (the listing covers
 * iPhone, iPad, Mac and Apple Watch) and a link to the other platforms. Calm+ only,
 * like the /guides pages.
 */
export function GuideDownloadCard({
  title,
  body,
  cta,
  other,
  imageAlt,
}: {
  title: string;
  body: string;
  cta: string;
  other: string;
  imageAlt: string;
}) {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-[28px] bg-(--c-card) md:grid-cols-[1fr_1fr]">
      <div className="flex flex-col justify-center gap-5 p-6 sm:p-10">
        <h2 className="font-display text-2xl font-bold leading-tight text-(--c-text) sm:text-3xl">{title}</h2>
        <p className="text-[17px] leading-relaxed text-(--c-muted)">{body}</p>
        <div id="blog-cta-sentinel" aria-hidden="true" />
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <TrackedDownloadLink
            location="guides"
            platform="ios"
            href={APPLE_APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="plus-btn inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-(--c-accent-fill) px-6 text-[15px] font-bold text-white hover:bg-(--c-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--c-bg)"
          >
            <AppleIcon className="h-[18px] w-[18px]" />
            {cta}
          </TrackedDownloadLink>
          <Link href="/downloads" className="text-[15px] font-bold text-(--c-accent) hover:underline hover:underline-offset-4">
            {other}
          </Link>
        </div>
      </div>
      <div className="relative aspect-[3/2] md:aspect-auto" style={{ backgroundColor: GUIDE_COVERS["doppler-on-iphone-and-mac"].bg }}>
        <Image src={GUIDE_COVERS["doppler-on-iphone-and-mac"].src} alt={imageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
    </div>
  );
}
