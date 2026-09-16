'use client';

import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { ICON_BTN, TOOLTIP, TOOLTIP_IDLE, TOOLTIP_SHOWN } from './ui';

const TONES = {
  default: '',
  teal: 'text-accent-teal',
  telegram: 'text-telegram',
} as const;

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** The accessible name, and the tooltip unless `tooltip` says more. */
  label: string;
  /** Richer tooltip text. It is shown to sighted users only; put anything a screen reader needs in `label`. */
  tooltip?: ReactNode;
  /** Pin the tooltip open (the "Copied" confirmation). */
  tooltipShown?: boolean;
  /** Renders a link instead of a button. */
  href?: string;
  tone?: keyof typeof TONES;
  /** A status mark on the icon: `dot` = linked, `plus` = not yet. */
  badge?: 'dot' | 'plus';
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}

/**
 * An icon-only control with a tooltip. Icon-only is only acceptable because the
 * tooltip names it on hover and keyboard focus, and `aria-label` names it to a
 * screen reader — never ship one without `label`.
 */
export function IconButton({
  label,
  tooltip,
  tooltipShown = false,
  href,
  tone = 'default',
  badge,
  className = '',
  ref,
  children,
  ...rest
}: IconButtonProps) {
  const classes = `${ICON_BTN} ${TONES[tone]} ${className}`;
  const inner = (
    <>
      {children}
      {badge === 'dot' && (
        <span
          aria-hidden="true"
          className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-accent-teal-light ring-2 ring-bg-secondary"
        />
      )}
      {badge === 'plus' && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-bg-elevated text-[11px] font-bold leading-none text-text-muted ring-1 ring-overlay/15"
        >
          +
        </span>
      )}
    </>
  );

  return (
    <span className="group/tip relative inline-flex">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={classes}>
          {inner}
        </a>
      ) : (
        <button ref={ref} type="button" aria-label={label} className={classes} {...rest}>
          {inner}
        </button>
      )}
      {/* A tooltip over the button's own open popover would only cover it. */}
      {!rest['aria-expanded'] && (
        <span aria-hidden="true" className={`${TOOLTIP} ${tooltipShown ? TOOLTIP_SHOWN : TOOLTIP_IDLE}`}>
          {tooltip ?? label}
        </span>
      )}
    </span>
  );
}
