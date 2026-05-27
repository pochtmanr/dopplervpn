import { type ReactNode } from "react";

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
      className={`py-12 md:py-20 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </Component>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  headingLevel?: "h2" | "h3";
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
      className={`mb-12 md:mb-16 ${centered ? "text-center" : ""} ${className}`}
    >
      <Heading className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-text-primary mb-4">
        {title}
      </Heading>
      {subtitle && (
        <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
