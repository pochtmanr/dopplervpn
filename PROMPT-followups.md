# Follow-up prompt — payment naming, Terms/DPA staleness, Windows release

Paste the whole of this into a fresh session. Work in
`/Volumes/RomanSSD/Developer28062026/doppler`. Two repos are involved:
`landing/` (GitHub `pochtmanr/dopplervpn`, auto-deploys to dopplervpn.org on
push to `main`) and `dopplerWindows/` (GitHub `pochtmanr/dopplerWindows`,
currently on branch `feat/supabase-host-failover`).

---

## Ground truth — establish this before touching anything

**The payment processors are Revolut (cards, web checkout) and OxaPay
(cryptocurrency). There is no Stripe.** Mobile in-app purchases go through the
Apple App Store / Google Play and are reconciled via RevenueCat.

Verify it yourself rather than trusting any document:

```bash
cd landing
grep -i stripe package.json                 # expect: nothing
grep -rhoE "(STRIPE|REVOLUT|OXAPAY)_[A-Z_]+" src .env.example | sort -u
```

A previous session asserted the opposite, wrote it into `en.json`, propagated
it to all 43 locales, and shipped it. It has been reverted (landing commit
`8f54739`, Windows commit `e366194`), and the bad audit row is struck through
in `dopplerWindows/docs/store/listing-content.md` finding 7. **Do not
re-derive the processor from any `.md` file — derive it from env vars and
`package.json`.**

---

## TRANSLATION RULE — non-negotiable

Any string you produce in a language other than English you translate
**personally, by hand, with Edit/Write**. You must never call the OpenAI /
ChatGPT / Gemini / any LLM API, never use Google Translate / DeepL / Yandex /
Microsoft Translator, never write or run a script that translates, and never
invoke the in-repo `/api/blog/translate` route. If you delegate to subagents,
they inherit this rule verbatim and must confirm compliance in their report.

A brand-name swap across already-translated text (e.g. `Stripe` → `Revolut`)
is **not** translation and may be done with a scoped `perl -i -pe`, provided
you first prove the token appears nowhere you don't intend to touch.

---

## Issue 1 — `Revolut` appears in 18 non-privacy keys per locale. Audit, don't assume.

`Revolut` is now correct for web card payments, so most of these are probably
fine. But they were written before OxaPay existed and some are likely wrong in
other ways — e.g. claiming Revolut is "merchant of record", or omitting crypto
as an option at a point where the user is choosing how to pay.

Enumerate what actually exists:

```bash
cd landing
node -e "
const en=require('./messages/en.json');
function walk(o,p,out){for(const k of Object.keys(o)){const v=o[k],q=p?p+'.'+k:k;
 if(typeof v==='string'){if(/Revolut|OxaPay|Paddle|Stripe/.test(v))out.push([q,v]);}
 else if(v&&typeof v==='object')walk(v,q,out);}}
const out=[];walk(en,'',out);out.forEach(([k,v])=>console.log(k+'\n  '+v+'\n'));
console.log('total:',out.length);"
```

Known key paths: `success.pending`, `success.errors`, `emails.receipt`,
`faq.items`, `terms.sections`, `refund.sections`, `support.faq`,
`guideSubscription.telegramMethod`, `subscribe.footerNote`,
`subscribe.securedBy`, `checkout.subtitle`, `checkout.footerNote`,
`dpa.sections`, `security.sections`.

For each, decide against the code whether the copy is accurate. Pay particular
attention to:

- **`success.*`** — the post-payment screen. If it hardcodes "Revolut has
  accepted the charge" it will be wrong for every OxaPay payer. Check whether
  the route knows which processor was used (`src/app/api/` — look at the
  Revolut webhook and the OxaPay callback) and whether the copy can be made
  processor-aware. If it can't, make it processor-neutral.
- **`subscribe.securedBy`** — a trust badge naming one processor while the
  page offers two.
- **`emails.receipt`** — same question, and it goes to the customer's inbox.
- **`dpa.sections` / `terms.sections`** — these are contractual. If OxaPay is a
  subprocessor and isn't listed, that is a real GDPR Article 28 gap. Cross-check
  against `src/app/[locale]/subprocessors/`.

