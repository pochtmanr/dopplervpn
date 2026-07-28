# AppsFlyer Paid-UA — Disclosures & Legal Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every public and store-facing statement match what the apps actually collect once AppsFlyer runs with IDFA/GAID — App Store nutrition label, Play Data safety, privacy policy, subprocessors page, and the no-logs marketing copy.

**Architecture:** Store forms cannot be edited from a toolchain, so each becomes a paste-ready document committed in the app repo it belongs to. The landing site changes are ordinary content edits across 44 locale files plus one hardcoded table.

**Tech Stack:** Next.js App Router, `next-intl` (`messages/<locale>.json`), TypeScript.

## Global Constraints

- Spec: `dopplerswift/docs/superpowers/specs/2026-07-28-appsflyer-paid-ua-design.md`.
- **The VPN no-logs claim stays true and stays.** Tunnel traffic is still never logged. Everything added here is app-usage and attribution data. Every edit must make that distinction explicit rather than blurring the two — a reader who skims must not come away thinking browsing activity is now collected.
- All copy is hand-translated into all 44 locales. No scripts, no third-party translation APIs.
- Do not invent legal entity names, addresses or jurisdictions. Where a value is unknown, look it up on the named source page, not from memory.
- Nothing here may ship before the corresponding client work lands — a policy naming AppsFlyer as a recipient of advertising identifiers while the shipped app declares "no tracking" creates the contradiction in the other direction.

---

### Task 1: App Store Connect nutrition-label document

**Files:**
- Create: `../dopplerswift/docs/store/2026-07-28-app-privacy-declaration.md`

- [ ] **Step 1: Write the document**

```markdown
# App Store Connect — App Privacy answers (v2.9.9)

Set in App Store Connect → your app → App Privacy. Must be updated in the
same submission that ships the ATT build; the shipped `PrivacyInfo.xcprivacy`
declares `NSPrivacyTracking = true`, and a "no tracking" label alongside it is
a rejection reason on its own.

## Tracking

**"Do you or your third-party partners use data for tracking?" → Yes**

Tracking here means linking app data with third-party data for advertising or
ad measurement. AppsFlyer matches install data against ad-network click data
from other companies, which is exactly that.

## Data types

All rows: **Linked to the user = Yes**, **Used for tracking = Yes**.

| Data type | Category | Purposes |
|---|---|---|
| Device ID | Identifiers | Third-Party Advertising; Developer's Advertising or Marketing; Analytics; App Functionality |
| User ID | Identifiers | Developer's Advertising or Marketing; Analytics; App Functionality |
| Purchase History | Purchases | Developer's Advertising or Marketing; Analytics |
| Product Interaction | Usage Data | Developer's Advertising or Marketing; Analytics |

- **Device ID** — IDFA (only with ATT authorisation) and the AppsFlyer ID.
- **User ID** — the anonymous account ID `VPN-XXXX-XXXX-XXXX`, sent to
  AppsFlyer as `customerUserID`.
- **Purchase History** — reaches AppsFlyer through RevenueCat's server-side
  integration, not from the client. It is still collected by the app.
- **Product Interaction** — AppsFlyer session events.

## Not declared

- Browsing or VPN traffic: never collected, never logged. Nothing changes here.
- Precise or Coarse Location: **verify before submitting.** AppsFlyer resolves
  IP to country server-side. Check AppsFlyer's current App Store declaration
  guidance at https://dev.appsflyer.com/hc/docs/ios-data-collection and follow
  whatever it states. Do not guess.

## Sanity check before submitting

The nutrition label, `PulseVPN/PrivacyInfo.xcprivacy`, and this document must
agree. If the app ever reverts to the Strict SDK with no ATT, all three change
back together.
```

- [ ] **Step 2: Resolve the open Coarse Location question**

Fetch `https://dev.appsflyer.com/hc/docs/ios-data-collection`, determine whether AppsFlyer's guidance requires a Coarse Location declaration for IP-to-country resolution, and replace the "verify before submitting" paragraph with the settled answer and a dated citation.

- [ ] **Step 3: Commit (in the dopplerswift repo)**

```bash
cd ../dopplerswift
git add docs/store/2026-07-28-app-privacy-declaration.md
git commit -m "docs: App Store privacy declaration for the ATT build"
```

