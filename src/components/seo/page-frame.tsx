import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { MobileStickyCta } from "@/components/layout/mobile-sticky-cta";
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
import { CTA } from "@/components/sections/cta";
import { PricingBackdrop } from "@/components/glyph/pricing-glyphs";
import { RelatedRail, type RelatedRailItem } from "@/components/no-registration/related-rail";
import type { CtaLocation } from "@/lib/track-cta";

/**
 * Chrome shared by the Glyph Terminal SEO articles: centered hero on the
 * download-CTA grain, mobile related chips, sticky desktop rail, notched CTA.
 */
export function SeoPageFrame({
  hero,
  relatedItems,
  trackingLocation,
  children,
}: {
  hero: ReactNode;
  relatedItems: RelatedRailItem[];
  trackingLocation: CtaLocation;
  children: ReactNode;
}) {
  return (
    <>
      <main className="overflow-x-clip">
        <section className="relative overflow-hidden bg-bg-secondary/30 pt-28 sm:pt-32 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8">
          <PricingBackdrop />
          <div className="relative mx-auto max-w-site py-6 md:py-10">
            {hero}
            <div className="lg:hidden mt-8">
              <RelatedRail items={relatedItems} variant="chips" />
            </div>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-site lg:grid lg:grid-cols-[minmax(0,1fr)_16.5rem] xl:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-10 xl:gap-12">
            <div className="min-w-0">{children}</div>
            <aside className="hidden lg:block pt-12 md:pt-20">
              <div className="sticky top-28">
                <RelatedRail items={relatedItems} />
              </div>
            </aside>
          </div>
        </div>

        <div id="blog-cta-sentinel" aria-hidden="true" />
        <CTA />
        <MobileStickyCta />
      </main>
      <BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation={trackingLocation} />
      <Footer />
    </>
  );
}
