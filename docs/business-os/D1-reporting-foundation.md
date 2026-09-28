# D1 handoff — Doppler reporting service and canonical history

Step ID: **D1**. Date: 2026-09-28.

API host subproject: `doppler-web`.
Intended base URL when this revision is deployed: `https://www.dopplervpn.org`.
The reporting routes are not deployed. There is no staging or production base URL for them yet.

`doppler-admin` does not calculate money. Its server route calls the doppler-web service.

## Status

| Stage | State |
|---|---|
| Implemented in this repository | Yes, locally |
| Locally tested | Yes. Commands and results below |
| Staging verified | No |
| Production verified | No |

Migration `011_reporting_foundation.sql` is written and has not been applied to Supabase.

## Contract

| Item | Value |
|---|---|
| Contract | `business-os.contract.v1`, schema `1.0.0` |
| C0 manifest SHA-256 | `79b35239d3709bfd80ab07d46fc41199c3e0869d3d34b2eac9427d93cc9ff94d` |
| C0 git commit | Not pinned. C0 handoff says the contract files were local and uncommitted |
| Doppler formula version | `doppler-purchase-native-v1` |
| FX policy on source records | `gbp-unconfigured` |
| `DOPPLER_FORMULA_PIN` | Still unconfirmed. The formula identifier above is the code version, not an owner pin |

## What was built

`doppler-web` owns the reporting service, the durable tables, and the later export API. It already owns Revolut, OxaPay, invoice writes, and the only migrations directory. Provider credentials stay there.

The service normalizes an invoice row and a webhook delivery onto one economic sale. Transport identity stays separate. Production summaries exclude sandbox observations. Invoices with no stored environment are quarantined as `ambiguous_environment` unless a production sale for that payment already exists, in which case the invoice is attached as an alias.

Purchase-basis metrics, original currency only:

- Gross is the sum of posted sale charges.
- Refunded principal is posted refunds plus chargebacks, minus refund reversals. No refunds is a measured zero.
- Sales tax and processor fees stay null unless every included sale has an explicit component. A missing component is not zero.
- Net sales is gross minus refunded principal, and minus sales tax only when tax inclusion is `inclusive`. Unknown or mixed tax inclusion leaves net sales null.
- Net proceeds is net sales minus fees, and is null when either input is null.
- GBP amounts stay null until source FX evidence exists. Original currency is kept.
- Direct costs, operating expenses, and profit stay null. Those are not part of this step.

History import reads `vpn_invoices` in keyset pages with a lease, a checkpoint, a 15-minute overlap, and a stop after 5 failed attempts. Replays dedupe on transport hash. Checkout and RevenueCat grants do not wait on this store. RevenueCat access events are not sales: the grant payload has no price, currency, tax, or fee.

Admin calls `GET /api/reporting/v1/summary` with `REPORTING_SERVICE_TOKEN`. That route is the internal service boundary. It is not the Business OS HMAC export API. That API is D4.

Installed Next.js 15.5 has no `node_modules/next/dist/docs`. The new routes follow the existing App Router `route.ts` handlers.

## Changed files

doppler-web:

- `src/lib/reporting/` — decimal math, observation planner, in-memory store, summary, history import, provider mapping, fulfilment isolation, Supabase store
- `src/app/api/reporting/v1/summary/route.ts`
- `src/app/api/reporting/v1/import/route.ts`
- `src/app/api/revolut/webhook/route.ts` — best-effort observation after the subscription update
- `src/app/api/oxapay/webhook/route.ts` — same
- `supabase/functions/revenuecat-webhook/index.ts` — comment only; grant behaviour unchanged
- `supabase/migrations/011_reporting_foundation.sql`
- `src/lib/reporting/reporting.test.ts`

doppler-admin:

- `src/lib/reporting-client.ts`
- `src/lib/reporting-client.test.ts`
- `src/app/api/admin/reporting/summary/route.ts`

## Commands and results

```bash
cd /Volumes/RomanSSD/Developer/doppler/doppler-web
./node_modules/.bin/vitest run src/lib/reporting/reporting.test.ts
npx tsc --noEmit
```

```text
src/lib/reporting/reporting.test.ts (13 tests) passed
tsc --noEmit passed
```

```bash
cd /Volumes/RomanSSD/Developer/doppler/doppler-admin
node --test src/lib/reporting-client.test.ts
npx tsc --noEmit
```

```text
fetchReportingSummary: 2 passed
tsc --noEmit passed
```

OxaPay webhook route tests still pass (2). Coverage is synthetic. No production database was read, and no redacted provider payload was available.

## Evidence and residuals

Earliest reliable production date: not established. `vpn_invoices` has no environment column. Historical paid rows are quarantined until an explicit environment is known. `DOPPLER_HISTORY_START` remains unconfirmed.

Revolut `amount` is minor units. OxaPay webhook `amount` is major units and is converted with the currency exponent. A stored zero is not treated as a measured zero, because the Revolut webhook writes `0` when the provider amount is missing. The webhook's `tax_reserve_usd` log line is not sales tax.

Live Revolut and OxaPay routes record completed sales only. Refund, partial refund, reversal, chargeback, void, and out-of-order updates are implemented and covered by synthetic tests. Those events are not emitted by the current webhook routes.

RevenueCat monetary history is unsupported. Fees, tax, and FX are unsupported on current provider payloads, so those metrics stay null. Sandbox Revolut traffic is the default unless `REVOLUT_ENVIRONMENT` is `production` or `prod`. OxaPay is production unless `OXAPAY_SANDBOX=true`.

## Configuration names still needed

No values belong here.

- `REPORTING_SERVICE_TOKEN` on doppler-web and doppler-admin
- `DOPPLER_REPORTING_BASE_URL` on doppler-admin
- `REVOLUT_ENVIRONMENT` (existing)
- `OXAPAY_SANDBOX` (existing)
- `REVOLUT_SOURCE_ACCOUNT_ID` optional; otherwise `revolut.unspecified`
- `OXAPAY_SOURCE_ACCOUNT_ID` optional; otherwise `oxapay.unspecified`
- `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` (existing, server only)
- Unconfirmed C0 gates that still apply: `DOPPLER_HISTORY_START`, `DOPPLER_FORMULA_PIN`, `REPORTING_TIMEZONE`, `REPORTING_CURRENCY`, `FX_POLICY_VERSION`, `FX_RATE_SOURCE`, `VAT_STATUS`

Apply `supabase/migrations/011_reporting_foundation.sql` before the import or summary route can read or write. Do not point admin at the service until that migration and `REPORTING_SERVICE_TOKEN` exist on the web deployment.

## Next dependent step

D2 in `docs/business-os-project-prompts/11-doppler-money-expenses-settlements.md`. Not started by this handoff.

## Completion

D1 is implemented and locally tested in `doppler-web`, with `doppler-admin` calling that service. It is not applied to the database and not verified in staging or production.
