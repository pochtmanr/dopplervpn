# Landing Page Trust & Conversion Improvements — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposition Doppler VPN landing page from "free privacy VPN" to "censorship-resistant VPN built on VLESS-Reality" by rewriting the hero, adding 6 new homepage sections, and creating a /bypass-censorship page.

**Architecture:** All new sections follow the existing pattern: `"use client"` components using `useTranslations()`, `Section`/`SectionHeader` from `@/components/ui/section`, and `Reveal` from `@/components/ui/reveal` for scroll animations. Translations in `messages/en.json`. New sections slotted into existing page layout in `src/app/[locale]/page.tsx`.

**Tech Stack:** Next.js 15, Tailwind CSS v4, next-intl v3, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-11-landing-page-trust-conversions-design.md`

---

## Chunk 1: Hero Rewrite + Trust Indicators + Translations

### Task 1: Update English translations for hero section

**Files:**
- Modify: `messages/en.json` (lines 19-33 — hero section)

- [ ] **Step 1: Update hero translation values in en.json**

Replace the hero translation values (keep the same keys):

```json
"hero": {
    "tagline": "Censorship-Resistant VPN",
    "headlinePart1a": "Works where other VPNs",
    "headlinePart1b": "get blocked.",
    "headlinePart2": "",
    "subheadline": "Built on VLESS-Reality — your traffic looks like regular HTTPS. Undetectable by deep packet inspection. No registration, no logs, no tracking.",
    ...keep all other hero keys unchanged...
    "trustBadges": {
      "noData": "No Registration Required",
      "noLogs": "No Activity Logs",
      "unlimited": "DPI-Resistant Traffic",
      "vless": "VLESS-Reality Protocol"
    },
    ...keep all other hero keys unchanged...
}
```

Only change: `tagline`, `headlinePart1a`, `headlinePart1b`, `headlinePart2`, `subheadline`, and the 4 `trustBadges.*` values. All other hero keys (`downloadIos`, `downloadAndroid`, `getPro`, etc.) stay exactly the same.

- [ ] **Step 2: Verify dev server loads without errors**

Run: `npm run dev` (should already be running)
Check: `http://localhost:3000` — hero should show new text. The `headlinePart2` being empty means the gradient line disappears — that's expected.

- [ ] **Step 3: Commit**

```bash
git add messages/en.json
git commit -m "feat: update hero copy — censorship-resistant positioning"
```

### Task 2: Update hero component — replace PromoCode with tagline badge

**Files:**
- Modify: `src/components/sections/hero.tsx` (lines 8, 46-49)

- [ ] **Step 1: Remove PromoCode import, add tagline rendering**

In `hero.tsx`, remove line 8:
```typescript
import { PromoCode } from "@/components/hero/promo-code";
```

Replace lines 46-49 (the PromoCode block):
```tsx
{/* Promo Code (replaces old tagline badge) */}
<div className="hero-animate">
  <PromoCode />
</div>
```

With a static tagline badge:
```tsx
{/* Tagline Badge */}
<div className="hero-animate">
  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-accent-teal/10 text-accent-teal border border-accent-teal/20">
    {t("tagline")}
  </span>
</div>
```

Also, conditionally render the `headlinePart2` span (lines 65-71). Replace:
```tsx
<span
  className="block mt-0 bg-gradient-to-t from-text-muted to-text-primary bg-clip-text text-transparent"
  style={useFallbackFont ? { fontFamily: "var(--font-body)", fontWeight: 700 } : { fontFamily: "var(--font-raster)" }}
>
  {t("headlinePart2")}
</span>
```

With:
```tsx
{t("headlinePart2") && (
  <span
    className="block mt-0 bg-gradient-to-t from-text-muted to-text-primary bg-clip-text text-transparent"
    style={useFallbackFont ? { fontFamily: "var(--font-body)", fontWeight: 700 } : { fontFamily: "var(--font-raster)" }}
  >
    {t("headlinePart2")}
  </span>
)}
```

This prevents an empty block element from adding whitespace when `headlinePart2` is empty.

- [ ] **Step 2: Verify hero renders correctly**

