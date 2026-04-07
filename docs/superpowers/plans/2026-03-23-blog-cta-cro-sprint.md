# CRO Sprint: Blog CTA + Hero Polish + Event Tracking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase app download conversion from blog traffic (~50% of all visitors) by adding sticky/inline CTAs to blog posts, polishing hero CTAs with icons and contrast, adding CTA event tracking, and enhancing the bypass-censorship page CTAs.

**Architecture:** New client components (`BlogStickyBar`, `BlogInlineCta`) injected into the existing blog post page. A shared `trackCta()` utility wraps Vercel Analytics custom events. Hero CTAs get platform icons and solid-fill styling. The `BlogContent` component gets a custom `h2` renderer that injects the inline CTA after the 3rd heading.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, next-intl v3, @vercel/analytics, ReactMarkdown

**Spec:** `docs/superpowers/specs/2026-03-23-blog-cta-cro-sprint-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/track-cta.ts` | Create | CTA event tracking utility |
| `src/lib/detect-platform.ts` | Create | Shared platform detection (extracted from hero-ctas-wrapper) |
| `src/components/blog/blog-sticky-bar.tsx` | Create | Sticky bottom CTA bar for blog/bypass-censorship |
| `src/components/blog/blog-inline-cta.tsx` | Create | Mid-article CTA card |
| `src/components/hero/hero-ctas.tsx` | Modify | Add icons, solid CTA styling, tracking |
| `src/components/hero/hero-ctas-wrapper.tsx` | Modify | Use shared detectPlatform |
| `src/components/sections/hero.tsx` | Modify | Reduce mobile top padding |
| `src/components/blog/blog-content.tsx` | Modify | Custom h2 renderer for inline CTA injection |
| `src/components/blog/blog-cta.tsx` | Modify | Add tracking, add sentinel div |
| `src/app/[locale]/blog/[slug]/page.tsx` | Modify | Add BlogStickyBar + sentinel |
| `src/app/[locale]/bypass-censorship/page.tsx` | Modify | Add BlogStickyBar + tracking + icons |
| `src/components/layout/footer.tsx` | Modify | Add tracking to store badges |
| `src/app/globals.css` | Modify | Add pulse-glow keyframe |
| `messages/en.json` | Modify | Add new CTA i18n keys |
| `messages/*.json` (23 other locales) | Modify | Add translated CTA strings |

---

## Task 1: Create shared platform detection utility

**Files:**
- Create: `src/lib/detect-platform.ts`
- Modify: `src/components/hero/hero-ctas-wrapper.tsx`

Extract `detectPlatform()` from `hero-ctas-wrapper.tsx` into a shared module so all new CTA components use the same logic.

- [ ] **Step 1: Create `src/lib/detect-platform.ts`**

```typescript
export type Platform = "ios" | "android" | "desktop";

export function detectPlatform(): Platform {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}
```

- [ ] **Step 2: Update `hero-ctas-wrapper.tsx` to import from shared module**

Replace the local `detectPlatform` function and `Platform` type with imports from `@/lib/detect-platform`. Remove the local `Platform` import from `hero-ctas` (keep re-exporting `Platform` from `hero-ctas.tsx` for backwards compat, but source it from the shared module).

```typescript
// hero-ctas-wrapper.tsx
"use client";

import { useState, useEffect } from "react";
import { HeroCTAs } from "./hero-ctas";
import { detectPlatform } from "@/lib/detect-platform";
import type { Platform } from "@/lib/detect-platform";

export function HeroCTAsWrapper() {
  const [platform, setPlatform] = useState<Platform>("desktop");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  return <HeroCTAs platform={platform} />;
}
```

Also update `hero-ctas.tsx` line 6 to import `Platform` from `@/lib/detect-platform`:
```typescript
import type { Platform } from "@/lib/detect-platform";
export type { Platform };
```

- [ ] **Step 3: Verify the dev server still works**

Run: `npm run dev` — visit the homepage, verify hero CTAs render correctly.

- [ ] **Step 4: Commit**

```bash
git add src/lib/detect-platform.ts src/components/hero/hero-ctas-wrapper.tsx src/components/hero/hero-ctas.tsx
git commit -m "refactor: extract detectPlatform into shared utility"
```

---

## Task 2: Create CTA event tracking utility

**Files:**
- Create: `src/lib/track-cta.ts`

- [ ] **Step 1: Create `src/lib/track-cta.ts`**