---

### Task 2: Play Data safety document

**Files:**
- Create: `../DopplerAndroid/docs/store/2026-07-28-play-data-safety.md`

This is the highest-risk item in the whole project: `com.google.android.gms.permission.AD_ID` is already in the shipped 1.7.0 manifest, so the form may already be wrong today.

- [ ] **Step 1: Write the document**

```markdown
# Google Play — Data safety & advertising ID answers (1.7.1)

Set in Play Console → Policy → App content → Data safety, and → Advertising ID.

## Advertising ID declaration

**"Does your app use advertising ID?" → Yes**

Purposes: **Advertising or marketing**, **Analytics**.

The app declares `com.google.android.gms.permission.AD_ID`
(`app/src/main/AndroidManifest.xml:10`) and RevenueCat's
`collectDeviceIdentifiers()` reads the GAID
(`services/AppsFlyerService.kt`). This was already true in 1.7.0 — check what
the form currently says and correct it regardless of when 1.7.1 ships.

## Data safety

### Device or other IDs
- Collected: **Yes** · Shared: **Yes** (with AppsFlyer and, through it, ad networks)
- Purposes: Advertising or marketing; Analytics
- Processed ephemerally: No
- Required or optional: **Optional** — EEA/UK users are asked first and a
  decline stops collection entirely
- Encrypted in transit: Yes
- Deletable: Yes, via in-app account deletion

Covers the Google Advertising ID, the AppsFlyer ID, and the anonymous account
ID `VPN-XXXX-XXXX-XXXX`.

### Purchase history
- Collected: **Yes** · Shared: **Yes** (RevenueCat, and onward to AppsFlyer)
- Purposes: App functionality; Analytics; Advertising or marketing
- Encrypted in transit: Yes · Deletable: Yes

### App activity → App interactions
- Collected: **Yes** · Shared: **Yes** (AppsFlyer sessions)
- Purposes: Analytics; Advertising or marketing

## Not collected

Browsing activity, DNS queries, connection timestamps, assigned IPs, bandwidth
and session duration remain uncollected and unlogged. The no-logs architecture
is unchanged by this work.

## Privacy policy requirement

Play requires the linked privacy policy to disclose advertising-ID use. That
disclosure lands with Task 4 of this plan — do not submit before it is live at
https://dopplervpn.org/privacy.
```

- [ ] **Step 2: Commit (in the DopplerAndroid repo)**

```bash
cd ../DopplerAndroid
git add docs/store/2026-07-28-play-data-safety.md
git commit -m "docs: Play Data safety and advertising ID declarations"
```

---

### Task 3: RevenueCat → AppsFlyer server-side verification checklist

Conversion events are configured in dashboards, not code. This task produces the checklist and confirms the integration is actually live.

**Files:**
- Create: `../dopplerswift/docs/store/2026-07-28-revenuecat-appsflyer-integration.md`

- [ ] **Step 1: Write the checklist**

```markdown
# RevenueCat → AppsFlyer integration checklist

No client event code exists by design: the client sets the AppsFlyer ID on
RevenueCat (`setAppsflyerID`) and RevenueCat forwards subscription events to
AppsFlyer server-side. Logging the same events client-side would double-count.

## Verify in the RevenueCat dashboard

- [ ] Integrations → AppsFlyer is **enabled**
- [ ] AppsFlyer Dev Key matches `APPSFLYER_DEV_KEY` in `Secrets.xcconfig` (iOS)
      and `local.properties` (Android)
- [ ] Apple App ID `6757091773` and Android package `org.dopplervpn.android` are set
- [ ] Event mapping is on for: initial purchase, trial start, trial conversion,
      renewal, cancellation
- [ ] Currency and revenue are forwarded (needed for ROAS)

## Verify end to end

- [ ] Make a sandbox purchase on iOS → `af_purchase` appears in AppsFlyer
      within ~15 minutes, attributed to the same AppsFlyer ID as the install
- [ ] Same on Android
- [ ] Start a trial → `af_start_trial` appears
- [ ] The event carries the customer user ID `VPN-XXXX-XXXX-XXXX`

## Ad-network optimisation

Once events flow, connect them in each ad network's console (Meta, Google,
TikTok) so campaigns can optimise on purchase rather than install.
```

