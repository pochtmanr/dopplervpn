import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

// `rounded-2xl bg-bg-secondary/50 backdrop-blur-sm` collapse into `.card`
// (globals.css, @layer components). The two border-colour utilities stay as
// utilities on purpose: two call sites pass `border-accent-teal/20`, which in
// the current utility source order LOSES to the base `border-overlay/5`.
// Moving the base border into the components layer would make those overrides
// suddenly win — a visual change, not a refactor. Same reason keeps
// `hover:border-accent-teal/20` out of `.card-hover`.
const baseStyles = "card border border-overlay/5";
const hoverStyles = "card-hover hover:border-accent-teal/20";

const paddingStyles = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={[
        baseStyles,
        paddingStyles[padding],
        hover ? hoverStyles : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <h3
      className={`font-display text-xl md:text-2xl font-semibold text-text-primary ${className}`}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({
  children,
  className = "",
}: CardDescriptionProps) {
  return (
    <p className={`text-text-muted text-base leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={className}>{children}</div>;
}
