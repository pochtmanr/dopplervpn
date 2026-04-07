# CRO Sprint: Blog CTA + Hero Polish + Event Tracking

**Date:** 2026-03-23
**Status:** Approved
**Goal:** Increase app download conversion rate from blog traffic (50%+ of all visitors) and homepage visitors.

---

## Problem Statement

Weekly analytics show ~700 visitors/week with ~50% landing on blog posts across 20+ locales. The existing blog CTA (`BlogCta`) sits at the very bottom of posts (after content, share buttons, and related posts). Most readers bounce before reaching it. The hero section CTAs lack platform icons and have low-contrast styling. No CTA click tracking exists, making optimization impossible.

### Traffic Breakdown (Weekly)

| Category | Visitors | Intent |
|----------|----------|--------|
| Blog posts | ~350 | Low-Medium |
| Homepages | ~100 | Medium |
| Downloads | ~65 | High |
| Privacy/Terms | ~55 | Due diligence |
| About | ~46 | Trust evaluation |
| Support | ~45 | Existing users |
| Account | ~43 | Active users |
| Bypass-censorship | ~42 | Very High |

---

## Changes

### 1. Sticky Mobile CTA Bar on Blog Posts

**What:** Fixed bottom bar on mobile that appears after 30% scroll depth.

**Behavior:**
- Hidden on initial load, slides up after user scrolls 30% of article
- Shows platform-detected CTA: Apple icon + "Get Doppler VPN" or Play Store icon + "Get Doppler VPN"
- Desktop: show as slim banner at bottom of viewport (not full sticky bar)
- Dismissable via X button — stores dismissal in sessionStorage (reappears on next page)
- Auto-hides when the existing `BlogCta` section enters viewport (IntersectionObserver)
- Doppler only — no Simnetiq, single focused action

**Component:** `BlogStickyBar` — client component (`"use client"`)

**Styling:**
- Dark semi-transparent background (`bg-bg-primary/95 backdrop-blur-sm`)
- Teal accent button matching brand
- Note: `<body>` already has `padding-bottom: env(safe-area-inset-bottom)` in globals.css — the sticky bar should NOT add its own safe area padding to avoid doubling. It positions itself at `bottom: 0` and relies on the body padding.
- Height: ~56px on mobile, ~48px on desktop
- z-index above content but below navbar

**Props:**
- `ctaText: string` (from i18n)
- `dismissLabel: string` (from i18n, aria-label for X button)

**Internal behavior:**
- Detects platform internally via `useEffect` + UA parsing (same pattern as `HeroCTAsWrapper`)
- Hardcodes App Store / Play Store URLs internally (same as `BlogCta`)
- Uses its own IntersectionObserver on a sentinel `<div id="blog-cta-sentinel">` placed before `BlogCta` in the page — no ref passing needed
- Queries `document.getElementById('blog-cta-sentinel')` on mount to set up observer

### 2. Inline Blog CTA Banner

**What:** Compact CTA card injected mid-article after the 3rd heading (`<h2>`).

**Behavior:**
- Injected via a custom `h2` renderer in `BlogContent`'s `ReactMarkdown` `components` prop
- A closure counter tracks how many `<h2>` elements have rendered; after the 3rd one, it renders `<BlogInlineCta />` immediately below that heading
- If article has fewer than 3 headings, fall back to injecting after the 2nd heading (or skip if only 1 heading)
- Platform-aware download button (detects platform internally, same pattern as `HeroCTAsWrapper`)

**Component:** `BlogInlineCta` — client component

**Styling:**
- Bordered card with subtle teal left accent border
- Doppler icon (small, 32px) + headline + platform button
- Compact: fits within `max-w-3xl` prose content width
- Distinct from article content (slightly different bg, rounded corners)
- Not overly promotional — feels like a contextual recommendation

**Copy (i18n):**
- Headline: "Protect your privacy with Doppler VPN"
- Subtext: "Free. No registration. No logs."
- Button: "Download for [iOS/Android/Desktop]"

### 3. Hero CTA Polish

**Changes to `hero-ctas.tsx`:**

