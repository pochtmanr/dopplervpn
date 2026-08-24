import { type ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ComponentProps<"button">, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  external?: boolean;
  className?: string;
}

// The full utility lists live in globals.css (@layer components) as .btn /
// .btn-<variant> / .btn-<size>. Emitting the short names instead of ~400 chars
// of utilities per button matters because the App Router serialises every class
// attribute twice (HTML + RSC flight payload) on ~4,900 prerendered pages.
// Anything passed via `className` is a Tailwind utility and therefore still
// wins over these, since `utilities` is layered after `components`.
const variantStyles: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  external,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const combinedStyles = ["btn", variantStyles[variant], sizeStyles[size], className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedStyles}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedStyles} {...props}>
      {children}
    </button>
  );
}