```typescript
import { track } from "@vercel/analytics";

export type CtaLocation =
  | "hero"
  | "blog-sticky"
  | "blog-inline"
  | "blog-bottom"
  | "bypass-censorship"
  | "footer"
  | "downloads";

export function trackCta(
  location: CtaLocation,
  platform: "ios" | "android" | "desktop",
  pagePath?: string,
  locale?: string
) {
  track("cta_click", {
    location,
    platform,
    page_path: pagePath ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    locale: locale ?? "",
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/track-cta.ts
git commit -m "feat: add CTA event tracking utility"
```

---

## Task 3: Add i18n keys for new CTA components

**Files:**
- Modify: `messages/en.json`

- [ ] **Step 1: Add new keys under `blog` namespace in `messages/en.json`**

After the existing `blog.cta` section (line ~426), add a new `blog.stickyBar` and `blog.inlineCta` section. Insert inside the `"blog"` object, after the `"cta"` block:

```json
"stickyBar": {
  "cta": "Get Doppler VPN",
  "dismiss": "Dismiss download banner"
},
"inlineCta": {
  "headline": "Protect your privacy with Doppler VPN",
  "subtext": "Free. No registration. No logs.",
  "downloadIos": "Download for iOS",
  "downloadAndroid": "Download for Android",
  "downloadDesktop": "Download App"
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8'));console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add messages/en.json
git commit -m "feat: add i18n keys for sticky bar and inline blog CTA"
```

- [ ] **Step 4: Add translations to all 23 other locale files**

Use the existing blog translation pipeline or manually add the same keys to all locale files in `messages/`. For initial deployment, English fallback is acceptable — next-intl falls back to `en` for missing keys. Translations can be added in a follow-up pass.

> **Note:** RTL locales (ar, fa, he, ur) need particular care — test that button layout mirrors correctly. The components use `flex` which handles RTL automatically with Tailwind's logical properties.

---

## Task 4: Create BlogInlineCta component

**Files:**
- Create: `src/components/blog/blog-inline-cta.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { detectPlatform, type Platform } from "@/lib/detect-platform";
import { trackCta } from "@/lib/track-cta";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=org.dopplervpn.android";

export function BlogInlineCta() {
  const t = useTranslations("blog.inlineCta");
  const [platform, setPlatform] = useState<Platform>("desktop");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const config = {
    ios: { href: APP_STORE_URL, label: t("downloadIos"), icon: AppleIcon },
    android: { href: GOOGLE_PLAY_URL, label: t("downloadAndroid"), icon: PlayIcon },
    desktop: { href: "/downloads", label: t("downloadDesktop"), icon: DownloadIcon },
  }[platform];

  const handleClick = () => {
    trackCta("blog-inline", platform);
  };

  return (
    <div className="not-prose my-10 rounded-xl border-s-4 border-accent-teal bg-accent-teal/5 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-text-primary mb-1">
            {t("headline")}
          </p>
          <p className="text-sm text-text-muted">
            {t("subtext")}
          </p>
        </div>
        <a
          href={config.href}
          target={platform === "desktop" ? undefined : "_blank"}
          rel={platform === "desktop" ? undefined : "noopener noreferrer"}
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent-teal text-bg-primary hover:bg-accent-teal/90 transition-colors text-sm font-medium whitespace-nowrap flex-shrink-0"
        >
          <config.icon />
          {config.label}
        </a>
      </div>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}
```

- [ ] **Step 2: Verify component renders in isolation**

Temporarily import into a page and check it renders. Then remove the temp import.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/blog-inline-cta.tsx
git commit -m "feat: add BlogInlineCta component for mid-article CTA"
```

---

## Task 5: Inject BlogInlineCta into blog content via custom h2 renderer

**Files:**
- Modify: `src/components/blog/blog-content.tsx`

- [ ] **Step 1: Add h2 counter and inline CTA injection**

Add import at top of `blog-content.tsx`:
```typescript
import { BlogInlineCta } from "./blog-inline-cta";
```

Inside the `BlogContent` component function (before the `return`), create a ref-based counter that resets each render:
```typescript
const h2CountRef = useRef(0);
h2CountRef.current = 0; // Reset on each render call (safe for Strict Mode double-invocation)
```

Add `useRef` to the react import at the top of the file:
```typescript
import { useRef } from "react";
```

Add a custom `h2` entry to the `components` prop of `ReactMarkdown` (inside the existing `components` object, after the `a` renderer at line 93-101):

```typescript
h2: ({ children, ...props }) => {
  h2CountRef.current++;
  const count = h2CountRef.current;
  return (
    <>
      <h2 {...props}>{children}</h2>
      {count === 3 && <BlogInlineCta />}
    </>
  );
},
```

**Why useRef instead of let:** A bare `let` counter mutated during render is a React anti-pattern — it breaks under Strict Mode's double-invocation. Using `useRef` with an explicit reset at the top of the render body ensures the counter always starts at 0 for each render pass, while refs are safe to mutate during render since they don't affect output.

**Fallback for short articles:** If the article has fewer than 3 headings, the inline CTA won't appear mid-article — this is acceptable since these posts are short enough that the bottom BlogCta is visible. No fallback injection needed for 1-2 heading posts.

- [ ] **Step 2: Verify on a blog post with 3+ headings**

Run: `npm run dev` — visit any blog post. The inline CTA should appear after the 3rd `<h2>`.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/blog-content.tsx
git commit -m "feat: inject BlogInlineCta after 3rd heading in blog posts"
```