a) **Platform icons on buttons:**
   - iOS: Apple logo SVG (16px) before "App Store" text
   - Android: Play Store logo SVG (16px) before "Google Play" text
   - Desktop: Download icon (16px) before "Download App" text

b) **Increased primary CTA contrast:**
   - Current: `bg-accent-teal/20 text-accent-teal`
   - New: `bg-accent-teal text-bg-primary` (solid teal, dark text)
   - Hover: `hover:bg-accent-teal/90`

c) **Mobile positioning:**
   - Reduce hero `pt-28` to `pt-20` on mobile only: `pt-20 sm:pt-28`
   - Saves ~32px vertical space, pushes CTAs higher above fold

d) **Subtle attention animation on primary CTA:**
   - One-time teal glow pulse on mount: `animation: pulse-glow 1.5s ease-out 1` (plays exactly once, then stops)
   - Keyframe: box-shadow grows from 0 to `0 0 20px rgba(teal, 0.3)` and back to 0
   - `animation-fill-mode: none` — button returns to normal state after animation

### 4. Bypass-Censorship Page CTA

**What:** Add a prominent download section to `/bypass-censorship` pages.

**Behavior:**
- Reuse `BlogInlineCta` component mid-page
- Add `BlogStickyBar` to this page as well
- These 42 visitors/week have highest intent — they're actively seeking a solution

### 5. CTA Event Tracking

**What:** Vercel Analytics custom events on all CTA clicks.

**Implementation:**
- Use `@vercel/analytics` `track()` function
- Wrapper: `trackCta(location, platform, extras?)` utility

**Event schema:**
```typescript
track('cta_click', {
  location: 'hero' | 'blog-sticky' | 'blog-inline' | 'blog-bottom' | 'bypass-censorship' | 'footer' | 'downloads',
  platform: 'ios' | 'android' | 'desktop',
  locale: string,
  page_path: string,
})
```

**Where to add:**
- Hero CTAs (`hero-ctas.tsx`)
- Blog sticky bar (new)
- Blog inline CTA (new)
- Existing `BlogCta` bottom section
- Footer app store badges
- Downloads page buttons
- Bypass-censorship page CTAs

### 6. Downloads Page Quick Audit

**What:** Review `/downloads` page for conversion gaps.
- Ensure platform detection auto-highlights the right download
- Add prominent store badges with icons
- Add trust signals (same as hero: no logs, no registration, DPI-resistant)

---

## Files to Create

| File | Type | Purpose |
|------|------|---------|
| `src/components/blog/blog-sticky-bar.tsx` | Client component | Sticky bottom CTA bar |
| `src/components/blog/blog-inline-cta.tsx` | Client component | Mid-article CTA card |
| `src/lib/track-cta.ts` | Utility | CTA event tracking wrapper |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/hero/hero-ctas.tsx` | Add icons, increase contrast, add tracking |
| `src/components/sections/hero.tsx` | Reduce mobile top padding |
| `src/components/blog/blog-cta.tsx` | Add tracking to existing bottom CTA, expose ref |
| `src/app/[locale]/blog/[slug]/page.tsx` | Add sticky bar + sentinel div before BlogCta |
| `src/components/blog/blog-content.tsx` | Add custom h2 renderer with counter for inline CTA injection |
| `src/app/[locale]/bypass-censorship/page.tsx` | Add sticky bar + inline CTA |
| `src/components/layout/footer.tsx` | Add tracking to store badges |
| `messages/en.json` | Add new CTA translation keys |
| `messages/*.json` (all 24 locales) | Add translated CTA strings via existing blog translation pipeline or manually |
| `src/app/globals.css` | Add `animate-pulse-subtle` keyframe |

## Out of Scope

- A/B testing infrastructure (future phase)
- Navbar CTA button (too aggressive for current brand)
- Popup/modal CTAs (bad UX, high bounce risk)
- Simnetiq promotion in blog CTAs (single focus = higher conversion)
- Blog content strategy changes

## Success Metrics

- CTA click rate > 0 (currently unmeasured)
- Blog-to-download funnel: target 2-3% click-through on sticky/inline CTAs
- Downloads page visit increase from blog traffic
- App Store impressions increase (correlates with CTA clicks)