- [ ] **Step 2: Work through the checklist and record the outcome**

Tick each box or note what was missing and what was changed. An unticked checklist committed as "done" is worse than no checklist.

- [ ] **Step 3: Commit**

```bash
cd ../dopplerswift
git add docs/store/2026-07-28-revenuecat-appsflyer-integration.md
git commit -m "docs: RevenueCat to AppsFlyer server-side event checklist"
```

---

### Task 4: English policy copy

**Files:**
- Modify: `messages/en.json` (`privacy.sections.collect` `:449-452`, `privacy.sections.thirdParty` `:469-472`, `security.sections.noLogs`)
- Modify: `src/app/[locale]/security/page.tsx` (`ONLY_KEYS` `:63`)

**Interfaces:**
- Produces: the English source text Tasks 6–8 translate, and one new key `security.sections.noLogs.only4`.

- [ ] **Step 1: Rewrite `privacy.sections.collect.content`**

Append to the existing content, after the payment-information sentence and before the DPA sentence:

```
When you install one of our mobile apps we also process attribution data through AppsFlyer: your device's advertising identifier (Apple IDFA or Google Advertising ID), your anonymous account ID, app session events and your IP address, which AppsFlyer resolves to a country. This tells us which advertising campaign brought you to Doppler. It is app-usage data only — it never includes your browsing activity, DNS queries or anything carried inside the VPN tunnel, none of which we log. On iOS the advertising identifier is only used if you allow it in the App Tracking Transparency prompt. In the EEA and UK we ask for your consent before any of this is collected, and declining leaves the app fully functional.
```

- [ ] **Step 2: Rewrite `privacy.sections.thirdParty.content`**

Replace the phrase `and analytics providers (aggregate, anonymised usage data only)` with:

```
AppsFlyer (mobile attribution and marketing analytics — receives your advertising identifier, anonymous account ID, IP address and app events, and shares campaign-level attribution with the ad networks we advertise on), and analytics providers (aggregate, anonymised usage data only)
```

The old wording is the specific sentence that is untrue today, since AppsFlyer receives the account ID.

- [ ] **Step 3: Add `security.sections.noLogs.only4`**

Add after `only3`:

```json
        "only4": "Mobile attribution data — advertising identifier, anonymous account ID and app events (not VPN traffic), with consent in the EEA and UK",
```

- [ ] **Step 4: Render the new key**

In `src/app/[locale]/security/page.tsx:63`:

```tsx
const ONLY_KEYS = ["only1", "only2", "only3", "only4"] as const;
```

- [ ] **Step 5: Verify**

```bash
python3 -c "import json; json.load(open('messages/en.json')); print('valid')"
npm run build 2>&1 | tail -5
```

Expected: `valid`, then a successful build. A build failure naming a missing message key means `only4` is missing from a locale that the build prerenders — Tasks 6–8 fix that; until then run `npm run dev` and check `/en/security` manually.

- [ ] **Step 6: Commit**

```bash
git add messages/en.json "src/app/[locale]/security/page.tsx"
git commit -m "content: disclose AppsFlyer attribution in privacy and security copy (en)"
```

---

### Task 5: Subprocessors table row

**Files:**
- Modify: `src/app/[locale]/subprocessors/page.tsx` (the `as const` array ending at `:96`)

The table rows are hardcoded English and not localized, so this is a single edit.

- [ ] **Step 1: Add the row after the RevenueCat entry**

```tsx
  {
    name: "AppsFlyer Ltd.",
    purpose: "Mobile install attribution & marketing analytics",
    location: "Israel (HQ), EU data centre",
    data: "Advertising identifier, anonymous account ID, IP address, app events",
    privacy: "https://www.appsflyer.com/legal/services-privacy-policy/",
  },
```

- [ ] **Step 2: Confirm the entity and data-region values**

Open https://www.appsflyer.com/legal/services-privacy-policy/ and confirm the legal entity name and the data-processing region that applies to your account. Correct the row if it differs — do not ship a guessed jurisdiction on a subprocessor page that your DPA points customers at.