Check `http://localhost:3000`:
- Tagline badge shows "Censorship-Resistant VPN" in teal pill
- Headline shows "Works where other VPNs get blocked."
- Gradient second line is gone (empty string)
- Subheadline shows new copy
- Trust badges show new labels
- CTAs still work

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/hero.tsx
git commit -m "feat: replace PromoCode with static tagline badge in hero"
```

### Task 3: Add Trust Indicators section

**Files:**
- Create: `src/components/sections/trust-indicators.tsx`
- Modify: `messages/en.json` — add `trustIndicators` namespace

- [ ] **Step 1: Add translations to en.json**

Add this new top-level key to `messages/en.json` (after the `hero` block):

```json
"trustIndicators": {
  "items": {
    "noAccount": {
      "label": "No Account Needed",
      "description": "Your device is your identity"
    },
    "zeroLogs": {
      "label": "Zero Activity Logs",
      "description": "We can't see what you browse"
    },
    "encryptedDns": {
      "label": "Encrypted DNS",
      "description": "Every query protected"
    },
    "dpiBypass": {
      "label": "DPI Bypass",
      "description": "Traffic looks like normal HTTPS"
    },
    "freeTier": {
      "label": "Free Tier Available",
      "description": "Try before you commit"
    }
  }
}
```

- [ ] **Step 2: Create trust-indicators.tsx**

Create `src/components/sections/trust-indicators.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";

const trustItems = [
  { key: "noAccount", icon: "user" },
  { key: "zeroLogs", icon: "eye-off" },
  { key: "encryptedDns", icon: "lock" },
  { key: "dpiBypass", icon: "shield" },
  { key: "freeTier", icon: "gift" },
] as const;

const icons: Record<string, React.ReactNode> = {
  "user": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  "eye-off": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ),
  "lock": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  "shield": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  ),
  "gift": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  ),
};

