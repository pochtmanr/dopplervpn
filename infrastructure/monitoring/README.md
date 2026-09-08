# Doppler fleet monitoring

Uniform per-server stats for the n8n "Doppler Service Monitor" workflow
(n8n.dopplervpn.org, running on the Poland server 185.203.240.174) and for the
admin panel's Servers tab (`doppler-admin/src/lib/server-health.ts`, deployed to
that same Poland box), which polls the same endpoints independently on a 60s
auto-refresh.

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

- `stats-agent.py` — Python 3 stdlib only, serves `GET /stats` on port **9101**
  (bearer-token auth, constant-time compare, 401 otherwise). Refuses to start
  without `STATS_TOKEN`.
- `doppler-stats-agent.service` — systemd unit (DynamicUser, MemoryMax=64M).
  Token lives in `/etc/doppler-stats-agent.env` (mode 600). DynamicUser is why
  the agent scans `/proc` instead of asking systemd or D-Bus anything.
- `deploy-stats-agent.sh` — discover + scp + install + restart; prints
  `<ip> <token>` pairs. Put those into `vpn_servers.stats_agent_url`
  (`http://<ip>:9101/stats`) and `stats_agent_token`.

Security layers: Azure NSG rule `Allow-DopplerStats` (priority 320) permits
TCP 9101 **only from 185.203.240.174/32**, plus the per-server bearer token.
Payload is non-sensitive metrics, so plain HTTP is acceptable.

Verified 2026-09-08 with `az network nsg rule list` across all seven resource
groups: every Azure node has `Allow-DopplerStats`, priority 320, Allow, port
9101, source `185.203.240.174/32`. Nothing is wider than documented and a deploy
never needs to touch firewalls.

**Why one /32 is enough for two pollers:** the admin panel does not run on
Vercel. `doppler-admin` is deployed to `/opt/doppler-admin` on the Poland VPS
185.203.240.174 (pm2, port 3060, behind nginx — see
`doppler-admin/scripts/deploy.sh`), which is the same host as n8n. Both pollers
therefore egress from the one address the rule allows, and anything probing 9101
from anywhere else just times out.

That also makes the request-amplification concern concrete rather than
theoretical: the panel reaches **every** node, and polls all of them every 60
seconds for as long as somebody leaves the Servers tab open.

### Agent v2 (2026-09-08)

**Why it exists: every bare-xray node reported 2258–2527 ms in the admin panel.**
Measured on Hong Kong, the cause was `xray api statsquery`. No node has an `api`
block in its xray config, and the failing gRPC call does not fail fast — 3.0 s
before erroring, capped at 2 s by the agent's subprocess timeout, paid on
**every** `/stats` request. For scale, `ss` on that same box while it held 2,198
established sockets took 0.007 s. v2 gates the subprocess behind a ~250 ms TCP
connect to the API port and caches the verdict for 5 minutes, so a node without
the `api` block costs approximately nothing. Measured end-to-end with a
deliberately 3-second-slow `xray` on `PATH`: 5–14 ms per request.

Other v2 changes:

- **Reachability is cached, not probed inline.** v1 made a live 4 s HTTPS GET to
  chatgpt.com inside every request. A background daemon thread now probes every
  **~15 minutes ±15% jitter** (first probe a few seconds after start, at a random
  offset so a fleet redeployed in one pass does not sync up); `/stats` serves the
  last cached verdict and never blocks on the network. This was latent rather
  than active on the Azure fleet, which is still running a build that predates
  the probe entirely — but it becomes a real 2 s per request the moment v2 lands,
  and with the admin panel refreshing 10 nodes every 60 s it also meant ~600
  requests/hour at OpenAI from datacenter IPs with a spoofed Chrome UA, which is
  a fine way to *cause* the IP flagging the probe exists to detect.
- **`reachability.status` is an explicit tri-state** — `blocked` (HTTP 403, 429,
  503, 1020), `ok` (2xx/3xx), `unknown` (probe error, an unrecognised code, or no
  probe finished yet). v1 returned `flagged: false` on any exception, so a broken
  probe read as healthy. `flagged` stays in the payload (both n8n and the admin
  panel read it) and is now true **only** for `blocked`.
