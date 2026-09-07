# Doppler VPN — 2026-09-07 customer-issue sweep

Four customer reports on 2026-09-06 turned into one cross-platform release plus a
server-side subscription-integrity change set. This document records what was wrong,
what shipped, and what each platform has to be checked for before it goes out.

Working plan and full per-task reports: `doppler/.superpowers/sdd/okay-so-we-have-ethereal-spindle/`.

---

## The four reports and their root causes

| # | Customer report | Root cause | Status |
|---|---|---|---|
| 1 | iOS 18 devices get the old React-Native app, no VLESS | The Swift app declared `IPHONEOS_DEPLOYMENT_TARGET = 26.0` (app) / `26.2` (tunnel + widget) with 79 unguarded Liquid-Glass calls and zero availability checks. Same bundle id as the RN app, so the App Store served iOS 18 the last compatible build. The live listing said "Requires iOS 26.0". | **Fixed** — iOS 3.2.0 floors at iOS 18.0 / macOS 15.0 |
| 2 | `VPN-CKC4-348C-7PMQ` paid with crypto, went back to free showing "oxapay", admin re-grant "closed" the subscription | Two independent bugs. (a) The admin grant wrote an **absolute** expiry (`now + days`) and overwrote `subscription_store`, truncating a paid term — every other writer stacks. (b) The free flip that kept `oxapay` can only come from a tier-only writer: the anon-callable `sync_subscription` or `claim_subscription`'s legacy branch. RevenueCat has no record for that account, so the RC webhook and the Swift client are ruled out. | **Fixed server-side** (both writers closed); the exact 11:44 caller stays unidentified — the new audit trail will name the next one |
| 3 | "Connection failed after 3 attempts" after a tier change | iOS/macOS only. The message overwrote the real tunnel error, the client dialled a stale pre-tier-change server list, and the fallback chain ping-ponged between two servers. | **Fixed** in iOS 3.2.0 |
| 4 | `VPN-BXKQ-AUDB-ATY8` (Iran) cannot log in unless another VPN is on first | Every client hard-fails to the account-setup screen when one Supabase host is unreachable. Host-failover exists on all three clients but the relay list was **empty everywhere** and no relay server existed. Windows (his main device) also re-minted its device token on every launch, and the server deletes the previous token on each mint. | **Partly fixed** — relay server built, Windows mint fixed, typed errors; offline/degraded connect is Release 2 |

---

## Issues resolved

Severity: P0 blocked customers · P1 data/revenue integrity or account bricking · P2 correctness · P3 hygiene.

### Fixed and committed

