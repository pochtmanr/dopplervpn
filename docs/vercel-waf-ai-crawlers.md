# Vercel WAF: stopping AI-crawler spend

**Why this file exists:** the Vercel CLI on this Mac is authenticated as
`vancouverrenovations43-7543`, which has no access to the team that owns the real
`dopplervpn` project. `vercel firewall …` returns *Not authorized*, and a `vercel link`
attempt previously overwrote `landing/.vercel/project.json`. So the WAF has to be configured
by hand in the dashboard. These are the exact steps.

**Why it matters:** Vercel does **not** bill requests denied by the WAF or by a managed
ruleset. Everything else — 200s, 304s, 307 redirects, 404s, the 410 Gone responses, every
middleware invocation — is billed. robots.txt only persuades polite bots; this is the only
layer that actually stops the meter.

Project: `dopplervpn` (`prj_UdkPjC4Nhvorxi1ls3IESCS3e0Fc`, team `team_AuIcOXvD0ArmmWkS3WNyZqrB`)

---

## Background: which bots are worth keeping

Each AI vendor runs *two different* crawlers, and only one of them sends traffic back:

| Vendor | Training crawler (no referral) | Answering agent (cites you) |
| --- | --- | --- |
| OpenAI | `GPTBot` | `OAI-SearchBot`, `ChatGPT-User` |
| Anthropic | `ClaudeBot` | `Claude-User`, `Claude-SearchBot` |
| Google | `Google-Extended` (Gemini training) | — (Search is `Googlebot`, unaffected) |
| Perplexity | — | `PerplexityBot` |
| Meta | `meta-externalagent` (training), `meta-externalfetcher` (agentic), `meta-webindexer` (Meta AI search) | — |
| ByteDance / Common Crawl / Amazon / Apple | `Bytespider`, `CCBot`, `Amazonbot`, `Applebot-Extended` | — |

The 2026-08-12 spike (~$2 in 12h) was **GPTBot** — the training crawler. Denying it costs
zero referral traffic. That is the policy encoded below and in `src/app/robots.ts`.

`Google-Extended` controls Gemini training only. Blocking it has **no** effect on Google
Search crawling, indexing, or ranking.

**Two Meta crawlers must stay unblocked**, and neither is an AI bot:

- `facebookexternalhit` — the link-preview unfurler. Blocking it means shares of
  dopplervpn.org on Facebook, Messenger and WhatsApp render with no title, image or
  description.
- `meta-externalads` — reviews landing pages for ad products. We run paid campaigns
  (see the click-id capture in `src/middleware.ts`), so this one is load-bearing.

Vercel's AI Bots ruleset classifies by bot purpose, so it should not touch either — but
after switching it to Deny in Step 2, confirm with the `facebookexternalhit` curl in
[Verifying](#verifying) and by running a URL through Meta's
[Sharing Debugger](https://developers.facebook.com/tools/debug/).

---

## Step 1 — Allow the citation agents (custom rule, must come first)

The WAF evaluates **custom rules before managed rulesets**, and a `Bypass` action skips all
remaining custom rules *and* every managed ruleset. That ordering is the whole trick: it
lets a blanket AI deny coexist with an allowlist.

1. Dashboard → project **dopplervpn** → **Firewall** → **Rules**
2. **+ New Rule**
3. Name: `Allow AI citation bots`
4. Conditions — add five, each joined with **OR**:

   | Parameter | Operator | Value |
   | --- | --- | --- |
   | User Agent | contains | `OAI-SearchBot` |
   | User Agent | contains | `ChatGPT-User` |
   | User Agent | contains | `PerplexityBot` |
   | User Agent | contains | `Claude-User` |
   | User Agent | contains | `Claude-SearchBot` |

5. Action: **Bypass**
6. Save, then drag the rule to **position 1** in the custom rules list
7. **Review Changes → Publish**

> A user-agent string is spoofable, so this is a small hole by construction — a scraper that
> sets `User-Agent: OAI-SearchBot` gets through. That is an acceptable trade here: the goal
> is cost control against bots that identify themselves honestly, not access control.

## Step 2 — Deny the training crawlers (managed ruleset)

Do **not** jump straight to Deny. Run it in Log for a day first.

1. **Firewall → Rules → Bot Management** section
2. On **AI Bots Ruleset**, select **Log**
3. **Review Changes → Publish**
4. Wait ~24h, then open **Firewall → Traffic** and confirm the matched traffic is only
   training crawlers — no Googlebot, no Bingbot, no uptime monitor, no real users
5. Set the same rule to **Deny** → **Review Changes → Publish**

Vercel maintains the bot list, so newly launched AI crawlers get the same treatment
automatically without further edits.

## Step 3 — Rate-limit backstop (optional, for bots the managed list misses)

1. **+ New Rule**, name: `Rate limit crawl burst`
2. Condition: **Path** / **starts with** / `/`
3. Action: **Rate Limit** — 300 requests per 60s, key by **IP**, action on exceed **Log**
4. **Review Changes → Publish**, review after a day, then switch the exceed action to
   **Deny**

300/min is far above any human but CGNAT can pool real users behind one IP, which is why it
starts in Log. Rate-limit counters are per region, so N regions can collectively exceed the
configured limit by roughly N×.

## Step 4 — Spend guardrail

**Settings → Billing → Spend Limit.** Set an amount and an email alert. This is the
backstop for the next unknown-unknown; it has been outstanding since 2026-08-11.

---

## Verifying

```bash
# After Step 2 reaches Deny:
curl -A "GPTBot" -o /dev/null -sw "%{http_code}\n" https://www.dopplervpn.org/en/blog
# expect 403

curl -A "OAI-SearchBot" -o /dev/null -sw "%{http_code}\n" https://www.dopplervpn.org/en/blog
# expect 200  (Step 1's bypass rule)

curl -A "Googlebot" -o /dev/null -sw "%{http_code}\n" https://www.dopplervpn.org/en/blog
# expect 200  (verified bots are excluded from the AI ruleset)

curl -A "facebookexternalhit/1.1" -o /dev/null -sw "%{http_code}\n" https://www.dopplervpn.org/en
# expect 200  — a 403 here means broken link previews on FB/Messenger/WhatsApp

curl -A "meta-externalagent/1.1" -o /dev/null -sw "%{http_code}\n" https://www.dopplervpn.org/en
# expect 403
```

Then watch **Usage → Edge Requests** over the next 24–48h. Baseline human traffic is roughly
9 visitors/day, so the graph should fall back close to flat.

## Keeping this in sync with the code

`src/app/robots.ts` holds the same policy in advisory form:

- `AI_USER_AGENTS` — must match the bypass rule in Step 1
- `BLOCKED_AI_USER_AGENTS` — the polite-bot half of what Step 2 enforces

If you change one, change the other.