---

## Task 6: Create BlogStickyBar component

**Files:**
- Create: `src/components/blog/blog-sticky-bar.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { detectPlatform, type Platform } from "@/lib/detect-platform";
import { trackCta, type CtaLocation } from "@/lib/track-cta";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=org.dopplervpn.android";

interface BlogStickyBarProps {
  /** ID of the sentinel element placed before the bottom CTA */
  sentinelId?: string;
  /** Override the tracking location (default: "blog-sticky") */
  trackingLocation?: CtaLocation;
}

export function BlogStickyBar({
  sentinelId = "blog-cta-sentinel",
  trackingLocation = "blog-sticky",
}: BlogStickyBarProps) {
  const t = useTranslations("blog.stickyBar");
  const locale = useLocale();
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Show after 30% scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.3) {
        setVisible(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide when bottom CTA sentinel enters viewport
  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only hide when sentinel is visible — scroll handler controls showing
        if (entry.isIntersecting) setVisible(false);
      },
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  // Check sessionStorage for dismissal
  useEffect(() => {
    if (sessionStorage.getItem("sticky-cta-dismissed") === "1") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("sticky-cta-dismissed", "1");
  };

  const config = {
    ios: { href: APP_STORE_URL, icon: AppleIcon },
    android: { href: GOOGLE_PLAY_URL, icon: PlayIcon },
    desktop: { href: `/${locale}/downloads`, icon: DownloadIcon },
  }[platform];

  const handleClick = () => {
    trackCta(trackingLocation, platform);
  };

  const show = visible && !dismissed;

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-bg-primary/95 backdrop-blur-sm border-t border-overlay/10">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-3 px-4 py-3">
          <a
            href={config.href}
            target={platform === "desktop" ? undefined : "_blank"}
            rel={platform === "desktop" ? undefined : "noopener noreferrer"}
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-teal text-bg-primary hover:bg-accent-teal/90 transition-colors text-sm font-medium"
          >
            <config.icon />
            {t("cta")}
          </a>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-overlay/10 transition-colors"
            aria-label={t("dismiss")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/blog/blog-sticky-bar.tsx
git commit -m "feat: add BlogStickyBar component with scroll/intersection logic"
```

---

## Task 7: Wire BlogStickyBar into blog post pages

**Files:**
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

- [ ] **Step 1: Add imports at top of file**

```typescript
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
```

- [ ] **Step 2: Add sentinel div before BlogCta**

In the blog post page (around line 397), insert a sentinel `<div>` immediately before the `<BlogCta>` component:

```typescript
{/* Sentinel for sticky bar auto-hide */}
<div id="blog-cta-sentinel" aria-hidden="true" />

{/* CTA */}
<BlogCta ... />
```

- [ ] **Step 3: Add BlogStickyBar between `</main>` and `<Footer />`**