export function TrustIndicators() {
  const t = useTranslations("trustIndicators");

  return (
    <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-bg-secondary/30 border-y border-overlay/5">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 [&>:last-child]:col-span-2 md:[&>:last-child]:col-span-1 [&>:last-child]:justify-self-center">
            {trustItems.map(({ key, icon }) => (
              <div key={key} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal">
                  {icons[icon]}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{t(`items.${key}.label`)}</p>
                  <p className="text-xs text-text-muted">{t(`items.${key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Export from index.ts**

In `src/components/sections/index.ts`, add:
```typescript
export { TrustIndicators } from "./trust-indicators";
```

- [ ] **Step 4: Add to page layout**

In `src/app/[locale]/page.tsx`, add import and render after `<Hero />`:

Import (add `TrustIndicators` to the existing import block):
```typescript
import {
  Hero,
  TrustIndicators,
  Features,
  ...
} from "@/components/sections";
```

Render (after `<Hero />`):
```tsx
<Hero />
<TrustIndicators />
<Features />
```

- [ ] **Step 5: Verify trust indicators render**

Check `http://localhost:3000`:
- 5 items in a horizontal row on desktop
- 2-column grid on mobile
- Teal icons, labels, descriptions
- Subtle background band separating from hero

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/trust-indicators.tsx src/components/sections/index.ts src/app/\\[locale\\]/page.tsx messages/en.json
git commit -m "feat: add trust indicators strip below hero"
```

---

## Chunk 2: Technical How It Works + Censorship Resistance

### Task 4: Add Technical How It Works section

**Files:**
- Create: `src/components/sections/technical-how-it-works.tsx`
- Modify: `messages/en.json` — add `technicalHowItWorks` namespace
- Modify: `src/components/sections/index.ts` — export
- Modify: `src/app/[locale]/page.tsx` — add to layout

- [ ] **Step 1: Add translations to en.json**

Add after `trustIndicators` in `messages/en.json`:

```json
"technicalHowItWorks": {
  "title": "How Doppler Protects Your Traffic",
  "subtitle": "Your connection is encrypted and routed through Doppler's edge network. Nothing is logged.",
  "flow": {
    "step1": "Your Device",
    "step2": "Encrypted VLESS Tunnel",
    "step3": "Doppler Edge Node",
    "step4": "Open Internet"
  },
  "cards": {
    "handshake": {
      "title": "VLESS-Reality Handshake",
      "description": "Your connection mimics a normal HTTPS session. Network firewalls and DPI systems can't distinguish Doppler traffic from regular web browsing."
    },
    "dns": {
      "title": "Encrypted DNS Pipeline",
      "description": "DNS queries are encrypted before leaving your device. Your ISP never sees which domains you visit."
    },
    "auth": {
      "title": "Device-Based Authentication",
      "description": "No accounts, no emails, no passwords. Your device identity is the only key — nothing personally identifiable is stored on our servers."
    }
  }
}
```

- [ ] **Step 2: Create technical-how-it-works.tsx**

Create `src/components/sections/technical-how-it-works.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const flowSteps = ["step1", "step2", "step3", "step4"] as const;

const cardItems = [
  { key: "handshake", icon: "handshake" },
  { key: "dns", icon: "dns" },
  { key: "auth", icon: "auth" },
] as const;

const cardIcons: Record<string, React.ReactNode> = {
  handshake: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  dns: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
    </svg>
  ),
  auth: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
};

export function TechnicalHowItWorks() {
  const t = useTranslations("technicalHowItWorks");

  return (
    <Section id="how-doppler-works">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Flow Diagram */}
      <Reveal>
        <div
          className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0 mb-16"
          aria-label={`${t("flow.step1")} → ${t("flow.step2")} → ${t("flow.step3")} → ${t("flow.step4")}`}
          role="img"
        >
          {flowSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-3 md:gap-0">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal text-lg font-semibold">
                  {i + 1}
                </div>
                <span className="text-sm text-text-primary font-medium text-center max-w-[120px]">
                  {t(`flow.${step}`)}
                </span>
              </div>
              {i < flowSteps.length - 1 && (
                <svg
                  className="w-6 h-6 text-text-muted mx-3 hidden md:block rtl:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              )}
              {i < flowSteps.length - 1 && (
                <svg
                  className="w-6 h-6 text-text-muted my-1 block md:hidden"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0 6.75-6.75M12 19.5l-6.75-6.75" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </Reveal>

      {/* Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cardItems.map(({ key, icon }, i) => (
          <Reveal key={key} delay={i * 50}>
            <div className="h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 hover:border-accent-teal/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-4">
                {cardIcons[icon]}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1.5">
                {t(`cards.${key}.title`)}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {t(`cards.${key}.description`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Export and add to page**

In `src/components/sections/index.ts`, add:
```typescript
export { TechnicalHowItWorks } from "./technical-how-it-works";
```

In `src/app/[locale]/page.tsx`, add after `<TrustIndicators />`:
```tsx
<TrustIndicators />
<TechnicalHowItWorks />
<Features />
```

- [ ] **Step 4: Verify rendering**

Check `http://localhost:3000`:
- Section title and subtitle render
- 4-step flow diagram: horizontal on desktop, vertical on mobile
- 3 explanation cards below in grid
- Scroll animation works

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/technical-how-it-works.tsx src/components/sections/index.ts src/app/\\[locale\\]/page.tsx messages/en.json
git commit -m "feat: add technical how-it-works section with flow diagram"
```

### Task 5: Add Censorship Resistance section

**Files:**
- Create: `src/components/sections/censorship-resistance.tsx`
- Modify: `messages/en.json` — add `censorshipResistance` namespace
- Modify: `src/components/sections/index.ts` — export
- Modify: `src/app/[locale]/page.tsx` — add to layout

- [ ] **Step 1: Add translations to en.json**

Add `censorshipResistance` namespace to `messages/en.json`:

```json
"censorshipResistance": {
  "title": "Designed for Restrictive Networks",
  "subtitle": "Doppler uses techniques that make VPN traffic invisible to network censorship systems.",
  "learnMore": "Learn how it works",
  "items": {
    "dpi": {
      "title": "Deep Packet Inspection Bypass",
      "description": "Traditional VPN protocols have recognizable traffic signatures. VLESS-Reality eliminates them — your traffic is indistinguishable from regular HTTPS."
    },
    "tls": {
      "title": "TLS Traffic Camouflage",
      "description": "Doppler performs a genuine TLS handshake with a real website certificate. Censorship systems see normal web traffic, not a VPN connection."
    },
    "fingerprint": {
      "title": "No Detectable Protocol Fingerprint",
      "description": "Unlike OpenVPN or WireGuard, VLESS-Reality leaves no protocol fingerprint. There's nothing for automated blocking systems to match against."
    },
    "regions": {
      "title": "Works in Restricted Regions",
      "description": "Tested and operational in networks with active VPN blocking. Doppler connects where mainstream VPNs fail."
    }
  }
}
```

- [ ] **Step 2: Create censorship-resistance.tsx**

Create `src/components/sections/censorship-resistance.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const items = [
  { key: "dpi", icon: "scan" },
  { key: "tls", icon: "lock" },
  { key: "fingerprint", icon: "fingerprint" },
  { key: "regions", icon: "globe" },
] as const;

const icons: Record<string, React.ReactNode> = {
  scan: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  fingerprint: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a48.667 48.667 0 0 0 .396 6.69M12 3c-1.64 0-3.163.527-4.398 1.42M12 3a7.5 7.5 0 0 1 7.484 6.714M12 3a48.234 48.234 0 0 1 .514 13.826M12 3c-2.292 0-4.476.39-6.514 1.107" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
    </svg>
  ),
};

export function CensorshipResistance() {
  const t = useTranslations("censorshipResistance");

  return (
    <Section id="censorship-resistance">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(({ key, icon }, i) => (
          <Reveal key={key} delay={i * 50}>
            <div className="h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 hover:border-accent-teal/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-4">
                {icons[icon]}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1.5">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {t(`items.${key}.description`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Learn More Link */}
      <Reveal delay={200}>
        <div className="text-center mt-8">
          <Link
            href="/bypass-censorship"
            className="inline-flex items-center gap-2 text-accent-teal hover:text-accent-gold transition-colors text-sm font-medium"
          >
            {t("learnMore")}
            <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
```

- [ ] **Step 3: Export and add to page**

In `src/components/sections/index.ts`, add:
```typescript
export { CensorshipResistance } from "./censorship-resistance";
```

In `src/app/[locale]/page.tsx`, add after `<Features />`:
```tsx
<Features />
<CensorshipResistance />
```

- [ ] **Step 4: Verify rendering**

Check `http://localhost:3000`:
- 2x2 card grid on desktop, 1-col on mobile
- "Learn how it works" link at bottom (will 404 until bypass-censorship page is built — that's fine)
- Cards have hover effect

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/censorship-resistance.tsx src/components/sections/index.ts src/app/\\[locale\\]/page.tsx messages/en.json
git commit -m "feat: add censorship resistance section with learn-more link"
```

---

## Chunk 3: Use Cases + Comparison Table + Privacy Model

### Task 6: Add Use Cases section

**Files:**
- Create: `src/components/sections/use-cases.tsx`
- Modify: `messages/en.json` — add `useCases` namespace
- Modify: `src/components/sections/index.ts`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Add translations to en.json**

```json
"useCases": {
  "title": "Who Uses Doppler",
  "subtitle": "Built for people who need more than a generic VPN.",
  "items": {
    "restricted": {
      "title": "People in Restricted Networks",
      "description": "Connect freely when your government or ISP blocks VPN traffic. Doppler's protocol bypasses active censorship."
    },
    "travelers": {
      "title": "Travelers on Public Wi-Fi",
      "description": "Hotel, airport, cafe — your traffic is encrypted and your DNS queries are private. No one on the network can see what you do."
    },
    "journalists": {
      "title": "Journalists & Researchers",
      "description": "Access blocked sources and communicate without exposing your traffic patterns. No account means no identity trail."
    },
    "developers": {
      "title": "Developers & Remote Workers",
      "description": "Reliable encrypted tunnels that don't get throttled or blocked. Works consistently across restrictive corporate and national firewalls."
    }
  }
}
```

- [ ] **Step 2: Create use-cases.tsx**

Create `src/components/sections/use-cases.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const items = [
  { key: "restricted", icon: "restricted" },
  { key: "travelers", icon: "travelers" },
  { key: "journalists", icon: "journalists" },
  { key: "developers", icon: "developers" },
] as const;

const icons: Record<string, React.ReactNode> = {
  restricted: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  travelers: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
    </svg>
  ),
  journalists: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  ),
  developers: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  ),
};

export function UseCases() {
  const t = useTranslations("useCases");

  return (
    <Section id="use-cases">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(({ key, icon }, i) => (
          <Reveal key={key} delay={i * 50}>
            <div className="h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 hover:border-accent-teal/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-4">
                {icons[icon]}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1.5">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {t(`items.${key}.description`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Export and add to page**

In `index.ts`, add: `export { UseCases } from "./use-cases";`

In `page.tsx`, add after `<CensorshipResistance />`:
```tsx
<CensorshipResistance />
<UseCases />
```

- [ ] **Step 4: Verify and commit**

```bash
git add src/components/sections/use-cases.tsx src/components/sections/index.ts src/app/\\[locale\\]/page.tsx messages/en.json
git commit -m "feat: add use cases section"
```

### Task 7: Add Comparison Table section

**Files:**
- Create: `src/components/sections/comparison-table.tsx`
- Modify: `messages/en.json` — add `comparisonTable` namespace
- Modify: `src/components/sections/index.ts`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Add translations to en.json**

```json
"comparisonTable": {
  "title": "Doppler vs. Traditional VPNs",
  "subtitle": "Not all VPNs are built the same.",
  "headers": {
    "feature": "Feature",
    "traditional": "Traditional VPN",
    "doppler": "Doppler"
  },
  "rows": {
    "account": {
      "feature": "Account required",
      "traditional": "Email + password",
      "doppler": "No account needed"
    },
    "fingerprint": {
      "feature": "Traffic fingerprint",
      "traditional": "Detectable by DPI",
      "doppler": "Camouflaged as HTTPS"
    },
    "protocol": {
      "feature": "Protocol",
      "traditional": "OpenVPN / WireGuard",
      "doppler": "VLESS-Reality"
    },
    "dns": {
      "feature": "DNS encryption",
      "traditional": "Sometimes",
      "doppler": "Always"
    },
    "censorship": {
      "feature": "Censorship resistance",
      "traditional": "Limited",
      "doppler": "Built-in"
    },
    "logs": {
      "feature": "Activity logs",
      "traditional": "Varies",
      "doppler": "Never"
    }
  }
}
```

- [ ] **Step 2: Create comparison-table.tsx**

Create `src/components/sections/comparison-table.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const rowKeys = ["account", "fingerprint", "protocol", "dns", "censorship", "logs"] as const;

export function ComparisonTable() {
  const t = useTranslations("comparisonTable");

  return (
    <Section id="comparison">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <Reveal>
        <div className="overflow-x-auto rounded-2xl border border-overlay/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary/50">
                <th scope="col" className="text-start p-4 font-medium text-text-muted">
                  {t("headers.feature")}
                </th>
                <th scope="col" className="text-start p-4 font-medium text-text-muted">
                  {t("headers.traditional")}
                </th>
                <th scope="col" className="text-start p-4 font-medium text-accent-teal">
                  {t("headers.doppler")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rowKeys.map((key, i) => (
                <tr
                  key={key}
                  className={i < rowKeys.length - 1 ? "border-t border-overlay/5" : ""}
                >
                  <th scope="row" className="text-start p-4 font-medium text-text-primary">
                    {t(`rows.${key}.feature`)}
                  </th>
                  <td className="p-4 text-text-muted">
                    {t(`rows.${key}.traditional`)}
                  </td>
                  <td className="p-4 text-accent-teal font-medium">
                    {t(`rows.${key}.doppler`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </Section>
  );
}
```

- [ ] **Step 3: Export and add to page**

In `index.ts`, add: `export { ComparisonTable } from "./comparison-table";`

In `page.tsx`, add after `<UseCases />`:
```tsx
<UseCases />
<ComparisonTable />
<Servers />
```

- [ ] **Step 4: Verify and commit**

Check table renders with proper alignment, Doppler column in teal, responsive horizontal scroll on mobile.

```bash
git add src/components/sections/comparison-table.tsx src/components/sections/index.ts src/app/\\[locale\\]/page.tsx messages/en.json
git commit -m "feat: add comparison table — Doppler vs traditional VPNs"
```

### Task 8: Add Privacy Model section

**Files:**
- Create: `src/components/sections/privacy-model.tsx`
- Modify: `messages/en.json` — add `privacyModel` namespace
- Modify: `src/components/sections/index.ts`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Add translations to en.json**

```json
"privacyModel": {
  "title": "What We Don't Store",
  "subtitle": "Privacy by architecture, not just policy.",
  "tagline": "We can't hand over data we don't have.",
  "items": {
    "browsing": {
      "title": "No browsing logs",
      "description": "We never see which websites you visit"
    },
    "ip": {
      "title": "No IP address logs",
      "description": "Your real IP is never recorded"
    },
    "dns": {
      "title": "No DNS query storage",
      "description": "Encrypted and discarded after resolution"
    },
    "account": {
      "title": "No account database",
      "description": "Device authentication means no personal data to store"
    }
  }
}
```

- [ ] **Step 2: Create privacy-model.tsx**

Create `src/components/sections/privacy-model.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const items = ["browsing", "ip", "dns", "account"] as const;

const icons: Record<string, React.ReactNode> = {
  browsing: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ),
  ip: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  dns: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
    </svg>
  ),
  account: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
};

export function PrivacyModel() {
  const t = useTranslations("privacyModel");

  return (
    <Section id="privacy-model">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((key, i) => (
          <Reveal key={key} delay={i * 50}>
            <div className="h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 hover:border-accent-teal/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-4">
                {icons[key]}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1.5">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {t(`items.${key}.description`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Tagline */}
      <Reveal delay={200}>
        <p className="text-center mt-8 text-lg font-medium text-text-primary">
          {t("tagline")}
        </p>
      </Reveal>
    </Section>
  );
}
```

- [ ] **Step 3: Export and add to page**

In `index.ts`, add: `export { PrivacyModel } from "./privacy-model";`

In `page.tsx`, the final page order should be:
```tsx
<Hero />
<TrustIndicators />
<TechnicalHowItWorks />
<Features />
<CensorshipResistance />
<UseCases />
<ComparisonTable />
<Servers />
<Pricing />
<PrivacyModel />
<HowItWorks />
<FAQ />
<CTA />
<HomeBlogSection posts={posts} locale={locale} />
```

Add `<PrivacyModel />` between `<Pricing />` and `<HowItWorks />`.

- [ ] **Step 4: Verify full page flow and commit**

Scroll through entire page — all 14 sections should render in order. Check mobile responsiveness.

```bash
git add src/components/sections/privacy-model.tsx src/components/sections/index.ts src/app/\\[locale\\]/page.tsx messages/en.json
git commit -m "feat: add privacy model section — what we don't store"
```

---

## Chunk 4: Bypass Censorship Page + Footer Link

### Task 9: Create /bypass-censorship page

**Files:**
- Create: `src/app/[locale]/bypass-censorship/page.tsx`
- Modify: `messages/en.json` — add `bypassCensorship` namespace

- [ ] **Step 1: Add translations to en.json**

Add `bypassCensorship` namespace to `messages/en.json`:

```json
"bypassCensorship": {
  "metadata": {
    "title": "How Doppler Bypasses Internet Censorship | Doppler VPN",
    "description": "Learn how VLESS-Reality makes VPN traffic undetectable by deep packet inspection and censorship systems."
  },
  "hero": {
    "title": "How Doppler Bypasses Internet Censorship",
    "subtitle": "A technical overview of how VLESS-Reality makes VPN traffic undetectable."
  },
  "problem": {
    "title": "How Censorship Systems Block VPNs",
    "p1": "Modern censorship systems use Deep Packet Inspection (DPI) to analyze internet traffic in real time. These systems don't just look at where your data is going — they examine how it's packaged, looking for telltale signs of VPN protocols.",
    "p2": "Traditional VPN protocols like OpenVPN and WireGuard have recognizable traffic patterns. DPI systems can identify these patterns and block the connections instantly. Even when VPN providers try to disguise their traffic, the underlying protocol signatures remain detectable.",
    "p3": "Beyond protocol detection, censorship systems also block known VPN server IP addresses and analyze TLS handshake fingerprints to identify and block VPN connections before they're fully established."
  },
  "evasion": {
    "title": "Why Doppler Traffic Is Invisible",
    "reality": {
      "title": "Reality Handshake",
      "description": "VLESS-Reality performs a genuine TLS handshake using a real website's certificate. To any observer — including DPI systems — the connection looks identical to someone browsing a normal HTTPS website. There's no fake certificate or proxy signature to detect."
    },
    "noSignature": {
      "title": "No Protocol Signature",
      "description": "Unlike OpenVPN (which uses a distinctive handshake) or WireGuard (which has a known packet structure), VLESS-Reality produces no identifiable protocol signature. Automated detection systems have nothing to match against."
    },
    "indistinguishable": {
      "title": "Traffic Indistinguishable from HTTPS",
      "description": "Once the tunnel is established, all data flowing through it is encrypted and formatted exactly like standard HTTPS traffic. Packet sizes, timing patterns, and headers all match what a normal web browsing session looks like."
    },
    "infrastructure": {
      "title": "Dynamic Server Infrastructure",
      "description": "Doppler rotates server endpoints and IP addresses, making it harder for censorship systems to maintain up-to-date blocklists. Even if one endpoint is identified, the network adapts."
    }
  },
  "flow": {
    "title": "What Censorship Systems See",
    "step1": "Your Device",
    "step1note": "Doppler client initiates connection",
    "step2": "TLS Handshake",
    "step2note": "Looks like visiting a normal website",
    "step3": "VLESS Tunnel",
    "step3note": "DPI sees: regular HTTPS traffic",
    "step4": "Doppler Node",
    "step4note": "Traffic exits to open internet",
    "dpiLabel": "What DPI sees: normal HTTPS traffic"
  },
  "comparison": {
    "title": "Protocol Comparison",
    "headers": {
      "protocol": "Protocol",
      "detectability": "Detectability",
      "speed": "Speed",
      "censorship": "Censorship Resistance",
      "fingerprint": "Protocol Fingerprint"
    },
    "openvpn": {
      "name": "OpenVPN",
      "detectability": "High",
      "speed": "Moderate",
      "censorship": "Low",
      "fingerprint": "Visible"
    },
    "wireguard": {
      "name": "WireGuard",
      "detectability": "Medium",
      "speed": "Fast",
      "censorship": "Low",
      "fingerprint": "Visible"
    },
    "vless": {
      "name": "VLESS-Reality",
      "detectability": "Very Low",
      "speed": "Fast",
      "censorship": "High",
      "fingerprint": "None"
    }
  },
  "works": {
    "title": "Where Doppler Works",
    "description": "Doppler is tested and operational in networks with active VPN blocking, including restrictive ISP environments, national-level firewalls, and corporate networks that block traditional VPN protocols.",
    "environments": {
      "isp": "Restrictive ISP environments",
      "national": "National-level firewall systems",
      "corporate": "Corporate network restrictions",
      "public": "Filtered public Wi-Fi networks"
    }
  },
  "cta": {
    "title": "Try Doppler in your network",
    "subtitle": "See if Doppler works where other VPNs fail.",
    "button": "Download Doppler"
  }
}
```

- [ ] **Step 2: Create the page component**

Create `src/app/[locale]/bypass-censorship/page.tsx`:

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section, SectionHeader } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bypassCensorship.metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

const protocolRows = ["openvpn", "wireguard", "vless"] as const;
const comparisonCols = ["detectability", "speed", "censorship", "fingerprint"] as const;
const environments = ["isp", "national", "corporate", "public"] as const;

export default async function BypassCensorshipPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("bypassCensorship");

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        {/* Hero */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary mb-4">
              {t("hero.title")}
            </h1>
            <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>
        </section>

        {/* The Problem */}
        <Section>
          <SectionHeader title={t("problem.title")} />
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-text-muted leading-relaxed">{t("problem.p1")}</p>
            <p className="text-text-muted leading-relaxed">{t("problem.p2")}</p>
            <p className="text-text-muted leading-relaxed">{t("problem.p3")}</p>
          </div>
        </Section>

        {/* How Doppler Evades Detection */}
        <Section>
          <SectionHeader title={t("evasion.title")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {(["reality", "noSignature", "indistinguishable", "infrastructure"] as const).map((key) => (
              <div key={key} className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {t(`evasion.${key}.title`)}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {t(`evasion.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Flow Diagram */}
        <Section>
          <SectionHeader title={t("flow.title")} />
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
              {(["step1", "step2", "step3", "step4"] as const).map((step, i) => (
                <div key={step} className="flex items-center gap-4 md:gap-0">
                  <div className="flex flex-col items-center gap-2 min-w-[140px]">
                    <div className="w-14 h-14 rounded-2xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal text-lg font-semibold">
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium text-text-primary text-center">
                      {t(`flow.${step}`)}
                    </span>
                    <span className="text-xs text-text-muted text-center">
                      {t(`flow.${step}note`)}
                    </span>
                  </div>
                  {i < 3 && (
                    <>
                      <svg className="w-6 h-6 text-text-muted mx-3 hidden md:block rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                      <svg className="w-6 h-6 text-text-muted my-1 block md:hidden" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0 6.75-6.75M12 19.5l-6.75-6.75" />
                      </svg>
                    </>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center mt-6 text-sm text-accent-teal font-medium">
              {t("flow.dpiLabel")}
            </p>
          </div>
        </Section>

        {/* Protocol Comparison */}
        <Section>
          <SectionHeader title={t("comparison.title")} />
          <div className="max-w-4xl mx-auto overflow-x-auto rounded-2xl border border-overlay/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-secondary/50">
                  <th scope="col" className="text-start p-4 font-medium text-text-muted">
                    {t("comparison.headers.protocol")}
                  </th>
                  {comparisonCols.map((col) => (
                    <th key={col} scope="col" className="text-start p-4 font-medium text-text-muted">
                      {t(`comparison.headers.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {protocolRows.map((row, i) => (
                  <tr key={row} className={`${i < protocolRows.length - 1 ? "border-t border-overlay/5" : ""} ${row === "vless" ? "bg-accent-teal/5" : ""}`}>
                    <th scope="row" className={`text-start p-4 font-medium ${row === "vless" ? "text-accent-teal" : "text-text-primary"}`}>
                      {t(`comparison.${row}.name`)}
                    </th>
                    {comparisonCols.map((col) => (
                      <td key={col} className={`p-4 ${row === "vless" ? "text-accent-teal font-medium" : "text-text-muted"}`}>
                        {t(`comparison.${row}.${col}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Where Doppler Works */}
        <Section>
          <SectionHeader title={t("works.title")} />
          <div className="max-w-3xl mx-auto">
            <p className="text-text-muted leading-relaxed mb-6">{t("works.description")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {environments.map((env) => (
                <div key={env} className="flex items-center gap-3 p-3 rounded-xl border border-overlay/10 bg-bg-secondary/50">
                  <svg className="w-5 h-5 text-accent-teal shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-sm text-text-primary">{t(`works.environments.${env}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Bottom CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3">
              {t("cta.title")}
            </h2>
            <p className="text-text-muted text-lg mb-6">{t("cta.subtitle")}</p>
            <Link
              href="/downloads"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal"
            >
              {t("cta.button")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Verify the page loads**

Check `http://localhost:3000/en/bypass-censorship`:
- All sections render
- Flow diagram works on mobile (vertical) and desktop (horizontal)
- Protocol comparison table is readable
- CTA links to /downloads

- [ ] **Step 4: Commit**

```bash
git add src/app/\\[locale\\]/bypass-censorship/page.tsx messages/en.json
git commit -m "feat: add /bypass-censorship page — censorship evasion explainer"
```

### Task 10: Add bypass-censorship link to footer

**Files:**
- Modify: `src/components/layout/footer.tsx`
- Modify: `messages/en.json` — add `footer.bypassCensorship` key

- [ ] **Step 1: Add translation key**

In `messages/en.json`, in the `footer` object, add:
```json
"bypassCensorship": "How We Bypass Censorship"
```

- [ ] **Step 2: Add link to footer**

In `src/components/layout/footer.tsx`, in the "Product" column `<ul>` (after the Blog link at line 93), add:
```tsx
<li>
  <Link
    href="/bypass-censorship"
    className="text-text-muted hover:text-text-primary transition-colors text-sm"
  >
    {t("bypassCensorship")}
  </Link>
</li>
```

- [ ] **Step 3: Add the footer key to all 20 other locale files**

The footer renders on every page in every locale. A missing key in non-English locales will cause errors. Add `"bypassCensorship": "How We Bypass Censorship"` inside the `"footer"` object of every `messages/*.json` file. Use the English string as a temporary placeholder — proper translations come in a separate pass.

Locale files to update: `ru.json`, `uk.json`, `zh.json`, `ja.json`, `ko.json`, `ar.json`, `fa.json`, `he.json`, `hi.json`, `ur.json`, `th.json`, `es.json`, `fr.json`, `de.json`, `pt.json`, `vi.json`, `id.json`, `tr.json`, `sw.json`, `fil.json`.

- [ ] **Step 4: Verify and commit**

Check footer shows the new link. Click it — should navigate to the bypass-censorship page. Also check a non-English locale (e.g., `/ru`) to confirm no missing key errors.

```bash
git add src/components/layout/footer.tsx messages/*.json
git commit -m "feat: add bypass-censorship link to footer"
```

### Task 11: Final verification

- [ ] **Step 1: Full page scroll test**

Navigate to `http://localhost:3000` and scroll through all 14 sections:
1. Hero — new censorship-resistant copy
2. Trust Indicators — 5 items
3. Technical How It Works — flow diagram + 3 cards
4. Features — existing bento grid
5. Censorship Resistance — 4 cards + learn more link
6. Use Cases — 4 cards
7. Comparison Table — 6-row table
8. Servers — existing
9. Pricing — existing
10. Privacy Model — 4 cards + tagline
11. How It Works — existing (Get Started)
12. FAQ — existing
13. CTA — existing
14. Blog — existing

- [ ] **Step 2: Test /bypass-censorship page**

Navigate to `http://localhost:3000/en/bypass-censorship`. All sections render correctly.

- [ ] **Step 3: Test mobile responsiveness**

Resize browser to ~375px width. Check:
- Trust indicators: 2-column grid
- Flow diagrams: vertical stepper
- Comparison table: horizontal scroll
- All card grids: 1-column

- [ ] **Step 4: Run build check**

```bash
cd /Users/romanpochtman/Developer/doppler/landing && npm run build
```

Ensure no build errors.
