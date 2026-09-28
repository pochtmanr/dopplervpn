# D5 handoff — Doppler analytics collectors and source handoff

Step ID: **D5**. Date: 2026-09-28.

API host subproject: `doppler-web` (`/Volumes/RomanSSD/Developer/doppler/doppler-web`).
Intended base URL when this revision is deployed: `https://www.dopplervpn.org`.
The analytics routes are not production verified. There is no separate staging base URL.

Admin UI host: `doppler-admin`. It reads stored reports from doppler-web and does not call Google on page view.

## Status

| Stage | State |
|---|---|
| Implemented in this repository | Yes, locally |
| Locally tested | Yes. Commands and results below |
| Staging verified | No |
| Production verified | No. Migrations are not applied. Provider credentials are not configured on the web deployment |

## Versions

| Item | Version |
|---|---|
| Contract | `business-os.contract.v1` / schema `1.0.0` (unchanged) |
| Analytics formula | `doppler-analytics-native-v1` |
| Migration | `supabase/migrations/012_reporting_analytics.sql` |
| GA refresh | previous 90 source days stored; period uniques for 7, 30, and 90 days are separate queries |
| GSC refresh | previous 14 Pacific days, `dataState=all`, property totals separate from dimension rows |

## What landed

- GA4 and Search Console collectors in `src/lib/reporting/analytics/`. Service-account JWT stays hand-rolled. Explicit dates, pagination, and GA metadata (timezone, quota, sampling, thresholding, other-row) are stored.
- Period `activeUsers` is its own query. Daily and breakdown users are never summed into it.
- GSC CTR is clicks/impressions for that row. Position is the provider value for that row. Dimension rows set `complete_property_total` false. Dates stay `America/Los_Angeles`.
- Replaceable revisions in `reporting_analytics_revisions`. A changed overlap day inserts the next revision. Leases and the five-failure stop reuse the reporting checkpoint table.
- `GET /api/business-os/v1/analytics/report` returns stored rows when the provider env is configured. Otherwise GA/GSC stay `unsupported`. Vercel stays `unavailable` / `drain_not_configured`.
- `POST /api/reporting/v1/analytics/drain` verifies `x-vercel-signature` (HMAC-SHA1) only when `VERCEL_ANALYTICS_DRAIN=enabled` and `VERCEL_DRAIN_SECRET` are set. Identical batches are both kept. Visitors stay null.
- Daily Vercel cron `0 7 * * *` calls `GET /api/reporting/v1/analytics/collect`.
- URL Inspection and project-to-central change notifications are not implemented.

Vercel list_drains for project `dopplervpn` returned 403 for team scope `romans-projects-a19aa0c4`. Plan and sampling were not read. The drain collector is present and left off.

## Commands and results

```bash
cd /Volumes/RomanSSD/Developer/doppler/doppler-web
./node_modules/.bin/vitest run src/lib/reporting
npx tsc --noEmit
```

```text
Test Files  7 passed (7)
Tests  81 passed (81)
tsc --noEmit passed
```

```bash
cd /Volumes/RomanSSD/Developer/doppler/doppler-admin
npx tsc --noEmit
```

```text
tsc --noEmit passed
```

Figures in the tests are synthetic. No live Google or Vercel payload was stored.

## Configuration names still needed

No values belong here.

On doppler-web:

- `GA_PROPERTY_ID`
- `GA_SA_CLIENT_EMAIL`
- `GA_SA_PRIVATE_KEY`
- `GSC_SITE_URL`
- `GSC_SA_CLIENT_EMAIL`
- `GSC_SA_PRIVATE_KEY`
- `ANALYTICS_PRIMARY_HEADLINE` optional; default is `ga4_active_users` when GA4 is configured
- `REPORTING_SERVICE_TOKEN`
- `CRON_SECRET`
- `BOS_EXPORT_KEYS`
- `VERCEL_DRAIN_SECRET` and `VERCEL_ANALYTICS_DRAIN=enabled` only after a Pro or Enterprise drain is confirmed

On doppler-admin:

- `DOPPLER_REPORTING_BASE_URL`
- `REPORTING_SERVICE_TOKEN`

Apply, in order, in the Doppler Supabase project:

- `supabase/migrations/011_reporting_foundation.sql`
- `supabase/migrations/011_reporting_money.sql`
- `supabase/migrations/012_business_os_export.sql`
- `supabase/migrations/012_reporting_analytics.sql`

## Next dependent step

Simnetiq M3 can pull this export after the deployment has a base URL, the migrations are applied, and the export key exists. Not started.

## Completion

D5 is implemented and locally tested in `doppler-web`. It is not staging verified and not production verified. GA purchase revenue is a check signal and is not written into finance records.
