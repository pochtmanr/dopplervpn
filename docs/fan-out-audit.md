# Fan-out FAQ Audit (Phase 2.2)

> Source: GEO blueprint section 2.1–2.2 (`landing/seo.md`). Pages that answer the
> fan-out sub-queries Google generates from a primary H1 are 161% more likely to
> be cited in AI Overviews. Target density: 8–10 FAQ items per landing page,
> dense and intent-matched (~2–3 sentences each), no historical-bloat dilution.

## Baseline → expanded

All 12 short-template SEO landing pages went from 6 FAQ items → 9. The
`SeoLandingPage` component default `faqCount` was bumped from 6 to 9
(`src/components/landing/seo-landing-page.tsx`). Pages with shorter FAQ
inventories should override explicitly.

The three new keys per namespace are `q7` / `q8` / `q9`. They cover gaps the
existing six left open — primarily fan-out queries that Google's PAA panel
surfaces for the page's H1.

## Per-page additions

| Namespace | New FAQ topics |
|---|---|
| `vpnForChina` | How VLESS-Reality bypasses the GFW · Google/Gmail/YouTube blocked list · Why other VPNs fail in China |
| `vpnForIran` | Installing when App Store is restricted · Full blocked-app list (IG, WhatsApp, Signal, Telegram) · Carrier compatibility (MCI, Irancell, Rightel) |
| `vpnForRussia` | Why other VPNs stopped working in 2026 (RKN DPI) · YouTube/Instagram/Facebook access · Whether VPN use attracts attention |
| `vpnForTurkey` | Twitter/Wikipedia/news outlet unblocking · BTK DPI mechanism · Banking/e-Devlet per-app handling |
| `vpnForUae` | Employer / corporate-network visibility · Hotel & corporate Wi-Fi compatibility · Skype/Zoom/Teams unblocking |
| `vpnForInstagramRussia` | Why Instagram was blocked (Meta extremist designation) · DMs/shopping/reels full coverage · Going-live latency from Russia |
| `vpnForPublicWifiIphone` | Concrete public-Wi-Fi attack catalog · DNS encryption · Cellular-data comparison |
| `vpnForTelegramCallsUae` | All-Telegram-features coverage · Secret chats compatibility · BOTIM cost/coverage comparison |
| `vpnForWhatsappCallsUae` | HD video-call latency · Account-ban myth · Per-app toggling vs always-on |
| `vpnForTiktokBan` | Current per-country ban status · Installing from foreign App Store / APK · National-security ban resilience |
| `vpnForTravelersChina` | Full app/service block list for China · OPSEC for discussing VPN use · Border-control / customs reality check |
| `vlessVpnAndroid` | VLESS vs VMess vs Trojan · Reality TLS handshake specifics · Doppler vs manual v2rayNG setup |

## Future expansion

These pages already exceed the blueprint's 540-word AI Overview grounding
window when including FAQ content. Pushing past 9 items risks intent dilution —
the next iteration should focus on **quality refresh of existing answers** as
the censorship landscape changes, not adding more questions.

The four extended Article pages (`bypass-censorship`, `vless-vpn`,
`no-registration-vpn`, `pay-with-crypto`) and the platform pages
(`vpn-for-ios`, `vpn-for-android`, `vpn-for-macos`, `vpn-for-windows`) were
not audited in this pass — they have custom layouts and longer-form content
that needs a separate per-page review.
