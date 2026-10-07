import { PLUS_LABEL } from "@/app/[locale]/design-lab/plus-recipes";

/**
 * "On this page": the article's H2s. A sticky list in the desktop rail, a
 * collapsed <details> above the body on mobile. Plain anchors, no JS.
 * `plus`: Calm+ (no mono caps, the card tone instead of a hairline box).
 */
export function ArticleToc({
  headings,
  label,
  variant,
  plus = false,
}: {
  headings: Array<{ id: string; text: string }>;
  label: string;
  variant: "rail" | "inline";
  plus?: boolean;
}) {
  const list = (
    <ol className={plus ? "space-y-2.5 text-[15px]" : "space-y-2 text-sm"}>
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            className={
              plus
                ? "block leading-snug text-(--c-muted) hover:text-(--c-accent) transition-colors"
                : "block leading-snug text-text-muted hover:text-accent-teal-light transition-colors"
            }
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "rail") {
    return (
      <nav aria-label={label}>
        <p className={plus ? `mb-3 ${PLUS_LABEL}` : "mb-3 font-mono text-xs uppercase tracking-wider text-text-tertiary"}>{label}</p>
        {list}
      </nav>
    );
  }
  return (
    <details
      className={
        plus
          ? "lg:hidden mb-10 rounded-2xl bg-(--c-card) px-5 py-4 [&_ol]:mt-3"
          : "lg:hidden mb-10 rounded-xl border border-overlay/10 bg-bg-secondary/40 px-4 py-3 [&_ol]:mt-3"
      }
    >
      <summary className={plus ? `cursor-pointer ${PLUS_LABEL}` : "cursor-pointer font-mono text-xs uppercase tracking-wider text-text-tertiary"}>
        {label}
      </summary>
      <nav aria-label={label}>{list}</nav>
    </details>
  );
}
