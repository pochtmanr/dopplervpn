# Doppler VPN Landing Page — Trust & Conversion Improvements

## Goal

Reposition Doppler from "free privacy VPN" to "censorship-resistant VPN built on VLESS-Reality." Increase trust and conversions by adding technical credibility, social proof, and clear differentiation from mainstream VPNs.

## Scope

- Rewrite hero section copy
- Add 6 new homepage sections
- Rename existing "How It Works" to "Get Started"
- Create new /bypass-censorship page
- Add translations for all new content (21 languages)

## Unchanged Sections

Features bento grid, Servers, Pricing, FAQ, CTA, Blog, Footer — no modifications.

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
11. Get Started (existing How It Works, renamed)
12. FAQ (existing)
13. CTA (existing)
14. Blog (existing)

---

## Section Designs

### 1. Hero (Rewrite)

**Tagline:** "Censorship-Resistant VPN"
**Headline:** "Works where other VPNs get blocked."
**Subheadline:** "Built on VLESS-Reality — your traffic looks like regular HTTPS. Undetectable by deep packet inspection. No registration, no logs, no tracking."

**Trust strip (4 items):**
- No Registration Required
- VLESS-Reality Protocol
- DPI-Resistant Traffic
- No Activity Logs

CTAs: unchanged (platform-aware downloads).

### 2. Trust Indicators Strip (NEW)

Horizontal row, subtle background band. 5 items with icon + label + one-liner.

| Item | Description |
|------|-------------|
| No Account Needed | Your device is your identity |
| Zero Activity Logs | We can't see what you browse |
| Encrypted DNS | Every query protected |
| DPI Bypass | Traffic looks like normal HTTPS |
| Free Tier Available | Try before you commit |

Mobile: 2-column grid or horizontal scroll.

### 3. How Doppler Protects Your Traffic (NEW)

**Title:** "How Doppler Protects Your Traffic"
**Subtitle:** "Your connection is encrypted and routed through Doppler's edge network. Nothing is logged."

**Visual:** 4-step horizontal flow diagram:
```
Your Device -> Encrypted VLESS Tunnel -> Doppler Edge Node -> Open Internet
```

**3 explanation cards below:**

1. **VLESS-Reality Handshake** — "Your connection mimics a normal HTTPS session. Network firewalls and DPI systems can't distinguish Doppler traffic from regular web browsing."
2. **Encrypted DNS Pipeline** — "DNS queries are encrypted before leaving your device. Your ISP never sees which domains you visit."
3. **Device-Based Authentication** — "No accounts, no emails, no passwords. Your device identity is the only key — nothing personally identifiable is stored on our servers."

### 4. Censorship Resistance (NEW)

**Title:** "Designed for Restrictive Networks"
**Subtitle:** "Doppler uses techniques that make VPN traffic invisible to network censorship systems."

**4 cards:**

1. **Deep Packet Inspection Bypass** — "Traditional VPN protocols have recognizable traffic signatures. VLESS-Reality eliminates them — your traffic is indistinguishable from regular HTTPS."
2. **TLS Traffic Camouflage** — "Doppler performs a genuine TLS handshake with a real website certificate. Censorship systems see normal web traffic, not a VPN connection."
3. **No Detectable Protocol Fingerprint** — "Unlike OpenVPN or WireGuard, VLESS-Reality leaves no protocol fingerprint. There's nothing for automated blocking systems to match against."
4. **Works in Restricted Regions** — "Tested and operational in networks with active VPN blocking. Doppler connects where mainstream VPNs fail."

### 5. Use Cases (NEW)

**Title:** "Who Uses Doppler"
**Subtitle:** "Built for people who need more than a generic VPN."

**4 cards:**

1. **People in Restricted Networks** — "Connect freely when your government or ISP blocks VPN traffic. Doppler's protocol bypasses active censorship."
2. **Travelers on Public Wi-Fi** — "Hotel, airport, cafe — your traffic is encrypted and your DNS queries are private. No one on the network can see what you do."
3. **Journalists & Researchers** — "Access blocked sources and communicate without exposing your traffic patterns. No account means no identity trail."
4. **Developers & Remote Workers** — "Reliable encrypted tunnels that don't get throttled or blocked. Works consistently across restrictive corporate and national firewalls."