At approximately line 417, between `</main>` and `<Footer />` (NOT inside `<main>` — it's a fixed-position component):

```typescript
      </main>
      <BlogStickyBar />
      <Footer />
```

- [ ] **Step 4: Test on a blog post**

Run: `npm run dev` — visit a blog post, scroll down 30%+, verify sticky bar appears. Scroll to the bottom CTA section — verify sticky bar auto-hides. Click X — verify it dismisses and doesn't reappear on scroll.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: add sticky CTA bar to blog post pages"
```

---

## Task 8: Polish hero CTAs (icons + contrast + animation)

**Files:**
- Modify: `src/components/hero/hero-ctas.tsx`
- Modify: `src/components/sections/hero.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add platform icons and solid styling to `hero-ctas.tsx`**

Replace the entire `hero-ctas.tsx` with the updated version that adds icons and solid teal background:

The primary CTA class changes from:
```
bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30
```
to:
```
bg-accent-teal text-bg-primary hover:bg-accent-teal/90 pulse-glow-once
```

Add icon components before the label text in each button. Add tracking via `onClick`:

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { trackCta } from "@/lib/track-cta";
import type { Platform } from "@/lib/detect-platform";
export type { Platform };

const APP_STORE_URL =
  "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=org.dopplervpn.android";
const ANDROID_APK = "/downloads/doppler-vpn-v1.2.0.apk";

interface HeroCTAsProps {
  platform: Platform;
}

export function HeroCTAs({ platform }: HeroCTAsProps) {
  const t = useTranslations("hero");

  const downloadConfig = {
    ios: { href: APP_STORE_URL, label: t("downloadIos"), external: true, icon: <AppleIcon /> },
    android: { href: GOOGLE_PLAY_URL, label: t("downloadAndroid"), external: true, icon: <PlayIcon /> },
    desktop: { href: "/downloads" as const, label: t("downloadApp"), external: false, icon: <DownloadIcon /> },
  }[platform];

  const handlePrimaryClick = () => trackCta("hero", platform);

  const primaryClass =
    "inline-flex items-center justify-center gap-2 px-5 py-3 w-full sm:w-auto text-center bg-accent-teal text-bg-primary hover:bg-accent-teal/90 rounded-lg transition-colors text-sm font-medium pulse-glow-once";

  const secondaryClass =
    "inline-flex items-center justify-center gap-2 px-5 py-3 w-full sm:w-auto text-center border border-overlay/20 text-text-muted hover:text-text-primary hover:border-overlay/40 rounded-lg transition-colors text-sm font-medium";

  const downloadBtn = downloadConfig.external ? (
    <a
      href={downloadConfig.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handlePrimaryClick}
      className={primaryClass}
    >
      {downloadConfig.icon}
      {downloadConfig.label}
    </a>
  ) : (
    <Link
      href="/downloads"
      onClick={handlePrimaryClick}
      className={primaryClass}
    >
      {downloadConfig.icon}
      {downloadConfig.label}
    </Link>
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full">
      {downloadBtn}
      {platform === "android" && (
        <a
          href={ANDROID_APK}
          download
          onClick={() => trackCta("hero", "android")}
          className={secondaryClass}
        >
          {t("getAndroid")}
        </a>
      )}
      <a
        href="#pricing"
        className={secondaryClass}
      >
        {t("seePrices")}
      </a>
    </div>
  );
}

function AppleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}
```

- [ ] **Step 2: Reduce mobile padding in `hero.tsx`**

In `src/components/sections/hero.tsx` line 15, change:
```
pt-28
```
to:
```
pt-20 sm:pt-28
```

- [ ] **Step 3: Add pulse-glow animation to `globals.css`**

After the hero-animate section (~line 114), add:

```css
/* One-time CTA glow pulse */
@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 0 rgba(0, 140, 140, 0); }
  50% { box-shadow: 0 0 20px 4px rgba(0, 140, 140, 0.3); }
  100% { box-shadow: 0 0 0 0 rgba(0, 140, 140, 0); }
}
.pulse-glow-once {
  animation: pulse-glow 1.5s ease-out 1;
}
```

> Note: `rgb(0, 140, 140)` is the RGB equivalent of `#008C8C`, matching the actual `--color-accent-teal` theme variable.

- [ ] **Step 4: Verify on homepage**

Run: `npm run dev` — check hero on desktop and mobile (responsive mode). Verify:
- Icons appear next to button text
- Primary CTA is solid teal (high contrast)
- Glow pulse plays once on load
- Mobile: hero content is ~32px higher

- [ ] **Step 5: Commit**

```bash
git add src/components/hero/hero-ctas.tsx src/components/sections/hero.tsx src/app/globals.css
git commit -m "feat: add platform icons, solid CTA styling, and glow animation to hero"
```

---

## Task 9: Add tracking to existing BlogCta and footer

**Files:**
- Modify: `src/components/blog/blog-cta.tsx`
- Modify: `src/components/layout/footer.tsx`

- [ ] **Step 1: Add tracking to BlogCta store buttons**

In `src/components/blog/blog-cta.tsx`, add import:
```typescript
import { trackCta } from "@/lib/track-cta";
```

In the `StoreButton` component (line 66), add an optional `onTrack` callback prop:
```typescript
interface StoreButtonProps {
  store: "apple" | "google";
  label: string;
  href: string;
  accent: "teal" | "gold";
  onTrack?: () => void;
}

function StoreButton({ store, label, href, accent, onTrack }: StoreButtonProps) {
  // ... existing colors logic ...
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onTrack}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${colors}`}
    >
      {/* ... existing icon + label ... */}
    </a>
  );
}
```

Then in `AppCard`, only pass `onTrack` for Doppler cards (teal accent), not Simnetiq (gold accent):
```typescript
<StoreButton
  store="apple"
  label={app.appStoreLabel}
  href={app.appStoreHref}
  accent={app.accentColor}
  onTrack={app.accentColor === "teal" ? () => trackCta("blog-bottom", "ios") : undefined}
