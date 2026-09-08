# Runbook — add a VPN exit node

Use this to add capacity and diversify exits. **Priority: a Taiwan node** (the streaming complaint), and
**diversify some exits off Azure** to cut both IP-flagging pressure and single-box contention.

This is provisioning/ops (spend + a `vpn_servers` row). No app release is needed — the bot and RPCs pick up
new rows automatically.

---

## 0. Decide node type

| Type | When | Monitoring column |
|---|---|---|
| **Marzban panel** | You want the bot to *provision users* on it (full node) | `marzban_api_url` + `marzban_admin_*` |
| **Bare-xray REALITY** | Extra exit only, users managed elsewhere | `stats_agent_url` + `stats_agent_token` |

> The bot treats a **non-null `marzban_api_url`** as "provision users here". Bare-xray nodes must leave the
> `marzban_*` columns NULL and use the `stats_agent_*` columns instead.

## 1. Provision the VPS

- **Taiwan:** pick a Taiwan region/host. For streaming, prefer a host with good local peering.
- **Diversify off Azure:** for some exits, use a non-Azure provider (cleaner IP reputation reduces ChatGPT
  403s and spreads load). Verify the IP isn't already flagged (`curl -w '%{http_code}' https://chatgpt.com/`
  from the box before committing).
- Open only what's needed: REALITY ports **8443–8448** to the world; SSH locked down.

## 2. Install the VPN core

- **Marzban node:** install Marzban, create the VLESS-Reality inbound (ports 8443–8448), note the panel URL +
  admin creds. Ensure inbound **sniffing** is on (needed for the flagged-domain routing).
- **Bare-xray node:** install xray-core with the same VLESS-Reality inbound layout on 8443–8448.

### 2a. Apply the node baseline — before the node ever takes traffic

A stock xray config has **no `routing` block at all**, which means no egress restrictions: a connected
client can dial the node's own loopback and the link-local instance metadata address at
`169.254.169.254`, and nothing stops BitTorrent or outbound SMTP from burning the exit IP. It also has
no `api`/`stats`, so per-user traffic is unmeasurable and `xray api statsquery` costs 3 s of timeout
per monitoring poll, and no `dns`, so the node resolves through the hosting provider's resolver.

Fix all of that as part of buildout rather than retrofitting it. It applies in **two independent
stages**. Stage 1 is additive and goes on every node. Stage 2 is the DNS
change and is a separate decision — see `README.md` before choosing it.

```bash
cd landing/infrastructure/xray
V='vless://…@<ip>:8443?…'

./verify-egress-exposure.sh --vless "$V" --node-ip <ip>    # before

./apply-node-baseline.sh --stage 1 --dry-run <ip>
./apply-node-baseline.sh --stage 1 <ip>
./verify-node-baseline.sh --stage 1 <ip> --vless "$V"      # stamps stage1_verified

# only if you have decided to take the DNS change on this node:
./apply-node-baseline.sh --stage 2 <ip>                    # refuses without the stamp above
./verify-node-baseline.sh --stage 2 <ip> --vless "$V"
```

Read the `_comment` fields in `node-baseline.json` before changing anything in it — they carry the
non-obvious constraints (why the CIDRs are literals rather than `geoip:private`, why the `dns` block
is inert without the freedom patch, why per-outbound counters are off, why the Marzban node skips
half the fragment). `README.md` has the same material in prose.

**Expect per-user traffic counters to be empty.** Stage 1 enables them, but the stat key is
`user>>>{email}>>>traffic>>>uplink`, and the fleet's shared VLESS client entries carry no `email`
field — so no per-user counter appears no matter what `policy` says. Per-**inbound** counters work
immediately and are what monitoring should sum. Populating emails is a later workstream's job;
`apply-node-baseline.sh` reports the count and deliberately refuses to add one, because doing so
would mean editing a REALITY inbound.

**The applier gates on the node's xray version.** It refuses to merge onto a core the fragment has
not been validated against (validated: 26.3.27; Poland runs 24.12.31). `--accept-untested-version`
overrides the refusal, after which the real gate is the `xray -test` run with the node's own binary
before anything restarts.

**Poland/Marzban is a documented separate branch** — it gets only log/outbound/routing/dns, because
Marzban supplies `api`/`stats`/`policy` itself. Note also that **Marzban regenerates
`xray_config.json` from its own panel state**, which the bare-xray nodes never do: a hand-edit there
can be overwritten by a panel action. Re-check the panel's Core Config after any panel change.

As of 2026-09-08 the baseline is applied to **zero** nodes, at either stage. A new node built from
this runbook is the first one that gets it from the start.

### 2b. Flagged-domain routing (optional, and currently applied nowhere)

Apply the **flagged-domain routing** from `README.md` (ChatGPT → clean upstream) as part of buildout
**if** clean-upstream credentials exist — as of 2026-09-08 they do not, and no node has this. If you
do apply both, apply the node baseline **last** so the rule order stays correct (see README).

### 2c. Turn the access log OFF — mandatory, before the node ever takes traffic

The App Store listing claims **"Zero activity logs."** xray's access log records *client IP +
destination, per connection*, which is a browsing history. The `log` block **must** be:

```json
"log": { "loglevel": "warning", "access": "none" }
```

`error` stays on (crashes and REALITY handshake failures are still wanted). Only `access` goes.

