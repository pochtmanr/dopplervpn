# Doppler VPN Landing Page — Trust & Conversion Improvements

## Goal

Reposition Doppler from "free privacy VPN" to "censorship-resistant VPN built on VLESS-Reality." Increase trust and conversions by adding technical credibility, social proof, and clear differentiation from mainstream VPNs.

## Scope

- Rewrite hero section copy
- Add 6 new homepage sections
- Keep existing "How It Works" as-is (no rename — title "Get started in seconds" already works)
- Create new /bypass-censorship page
- Add English translations first; other 20 languages deferred to a separate pass

## Unchanged Sections

Features bento grid, Servers, Pricing, FAQ, CTA, Blog, Footer, How It Works — no modifications.

---

## Homepage Structure (final order)

1. Hero (rewritten)
2. Trust Indicators Strip (NEW)
3. How Doppler Protects Your Traffic (NEW)
4. Features (existing)
5. Censorship Resistance (NEW)
6. Use Cases (NEW)
7. Comparison Table (NEW)
8. Servers (existing)
9. Pricing (existing)
10. Privacy Model (NEW)
11. How It Works (existing, unchanged)
12. FAQ (existing)
13. CTA (existing)
14. Blog (existing)

---

## Section Designs

### 1. Hero (Rewrite)

The hero component currently uses a split-headline structure with `headlinePart1a`, `headlinePart1b`, `headlinePart2`, plus `tagline` and `subtitle` keys, and a `PromoCode` component in the tagline position. It also uses `FALLBACK_FONT_LOCALES` for non-Latin scripts.

**Changes:**
- Remove `PromoCode` import and component usage. Replace with a static badge/pill displaying the tagline text.
- Reuse existing translation key structure with new values:
  - `hero.tagline`: "Censorship-Resistant VPN"
  - `hero.headlinePart1a`: "Works where other VPNs"
  - `hero.headlinePart1b`: "get blocked."
  - `hero.headlinePart2`: "" (empty — single-line headline is sufficient)
  - `hero.subheadline`: "Built on VLESS-Reality — your traffic looks like regular HTTPS. Undetectable by deep packet inspection. No registration, no logs, no tracking."
- Reuse existing `hero.trustBadges.*` keys with new values:
  - `hero.trustBadges.noData`: "No Registration Required"
  - `hero.trustBadges.noLogs`: "No Activity Logs"
  - `hero.trustBadges.unlimited`: "DPI-Resistant Traffic"
  - `hero.trustBadges.vless`: "VLESS-Reality Protocol"
- Keep `FALLBACK_FONT_LOCALES` logic and all CTA logic unchanged
- Keep the split-headline rendering structure (italic part1a + normal part1b + gradient part2)

### 2. Trust Indicators Strip (NEW)

**Exported component:** `TrustIndicators`
**File:** `src/components/sections/trust-indicators.tsx`

Horizontal row with subtle background band (e.g., slightly darker or tinted background). 5 items with icon + label + one-liner.

| Item | Description |
|------|-------------|
| No Account Needed | Your device is your identity |
| Zero Activity Logs | We can't see what you browse |
| Encrypted DNS | Every query protected |
| DPI Bypass | Traffic looks like normal HTTPS |
| Free Tier Available | Try before you commit |

**Note:** These are distinct from the hero trust badges. Hero badges are brief labels (no description). Trust Indicators are fuller statements with explanatory one-liners. No duplication — they serve different functions (quick scan vs. reinforcement).

**Mobile:** 2-column grid.
**RTL:** Row direction reverses automatically via CSS `dir="rtl"`. No special handling needed for icons.

### 3. How Doppler Protects Your Traffic (NEW)

**Exported component:** `TechnicalHowItWorks`
**File:** `src/components/sections/technical-how-it-works.tsx`

**Title:** "How Doppler Protects Your Traffic"
**Subtitle:** "Your connection is encrypted and routed through Doppler's edge network. Nothing is logged."

**Visual:** 4-step flow diagram:
```
Your Device -> Encrypted VLESS Tunnel -> Doppler Edge Node -> Open Internet
```

**Layout:**
- Desktop: horizontal flow with arrow connectors between steps
- Mobile: vertical stepper (stacked top-to-bottom with downward arrows)
- RTL: horizontal flow reverses direction (right-to-left arrows). Use CSS `flex-direction: row` which auto-reverses in RTL context. Arrow icons should use `rtl:rotate-180` or use logical direction arrows.

**3 explanation cards below (grid: 3-col desktop, 1-col mobile):**

