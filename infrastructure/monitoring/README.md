# Doppler fleet monitoring

Uniform per-server stats for the n8n "Doppler Service Monitor" workflow
(n8n.dopplervpn.org, running on the Poland server 185.203.240.174).

## How a server gets monitored

The monitor enumerates `vpn_servers` (Supabase, `is_active = true`) every run.
Per row it picks, in order:

1. `marzban_api_url` set → Marzban panel: `POST {url}/admin/token`
   (creds from `marzban_admin_user/pass`, optional `X-Marzban-Key` from
   `marzban_api_key`), then `GET {url}/system` → users, active, traffic, mem.
2. `stats_agent_url` set → this stats agent: `GET {url}` with
   `Authorization: Bearer {stats_agent_token}` → xray up, connection counts
   (ports 8443–8448), CPU load, memory.
3. Neither → reported as "no monitoring endpoint configured" (a failure).

**Adding a server never requires touching the workflow** — set the columns on
its `vpn_servers` row.

## Stats agent (bare-xray servers)

- `stats-agent.py` — Python 3 stdlib only, ~150 lines, serves
  `GET /stats` on port **9101** (bearer-token auth, 401 otherwise).
- `doppler-stats-agent.service` — systemd unit (DynamicUser, MemoryMax=64M).
  Token lives in `/etc/doppler-stats-agent.env` (mode 600).
- `deploy-stats-agent.sh` — scp + install + enable to the fleet; prints
  `<ip> <token>` pairs. Put those into `vpn_servers.stats_agent_url`
  (`http://<ip>:9101/stats`) and `stats_agent_token`.

Security layers: Azure NSG rule `Allow-DopplerStats` (priority 320) permits
TCP 9101 **only from 185.203.240.174/32**, plus the per-server bearer token.
Payload is non-sensitive metrics, so plain HTTP is acceptable.

`xray.traffic` is `null` on bare installs — the xray stats API is not enabled
in their configs (enabling it would mean editing live REALITY configs +
restarting xray; deliberate non-goal).

## SQL

`sql/2026-07-monitoring.sql` — adds `support_tickets.telegram_notified_at`
(+ partial index) for the ticket notifier, and
`vpn_servers.stats_agent_url/stats_agent_token`. The `stats_agent_*` columns
are separate from `marzban_*` on purpose: doppler-bot treats non-null
`marzban_api_url` as "provision users here".

## Related n8n workflows (exports in ../n8n-workflows/)

- `service-monitor.json` — Doppler Service Monitor (id `6KtZe6D5XcbVzyFS`),
  schedule 0/6/9/12/18 **Europe/Berlin**; 09:00 run = daily summary, others
  alert-only with fingerprint dedupe (re-alert on change or after 12h,
  "Recovered" message when failures clear).
- `support-ticket-notify.json` — polls `support_tickets` every minute where
  `telegram_notified_at IS NULL`, sends to Telegram chat 218545546, stamps
  the row only after a 200 from Telegram (at-least-once; 4xx rows fall back
  to plain text so a bad row can't wedge the queue).

Secrets: workflows reference `$env.*` (set on the n8n container) and one n8n
credential ("Blog API Key (admin app)") — exported JSONs contain no secret
values and are safe to commit.