- **Probe age is reported.** `checked_at` is the last probe that came back with a
  status code, `attempted_at` the last attempt of any kind, `age_s` the seconds
  since `checked_at` (null if none), `interval_s` the configured period. A probe
  that errors keeps the older `checked_at` and sets `error`, so "clean 30 s ago"
  and "last real answer was 3 hours ago" are distinguishable.
- **`agent_compute_ms`** (top level) is how long the agent spent assembling the
  response, so a consumer can subtract agent time from measured latency.
- **`connections.distinct_peers` is `0`, not `null`, on an idle node.** `null`
  now means only one thing: the `/proc` fallback ran and genuinely cannot measure
  peers. v1 wrote `len(peers) if peers else None` *and* chose the fallback on
  empty `ss` output — which is exactly what an idle node produces — so idle and
  unmeasurable were indistinguishable in two separate ways.
- **`xray.traffic` now sums exactly one counter family, and says which.** xray
  emits several families over the *same* bytes:

  | stat name | family |
  | --- | --- |
  | `inbound>>>{tag}>>>traffic>>>{uplink,downlink}` | the REALITY listeners clients connect to |
  | `outbound>>>{tag}>>>traffic>>>{uplink,downlink}` | the same bytes leaving again |
  | `user>>>{id}>>>traffic>>>{uplink,downlink}` | the same bytes attributed per user |

  v1 summed *every* name ending in `uplink`/`downlink`, which is harmless only
  while the API is absent — the moment an `api` block enables more than one
  family, each byte is counted two or three times. With a realistic mix of all
  three families the v1 sum reports **3900** where the truth is **1500**. v2 sums
  the `inbound` family only (every client byte crosses exactly one inbound, and
  the total does not depend on whether per-user accounting is on) and reports
  `counter_family: "inbound"` alongside it so no consumer has to guess. If that
  family emits nothing, `uplink`/`downlink` are **`null`, not `0`** — a missing
  measurement must never render as a real zero.

  Directions are xray's, from the node's point of view: `uplink` = bytes
  **received from** clients, `downlink` = bytes **sent to** them. Note that
  `server-health.ts` currently maps `bandwidth_in ← downlink` and
  `bandwidth_out ← uplink`, which is the opposite convention; worth reconciling
  before those numbers go live on a chart.

  `users` (per-user `{uplink, downlink}`, keyed by the id in the `user>>>` names)
  is `{}` until per-user accounting is enabled, and the whole `traffic` object is
  `null` while the node has no `api` block at all.

Env knobs (all optional): `STATS_PORT`, `XRAY_API`, `XRAY_API_CONNECT_TIMEOUT_S`,
`XRAY_API_RECHECK_S`, `REACH_URL`, `REACH_UA`, `REACH_TIMEOUT_S`,
`REACH_INTERVAL_S`, `REACH_START_DELAY_S`.

### Fleet state as of 2026-09-08

Nine `vpn_servers` rows carry a `stats_agent_url`: Poland 2 `74.248.17.32`,
Sweden `4.223.104.74`, United States `172.202.18.40`, Hong Kong `20.24.217.182`,
Canada `20.151.116.180`, Japan `20.46.122.212`, UAE `20.203.125.164` (all seven
Azure, all active), plus Netherlands `103.246.146.20` and Russia `72.56.36.147`,
both `is_active = false` but both still needing the agent.

All seven Azure nodes were checked directly and run a build that predates the
reachability probe entirely (`grep -c "def reachability"` returns 0 on every
one, `access` is `none`, zero access-log lines), so v2 is a genuine upgrade on
all seven, not a no-op. Netherlands is the only node on a newer build.
Russia was refusing connections when polled and is expected to fail the deploy.

**Egress reality, measured on all seven Azure nodes 2026-09-08:** every one
returns **403 from chatgpt.com** and **200 from both cloudflare.com and
google.com**. The fleet is blocked by OpenAI specifically — Cloudflare as a
network is not blocking us at all, and general egress is fine. Read a `blocked`
verdict as "OpenAI refuses this IP", never as "this node has no internet".

**Expect the Servers tab to go amber when v2 lands.** Those nodes report no
`reachability` object today, so `flagged` is null and `classifyFromSignals`
calls them healthy. Under v2 they will report `flagged: true` truthfully, and
that function maps `flagged` → `degraded`. Seven nodes will change colour on the
first refresh after deploy without anything about them having changed.

