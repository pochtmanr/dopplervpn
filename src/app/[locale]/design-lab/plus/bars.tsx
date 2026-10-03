'use client';

import { useTranslations } from 'next-intl';
import { useInView } from '@/hooks/use-in-view';
import { PLANS } from '@/lib/facts';
import { PLUS_CARD, PLUS_META, PlusContainer, PlusHeading } from '../plus-recipes';

interface Bar {
  key: string;
  value: number;
  /** The figure printed at the end of the row. */
  label: string;
  doppler?: boolean;
}

/**
 * Live element: the bars fill once, in order, when the card scrolls in. Doppler's
 * bar is teal; the rest sit on the inset grey so only one thing on the card is lit.
 */
function BarsCard({ bars, max, names, note }: { bars: Bar[]; max: number; names: (k: string) => string; note: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={`${PLUS_CARD} justify-center gap-5`}>
      {bars.map((bar, i) => (
        <div key={bar.key}>
          <div className="mb-2 flex items-center justify-between gap-3 text-[15px]">
            <span className={bar.doppler ? 'font-bold text-(--c-accent)' : 'font-medium text-(--c-muted)'}>{names(bar.key)}</span>
            <span className={`tabular-nums ${bar.doppler ? 'font-bold text-(--c-accent)' : 'text-(--c-tert)'}`} dir="ltr">
              {bar.label}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-(--c-inset)">
            <div
              className={`h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none ${
                bar.doppler ? 'bg-(--c-accent)' : 'bg-(--c-tert)/45'
              }`}
              style={{ width: visible ? `${(bar.value / max) * 100}%` : '0%', transitionDelay: `${i * 100}ms` }}
            />
          </div>
        </div>
      ))}
      <p className={`pt-1 ${PLUS_META}`}>{note}</p>
    </div>
  );
}

/** Four figures beside the bars: a big serif number over a quiet label. */
function StatGrid({ stats }: { stats: { key: string; value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((s) => (
        <div key={s.key} className={`${PLUS_CARD} items-center justify-center text-center`}>
          <p className="plus-num text-4xl text-(--c-text) md:text-5xl">{s.value}</p>
          <p className={`mt-2 ${PLUS_META}`}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

const speedBars = [
  { key: 'doppler', value: 94, doppler: true },
  { key: 'wireguard', value: 89 },
  { key: 'nordvpn', value: 72 },
  { key: 'expressvpn', value: 68 },
  { key: 'openvpn', value: 51 },
] as const;

export function PlusSpeedComparison({ live = false }: { live?: boolean }) {
  const t = useTranslations('speedComparison');
  return (
    <PlusContainer className="py-10">
      <PlusHeading title={t('title')} subtitle={t('subtitle')} live={live} />
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <BarsCard
          bars={speedBars.map((b) => ({ ...b, label: `${b.value}%` }))}
          max={100}
          names={(k) => t(`bars.${k}`)}
          note={t('note')}
        />
        <StatGrid
          stats={(['overhead', 'latency', 'detection', 'throughput'] as const).map((k) => ({
            key: k,
            value: t(`stats.${k}.value`),
            label: t(`stats.${k}.label`),
          }))}
        />
      </div>
    </PlusContainer>
  );
}

/** As sections/price-comparison.tsx (competitor prices are theirs), cheapest first; ours from facts.ts. */
const priceBars = [
  { key: 'surfshark', value: 2.19 },
  { key: 'doppler', value: PLANS.annual.monthly, doppler: true },
  { key: 'nordvpn', value: 3.59 },
  { key: 'protonvpn', value: 3.99 },
  { key: 'expressvpn', value: 6.67 },
] as const;

export function PlusPriceComparison({ live = false }: { live?: boolean }) {
  const t = useTranslations('priceComparison');
  return (
    <PlusContainer className="py-10">
      <PlusHeading title={t('title')} subtitle={t('subtitle')} live={live} />
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <BarsCard
          bars={priceBars.map((b) => ({ ...b, label: `$${b.value.toFixed(2)}/mo` }))}
          max={Math.max(...priceBars.map((b) => b.value))}
          names={(k) => t(`vpns.${k}`)}
          note={t('note')}
        />
        <StatGrid
          stats={(['savings', 'trial', 'noRenewal', 'devices'] as const).map((k) => ({
            key: k,
            value: t(`stats.${k}.value`),
            label: t(`stats.${k}.label`),
          }))}
        />
      </div>
    </PlusContainer>
  );
}
