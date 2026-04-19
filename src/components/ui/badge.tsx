import { type ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "gold"
  | "teal"
  | "violet"
  | "amber"
  | "danger"
  | "outline"
  | "auto";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  /** Optional string used to deterministically pick a color when variant="auto". Falls back to stringified children. */
  seed?: string;
}

const variantStyles: Record<Exclude<BadgeVariant, "auto">, string> = {
  default: "bg-bg-primary border border-overlay/20 text-text-primary",
  gold:    "bg-bg-primary border border-accent-gold text-accent-gold",
  teal:    "bg-bg-primary border border-accent-teal text-accent-teal",
  violet:  "bg-bg-primary border border-accent-violet text-accent-violet",
  amber:   "bg-bg-primary border border-accent-amber text-accent-amber",
  danger:  "bg-bg-primary border border-danger text-danger",
  outline: "bg-bg-primary border border-accent-gold text-accent-gold",
};

const autoPalette: Array<Exclude<BadgeVariant, "auto" | "default" | "outline">> = [
  "teal",
  "gold",
  "violet",
  "amber",
  "danger",
];

// djb2 hash — deterministic, stable across builds. Used only for visual variety, not security.
function hashSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickAutoVariant(seed: string): Exclude<BadgeVariant, "auto"> {
  return autoPalette[hashSeed(seed) % autoPalette.length];
}

export function Badge({
  children,
  variant = "default",
  className = "",
  seed,
}: BadgeProps) {
  const resolved =
    variant === "auto"
      ? pickAutoVariant(seed ?? (typeof children === "string" ? children : String(children)))
      : variant;

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        ${variantStyles[resolved]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
