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

// Colour triples live in globals.css (@layer components) as .badge-<variant>.
const variantStyles: Record<Exclude<BadgeVariant, "auto">, string> = {
  default: "badge-default",
  gold:    "badge-gold",
  teal:    "badge-teal",
  violet:  "badge-violet",
  amber:   "badge-amber",
  danger:  "badge-danger",
  outline: "badge-outline",
};

// px-3 / py-1 deliberately stay as utilities rather than moving into `.badge`.
// Call sites override them (pricing.tsx passes px-1.5 py-0.5 lg:px-2 lg:py-1)
// and in the current utility-vs-utility source order the *base* padding wins.
// Moving it to the components layer would let the override start winning —
// a silent visual change. Everything else in `.badge` is safe to collapse.
const baseStyles = "badge px-3 py-1";

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
      className={[baseStyles, variantStyles[resolved], className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