### Reading a payload: check `agent_version` first

Every key documented here is guaranteed only at `agent_version: 2`. Measured
across the fleet 2026-09-08: all seven Azure nodes report **`agent_version: 1`**,
and their payloads carry no `reachability` object and no `distinct_peers` key —
that build predates both. A v1 payload's top-level keys are exactly
`agent_version, hostname, ts, xray, cpu, mem, uptime_s`. So:

| payload | means |
| --- | --- |
| `agent_version: 1` | pre-reachability build; `reachability`/`distinct_peers` absent, infer nothing from their absence |
| `agent_version: 2`, `reachability.status: "unknown"`, `checked_at: null` | agent is up, no probe has completed yet |
| `agent_version: 2`, `reachability.status: "ok"` | a probe completed and the exit IP was served normally |

A **missing** `reachability` object must read as *unknown*, never as healthy —
the same rule the `flagged`/`unknown` split enforces inside a v2 payload.

### Deploying (`deploy-stats-agent.sh`)

```bash
# whole fleet
SUPABASE_URL=https://fzlrhmjdjjzcgstaeblu.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=... ./deploy-stats-agent.sh

# one node at a time, which is how the v2 rollout should go
./deploy-stats-agent.sh 20.46.122.212
```

- **Fleet discovery from Supabase.** With `SUPABASE_URL` (or
  `NEXT_PUBLIC_SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY` in the environment
  it queries PostgREST for every `vpn_servers` row with a `stats_agent_url`, so a
  node added to the table is picked up without editing the script. **It does not
  filter on `is_active`** — Netherlands and Russia are both inactive and both
  still need the agent. `stats_agent_url is not null` is the whole filter, and it
  is what keeps Poland (185.203.240.174, a Marzban node) and Israel
  (185.159.73.238, no agent) out of the list. Without those env vars — or if the
  query fails or returns nothing — it falls back to the `FALLBACK_FLEET` array at
  the top of the script and says so on stderr. That array is a hand-maintained
  snapshot and will rot.
- **Per-host SSH profiles.** Nothing may assume azureuser:
  | host | login |
  | --- | --- |
  | the seven Azure nodes | `azureuser` + `sudo` + `~/.ssh/id_rsa` |
  | Netherlands `103.246.146.20` | `root`, **no sudo**, `~/.ssh/doppler_nl_relay` (a `doppler-nl` alias also exists in `~/.ssh/config`) |
  | Russia `72.56.36.147` | `admin` + passwordless `sudo`, `~/.ssh/iron_blog_ed25519` |

  Overridable per run via `SSH_USER`/`SSH_KEY`, `NL_SSH_USER`/`NL_SSH_KEY`,
  `RU_SSH_USER`/`RU_SSH_KEY`. A configured key that is missing on disk falls back
  to ssh-agent / `~/.ssh/config` with a warning rather than failing.
- **Explicit IPs as arguments** deploy to just those hosts and skip discovery.
- **Token reuse is preserved and load-bearing**: the existing `STATS_TOKEN` is
  read off the box and reused, so redeploying never rotates the token and never
  desyncs `vpn_servers.stats_agent_token`. A new token is minted only when the
  box has none, and the script says which of the two happened.
- **`systemctl restart` is now explicit, and this is the bug most likely to
  repeat.** `enable --now` starts a unit that is *stopped*; it does nothing at
  all to one that is already running. The old script only ever ran
  `enable --now`, so every redeploy copied a new `stats-agent.py` onto the box
  and then left the **old** agent running in memory — a deploy that looks
  completely successful, prints its `<ip> <token>` line, and changes nothing.
  That is almost certainly what happened to commit 211daf1: it was deployed, and
  `grep -c "def reachability"` on the installed agent still returns 0 on all
  seven Azure nodes. v2 runs `enable` + `restart` and then greps the live
  response for `"agent_version": 2`, so a silent no-op now fails loudly.
- **Self-verify**: after install it curls `127.0.0.1:9101/stats` on the box with
  the token and greps for `"agent_version": 2`.
- **One host failing no longer aborts the run.** Russia `72.56.36.147` was
  refusing connections on 2026-09-08 and is expected to fail; it stays in the
  list and gets reported as failed rather than being quietly dropped. Each
  failure is reported inline, and the run ends with a `Deployed (n)` /
  `Failed (n)` summary and a non-zero exit if anything failed. `<ip> <token>` pairs go to stdout, everything else to
  stderr, so `./deploy-stats-agent.sh > pairs.txt` stays clean.

### What the connection numbers mean (read before alerting on them)

`xray.connections.total` counts **ESTABLISHED TCP sockets**, not users and not
sessions. In TUN mode a client opens one socket per destination flow, so a
single device routinely holds hundreds; anything probing the public REALITY
ports is counted too. Measured on Hong Kong 2026-09-08: **2,197 sockets from 33
distinct peer IPs**, against a fleet that had 58 subscription-bearing accounts
in total.

`xray.connections.distinct_peers` (added 2026-09-08) counts unique remote IPs.
It is the closest thing this box can measure to a device count — still not an
account count, because every client presents the same shared VLESS UUID and
several devices can sit behind one NAT address. From agent v2 it is `0` on an idle node and
`null` only on the `/proc` fallback path; on any node still running an older
agent it is absent entirely, so every consumer must treat it as optional.

**Never compare `total` to `vpn_servers.max_users`** — that column counts people.
The service-monitor did exactly this until 2026-09-08 and would have paged with
"near cap 2197/150" at roughly two real devices. Capacity alerts now use
`distinct_peers`; socket volume gets its own separate threshold. `nf_conntrack`
is not a usable denominator either: Hong Kong read 200/7168 while holding those
2,197 xray sockets.

`xray.traffic` is `null` on bare installs — the xray stats API is not enabled in
their configs. Agent v2 no longer *pays* for that (see above) and already parses
per-user stats, so if an `api` block is added the numbers appear on their own,
up to `XRAY_API_RECHECK_S` (5 min) later.

## Metrics collector (`server_metrics` history)

`20260908T202000_server_metrics_history.sql` created the table, the retention
function and the rollup, but deliberately shipped no writer. This is the writer.
Without it the history stays empty forever and every number in the fleet remains
a live probe that is rendered once and lost.

| file | role |
| --- | --- |
| `metrics-collector.py` | stdlib-only; one sweep per invocation |
| `doppler-metrics-collector.service` / `.timer` | the 60s sweep |
| `doppler-metrics-prune.service` / `.timer` | daily retention at 03:20 UTC |
| `deploy-metrics-collector.sh` | installs all of the above, Poland only |

**Poland only, enforced in the deploy script.** The collector holds the Supabase
service-role key, which rewrites every table in the project; a VPN node is the
machine most likely to be seized, resold or reimaged, so the key must never land
on one. 185.203.240.174 is also the only source address the agents' NSG rules
accept, so a collector anywhere else could not poll them regardless.
`deploy-metrics-collector.sh` hard-codes that host and makes you retype any other
one to proceed. Poland already runs pm2 (doppler-admin, admin-bot, doppler-api)
and Docker (n8n); these are systemd units named `doppler-metrics-*` and the
collector binds no port, so nothing collides.

Each sweep reads `vpn_servers` for every row with a `stats_agent_url` (again **no
`is_active` filter** — Netherlands and Russia are inactive and their history
still matters), polls the fleet in parallel, and writes one row per node.

### Decisions worth knowing before you change it

**A missing measurement is NULL, never 0.** Every extractor returns `None` for
anything that is not a real number — `bool` is excluded explicitly, because
`isinstance(True, int)` is true in Python and `True` would otherwise become the
integer 1. A real `0` survives as `0`. This is the rule the whole table was
designed around: an old agent, a failed probe and an idle node are three
different facts and only NULL carries the first two.

**Older agents degrade to NULL, and `agent_version` records why.** The seven
Azure nodes emit no `agent_version`, no `reachability` and no `distinct_peers`;
those columns go NULL while `connections`, `cpu` and `mem` are stored normally.
One exception, made deliberately: the Netherlands node runs the v1 build, which
has a `reachability` object with a raw `chatgpt_status` but no `status` key — and
it is the only node currently reporting a 403. Dropping that to NULL would throw
away the single most interesting datapoint in the fleet, so the collector
re-derives the verdict from the raw status code using agent v2's own table. It
never reads v1's `flagged` boolean, which only ever counted 403.

**`traffic_*` is only stored when the agent names its counter family.** Agent v2
reports `counter_family: "inbound"`; a v1 payload's totals summed every family
and would double-count, so unnamed totals are refused rather than stored wrong.
Both columns stay NULL until an xray `api` block exists, which is correct.

**`sampled_at`** is the agent's own `ts` when it is usable — second resolution, so
a retried poll collides with the row it already wrote and ingestion is idempotent
under `UNIQUE (server_id, sampled_at)`. Two cases fall back to the sweep's own
second-truncated clock, shared by every row in that sweep: a node that did not
answer has no `ts` at all, and a node whose clock is more than
`MAX_CLOCK_SKEW_S` (300s) off would otherwise write one row and then silently
collide with itself forever, losing every later sample. The fallback is logged.

**Two deliberate divergences from the migration's own comments.** Both were
directed, both are argued in the file header, and the migration's prose is what
should be corrected — not this collector:

1. §8 says a node that does not answer writes **no row**. We write a row for
   every node on every sweep, with `xray_active` NULL and the metrics NULL.
   Check the rollup before objecting: `uptime_pct` is
   `count(*) FILTER (WHERE xray_active IS TRUE) / expected_samples`, and the
   denominator is *expected* samples, not rows present — the migration's own
   comment says that is so "an agent that stopped answering counts as downtime
   rather than vanishing". So a NULL row cannot inflate uptime. What it changes
   is `coverage_pct`, for the better:

   | | collector dead | one node down |
   | --- | --- | --- |
   | with failure rows | coverage collapses for **every** node | that node: coverage ~100, uptime 0 |
   | without them | coverage 0 for every node | coverage 0 for that node |

   Without failure rows the two are indistinguishable, `coverage_pct` merely
   duplicates `uptime_pct`, and "is my collector alive?" cannot be answered from
   the data at all. A gap that means two different things is the exact class of
   bug this project exists to remove.

2. The `net_rtt_ms` column comment says "round trip to GET /stats". We store the
   TCP handshake to the node's REALITY port instead, matching
   `doppler-admin/src/lib/tcp-ping.ts` and the panel's Ping column: the same
   measurement on every node with no agent in the path, still a number when the
   agent is dead but xray is alive, and the agent's own share of a /stats round
   trip is already reported separately as `agent_compute_ms`. A node whose
   REALITY port answers while its agent does not produces `net_rtt_ms` set and
   everything else NULL — "the box lives, the agent is gone".

### Retention: systemd timer, not pg_cron

The migration's section 7 offers both and refuses to choose, because whether
pg_cron exists on `fzlrhmjdjjzcgstaeblu` has never been confirmed (`SELECT * FROM
cron.job` is the query that would settle it and nobody has run it). **This ships
the systemd option**: `doppler-metrics-prune.timer` calls
`metrics-collector.py --prune` daily at 03:20 UTC — the same slot the pg_cron
variant would have used, chosen to stay off the 6-hourly expiry sweeper's
boundaries — which POSTs `rpc/prune_server_metrics` with `p_keep_days=30`.
`Persistent=true`, so a box that was down catches up rather than skipping a week.

It needs no unconfirmed extension and it lives next to the only other scheduled
job that touches this table. If pg_cron is later confirmed present, prefer it and
`systemctl disable --now doppler-metrics-prune.timer` — running both would double
the deletes, which is harmless but pointless. Either way, check monthly:

```sql
SELECT count(*), min(sampled_at), max(sampled_at),
       pg_size_pretty(pg_total_relation_size('public.server_metrics'))
FROM public.server_metrics;
```

### Deploying and watching it

```bash
SUPABASE_SERVICE_ROLE_KEY=... ./deploy-metrics-collector.sh
./deploy-metrics-collector.sh --dry-run     # install, then one sweep that writes nothing

journalctl -fu doppler-metrics-collector
systemctl list-timers 'doppler-metrics-*'
```

The key is reused from `/etc/doppler-metrics-collector.env` if the box already
has one (same reasoning as the agent's token reuse: redeploying must not rotate
credentials), and when it is installed it is piped over stdin into
`install -m 600 /dev/stdin` — never in an argv where `ps` would show it, never
echoed, never logged. `metrics-collector.py --dry-run` prints the rows it would
write and is the right way to inspect the fleet without touching the table.

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