1. **VLESS-Reality Handshake** — "Your connection mimics a normal HTTPS session. Network firewalls and DPI systems can't distinguish Doppler traffic from regular web browsing."
2. **Encrypted DNS Pipeline** — "DNS queries are encrypted before leaving your device. Your ISP never sees which domains you visit."
3. **Device-Based Authentication** — "No accounts, no emails, no passwords. Your device identity is the only key — nothing personally identifiable is stored on our servers."

### 4. Censorship Resistance (NEW)

**Exported component:** `CensorshipResistance`
**File:** `src/components/sections/censorship-resistance.tsx`

**Title:** "Designed for Restrictive Networks"
**Subtitle:** "Doppler uses techniques that make VPN traffic invisible to network censorship systems."

**4 cards (2x2 grid desktop, 1-col mobile):**

1. **Deep Packet Inspection Bypass** — "Traditional VPN protocols have recognizable traffic signatures. VLESS-Reality eliminates them — your traffic is indistinguishable from regular HTTPS."
2. **TLS Traffic Camouflage** — "Doppler performs a genuine TLS handshake with a real website certificate. Censorship systems see normal web traffic, not a VPN connection."
3. **No Detectable Protocol Fingerprint** — "Unlike OpenVPN or WireGuard, VLESS-Reality leaves no protocol fingerprint. There's nothing for automated blocking systems to match against."
4. **Works in Restricted Regions** — "Tested and operational in networks with active VPN blocking. Doppler connects where mainstream VPNs fail."

### 5. Use Cases (NEW)

**Exported component:** `UseCases`
**File:** `src/components/sections/use-cases.tsx`

**Title:** "Who Uses Doppler"
**Subtitle:** "Built for people who need more than a generic VPN."

**4 cards (2x2 grid desktop, 1-col mobile):**

1. **People in Restricted Networks** — "Connect freely when your government or ISP blocks VPN traffic. Doppler's protocol bypasses active censorship."
2. **Travelers on Public Wi-Fi** — "Hotel, airport, cafe — your traffic is encrypted and your DNS queries are private. No one on the network can see what you do."
3. **Journalists & Researchers** — "Access blocked sources and communicate without exposing your traffic patterns. No account means no identity trail."
4. **Developers & Remote Workers** — "Reliable encrypted tunnels that don't get throttled or blocked. Works consistently across restrictive corporate and national firewalls."

### 6. Comparison Table (NEW)

**Exported component:** `ComparisonTable`
**File:** `src/components/sections/comparison-table.tsx`
**Translation namespace:** `comparisonTable.*`

**Title:** "Doppler vs. Traditional VPNs"
**Subtitle:** "Not all VPNs are built the same."

| Feature | Traditional VPN | Doppler |
|---------|----------------|---------|
| Account required | Email + password | No account needed |
| Traffic fingerprint | Detectable by DPI | Camouflaged as HTTPS |
| Protocol | OpenVPN / WireGuard | VLESS-Reality |
| DNS encryption | Sometimes | Always |
| Censorship resistance | Limited | Built-in |
| Activity logs | Varies | Never |

**Visual:** Two-column comparison, Doppler column highlighted with accent color. Traditional column muted.
**Implementation:** Use semantic `<table>` element with `<thead>`, `<th scope="col">` for column headers, and `<th scope="row">` for feature name cells. Screen readers must be able to navigate the table.
**Mobile:** Table scrolls horizontally, or reflows to stacked cards (feature → traditional → doppler per row).
**RTL:** Table column order stays the same (Feature | Traditional | Doppler) — content reads correctly in both directions.

### 7. Privacy Model (NEW)

**Exported component:** `PrivacyModel`
**File:** `src/components/sections/privacy-model.tsx`

**Title:** "What We Don't Store"
**Subtitle:** "Privacy by architecture, not just policy."

**4 items (2x2 grid desktop, 1-col mobile):**
- **No browsing logs** — "We never see which websites you visit"
- **No IP address logs** — "Your real IP is never recorded"
- **No DNS query storage** — "Encrypted and discarded after resolution"
- **No account database** — "Device authentication means no personal data to store"

**Tagline:** "We can't hand over data we don't have."

---

## New Page: /bypass-censorship

**URL:** `/[locale]/bypass-censorship`
**File:** `src/app/[locale]/bypass-censorship/page.tsx`

### Metadata

The page must export `generateMetadata` using `getTranslations`. Translation keys:
- `bypassCensorship.metadata.title`: "How Doppler Bypasses Internet Censorship | Doppler VPN"
- `bypassCensorship.metadata.description`: "Learn how VLESS-Reality makes VPN traffic undetectable by deep packet inspection and censorship systems."

### Navigation

