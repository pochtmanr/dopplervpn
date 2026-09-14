# UI Polish: Layout, Loading, & Animation Refinement

> **Superseded (marketing motion):** the "opacity-only, 200ms" rule below no longer applies to the
> landing. See [`landing/DESIGN.md`](../../DESIGN.md) §5.

**Date:** 2026-02-23
**Scope:** Option A — Surgical Fix (~12 files)
**Goal:** Enterprise-grade polish for admin panel layout, loading states, hero animations, and accessibility.

---

## Decisions Made

- **Admin animations:** Pure CSS/Tailwind only (no Framer Motion in admin)
- **Marketing animations:** Opacity-only, 200ms duration (no translateY/X)
- **Loading component:** Spinning ring, centered, CSS-only
- **Approach:** Surgical — fix what's broken, no new features

---

## 1. Admin Layout Fix

### Problem
VPN pages add `p-8` to their root div inside the layout's `<main className="p-8">`, creating 64px padding. All other pages have 32px.

### Changes

| File | Current | Fix |
|------|---------|-----|
| `vpn/page.tsx` | `<div className="p-8 max-w-7xl mx-auto">` | `<div className="max-w-7xl mx-auto space-y-8">` |
| `vpn/[username]/page.tsx` | `<div className="p-8 max-w-3xl mx-auto">` | `<div className="max-w-3xl mx-auto space-y-6">` |
| `vpn/[username]/page.tsx` loading | `<div className="p-8 text-text-muted">` | `<AdminLoader />` |
| `messages/page.tsx` | `<div>` (no class) | `<div className="space-y-6">` |

---

## 2. Centralized Admin Loader

### New file: `src/components/admin/admin-loader.tsx`

```tsx
"use client";

export function AdminLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-overlay/20 border-t-accent-teal rounded-full animate-spin" />
      {label && (
        <p className="mt-4 text-sm text-text-muted">{label}</p>
      )}
    </div>
  );
}
```

### Replacements

| File | Current Loading UI | Replacement |
|------|-------------------|-------------|
| `(dashboard)/page.tsx` | `<p>Loading dashboard...</p>` | `<AdminLoader />` |
| `messages/page.tsx` | `<div>Loading…</div>` | `<AdminLoader />` |
| `messages/[telegramId]/page.tsx` | `<div>Loading conversation…</div>` | `<AdminLoader />` |
| `vpn/page.tsx` (servers) | `<div>Loading servers...</div>` | `<AdminLoader />` |
| `vpn/page.tsx` (users) | `<div>Loading users...</div>` | `<AdminLoader />` |
| `vpn/[username]/page.tsx` | `<div>Loading...</div>` | `<AdminLoader />` |
| `promo/page.tsx` | `<p>Loading promo codes...</p>` | `<AdminLoader />` |

Labels are optional — the spinner alone is clear enough. We may add labels for longer operations (e.g., sync).

---

## 3. Animation Overhaul

### `src/lib/animations.ts` — Full rewrite

```ts
// All variants: opacity-only, 200ms, easeOut
export const fadeUpVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

export const cardVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

export const slideInFromLeft = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

export const slideInFromRight = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

// Hover scale stays — it's interactive, not entrance
export const scaleOnHoverVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } },
};
```

### Hero-specific changes in `hero.tsx`

- Right column: `initial={{ opacity: 0 }}` / `animate={{ opacity: 1 }}` / `transition={{ delay: 0.2, duration: 0.3 }}`
- Remove `x: 30` from right column

### Pricing pill in `pricing.tsx`

- Change spring transition to: `type: "tween", duration: 0.2`

---

## 4. Reduced Motion Support

### Add to `src/app/globals.css`

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Global safety net for all CSS animations/transitions. Framer Motion animations will still complete (opacity changes are safe for reduced-motion users — no vestibular impact).

---

## 5. Hero Hydration

With opacity-only animations at 200ms, the SSR → hydration → animate cycle produces a clean, intentional fade-in rather than a jarring flash. No additional fix needed beyond the animation rewrite.

---

## Files Touched

1. `src/components/admin/admin-loader.tsx` — NEW
2. `src/lib/animations.ts` — REWRITE
3. `src/app/globals.css` — ADD reduced-motion
4. `src/app/admin-dvpn/(dashboard)/page.tsx` — loading state
5. `src/app/admin-dvpn/(dashboard)/messages/page.tsx` — loading state + spacing
6. `src/app/admin-dvpn/(dashboard)/messages/[telegramId]/page.tsx` — loading state
7. `src/app/admin-dvpn/(dashboard)/vpn/page.tsx` — padding fix + loading states
8. `src/app/admin-dvpn/(dashboard)/vpn/[username]/page.tsx` — padding fix + loading state
9. `src/app/admin-dvpn/(dashboard)/promo/page.tsx` — loading state
10. `src/components/sections/hero.tsx` — animation trim
11. `src/components/sections/pricing.tsx` — spring → tween

---

## Quality Checklist

- [ ] All admin pages have 32px padding (from layout only)
- [ ] All admin loading states use `<AdminLoader />`
- [ ] No Framer Motion in admin components
- [ ] All entrance animations are opacity-only, ≤200ms
- [ ] No translateY/X in entrance animations
- [ ] Stagger reduced to 50ms children, 100ms delay
- [ ] Pricing pill uses tween, not spring
- [ ] `prefers-reduced-motion` in globals.css
- [ ] Hero fades in cleanly without flash
- [ ] No layout shifts during load
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors (`npm run typecheck`)