| ID | Sev | Platform | Issue | Where fixed |
|---|---|---|---|---|
| S1 | P0 | iOS/macOS | iOS 26 deployment floor, app/extension skew, 79 unguarded glass sites | `project.pbxproj` project-level 18.0/15.0; `DesignConstants.swift` `dopplerGlass` shim |
| S18 | P1 | iOS | Retry loop: stale list dialled, real error discarded, two-server oscillation, SNI burn, saved selection overwritten | `ContentView.swift` + new `ConnectionFallbackPlanner.swift` |
| S12 | P1 | all | Empty `get_servers_v2` indistinguishable from "no fleet"; up to 6 calls per failing launch | Typed fetch outcomes on iOS, Android, Windows |
| S13 | P1 | macOS | Device id rotated per call → identity-mismatch loop, device-cap burn | New `DeviceIdentity.swift` (memoized, deterministic seed) |
| S19 | P1 | all | Account row read only at launch, so a web/crypto payment showed Free until relaunch | Foreground + pre-paywall refresh, 60 s throttled, on all three clients |
| S11 | P0 | Windows | Token re-minted on **every** launch; server deletes the prior token, so each launch needed Supabase | `SupabaseService.RegisterDeviceAsync` mints only when no token is stored |
| S24 | P2 | Windows | Wrong copy on null config, cached config replayed on network change, no token revoke on self-removal, navigation jump on refresh | `VpnViewModel`, `DevicesPage`, `App.xaml.cs` |
| S23 | P2 | Windows | Dead `ClaimWithRetryAsync` (400 on empty expiry) burning ~6 s per purchase | Call removed; method + warning kept so nobody "fixes" it into a downgrade |
| S14 | P1 | Android | Device UUID rotated per cold launch (10-device cap brick); stale token unrecoverable | AND-02 store resilience + one bounded re-mint on empty |
| S20 | P1 | Android | Server id flipped namespace across tiers, silently replacing the saved selection | `ServerIdPolicy` — always the Supabase row id, legacy ids still match |
| S21 | P1 | Android | Nothing refreshed the list on tier change → paid user saw "no server" until opening the picker | `LaunchedEffect(isEffectivelyPro)` + resume refresh |
| S22 | P2 | Android | Always-on reconnected on the pro-epoch cached config after a downgrade | `AlwaysOnConfigPolicy` consumes the fetch outcome directly |
| S2 | P1 | Server | Admin grant absolute, overwrote a paid store | `admin_grant_subscription` (stacks, keeps paid store, audited); admin panel rewired |
| S3 | P1 | Server | `sync_subscription` anon-callable blind UPDATE | Stubbed non-writing, revoked from anon; DROP dated 2026-10-06 |
| S4 | P1 | Server | `claim_subscription` legacy branch wrote any tier; branches could shorten a paid expiry; transfer revoked regardless of source | Tier gate, legacy branch removed, monotonic `subscription_apply_grant`, store-only transfer downgrade |
| S5 | P1 | Server | `revoke_subscription` + RC webhook nuked entitlements with no source or transaction check | Skip on non-store rows and txn mismatch; expiry clamped, never NULLed; webhook resolves the current owner |
| S6 | P1 | Server | Old RN app calls `claim_subscription(tier:'free')` on every foreground | Server now refuses any tier but pro — **no app release needed** |
| S7 | P1 | Server | Expiry sweeper skipped web-checkout rows (21 stale pro rows) | Store filter removed, 3-day grace kept |
| S8 | P2 | Server | No audit trail on subscription columns | `subscription_audit` + triggers recording writer function, role, user-agent, IP, reason, actor |
| S9 | P2 | Server | Webhook wrote `ios`/`android` into `subscription_store` | Normalised at the boundary and inside the RPCs |
| S15 | P0 | all | Relay list empty everywhere; CI never wrote the key; no relay server | Relay VPS built (below); CI heredoc line added; constants ready and blank |
| S27 | P3 | docs | CLAUDE.md said 26.2, QA finding never actioned, sweeper comments wrong | Corrected in all three client repos |

### Infrastructure added

**`doppler-nl` — 103.246.146.20 (Netherlands, 2.5 GB).** Two roles on one box:

- **Supabase relay ("sb1")** — Caddy reverse-proxy to `fzlrhmjdjjzcgstaeblu.supabase.co`, verified through a localhost listener. Public site is inert until `RELAY_HOST` is set.
- **VPN exit node** — bare xray-core, 6 REALITY inbounds on 8443-8448, all six handshake-verified from the box itself, access logging off from first start. Stats agent on 9101.
- `vpn_servers` row inserted as **`is_active = false`** (id `167f455e-3ae4-41c8-bb9f-caaf344e659f`). Flip it to true when you want Netherlands offered.
- Shared with the admin-panel staging session. **Do not rotate its SSH key** while that work is live.

### Known and deliberately deferred

| ID | Issue | Why deferred |
|---|---|---|
| S16 / S17 | Cold start still hard-fails when the control plane is unreachable; no offline connect from a cached server list | Release 2 — needs the runtime relay list and a cached-Pro grace policy |
| S25 | `get_servers_v2` returns `sni_options` ungated to free accounts (REALITY keys leak) | Separate server change; legacy `get_servers` retirement is also still open |
| S26 | Vercel 403s Iranian IPs, so the download page is unreachable for the users who need the sideload APK | Mirror on the relay VPS — not built yet |
| S28 | Dead RPCs `check_device_limit`, `report_device_heartbeat`; `device_sessions` never consulted by v2; revoke rows carry no IP | Hygiene |
| — | AND-02 residual: a permanently broken Android keystore still loses the **account id** (device identity now survives) | Closing it means calling `find_account_by_device` on launch — separate change |
| — | Windows `Trace` output is discarded in Release (no listener registered) | Pre-existing; one-line startup change, own task |
| — | `SUBSCRIPTION-AND-ANTIFRAUD.md` lives at workspace root, which is not a git repo | It is referenced by relative path from three client repos; moving it breaks those |

