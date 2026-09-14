import { Link } from "@/i18n/navigation";

export interface RelatedRailItem {
  href: string;
  title: string;
  desc: string;
  icon: "vless" | "crypto" | "bypass" | "noreg";
}

function RailIcon({ icon }: { icon: RelatedRailItem["icon"] }) {
  if (icon === "crypto") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M9.5 8.5h5.2M9.5 12h5.2M9.5 15.5h5.2M14 7.5v1M14 15.5v1" />
      </svg>
    );
  }
  if (icon === "bypass") {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5 14.25 3v7.5h6L9.75 21v-7.5H3.75Z" />
      </svg>
    );
  }
  if (icon === "noreg") {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function RailCard({ item }: { item: RelatedRailItem }) {
  return (
    <Link
      href={item.href}
      className="group flex items-center gap-2.5 rounded-xl border border-overlay/10 bg-bg-secondary/40 px-3 py-2.5 hover:bg-bg-secondary/70 hover:border-accent-teal/30 transition-colors"
    >
      <span className="flex w-8 h-8 shrink-0 items-center justify-center rounded-lg bg-bg-secondary/80 border border-accent-teal/20 text-accent-teal group-hover:bg-accent-teal/15 group-hover:border-accent-teal/40 transition-colors">
        <RailIcon icon={item.icon} />
      </span>
      <span className="min-w-0 flex-1 text-start">
        <span className="block font-display text-sm font-semibold leading-tight text-text-primary truncate">
          {item.title}
        </span>
        <span className="block text-xs leading-snug text-text-muted truncate">
          {item.desc}
        </span>
      </span>
      <svg
        className="w-3.5 h-3.5 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

function RailChip({ item }: { item: RelatedRailItem }) {
  return (
    <Link
      href={item.href}
      className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-overlay/10 bg-bg-secondary/40 px-3 py-2 hover:bg-bg-secondary/70 hover:border-accent-teal/30 transition-colors"
    >
      <span className="flex w-7 h-7 shrink-0 items-center justify-center rounded-full bg-bg-secondary/80 border border-accent-teal/20 text-accent-teal">
        <RailIcon icon={item.icon} />
      </span>
      <span className="font-display text-sm font-semibold text-text-primary whitespace-nowrap">
        {item.title}
      </span>
    </Link>
  );
}

/**
 * Compact related-page links. `stack` is the sticky desktop rail; `chips` is
 * the mobile strip under the hero — not part of the page header.
 */
export function RelatedRail({
  items,
  variant = "stack",
}: {
  items: RelatedRailItem[];
  variant?: "stack" | "chips";
}) {
  if (variant === "chips") {
    return (
      <nav aria-label="Related pages" className="flex flex-wrap justify-center gap-2">
        {items.map((item) => (
          <RailChip key={item.href} item={item} />
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Related pages" className="flex flex-col gap-2">
      {items.map((item) => (
        <RailCard key={item.href} item={item} />
      ))}
    </nav>
  );
}