Fix `en.json` first and get it right, then hand-translate the changed keys into
all 43 locales. Same method as the privacy pass: `en.json` is the source of
truth, match each locale's existing register and terminology, and only touch
the keys that changed.

---

## Issue 2 — Terms and DPA are stale in every locale

Two concrete defects, both present in all 44 files:

1. **Dates.** `terms.lastUpdated` and `dpa.lastUpdated` still read March 2026 /
   April 2026. The privacy policy is now July 2026.
2. **Platform list.** `terms.intro` (and some `terms.sections`) still say
   "iOS, Android and Windows" — macOS is missing, and the macOS app ships.

Additionally, check whether Terms and DPA need the same substantive corrections
the privacy policy just received. The privacy pass added or fixed: the
qualified no-logs claim with its authentication-log carve-out; the Windows
system-proxy-not-a-tunnel disclosure; per-device tokens stored as SHA-256
hashes; the AppsFlyer attribution disclosure; 90-day auth-log retention;
immediate account deletion with the active-paid-subscription block. If the
Terms or DPA restate any of those, they must agree with the privacy policy —
a contract that contradicts the privacy notice is worse than one that is
merely out of date.

Read `landing/src/app/[locale]/terms/` and `.../dpa/` to see which keys render.

Only bump a `lastUpdated` if you actually changed that document's substance;
don't re-date a file you didn't touch.

---

## Issue 3 — Get the current Windows app onto the website

### Read this first: the state is NOT "from scratch"

- `feat/supabase-host-failover` **is already merged into `main`** (merge commit
  `b9667f9`). `main` carries both the Store-readiness work and the UI polish /
  WelcomePage that landed separately. Build from `main`.
- **Azure Artifact Signing is already configured.** All six GitHub secrets are
  set and authenticate correctly. Do **not** re-enter them.
- **The blocker is a 403 at the sign call**, not at auth. Per
  `dopplerWindows/docs/HANDOFF-windows-session.md` it is one of exactly two
  portal-side things:
  1. the app registration is missing the **"Artifact Signing Certificate
     Profile Signer"** role on the Artifact Signing account → Access control (IAM);
  2. identity validation is not yet **Completed**.
- **`v1.0.1` shipped UNSIGNED** and is live, forced by the repo variable
  `SKIP_AZURE_SIGNING=true`. **Delete that variable once Azure works** or every
  future release stays unsigned — and an unsigned submission is an automatic
  10.2.9 rejection.
- `docs/HANDOFF-final-release.md` names a certificate profile `doppler-vpn-de`.
  Confirm that is the intended name given the publisher is **SIMNETIQ LTD**.

### The thing that actually puts the app on the website

**Two GitHub repos are involved and CI only touches one of them.**

- CI's `Create Release` step (`softprops/action-gh-release`) has **no
  `repository:` parameter**, so tagging publishes the installers to
  **`pochtmanr/dopplerWindows`** — the private repo.
- The website resolves downloads from **`pochtmanr/dopplervpn`** — the public
  repo (`landing/src/app/api/windows/download/[file]/route.ts:26`), because the
  private repo's release assets require auth.

**So tagging alone does not update the website.** Copying the installers to a
matching `windows-v<x.y.z>` release on the public repo is a manual step. If it
is skipped, dopplervpn.org keeps serving v1.0.1 and nobody gets an error.

Once that public release exists, the `latest-x64` / `latest-arm64` aliases pick
it up automatically within 5 minutes — **the download page needs no code
change**. Only the in-app update banner needs the constant bump.

### Order

1. **Smoke-test.** Actions → *Release Windows* → Run workflow on `main`
   (`workflow_dispatch` builds and signs but publishes no release). Download the
   `doppler-windows-installers` artifact and run Part B of
   `dopplerWindows/docs/store/05-submission-walkthrough.md` — tests 5 (kill
   switch + uninstall while connected) and 10 (demo account) historically fail.
   - Installer properties → Details should show Company = **SIMNETIQ LTD**.
   - No Digital Signatures tab until the 403 is resolved. Expected, not a bug.
