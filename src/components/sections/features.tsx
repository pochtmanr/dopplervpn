import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { BtcIcon, EthIcon, UsdtIcon, UsdcIcon } from "@/components/icons/crypto";

/* ─── Feature icons (teal stroke style) ─── */
const featureIcons: Record<string, React.ReactNode> = {
  noRegistration: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  ),
  vlessReality: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  cryptoPayment: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 8.5h3.25a2 2 0 0 1 0 4H10m0 0h3.5a2 2 0 0 1 0 4H10m0-8v9M9 6.5v2m0 7v2m3-11.5v2m0 7v2" />
    </svg>
  ),
  smartRouting: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  minimalData: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  dnsProtection: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
    </svg>
  ),
};

/* ─── Bento grid layout ─── */
const featureLayout: { key: string; colSpan: string; hasImage?: boolean; imagePath?: string; isWide?: boolean; href?: string }[] = [
  { key: "noRegistration", colSpan: "md:col-span-2", hasImage: true, imagePath: "/images/features/1.avif", href: "/no-registration-vpn" },
  { key: "vlessReality", colSpan: "", href: "/vless-vpn" },
  { key: "smartRouting", colSpan: "" },
  { key: "cryptoPayment", colSpan: "", href: "/pay-with-crypto" },
  { key: "minimalData", colSpan: "" },
  { key: "dnsProtection", colSpan: "md:col-span-3", isWide: true },
];

/* ─── Card CTA label (matches censorship-resistance regions card) ─── */
function CardCta({ label }: { label: string }) {
  return (
    <span className="mt-4 inline-flex items-center gap-2 text-accent-teal group-hover:text-accent-gold transition-colors text-sm font-medium">
      {label}
      <svg className="w-4 h-4 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
      </svg>
    </span>
  );
}

/* ─── Crypto coin stack (for the cryptoPayment feature card) ─── */
function CryptoIconStack() {
  return (
    <div className="flex items-center mb-4 h-10">
      <BtcIcon size={40} className="relative z-40 drop-shadow-sm" />
      <EthIcon size={40} className="relative z-30 -ms-3 drop-shadow-sm" />
      <UsdtIcon size={40} className="relative z-20 -ms-3 drop-shadow-sm" />
      <UsdcIcon size={40} className="relative z-10 -ms-3 drop-shadow-sm" />
    </div>
  );
}

/* ─── Standard feature card ─── */
function FeatureCard({ featureKey, title, description, ctaLabel }: { featureKey: string; title: string; description: string; ctaLabel?: string }) {
  return (
    <div className="group h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 hover:border-accent-teal/20 transition-colors">
      {featureKey === "cryptoPayment" ? (
        <CryptoIconStack />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-4">
          {featureIcons[featureKey]}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
      {ctaLabel && <CardCta label={ctaLabel} />}
    </div>
  );
}

/* ─── Featured card with background image ─── */
function FeaturedCard({ featureKey, title, description, imagePath, ctaLabel }: { featureKey: string; title: string; description: string; imagePath: string; ctaLabel?: string }) {
  return (
    <div className="relative h-full min-h-[280px] rounded-2xl overflow-hidden border border-overlay/10 group">
      <Image
        src={imagePath}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 66vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/95 via-bg-primary/60 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="w-10 h-10 rounded-xl bg-accent-teal/15 backdrop-blur-sm border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-3">
          {featureIcons[featureKey]}
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed">{description}</p>
        {ctaLabel && <CardCta label={ctaLabel} />}
      </div>
    </div>
  );
}

/* ─── Wide banner card (completelyFree) ─── */
function WideCard({ featureKey, title, description }: { featureKey: string; title: string; description: string }) {
  return (
    <div className="h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 flex items-start gap-5 hover:border-accent-teal/20 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal shrink-0">
        {featureIcons[featureKey]}
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ─── Features section ─── */
export function Features() {
  const t = useTranslations("features");

  return (
    <Section id="features">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featureLayout.map(({ key, colSpan, hasImage, imagePath, isWide, href }, i) => {
          const ctaLabel = href ? t("seeFullInfo") : undefined;
          const card = hasImage && imagePath ? (
            <FeaturedCard
              featureKey={key}
              title={t(`items.${key}.title`)}
              description={t(`items.${key}.description`)}
              imagePath={imagePath}
              ctaLabel={ctaLabel}
            />
          ) : isWide ? (
            <WideCard
              featureKey={key}
              title={t(`items.${key}.title`)}
              description={t(`items.${key}.description`)}
            />
          ) : (
            <FeatureCard
              featureKey={key}
              title={t(`items.${key}.title`)}
              description={t(`items.${key}.description`)}
              ctaLabel={ctaLabel}
            />
          );

          return (
            <Reveal key={key} delay={i * 50} className={colSpan}>
              {href ? <Link href={href} className="block h-full">{card}</Link> : card}
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
