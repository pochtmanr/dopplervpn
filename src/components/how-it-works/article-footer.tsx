import { Link } from "@/i18n/navigation";
import type { ArticleSource } from "@/lib/how-it-works";
import { CARD, CARD_HAIRLINE } from "@/components/ui/card-recipes";

/** Sources, then the hand-off to the next step of the traffic flow. */
export function ArticleFooter({
  sources,
  sourcesLabel,
  next,
}: {
  sources: ArticleSource[];
  sourcesLabel: string;
  next: { href: string; kicker: string; title: string; desc: string };
}) {
  return (
    <div className="mt-16 space-y-12">
      <section aria-labelledby="sources">
        <h2 id="sources" className="font-display text-xl font-semibold text-text-primary mb-4">
          {sourcesLabel}
        </h2>
        <ol className="list-decimal ps-5 space-y-2 text-sm text-text-muted marker:text-text-tertiary">
          {sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 decoration-overlay/30 hover:text-accent-teal-light break-words">
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <Link href={next.href} className={`${CARD} p-6 sm:p-8 block`}>
        <span className={CARD_HAIRLINE} />
        <span className="block font-mono text-xs tracking-wide text-accent-teal-light">{next.kicker}</span>
        <span className="mt-2 flex items-center justify-between gap-4">
          <span>
            <span className="block font-display text-xl sm:text-2xl font-semibold text-text-primary">{next.title}</span>
            <span className="mt-1 block text-sm text-text-muted">{next.desc}</span>
          </span>
          <svg className="w-6 h-6 shrink-0 text-accent-teal rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </Link>
    </div>
  );
}
