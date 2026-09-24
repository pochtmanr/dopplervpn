/**
 * "On this page": the article's H2s. A sticky list in the desktop rail, a
 * collapsed <details> above the body on mobile. Plain anchors, no JS.
 */
export function ArticleToc({
  headings,
  label,
  variant,
}: {
  headings: Array<{ id: string; text: string }>;
  label: string;
  variant: "rail" | "inline";
}) {
  const list = (
    <ol className="space-y-2 text-sm">
      {headings.map((h) => (
        <li key={h.id}>
          <a href={`#${h.id}`} className="block leading-snug text-text-muted hover:text-accent-teal-light transition-colors">
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (variant === "rail") {
    return (
      <nav aria-label={label}>
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-text-tertiary">{label}</p>
        {list}
      </nav>
    );
  }
  return (
    <details className="lg:hidden mb-10 rounded-xl border border-overlay/10 bg-bg-secondary/40 px-4 py-3 [&_ol]:mt-3">
      <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-text-tertiary">{label}</summary>
      <nav aria-label={label}>{list}</nav>
    </details>
  );
}