---

## Branches — nothing is merged or tagged

| Repo | Branch | Range | Built by |
|---|---|---|---|
| `dopplerswift` | `release/3.2.0` | `1b09bc8..91a7b39` | Roman, in Xcode |
| `DopplerAndroid` | `release/1.8.1` | `31b9283..afcf771` | CI on tag `android-v1.8.1` |
| `dopplerWindows` | `fix/windows-entitlement-gates` | `577fd3a..a4d395f` | CI on tag `windows-v11.0.2` |
| `VPnReact` | `main` | `0ef5643..7c4f058` | migrations, **not applied** |
| `landing` | `main` | `accb715..ee587b6` | webhook **not deployed** |
| `doppler-admin` | `main` | `100bbac..f32acaa` | **not deployed** |

---

# Checklists

## Server — apply order (do this first; no app release needed)

The full runbook is `VPnReact/supabase/live/README.md`. Order is load-bearing.

- [ ] **Step 0 — dump the live function bodies** with `VPnReact/supabase/live/2026-09-06-dump-queries.sql`, save into `2026-09-06-subscription-rpcs.sql`. Abort if `claim_subscription` has more than one overload.
- [ ] Diff each migration's function body against the dump, then set `SET LOCAL doppler.reconciled_from_dump = '2026-09-06-subscription-rpcs.sql'` in the same transaction. Both `T100200` and `T100500` abort without it.
- [ ] Apply `T100000` (audit table + triggers). Verify: two `subscription_audit%` triggers on `accounts`, RLS on, no anon grants.
- [ ] Apply `T100100` (`sync_subscription` stub) → `has_function_privilege('anon', …)` is false.
- [ ] Apply `T100200` (claim guards) → exactly one `claim_subscription`; a free-tier call returns `action:'ignored'` and writes nothing.
- [ ] Apply `T100300` (revoke guards) → exactly one `revoke_subscription`; anon has no EXECUTE; service_role does.
- [ ] Apply `T100400` (admin RPCs) → grant on an entitled oxapay row returns `stacked_on_active_term: true` with the store unchanged.
- [ ] Run `T100600` **steps 1-3 as one execution**. Run 1 reviews only (`v_confirm := false`). Read the REVIEW output — in the Supabase editor run that SELECT as its **own** execution, the editor shows only the last result set. Expected: **0 rows to repair**.
- [ ] Apply `T100500` (widened sweeper). It is define-only; do not call it yet.
- [ ] Run `T100600` steps 4-5: one manual sweep, then assert **0** rows with `tier <> 'free'` and an expiry more than 3 days past.
- [ ] Deploy the RevenueCat webhook (`landing/supabase/functions/revenuecat-webhook`, see its `DEPLOY.md`). Clear `landing/supabase/.temp/` first.
- [ ] Deploy the admin panel (`doppler-admin/scripts/deploy.sh`). Grant and set-free must now go through the RPCs.
- [ ] **After deploy**, grant 7 days to a test account, then grant 30 more: the expiry must **stack**, and `subscription_audit` must show `writer_fn = 'admin_grant_subscription'` with your email as actor.
- [ ] Watch for a week: `SELECT writer_fn, jwt_role, reason, count(*) FROM subscription_audit GROUP BY 1,2,3` — rows with `writer_fn IS NULL` are raw writers still to be moved onto the RPCs.

## iOS / macOS 3.2.0 (build 20)

Build both xcframeworks first (`./scripts/build-libxray.sh`, `./scripts/build-hev-tunnel.sh`) and make sure `Secrets.xcconfig` is attached.

