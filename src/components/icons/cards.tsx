import type { SVGProps } from "react";

type CardIconProps = SVGProps<SVGSVGElement> & { width?: number; height?: number };

/**
 * Brand-colored payment-card marks. Default 32x20 (credit-card aspect ratio).
 * Used in the pricing section to indicate accepted regular payment methods
 * alongside the crypto coin marks.
 */

export function VisaIcon({ width = 32, height = 20, ...props }: CardIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect width="32" height="20" rx="2.5" fill="#1A1F71" />
      <text
        x="16"
        y="14"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="8"
        fontWeight="900"
        fontStyle="italic"
        letterSpacing="0.4"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardIcon({ width = 32, height = 20, ...props }: CardIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect width="32" height="20" rx="2.5" fill="#FFFFFF" />
      <circle cx="13" cy="10" r="5.5" fill="#EB001B" />
      <circle cx="19" cy="10" r="5.5" fill="#F79E1B" fillOpacity="0.88" />
    </svg>
  );
}