2. **Clear the 403** — check the IAM role first, then identity validation. Then
   delete the `SKIP_AZURE_SIGNING` repo variable and re-run `workflow_dispatch`.
3. **Verify signatures** on Windows: `installer/verify-signatures.ps1` over both
   publish dirs. Every PE file must pass. In CI this gate runs `WarnOnly` when
   `SIGNING_MODE=none`, so a green run does **not** by itself prove signing —
   read the step output.
4. **Tag the release** on the Windows repo:
   ```bash
   cd dopplerWindows && git tag windows-v1.0.2 && git push origin windows-v1.0.2
   ```
5. **Mirror the installers to the public repo — the step CI does not do:**
   ```bash
   gh release download windows-v1.0.2 -R pochtmanr/dopplerWindows -p '*.exe' -D /tmp/dvpn
   gh release create windows-v1.0.2 /tmp/dvpn/*.exe \
     -R pochtmanr/dopplervpn \
     --title "Doppler VPN for Windows — v1.0.2" --notes "..."
   ```
   Verify: `gh release list -R pochtmanr/dopplervpn` shows `windows-v1.0.2` as
   Latest, and
   `curl -sIL https://www.dopplervpn.org/api/windows/download/latest-x64 | grep -i location`
   resolves to the 1.0.2 asset.
6. **Only now**, bump both constants in `landing`:
   - `src/app/api/windows/update/route.ts` → `DEFAULT_VERSION = "1.0.2"`
   - `src/app/api/windows/download/[file]/route.ts` → `FALLBACK_VERSION = "1.0.2"`

   `FALLBACK_VERSION` is used only when the GitHub API is unreachable.
   `DEFAULT_VERSION` is what triggers the in-app update banner — bumping it
   before step 5 gives existing users a banner whose button downloads the old
   version.

### Worth proposing, not doing unasked

Steps 4–5 are two manual actions that must not drift apart, and forgetting step
5 fails silently. Consider adding a `repository:`-targeted second release step
(or a `gh release create` step) to `release.yml` so one tag publishes to both
repos. It needs a PAT with write access to `pochtmanr/dopplervpn` stored as a
secret — flag the trade-off rather than adding the token unilaterally.

---

## Definition of done

- `grep -ri stripe landing/messages landing/src dopplerWindows/docs` returns nothing.
- Every locale's payment copy names Revolut and OxaPay accurately, and the
  post-payment / receipt copy is correct for both.
- Terms and DPA agree with the privacy policy on platforms, dates, and any
  shared substantive claim.
- All 44 `messages/*.json` parse, and key parity with `en.json` holds:

```bash
cd landing && node -e "
const fs=require('fs'),en=require('./messages/en.json');
const flat=(o,p='',a={})=>{for(const k in o){const v=o[k],q=p?p+'.'+k:k;
 typeof v==='object'&&v?flat(v,q,a):a[q]=1}return a};
const E=Object.keys(flat(en));
for(const f of fs.readdirSync('./messages')){if(f==='en.json')continue;
 const L=flat(JSON.parse(fs.readFileSync('./messages/'+f,'utf8')));
 const miss=E.filter(k=>!(k in L));
 if(miss.length)console.log(f,'missing',miss.length,miss.slice(0,5));}
console.log('parity check done');"
```

- `gh release list -R pochtmanr/dopplervpn` shows the new `windows-v*` release
  as Latest, and `https://www.dopplervpn.org/api/windows/download/latest-x64`
  redirects to that version's installer.
- The `SKIP_AZURE_SIGNING` repo variable is deleted, and a tagged release run
  shows the Azure signing steps actually executing (not skipped).
- Commit in coherent tranches with real messages; push both repos to `main`
  (`dopplerWindows` is now on `main`, the feature branch is merged). State
  plainly what you verified by running versus what you inferred by reading —
  and note that a Mac cannot build this app, so anything about runtime
  behaviour is inference until tested on Windows.
