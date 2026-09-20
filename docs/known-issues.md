# Known issues

Honest list of what is wrong or unfinished in `doppler-web`, kept in the repo rather than in
someone's head. Each entry says what the problem is, why it has not been fixed, and what the fix
would involve. Fix an entry or delete it — do not let it rot.

Last reviewed: 2026-09-18.

---

## 1. The account ID is used as a bearer password — HIGH

**What.** An account is identified by a code in the form `VPN-XXXX-XXXX-XXXX`. There is no
password and no session. 30 of the 42 API routes construct the Supabase **service-role** client
(`lib/supabase/admin.ts`), which bypasses every RLS policy, and then authorise purely on an
`account_id` supplied in the request. Only `/api/vpn/*` checks a real secret
(`requireAppApiKey`). Anyone holding an account ID can read its devices and subscription, mint a
checkout token against it, and delete it if it is not on a paid plan.

**Why it is still here.** The account ID is the credential on *every* platform — iOS, Android,
Windows and the Telegram bot all authenticate this way. Changing it is a coordinated
cross-platform release, not a web change.

**The fix.** Mint a signed, expiring session token in the existing verify-code flow
(`/api/doppler/verify-code`), return it to the client, and require it on all `/api/account/*` and
`/api/subscribe/*` reads and writes. Keep accepting a bare `account_id` behind a feature flag
until the native clients have shipped, then turn it off.

**Partially mitigated (2026-09-17):** `/api/subscribe/create-account` no longer returns the ID of
an account that already exists — it mails the ID to the address on file instead — and both account
ID generators now use `crypto.randomInt` rather than `Math.random`, which was predictable.

## 2. Rate limiting is per-instance — MEDIUM

`lib/rate-limit.ts` keeps its counters in module memory, so on Vercel each serverless instance has
its own. It raises the cost of brute force but is not a boundary; the file says so itself. A real
fix needs shared state (Upstash Redis via the Vercel marketplace, or a Postgres counter).

## 3. CSP allows `script-src 'unsafe-inline'` — MEDIUM

`next.config.ts`. Deliberate: nonces would break static generation for 5280 prerendered pages.
The rest of the header set is strong (HSTS with preload, `frame-ancestors 'none'`,
`object-src 'none'`, `X-Frame-Options: DENY`), but CSP is not currently buying XSS protection.

## 4. `comparisonTable.panel.*` is English-only — MEDIUM

`messages/en.json` has `comparisonTable.panel.{means,keeps,why}` and the per-row equivalents; the
other 43 locales do not. The build logs ~2,800 `MISSING_MESSAGE` errors and the panel renders the
raw key path to non-English users. The build still exits 0, which is why this survived. Needs the
keys translated into the other 43 locales.

## 5. Two checkout entry points — LOW

`src/app/checkout/` (non-localized, 407 lines) sits alongside `src/app/[locale]/checkout/success/`.
It is not obvious which is live. Decide, then either localize it or delete it.

## 6. A `service_role` key is in the public git history

`venus_init.js`, an unrelated scratch file, carried the Supabase `service_role` JWT for the
production project. Added in `205b951`, removed in `d3d7dc5`. The leaked key was issued
2024-12-15; the keys in use since 2025-12-21 were reissued under a rotated JWT secret, which
invalidates it. **Verify in the Supabase dashboard before relying on that** — and note that
rotating the JWT secret again would also reissue the *anon* key, which every shipped native client
embeds, breaking them until store updates ship. Rotate the `service_role` key alone if needed.