**This is not the default and it is easy to miss.** An unset `access` key does not mean off — it
means stdout, which journald persists to disk. On 2026-08-16 all 9 fleet nodes were found logging:
the 7 Azure nodes had no `access` key at all, and Poland (Marzban) had it pointed at a real file,
`/var/lib/marzban/access.log` — **266 MB, ~2M lines, 752 distinct client IPs, going back to
2026-04-03**, with no logrotate.

- Bare-xray: `/usr/local/etc/xray/config.json` → `scratchpad/kill-access-log.sh`
- Marzban: `/var/lib/marzban/xray_config.json` → `scratchpad/kill-access-log-poland.sh`

`node-baseline.json` carries the correct `log` block and `apply-node-baseline.sh` refuses to reload if
`access` is not `none` — but that is a **regression guard, not a fix**. A 2026-09-08 sweep found all
seven Azure nodes already correct (`access: "none"`, `0` ` accepted ` lines). A brand-new node is not
covered by that sweep, so do this step on its own merits.

Verify after install: `journalctl -u xray | grep -c " accepted "` must be `0`, and for a Marzban
node `/var/lib/marzban/access.log` must not exist.

## 3. Insert the `vpn_servers` row

Credentials go in the **dedicated columns, never env/code** (`doppler-bot/CLAUDE.md`). Set real capacity:

```sql
insert into public.vpn_servers
  (name, country, country_code, city, ip_address, port, protocol, config_data,
   load_percentage, is_active, max_users,
   marzban_api_url, marzban_admin_user, marzban_admin_pass, marzban_api_key)
values
  ('Taiwan 1', 'Taiwan', 'TW', 'Taipei', '<ip>', 8443, 'tcp', '<vless-uri-or-json>',
   0, true, 300,                      -- max_users: real capacity ceiling for this box
   'https://<panel-host>', '<admin>', '<pass>', '<api-key-or-null>');
-- Bare-xray node instead: leave marzban_* NULL, and after step 4 set:
--   stats_agent_url = 'http://<ip>:9101/stats', stats_agent_token = '<token from deploy>'
```

- `max_users` — the real ceiling this node can serve well. Read only by `doppler-bot`
  (`src/services/marzban.ts`); **not** exposed by `get_servers`/`get_servers_v2` and not read by any
  client app. NULL means "no ceiling set", which is the current state of every row.

  > **History:** this column did not exist until 2026-08-17. `20260723_server_capacity.sql` was
  > written but never applied, while the bot shipped a `SELECT` that included `max_users` — so
  > PostgREST returned `400 column vpn_servers.max_users does not exist` and the bot's Marzban
  > provisioning failed on every path. Only section 1 of that migration (the column + check
  > constraint) has been applied. **Do not apply sections 2–4** — they rewrite `vpn_servers_safe`,
  > `get_servers` and `get_servers_v2` from a July snapshot and would silently revert the
  > 2026-08-16 version gate (`min_tun_version`) and the BE-03 `tunnel_mode`/`client_flags` keys.

  **Sizing it.** The old "a modest VPS is often ~200–500" was a guess and is too high for this
  fleet. Measured 2026-08-17 across all 7 Azure nodes: **2 vCPU, ~900 MB RAM, load ~0.00** — CPU is
  nowhere near the limit. The binding constraints are RAM and, first, **`nf_conntrack_max`, which
  is only 7,680** on these boxes (it is derived from the 1 GB of RAM). Sweden was already at
  624/7680 with ~130 established client connections.

  **That measurement is proxy-era and is now the wrong baseline.** A packet tunnel carries every
  UDP flow, and each one opens its own outbound connection, so conntrack per user rises sharply.
  Start conservative — **~150** for a 2 vCPU / 1 GB B-series box — then re-derive from
  `nf_conntrack_count` under real VPN traffic before raising it. If conntrack is the ceiling,
  raising `net.netfilter.nf_conntrack_max` is cheaper than a bigger VM, but it costs RAM on a box
  that only has 1 GB.

- `load_percentage` starts at 0; keep it roughly current so the bot's least-loaded pick spreads users.

## 4. Deploy the stats agent (monitoring + reachability probe)

```bash
cd landing/infrastructure/monitoring
./deploy-stats-agent.sh <ip>          # prints:  <ip> <token>
```

Paste the printed `<ip> <token>` into the row's `stats_agent_url` (`http://<ip>:9101/stats`) and
`stats_agent_token`. Redeploys now **preserve** the existing token (see `deploy-stats-agent.sh`), so you only
set this once per node.

Also add an Azure/host firewall rule allowing TCP **9101 only from the n8n host** `185.203.240.174/32`.

## 5. Verify

- `./verify-node-baseline.sh --stage 1 <ip> --vless '…'` is all PASS (and read the SKIPs — a skip is
  not a pass). Same for `--stage 2` if that stage was taken.
- `./verify-egress-exposure.sh` reports the CONTROL passing and sections A/B/C all with no answer.
- Row shows up in the n8n **Doppler Service Monitor** as OK (xray active, connection count sane).
- The monitor's per-node latency is no longer ~2.2 s — that number was the 2 s timeout the stats agent
  paid on every `xray api statsquery` against a node with no `api` block.
- Reachability probe reports `chatgpt_status: 200` (not 403) — the flagged-domain routing is working.
  Note that on the existing Azure fleet it reports **403 on every node** and the baseline's abuse rules
  cannot change that; only a cleaner exit IP or the flagged-upstream routing can.
- Bot's country picker offers the new node; a new provision for that country lands on the least-loaded box.
- Taiwan streaming smoke test on the new node (play a video, confirm no buffering).