- [ ] **Step 3: Verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: build succeeds; `/en/subprocessors` shows the new row.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/subprocessors/page.tsx"
git commit -m "content: list AppsFlyer as a subprocessor"
```

---

### Tasks 6–8: Translate the policy copy into all 43 non-English locales

**Translate by hand. No scripts, no third-party translation APIs — this is a standing project rule.** For each locale file, update `privacy.sections.collect.content`, `privacy.sections.thirdParty.content`, and add `security.sections.noLogs.only4`.

Constraints in every language:
- These are legal texts. Translate meaning precisely; do not compress or omit clauses.
- The distinction between app-usage data (collected) and VPN traffic (never logged) must survive translation intact. If a language makes the sentence unwieldy, split it rather than dropping the clause.
- Keep brand and product names untranslated: AppsFlyer, RevenueCat, Doppler VPN, App Tracking Transparency.
- Validate each file parses after editing.

- [ ] **Task 6 — Western Europe (14):** `de`, `fr`, `es`, `it`, `nl`, `pt`, `ca`, `sv`, `da`, `nb`, `fi`, `el`, `hu`, `ro`
  Then: `for f in de fr es it nl pt ca sv da nb fi el hu ro; do python3 -c "import json;json.load(open('messages/$f.json'))" || echo "INVALID $f"; done`
  Expected: no output.
  Commit: `git commit -m "i18n: AppsFlyer disclosure — Western European locales"`

- [ ] **Task 7 — Eastern Europe, Middle East, Africa (18):** `pl`, `cs`, `sk`, `sl`, `hr`, `bg`, `et`, `lv`, `lt`, `uk`, `ru`, `tr`, `az`, `ar`, `fa`, `he`, `ur`, `sw`
  Validate as above and commit: `git commit -m "i18n: AppsFlyer disclosure — Eastern European, MEA locales"`

- [ ] **Task 8 — Asia (11):** `zh`, `zh-Hant`, `ja`, `ko`, `hi`, `bn`, `th`, `vi`, `id`, `ms`, `tl`
  Validate as above and commit: `git commit -m "i18n: AppsFlyer disclosure — Asian locales"`

After Task 8, confirm full coverage and a clean build:

```bash
grep -L "only4" messages/*.json
npm run build 2>&1 | tail -5
```

Expected: no output from `grep -L`, and a successful build.

---

### Task 9: Sweep for claims that are now contradicted

**Files:**
- Modify: whatever the sweep finds.

- [ ] **Step 1: Find absolute tracking claims**

```bash
grep -rn -i "never track\|no tracking\|zero tracking\|don't track\|do not track\|tracker-free" messages/ src/ --include="*.json" --include="*.tsx" | grep -v node_modules
```

- [ ] **Step 2: Judge each hit**

A claim about **VPN traffic** ("we never log what you browse", "no traffic logs") stays — it is still true. A claim that the app performs **no tracking at all** does not, now that the iOS build declares `NSPrivacyTracking = true`. Narrow those to the traffic claim rather than deleting them: the true statement is still a strong one.

- [ ] **Step 3: Apply the same sweep to in-app copy**

```bash
grep -rn -i "never track\|no tracking\|zero tracking" ../dopplerswift/PulseVPN/Localizable.xcstrings ../DopplerAndroid/app/src/main/res/values/strings.xml
```

Fix any hits in English first, then in every locale, by hand.

- [ ] **Step 4: Verify and commit**

```bash
npm run build 2>&1 | tail -5
git add -A
git commit -m "content: narrow absolute no-tracking claims to VPN traffic"
```

---

### Task 10: Ship gate

- [ ] **Step 1: Confirm ordering**

Landing changes go live **before or with** the app submissions, never after. Play explicitly checks that the linked privacy policy discloses advertising-ID use.

- [ ] **Step 2: Final cross-check**

| Statement | Location | Must say |
|---|---|---|
| Tracking = yes | `PrivacyInfo.xcprivacy`, App Store label | Both |
| Advertising ID = yes | `AndroidManifest.xml`, Play Data safety | Both |
| AppsFlyer named | `messages/*.json`, subprocessors page | Both |
| No-logs (VPN traffic) | everywhere | Unchanged and still true |

- [ ] **Step 3: Deploy**

Push to the branch and let the GitHub → Vercel deploy run. Do not use the Vercel CLI from this machine — it is authenticated to the wrong account and cannot manage the real `dopplervpn` project.
