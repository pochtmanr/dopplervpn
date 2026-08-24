import { type ReactNode } from "react";

// `.section` / `.section-title` / `.section-subtitle` are defined in
// globals.css (@layer components). `font-display` is kept as a literal token —
// it resolves to no CSS today (there is no `--font-display` theme key), so
// @apply-ing it would fail; removing it would be a behaviour change to make
// deliberately, not a side effect of this refactor.

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div" | "article";
}

export function Section({
  children,
  className = "",
  id,
  as: Component = "section",
}: SectionProps) {
  return (
    <Component
      id={id}
      className={className ? `section ${className}` : "section"}
    >
      <div className="mx-auto max-w-site">{children}</div>
    </Component>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  /** "h1" is for pages whose SectionHeader IS the page heading — currently
   *  only the blog index, which otherwise renders no h1 at all. */
  headingLevel?: "h1" | "h2" | "h3";
}

export function SectionHeader({
  title,
  subtitle,
  centered = true,
  className = "",
  headingLevel = "h2",
}: SectionHeaderProps) {
  const Heading = headingLevel;
  return (
    <div
      className={["mb-12 md:mb-16", centered ? "text-center" : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Heading className="font-display section-title">
        {title}
      </Heading>
      {subtitle && (
        <p className="section-subtitle">
          {subtitle}
        </p>
      )}
    </div>
  );
}
