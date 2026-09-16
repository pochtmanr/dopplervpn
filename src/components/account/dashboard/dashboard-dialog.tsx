'use client';

import { useRef, type ReactNode } from 'react';
import { DIALOG_PANEL, useModalDialog, useVisualViewportFit } from '@/components/ui/modal-parts';
import { SCRIM } from './ui';

interface DashboardDialogProps {
  labelledBy: string;
  onClose: () => void;
  /** While true, Esc and the scrim do nothing (e.g. a delete in flight). */
  locked?: boolean;
  /** Width class for the sizing wrapper, e.g. `sm:max-w-md`. */
  width: string;
  /** Panel padding and layout. Kept out of DIALOG_PANEL on purpose (card-recipes.ts). */
  className?: string;
  children: ReactNode;
}

/**
 * The account dashboard's dialogs, built like the support ones (ticket-modal.tsx):
 * scrim → sizing wrapper → flat DIALOG_PANEL, a bottom sheet below `sm`, with
 * useModalDialog's focus return, Esc, Tab trap and scroll lock.
 */
export function DashboardDialog({ labelledBy, onClose, locked = false, width, className = '', children }: DashboardDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const close = () => {
    if (!locked) onClose();
  };
  useModalDialog(panelRef, close);
  useVisualViewportFit(scrimRef);

  return (
    <div
      ref={scrimRef}
      className={SCRIM}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* Sizing wrapper: its height is indefinite, so the panel's h-full resolves to
          auto instead of stretching the panel to the viewport. */}
      <div className={`flex w-full ${width} max-h-full sm:max-h-[90vh] flex-col animate-[slideUp_200ms_ease-out]`}>
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          className={`${DIALOG_PANEL} min-h-0 overflow-y-auto max-sm:rounded-b-none max-sm:border-b-0 ${className}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