### 6. Comparison Table (NEW)

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

Visual: two-column comparison, Doppler column highlighted. Checkmarks/crosses or color coding.

### 7. Privacy Model (NEW)

**Title:** "What We Don't Store"
**Subtitle:** "Privacy by architecture, not just policy."

**4 items:**
- **No browsing logs** — "We never see which websites you visit"
- **No IP address logs** — "Your real IP is never recorded"
- **No DNS query storage** — "Encrypted and discarded after resolution"
- **No account database** — "Device authentication means no personal data to store"

**Tagline:** "We can't hand over data we don't have."

### 8. How It Works -> Get Started (Rename)

Rename section title from "Get started in seconds" to "Get Started" (or keep as-is since the title already says "Get started in seconds"). The subtitle "Choose a plan, download the app, and connect" stays. Content unchanged. Translation key `howItWorks` stays to avoid breaking other languages — only update the English title if needed.

---

## New Page: /bypass-censorship

**URL:** `/[locale]/bypass-censorship`

### Hero
- **Title:** "How Doppler Bypasses Internet Censorship"
- **Subtitle:** "A technical overview of how VLESS-Reality makes VPN traffic undetectable."

### Section 1: The Problem
- **Title:** "How Censorship Systems Block VPNs"
- Content: DPI explanation, protocol fingerprinting, known IP blocking, TLS fingerprint analysis. 2-3 paragraphs, accessible language.

### Section 2: How Doppler Evades Detection
- **Title:** "Why Doppler Traffic Is Invisible"
- 4 subsections:
  - Reality Handshake (genuine TLS with real certificate)
  - No Protocol Signature (unlike OpenVPN/WireGuard)
  - Traffic Indistinguishable from HTTPS
  - Dynamic server infrastructure

### Section 3: Visual Flow Diagram
- Detailed annotated flow:
  - Your Device -> TLS Handshake (looks like visiting a normal website) -> VLESS Tunnel Established -> Doppler Node -> Open Internet
- Annotations showing what DPI sees at each step: "normal HTTPS traffic"

### Section 4: Protocol Comparison Table
| | OpenVPN | WireGuard | VLESS-Reality |
|---|---|---|---|
| Detectability | High | Medium | Very Low |
| Speed | Moderate | Fast | Fast |
| Censorship Resistance | Low | Low | High |
| Protocol Fingerprint | Visible | Visible | None |

### Section 5: Where Doppler Works
- Network environments: restrictive ISPs, national firewalls, corporate networks
- No specific country claims — keep as "restrictive network environments"

### Bottom CTA
- "Try Doppler in your network" + platform-aware download buttons

---

## Translation Strategy

- All new content added to `messages/en.json` first
- New translation keys namespaced:
  - `trustIndicators.*`
  - `technicalHowItWorks.*`
  - `censorshipResistance.*`
  - `useCases.*`
  - `comparison.*`
  - `privacyModel.*`
  - `bypassCensorship.*` (for the new page)
- Translations to other 20 languages done in a separate pass after English is implemented and reviewed

## File Changes Summary

**New files:**
- `src/components/sections/trust-indicators.tsx`
- `src/components/sections/technical-how-it-works.tsx`
- `src/components/sections/censorship-resistance.tsx`
- `src/components/sections/use-cases.tsx`
- `src/components/sections/comparison-table.tsx`
- `src/components/sections/privacy-model.tsx`
- `src/app/[locale]/bypass-censorship/page.tsx`

**Modified files:**
- `src/components/sections/hero.tsx` — copy changes
- `src/app/[locale]/page.tsx` — add new sections to page flow
- `src/components/sections/index.ts` — export new sections
- `messages/en.json` — add all new translation keys

**Unchanged files:**
- `src/components/sections/features.tsx`
- `src/components/sections/servers.tsx`
- `src/components/sections/pricing.tsx`
- `src/components/sections/faq.tsx`
- `src/components/sections/cta.tsx`
- `src/components/sections/how-it-works.tsx` (content unchanged, rename optional)