**iOS 18 — the point of the release**
- [ ] It builds and launches on iOS 18 at all. No harness can prove this.
- [ ] Sweep every screen for the glass fallback: Home (card, connect ring, server row, quick-setting pills, map / smart-route / speed-test cards), server picker, Smart Route, Profile, Settings, Tunnel Logs, Help, Devices, Language picker, Paywall, onboarding, Welcome, the three explainer sheets, Connect Account, Account Setup, OTP entry, Attribution consent. Frosted, not flat or invisible.
- [ ] **Teal CTAs are still teal, not washed grey** — `PrimaryCTAButton`, "Get Started", and "Next"/"Got it" on the explainers. These are the five `fallback: .none` sites.
- [ ] Judge the tinted fallbacks: connect ring (connecting / connected / failed), selected server row, active Smart Route card, Speed Test running, and the **red error banner**. One number tunes all of them: `0.35` in `DesignConstants.swift`.
- [ ] Tab bar and sidebar still behave.
- [ ] **iOS 26** — spot-check the same screens. Nothing should look different at all.

**macOS 15**
- [ ] Launch, quit, launch again, then Profile → Devices: **one** device row, not two. Repeat once. This is the change with the largest blast radius.
- [ ] An existing Mac install still shows its original device row, same name — nothing re-registered.

**Connection diagnostics**
- [ ] Airplane-mode cold launch with a saved list: saved servers still shown under an orange "Server list couldn't be refreshed" banner. Console shows at most **three** `get_servers_v2` attempts, not six.
- [ ] Cold launch with no saved list and no network: the picker shows the specific message, not "No Servers — Pull down to refresh".
- [ ] Force a bad SNI and connect: the error names server, SNI, stage and the tunnel's reason. **Copy details** pastes the whole trail; it also appears in Tunnel Logs under "Connect attempts (last chain)".
- [ ] Two-server account, both failing: the chain tries each **once** and stops, and on giving up the selection is back on the server you originally chose.
- [ ] `[connect] attempt=…` lines appear in a **Release** build console, not just Debug.

**Entitlement**
- [ ] Pick a server **while free**, then pay on the website with the app backgrounded, foreground it, tap Connect: it must **connect to that server**, not open the picker. This is the acceptance test for the reworked gate.
- [ ] Background/foreground several times quickly: at most one `register_device` per minute.
- [ ] Free user taps Connect: paywall still opens after a brief refresh, and never opens for an account that just became Pro.

**Then**
- [ ] Archive as 3.2.0 (20); confirm minimum OS reads iOS 18.0 / macOS 15.0 on the App Store version page before submitting.

## Android 1.8.1 (versionCode 15)

CI on tag `android-v1.8.1` publishes both sideload APKs. The Play AAB still needs the keystore machine.

**From CI artifacts (cannot be checked on this Mac)**
- [ ] `unzip -l` each APK: `lib/arm64-v8a/` and `lib/armeabi-v7a/` each contain `libgojni.so` and `libhev-socks5-tunnel.so`. arm64 ≈ 58 MB.
- [ ] The 32-bit URL for the waiting customer: `https://www.dopplervpn.org/api/android/download/latest?abi=armeabi-v7a`.

**On device**
- [ ] Install the arm32 APK on a 32-bit device and connect. A crash in `TProxyService` means a missing native library.
- [ ] Install the arm64 APK **over** an existing 1.8.0 install — updates in place, no uninstall.
- [ ] Healthy upgrade is a no-op: still logged in, same account, and **no new row** in Devices.
- [ ] free → pro: pick a server while free, upgrade in a browser, return, press Connect **without opening the picker**. It must connect (previously "no server selected").
- [ ] Block `*.supabase.co`, open the picker: message must read "Can't reach Doppler servers…" with Refresh **enabled**. If it says "device is not authorised" or greys out with a countdown, the classification is wrong.
- [ ] Force an empty `get_servers_v2` and tap Refresh repeatedly: the button disables with a countdown and the re-mint happens at most once per 60 s.
- [ ] Lapsed subscription with Always-on VPN enabled, then reboot: the tunnel must **not** come up from cache; the failure notification must appear.

