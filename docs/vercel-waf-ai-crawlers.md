# Vercel WAF: stopping AI-crawler spend

> **STATUS 2026-08-14 — this policy is APPLIED and enforcing.** See
> [What is live](#what-is-live) at the bottom. The steps below are kept as the
> rationale and the recovery procedure.

**Why this file exists:** it used to be that the Vercel CLI on this Mac was authenticated
as `vancouverrenovations43-7543`, with no access to the team owning `dopplervpn`, so
`vercel firewall …` returned *Not authorized* and everything had to be done in the
dashboard. **That is fixed** — the CLI is authenticated as `rpochtman-5822` and
`vercel firewall` works, but only when run from `landing/`. Never run `vercel link` at the
repo root; it previously overwrote `landing/.vercel/project.json`.

**The failure this policy actually had:** the rules were written down here in 2026-08-12 but
never applied. On 2026-08-14 the live config still showed `managedRules: null`, and the one
custom rule that did exist (`Block Washington DC`) had action **`log`**, not `deny` — so it
recorded matches and passed the traffic through. Four days of traffic: `waf_action=allow`
171,049 vs `deny` 117. A rule listed as "Enabled" tells you nothing; only the action does.
Always verify with:

```bash
vercel metrics vercel.request.count -a sum --group-by waf_action --since 1h
```

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

---

## What is live

Applied 2026-08-14 via the CLI (run from `landing/`). Custom rules, in evaluation order —
order matters, because `bypass` short-circuits every later custom rule *and* every managed
ruleset:

| # | Rule | Action | Matches |
| --- | --- | --- | --- |
| 1 | `Allow AI citation bots` | Bypass | UA contains `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-User`, `Claude-SearchBot` |
| 2 | `Block Washington DC` | **Deny** (was Log) | `geo_country = US` AND `geo_country_region = DC` |
| 3 | `Deny AI training crawlers` | Deny | UA contains `meta-externalagent`, `meta-externalfetcher`, `meta-webindexer`, `GPTBot`, `ClaudeBot`, `CCBot`, `Bytespider`, `Amazonbot` |
| 4 | `Rate limit crawl burst` | Rate Limit 300/60s, key IP, **exceed = Log** | path starts with `/` |

Plus the **AI Bots managed ruleset**, enabled in **Log** (`managedRules.ai_bots`). It catches
crawlers the UA list above does not name, and Vercel maintains that list.

`Google-Extended` and `Applebot-Extended` are deliberately **not** in rule 3: they are
robots.txt-only tokens that are never sent as a `User-Agent`, so a UA rule for them is dead
weight — and matching on `Applebot-Extended` must not be widened to `Applebot`, which would
block Apple's actual search crawler.

Measured within the hour of publishing: total requests fell from ~1,770/h to 324/h, and
`meta-externalagent` — 96,939 requests over the preceding 4 days, 57% of all traffic — went
to zero. `bypass | perplexitybot` appears in the metrics, confirming rule 1 works.

### Still to do

1. **Flip the AI Bots managed ruleset Log → Deny** after reviewing ~24h of matched traffic
   (Firewall → Traffic; confirm no Googlebot, Bingbot, uptime monitor or real users). There is
   no CLI for managed rulesets — use the dashboard or:
   ```bash
   curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -d '{"action":"managedRules.update","id":"ai_bots","value":{"active":true,"action":"deny"}}' \
     "https://api.vercel.com/v1/security/firewall/config?projectId=prj_UdkPjC4Nhvorxi1ls3IESCS3e0Fc&teamId=team_AuIcOXvD0ArmmWkS3WNyZqrB"
   ```
2. **Flip rule 4's exceed action Log → Deny** after the same review — `vercel firewall rules edit`.
3. **Spend limit** (Settings → Billing). Still outstanding. Deliberately not set unattended:
   hitting it *pauses the project*, i.e. takes the site offline, so the amount is Roman's call.

### visachecker

The sibling project `visachecker` (`prj_PjsFjFHhX0lI4kXSkRROAeYRnXhX`, `visapassage.com`) had
**no firewall configuration at all** and now has rule 4 only. It deliberately does **not** get
rules 1–3: its `src/app/robots.ts` uses `Allow: /` for 13 AI crawlers, the opposite of the
policy here, and that choice was left intact. Its cost was fixed at the source instead — see
[[vercel-isr-write-billing]] and the `perf/isr-write-cost` branch on `pochtmanr/visachecker`.

To run firewall commands against another project without relinking, point `--cwd` at a scratch
directory containing only a `.vercel/project.json` for it.