/>
```

This ensures Simnetiq clicks don't pollute Doppler analytics.

- [ ] **Step 2: Add tracking to footer store badges**

In `src/components/layout/footer.tsx`, the footer is an async Server Component. Since `trackCta` uses client-side `track()`, we need a thin wrapper. The simplest approach: create inline `onClick` handlers won't work in a Server Component.

Instead, add `data-cta-location="footer"` and `data-cta-platform="ios"` / `data-cta-platform="android"` attributes to the footer store links (lines 26-57). Then add a small client-side script in `BlogStickyBar` or a new utility that listens for clicks on `[data-cta-location]` elements.

**Simpler approach:** Convert just the footer store badges section into a small client component `FooterStoreBadges`:

Create the tracking directly on the `<a>` tags by wrapping them in a client component. For now, skip footer tracking — it's lowest priority and the footer is a Server Component. We can add it in a follow-up.

**Proceed with just BlogCta tracking for now.**

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/blog-cta.tsx
git commit -m "feat: add CTA click tracking to BlogCta store buttons"
```

---

## Task 10: Add BlogStickyBar + tracking to bypass-censorship page

**Files:**
- Modify: `src/app/[locale]/bypass-censorship/page.tsx`

- [ ] **Step 1: Add BlogStickyBar import and render**

Add import at top:
```typescript
import { BlogStickyBar } from "@/components/blog/blog-sticky-bar";
```

Add a sentinel div before the CTA section (~line 365) and render `BlogStickyBar` after `</main>` before `<Footer />` (~line 423):

Before the "Primary download buttons" div (line 372):
```typescript
<div id="blog-cta-sentinel" aria-hidden="true" />
```

Between `</main>` and `<Footer />` (line 423-424):
```typescript
</main>
<BlogStickyBar sentinelId="blog-cta-sentinel" trackingLocation="bypass-censorship" />
<Footer />
```

- [ ] **Step 2: Add platform icons to existing CTA buttons**

The bypass-censorship page has download buttons at lines 374-398. Add the Apple/Play Store SVG icons inline before the text, matching the same SVGs used in `hero-ctas.tsx`. Also add `onClick` tracking:

For the iOS button (line 374-381), add before `{t("cta.downloadIos")}`:
```tsx
<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47..." />
</svg>
```

For the Android button (line 382-389), add the Play Store icon similarly.

> Note: Since this is a Server Component, we cannot add `onClick` tracking directly. For now, just add the icons. Tracking for this page's inline buttons would require extracting them into a client component — defer this to a follow-up or use the sticky bar tracking as the primary signal.

- [ ] **Step 3: Verify**

Run: `npm run dev` — visit `/en/bypass-censorship`, scroll down, verify sticky bar appears.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/bypass-censorship/page.tsx
git commit -m "feat: add sticky CTA bar and icons to bypass-censorship page"
```

---

## Task 11: Final integration test and type check

- [ ] **Step 1: Run type check**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Manual integration test**

Run: `npm run dev` and verify:
1. **Homepage:** Hero CTAs have icons, solid teal primary button, glow pulse on load, reduced mobile padding
2. **Blog post:** Inline CTA appears after 3rd heading, sticky bar appears at 30% scroll, sticky bar hides at bottom CTA, X dismisses for session
3. **Bypass-censorship:** Sticky bar appears, download buttons have icons
4. **Mobile responsive mode:** All CTAs look good at 375px width, sticky bar has correct spacing

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: CRO sprint — blog CTAs, hero polish, event tracking

- Add sticky bottom CTA bar on blog posts and bypass-censorship page
- Add inline mid-article CTA after 3rd heading in blog posts
- Polish hero CTAs with platform icons and solid teal contrast
- Add one-time glow animation on hero primary CTA
- Reduce hero mobile top padding for better above-fold placement
- Add Vercel Analytics custom event tracking on all CTA clicks
- Extract shared platform detection utility
- Add i18n keys for new CTA components"
```

---

## Follow-Up Tasks (not in this sprint)

1. **Translate CTA keys** to all 23 non-English locales (use blog translation pipeline)
2. **Footer tracking** — extract store badges into client component for click tracking
3. **Bypass-censorship inline button tracking** — extract into client component
4. **A/B test** sticky bar vs no sticky bar after 2 weeks of baseline data
5. **Downloads page audit** — review for conversion gaps with new tracking data