## Windows 11.0.2

CI is the compiler — nothing here was ever built. Run the build before trusting any of it.

```bash
git push origin fix/windows-entitlement-gates      # build.yml runs on any branch
gh run watch -R pochtmanr/dopplerWindows
gh workflow run release.yml -R pochtmanr/dopplerWindows --ref fix/windows-entitlement-gates
# only when green and the device checks pass:
git tag windows-v11.0.2 && git push origin windows-v11.0.2
```

- [x] **CI build green** — run `34145474191`, 2026-09-07, Debug + Release x64 including XAML, conclusion `success`. The three items flagged as compile risks (the `or`-combined type patterns in `ServerLoadError.Describe`, `Interlocked` / `CancellationTokenSource` via ImplicitUsings, the `Activated` handler signature) all resolved. Warnings are pre-existing `async` -without-`await` ones in `ProfilePage`.
- [ ] Untagged `release.yml` run completes the publish + Inno Setup build.
- [ ] **The core fix.** Launch once online, confirm servers list and that `device_tokens` has **one** row for this machine. Block Supabase, relaunch: servers still list from the stored token and the row is **still one, unchanged**. Before this release it was replaced every launch.
- [ ] Make `%LocalAppData%\DopplerVPN\device-tokens.bin` unwritable, sign in fresh: the session still mints, fetches and connects, and does not re-mint on every fetch.
- [ ] Devices → remove **this** machine: the app signs out to account setup.
- [ ] Pay in the browser, alt-tab back: within one activation the Upgrade button goes and connect works — **without the page jumping** away from where you were.
- [ ] Free account taps Connect: Pro Required dialog; a selected-but-unavailable server reads "Upgrade to Pro to connect to this server", not "select a different server".
- [ ] Connect, then switch Wi-Fi: the reconnect succeeds and a fresh `[Connect] sni=` line is emitted (it re-selects now instead of replaying the cached config).
- [ ] **After tagging: copy the installer to the public `dopplervpn` release.** Skipping this leaves dopplervpn.org on 11.0.1 while the tag says otherwise.

## Relay + fleet

- [ ] Buy a domain (DNS-only, not Cloudflare-proxied, boring name — nothing with `vpn`, `doppler` or `supabase` in it) and point an A record at `103.246.146.20`.
- [ ] On the box: `sed -i 's/^RELAY_HOST=.*/RELAY_HOST=<domain>/' /etc/caddy/relay.env && systemctl reload caddy`
- [ ] Verify from outside: `curl https://<domain>/rest/v1/ -H 'apikey: <anon key>'` returns Supabase's own response, and `curl https://<domain>/` returns the bland 404.
- [ ] Set `SUPABASE_RELAY_URLS` in three places, then re-cut the builds: `dopplerswift/PulseVPN/Configuration/Secrets.xcconfig`, `DopplerAndroid/local.properties` **and** the `SUPABASE_RELAY_URLS` GitHub secret, `dopplerWindows/DopplerVPN/Services/SupabaseService.cs:52`.
- [ ] Test each client with `*.supabase.co` blocked in a hosts file: login and server list must succeed through the relay.
- [ ] Optional: flip the Netherlands `vpn_servers` row to `is_active = true` when you want it offered, and sync the landing page fleet list.
- [ ] Rotate the NL box's SSH key once the admin-panel staging work is done — the private key was pasted into a chat transcript.

## Customer follow-up

- [ ] `VPN-CKC4-348C-7PMQ` / `VPN-MQCL-R6V9-WV53` — after the server apply, confirm 48 h of no unexplained rows in `subscription_audit`, then answer ticket TKT-8293980B.
- [ ] `VPN-BXKQ-AUDB-ATY8` (Iran) — send the arm-specific APK link and ask for a login test once a relay build exists.
- [ ] The Ethiopian customer (`196.189.x`) — ask for the **Copy details** output on the next failed connect.
