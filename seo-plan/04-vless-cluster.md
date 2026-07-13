# Prompt 04 — VLESS cluster: CTR rewrites, definitional FAQ, cannibalization cleanup

You are working in `/Volumes/RomanSSD/Developer28062026/doppler/landing` — the Next.js 15 App Router
marketing site for Doppler VPN (dopplervpn.org), 44 locales via next-intl. This prompt is
self-contained. The VLESS topic cluster is the site's biggest organic asset; this package converts
its impressions into clicks and stops three pages competing for one query.

## Ground rules (do not skip)

- Never commit anything under `.secrets/` or `seo-plan/data/`.
- Do NOT `git push` without asking — pushes to main auto-deploy to production (Vercel).
- **Hand-translation rule (absolute):** all locale-string changes in `messages/<locale>.json` are
  translated BY YOU, by hand, in this session — never via scripts, APIs, or translation services.
- No fabricated claims. Product facts from `src/lib/facts.ts`. VLESS/Reality technical claims must be
  accurate (VLESS = stateless proxy protocol used by Xray/V2Ray; REALITY = TLS camouflage that
  borrows a real site's certificate presentation, defeating SNI-based blocking) — keep explanations
  technically honest.
- Blog posts live in **Supabase** (project `fzlrhmjdjjzcgstaeblu`, tables `blog_posts` +
  `blog_translations`). Inspect the schema first (list columns), draft the exact UPDATE, and
  **show it to the user for approval before executing** — it's the production database. Never change
  a post's slug (URLs must not move).
- Verify with `npm run build` before committing.

## Evidence (GSC 90d, pulled 2026-07-14; Bing where noted)

Pages (locale-aggregated where marked Σ):

| Page | Impr | Clicks | CTR | Pos |
|---|---|---|---|---|
| `/vless-vpn` Σ (all locales) | 7,816 | 232 | 2.97% | 7.9 |
| `/fa/vless-vpn` | 4,724 | 208 | **4.40%** | 7.7 |
| `/en/vless-vpn` | 2,264 | 5 | **0.22%** | 8.7 |
| `/zh-Hant/vless-vpn` | 1,573 | 52 | 3.31% | 7.3 |
| `/en/blog/vless-reality-explained` | 1,899 | 16 | 0.84% | 8.2 |
| `/vless-vpn-android` Σ | 442 | 12 | 2.71% | 9.8 |
| `/zh/vless-vpn` (Bing, ~monthly) | ~940 | ~14 | ~1.5% | ~7 |

Key queries → dominant page:

| Query | Impr | Clicks | Pos | Lands on |
|---|---|---|---|---|
| vless | 1,612 | 36 | 9.1 | /fa/vless-vpn (922) + /zh-Hant (411) |
| vless reality | 742 | 34 | 7.4 | split: /zh-Hant (268), /en/blog/vless-reality-explained (235), /fa (167) |
| **what is vless and how does it work?** | **662** | **0** | 9.6 | /en/vless-vpn |
| vless چیست ("what is vless") | 428 | 7 | 6.4 | /fa/vless-vpn |
| vless + reality / vless+reality | 304 | 21 | ~7 | split fa/zh-Hant/blog |
| معنی vless (+ variants یعنی چی/چیه/معنی) | ~530 | 2 | 8–9.5 | /fa/vless-vpn |
| what is vless reality? / how does vless reality work? | 147 | 0 | 5.5–8.6 | /en/blog/vless-reality-explained |
| vpn vless | 39 | 0 | 7.4 | /fa/vless-vpn-android |
| پروتکل reality | 44 | 9 | 4.7 | /fa/vless-vpn |

Trend: "vless" impressions 469 (last 28d) vs 144 (prior); "vless reality" 417 vs 142. The cluster is
exploding — act now.

## Changes

Relevant files: `src/app/[locale]/vless-vpn/page.tsx` (metadata from `messages/<locale>.json`
namespace `vlessVpn.metadata`, FAQ under `vlessVpn.faq.*` — check exact keys),
`src/app/[locale]/vless-vpn-android/page.tsx`, blog post `vless-reality-explained` in Supabase.

1. **`/en/vless-vpn` title/description rewrite** (0.22% CTR at pos 8.7 is a copy failure). The page
   must speak to definitional intent: searchers ask *what VLESS is*, and the SERP title should
   promise that answer plus the product. Pattern to beat: current title (read it in
   `messages/en.json` → `vlessVpn.metadata`). Target shape ≈ "What Is VLESS? The Protocol Explained —
   and the Easiest VLESS VPN" + description that answers the question in one sentence and names
   Reality. Write it fresh, don't copy this literally.
2. **Definitional FAQ entries.** Add 2–3 FAQ items to the `vlessVpn` FAQ namespace answering exactly:
   "What is VLESS and how does it work?", "What is VLESS Reality?", "Is VLESS better than
   WireGuard/OpenVPN for censorship?" (honest answer). They render into the existing `FAQSchema` on
   the page (verify in `src/app/[locale]/vless-vpn/page.tsx`), making the page eligible to answer the
   662-impr zero-click query. Hand-translate the new FAQ strings into **all 44 locales**, prioritizing
   quality on fa, zh-Hant, zh, ru, id (the locales with live impressions).
3. **Persian definitional coverage.** ~950 impr of fa queries are pure definitions (vless چیست, معنی
   vless…). On `/fa/vless-vpn`, make sure the **first visible paragraph** literally answers "vless
   چیست" in natural Persian, and the fa metadata title contains the definitional phrase. You write
   the Persian by hand; match the register of the existing fa strings.
4. **Cannibalization: landing vs blog.** Differentiate intent instead of merging:
   - `/vless-vpn` (all locales) = product/definitional hub. `/en/blog/vless-reality-explained` =
     deep technical explainer.
   - In Supabase, retitle the blog post toward explainer intent (e.g. "VLESS Reality, Explained: How
     It Defeats DPI" — again, write fresh) and make its meta description complementary to, not
     competing with, the landing page. **Do not** change its slug. Ask user before the DB write.
   - Cross-link: blog post body/CTA → `/vless-vpn` ("get a VLESS VPN"); landing page → blog post
     ("read the deep dive"). Check how blog post bodies store links (markdown/HTML in Supabase) and
     how the landing page renders body copy.
5. **Link `/vless-vpn-android`** prominently from `/vless-vpn` (a "VLESS on Android" section/link) —
   it's currently orphaned. (Prompt 03 also adds footer links; do the in-content link here anyway.)
6. Do NOT touch `/zh-Hant` or `/fa` titles unless they're clearly weaker than what you'd write —
   they already convert at 3.3–4.4%. If you improve them, keep the working keywords (vless, reality,
   翻牆/翻墙 terms as applicable).

## Verification

1. `npm run build` green (catches missing message keys across all 44 locales).
2. `npm run dev`: check `/en/vless-vpn`, `/fa/vless-vpn` (RTL), `/zh-Hant/vless-vpn` — new FAQ
   renders, first paragraph answers the definition (fa), cross-links work; view-source: FAQPage
   JSON-LD contains the new questions.
3. For the Supabase change: SELECT the row after UPDATE and paste old→new title/description in chat.
4. Commit; **ask before pushing**. Note deploy date in `seo-plan/00-PLAN.md`.
5. Expected outcome (prompt 07 checks after ≥1 week): `/en/vless-vpn` CTR 0.22% → >1.5%;
   "what is vless and how does it work?" starts earning clicks; blog/landing each rank for their own
   intent instead of splitting "vless reality".
