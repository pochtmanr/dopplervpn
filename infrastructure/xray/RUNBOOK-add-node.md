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

Apply the **flagged-domain routing** from `README.md` (ChatGPT → clean upstream) as part of buildout.

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

- `max_users` — the real ceiling this node can serve well; drives the capacity alert and (future)
  hard-cap selection. Pick from the box's CPU/RAM/bandwidth (a modest VPS is often ~200–500).
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

- Row shows up in the n8n **Doppler Service Monitor** as OK (xray active, connection count sane).
- Reachability probe reports `chatgpt_status: 200` (not 403) — the flagged-domain routing is working.
- Bot's country picker offers the new node; a new provision for that country lands on the least-loaded box.
- Taiwan streaming smoke test on the new node (play a video, confirm no buffering).
