'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

/**
 * Open state for a popover or menu anchored to a trigger inside `rootRef`.
 *
 * Behaves like the support dialogs (ui/modal-parts `useModalDialog`) minus the
 * parts that only make sense for a modal: Esc closes and returns focus to the
 * trigger; a click outside or tabbing out closes too, but there is no focus
 * trap and no scroll lock — the page behind stays usable.
 *
 * `shown` flips two frames after opening, so the panel paints hidden once and
 * then transitions in (StepPanel's idiom).
 */
export function usePopover() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  /* Enter transition, then focus the first control in the panel */
  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    panelRef.current?.querySelector<HTMLElement>('button, a[href], [role="menuitem"]')?.focus();
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open]);

  /* Esc, click outside, focus leaving */
  useEffect(() => {
    if (!open) return;
    const root = rootRef.current;
    const onPointerDown = (e: PointerEvent) => {
      if (root && !root.contains(e.target as Node)) close(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && root && !root.contains(next)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    root?.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      root?.removeEventListener('focusout', onFocusOut);
    };
  }, [open, close]);

  const triggerProps = {
    ref: triggerRef,
    'aria-expanded': open,
    'aria-controls': open ? panelId : undefined,
    onClick: () => setOpen((o) => !o),
  };

  return { open, shown, close, rootRef, panelRef, panelId, triggerProps };
}

/** Arrow keys, Home and End move between a menu's items (WAI-ARIA menu pattern). */
export function onMenuKeyDown(e: KeyboardEvent<HTMLElement>) {
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  if (items.length === 0) return;
  const at = items.indexOf(document.activeElement as HTMLElement);
  let next = -1;
  if (e.key === 'ArrowDown') next = (at + 1) % items.length;
  else if (e.key === 'ArrowUp') next = (at - 1 + items.length) % items.length;
  else if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = items.length - 1;
  if (next === -1) return;
  e.preventDefault();
  items[next].focus();
}