Add a link to this page from:
- The Censorship Resistance section on the homepage (a "Learn more" link on the section)
- The footer under an appropriate column

Do NOT add to the main navbar — it's a depth page, not a primary navigation item.

### Page Sections

**Hero:**
- **Title:** "How Doppler Bypasses Internet Censorship"
- **Subtitle:** "A technical overview of how VLESS-Reality makes VPN traffic undetectable."

**Section 1: The Problem**
- **Title:** "How Censorship Systems Block VPNs"
- Content: DPI explanation, protocol fingerprinting, known IP blocking, TLS fingerprint analysis. 2-3 paragraphs, accessible language.

**Section 2: How Doppler Evades Detection**
- **Title:** "Why Doppler Traffic Is Invisible"
- 4 subsections:
  - Reality Handshake (genuine TLS with real certificate)
  - No Protocol Signature (unlike OpenVPN/WireGuard)
  - Traffic Indistinguishable from HTTPS
  - Dynamic server infrastructure (Doppler rotates server IPs and endpoints, making it harder for censorship systems to maintain blocklists)

**Section 3: Visual Flow Diagram**
- Detailed annotated flow:
  - Your Device -> TLS Handshake (looks like visiting a normal website) -> VLESS Tunnel Established -> Doppler Node -> Open Internet
- Annotations showing what DPI sees at each step: "normal HTTPS traffic"
- Desktop: horizontal. Mobile: vertical stepper. RTL: flow reverses.

**Section 4: Protocol Comparison Table**

| | OpenVPN | WireGuard | VLESS-Reality |
|---|---|---|---|
| Detectability | High | Medium | Very Low |
| Speed | Moderate | Fast | Fast |
| Censorship Resistance | Low | Low | High |
| Protocol Fingerprint | Visible | Visible | None |

Use semantic `<table>` with proper `<th>` and `scope` attributes.

**Section 5: Where Doppler Works**
- Network environments: restrictive ISPs, national firewalls, corporate networks
- No specific country claims — keep as "restrictive network environments"

**Bottom CTA:**
- "Try Doppler in your network" + platform-aware download buttons (reuse hero CTA logic)

---

## Translation Strategy

- All new content added to `messages/en.json` first
- New translation key namespaces:
  - `trustIndicators.*`
  - `technicalHowItWorks.*`
  - `censorshipResistance.*`
  - `useCases.*`
  - `comparisonTable.*`
  - `privacyModel.*`
  - `bypassCensorship.*` (for the new page, including `bypassCensorship.metadata.*`)
- Translations to other 20 languages deferred to a separate session. Those 20 `messages/*.json` files are NOT modified in this implementation.

## Accessibility Requirements

- Comparison tables: semantic `<table>` with `<th scope="col">` and `<th scope="row">`
- Flow diagrams: include `aria-label` describing the flow for screen readers
- All new sections: proper heading hierarchy (h2 for section titles, h3 for card titles)
- Interactive elements: visible focus indicators
- Color contrast: all text meets WCAG AA (4.5:1 for body text, 3:1 for large text)

## File Changes Summary

**New files:**
- `src/components/sections/trust-indicators.tsx` — exports `TrustIndicators`
- `src/components/sections/technical-how-it-works.tsx` — exports `TechnicalHowItWorks`
- `src/components/sections/censorship-resistance.tsx` — exports `CensorshipResistance`
- `src/components/sections/use-cases.tsx` — exports `UseCases`
- `src/components/sections/comparison-table.tsx` — exports `ComparisonTable`
- `src/components/sections/privacy-model.tsx` — exports `PrivacyModel`
- `src/app/[locale]/bypass-censorship/page.tsx` — new page

**Modified files:**
- `src/components/sections/hero.tsx` — remove `PromoCode` import/usage, replace with static tagline badge, update copy
- `src/app/[locale]/page.tsx` — add 6 new sections to page flow
- `src/components/sections/index.ts` — export 6 new section components (create file if absent)
- `src/components/layout/footer.tsx` (or equivalent) — add link to `/bypass-censorship` under appropriate column
- `messages/en.json` — add all new translation keys (7 new namespaces)

**Unchanged files:**
- `src/components/sections/features.tsx`
- `src/components/sections/servers.tsx`
- `src/components/sections/pricing.tsx`
- `src/components/sections/faq.tsx`
- `src/components/sections/cta.tsx`
- `src/components/sections/how-it-works.tsx`

**Deferred (separate session):**
- `messages/{ru,uk,zh,ja,ko,ar,fa,he,hi,ur,th,es,fr,de,pt,vi,id,tr,sw,fil}.json` — translations
