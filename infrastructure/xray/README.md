# Xray flagged-domain routing (ChatGPT 403 fix)

Fixes the customer-reported **ChatGPT 403 / Cloudflare challenge** on Doppler exits (US, HK, Poland).

## Why this is needed

The whole fleet runs Xray VLESS-Reality on **Microsoft Azure datacenter IPs**. Cloudflare and OpenAI
blanket-flag datacenter ASNs, so the single shared exit IP for a country gets a 403 for *everyone* on it.
**A flagged datacenter IP cannot be un-flagged by any Xray setting** — the only real levers are a cleaner
exit IP or routing the flagged domains through a cleaner upstream.

This mechanism routes **only** the flagged domains (`openai.com`, `chatgpt.com`, …) through a clean
**`flagged-upstream`** outbound. All other traffic keeps the fast direct path, so working-server speed is
untouched.

Files:
- `routing-flagged-domains.json` — the outbound + routing-rule fragment to merge into each node's xray config.
- `RUNBOOK-add-node.md` — how to provision new exit nodes (Taiwan first, off-Azure diversification).

---

## Choosing the upstream (cost — read before buying)

The `flagged-upstream` outbound points at a **clean** SOCKS5/HTTP endpoint. The template accepts any such
endpoint identically, so the provider choice **never changes code** — only the env values you substitute in.

> ⚠️ **A plain cheap datacenter VPS is NOT reliably clean.** Hetzner / Contabo / Aeza are still datacenter
> ranges and OpenAI frequently 403s them too. Do not assume "off-Azure VPS" = fixed.

Reliable, cheap options (in order of predictability):

| Option | What to buy | Cost | Notes |
|---|---|---|---|
| **Static ISP / static-residential IP** ✅ recommended | 1–2 static ISP IPs (US + HK) exposed as SOCKS5/HTTP | **~$1–4 / IP / month, fixed** | Not per-GB. Reliably passes ChatGPT. Providers: **IPRoyal**, **Proxy-Seller**, **Proxys.io** (RU-friendly billing); **Oxylabs / Bright Data** ISP (pricier, top reputation). |
| **Clean off-Azure node** | A VPS on a residential/ISP network you control, running an auth SOCKS5 | ~$5–10 / month, fixed | Only clean if the host's IP is genuinely un-flagged — verify with the reachability test below before trusting it. |
| **Rotating residential (per-GB)** ⚠️ documented only | Gateway endpoint, country-targeted | **~$3–15 / GB, recurring & growing** | One account for the whole fleet; scoped to the tiny domain list keeps volume small. Not chosen — avoid unless the fixed options fail. |

**Recommendation:** a pair of static ISP IPs (US + HK). Predictable few-dollars/month, no per-GB bill.

Whatever you pick, you get: `host`, `port`, `user`, `pass`. Those go in a node env file, never in git.

---

## Rollout (per node)

There are only a handful of nodes, so a short loop over the fleet IPs is fine (mirror
`../monitoring/deploy-stats-agent.sh`). Fleet: `74.248.17.32 4.223.104.74 172.202.18.40 20.24.217.182
20.151.116.180`; REALITY ports 8443–8448.

### 1. Put the upstream credentials on each node (never in git)

```bash
# On each node, as root — mode 600, one line per var:
cat >/etc/doppler-xray-upstream.env <<'EOF'
UPSTREAM_HOST=<clean-endpoint-host>
UPSTREAM_PORT=<port>
UPSTREAM_USER=<user>
UPSTREAM_PASS=<pass>
EOF
chmod 600 /etc/doppler-xray-upstream.env
```

### 2. Merge the fragment into the node's xray config

The node's xray config is what Marzban feeds xray-core (typically `/var/lib/marzban/xray_config.json`, or
the "Core Config" in the Marzban panel). Merge **without touching the REALITY inbounds on 8443–8448**:

- **Append** the `flagged-upstream` object to the existing `outbounds` array (keep `direct`/`freedom` as the
  default, first-matching fallback).
- **Prepend** the `routing.rules` entry so flagged domains are matched *before* any catch-all rule.
- Substitute the placeholders from the env file. Example with `jq` + the env file:

```bash
set -a; . /etc/doppler-xray-upstream.env; set +a
CFG=/var/lib/marzban/xray_config.json
cp "$CFG" "$CFG.bak.$(date +%s)"     # always back up first

jq --arg h "$UPSTREAM_HOST" --argjson p "${UPSTREAM_PORT}" \
   --arg u "$UPSTREAM_USER" --arg w "$UPSTREAM_PASS" '
  .outbounds += [{
    tag:"flagged-upstream", protocol:"socks",
    settings:{servers:[{address:$h, port:$p, users:[{user:$u, pass:$w}]}]}
  }]
  | .routing.rules = ([{
      type:"field", outboundTag:"flagged-upstream",
      domain:["domain:openai.com","domain:chatgpt.com","domain:chat.openai.com",
              "domain:oaistatic.com","domain:oaiusercontent.com","domain:cdn.openai.com",
              "domain:auth0.openai.com","domain:featureassets.org",
              "domain:intercom.io","domain:intercomcdn.com"]
    }] + (.routing.rules // []))
' "$CFG.bak."* >/tmp/xray_new.json && mv /tmp/xray_new.json "$CFG"
```

> **Sniffing must be on.** Domain rules only match if the inbound has `sniffing` enabled
> (`destOverride: ["tls","http"]`) so xray can read the SNI/host. Marzban's default VLESS-Reality inbound has
> this on — confirm it wasn't disabled.

### 3. Reload xray only (do not restart REALITY inbounds unnecessarily)

Via Marzban panel: save the Core Config (it restarts xray-core, keeps Marzban up). Or restart the Marzban
service if editing the file directly:

```bash
marzban restart          # or: systemctl restart marzban
```

---

## Verify

From the node (or through a client connected to that node's exit):

```bash
# Direct datacenter exit — expect 403 on flagged nodes:
curl -sS -o /dev/null -w '%{http_code}\n' https://chatgpt.com/

# Through the upstream — expect 200:
curl -sS -o /dev/null -w '%{http_code}\n' -x socks5h://$UPSTREAM_USER:$UPSTREAM_PASS@$UPSTREAM_HOST:$UPSTREAM_PORT https://chatgpt.com/
```

Then run a real ChatGPT session through the VPN exit and confirm no 403. Confirm a normal site
(`curl -s -o /dev/null -w '%{http_code}\n' https://example.com/`) still returns 200 quickly via `direct`
(no global latency regression).

The n8n monitor's per-node reachability probe (see `../monitoring/`) will start alerting automatically if a
node's ChatGPT status turns 403 again.

---

# Fleet nodes

The `RUNBOOK-add-node.md` port→SNI layout is fleet-wide:
**8443 www.yahoo.com · 8444 www.amazon.com · 8445 www.apple.com · 8446 www.bing.com ·
8447 www.cloudflare.com · 8448 dl.google.com**, one REALITY inbound per port, fresh x25519
keypair + shortId per inbound, shared client UUID, `flow: xtls-rprx-vision`,
`log.access = "none"`. Exceptions are noted per node.

## Netherlands — `103.246.146.20` (added 2026-09-06)

| | |
|---|---|
| Host | non-Azure VPS, Ubuntu 26.04, 1 vCPU / 2.5 GB RAM (same hosting account as the Poland bare-metal box) |
| SSH | `ssh doppler-nl` (root; alias in `~/.ssh/config`) |
| Type | **bare xray-core** 26.3.27 — `marzban_*` columns stay NULL |
| Layout | fleet default, **no dest swaps** — all 6 handshake-verified PASS |
| Access log | `"access": "none"` from the first start; `journalctl -u xray \| grep -c " accepted "` = 0 |
| Firewall | **ufw**, not an Azure NSG. Open: 22, 80, 443, 8443:8448/tcp, and 9101/tcp **only from 185.203.240.174/32** (the n8n monitor) |
| Stats agent | `http://103.246.146.20:9101/stats`, deployed per `../monitoring/` conventions |
| Row payload | generated on the box at `/root/node-summary.json` (keys + stats token). `is_active` starts **false** |
| Keys | `/root/xray-keys.json` (mode 600, includes private keys — never leaves the box) |
| Extra role | **also the Supabase relay "sb1"** — see `../relay/README.md`. Caddy owns 80/443, xray owns 8443-8448 |

### Things that differ from the Azure fleet

- **This box can hairpin.** Unlike the Azure VMs, it reaches its own public IP, so
  `/root/test-reality.sh` verifies all 6 inbounds *from the node itself* — no second
  server needed. That script is the same pattern as the fleet's `test-reality.sh`
  (throwaway xray socks client → `curl --socks5-hostname https://ifconfig.me` →
  assert exit IP == the node's IP).
- **No Azure NSG.** Every "add an NSG rule" step in the runbook and in
  `../monitoring/README.md` becomes `ufw allow …` here.
- **`deploy-stats-agent.sh` does not apply as written** — it hardcodes
  `azureuser` + `sudo` + `~/.ssh/id_rsa`. The agent was installed by hand following the
  script's exact conventions (same paths, same `/etc/doppler-stats-agent.env` mode-600
  token file, same preserve-existing-token rule) over the `doppler-nl` root alias.
- **`chatgpt_status` is 403** from this IP, same as the rest of the fleet — it is still a
  datacenter range. The `flagged-upstream` routing above is **not** applied (there are no
  clean-upstream credentials yet, and no fleet node has it either).
- **The box is shared** with an admin-panel staging workload. `/root/SHARED-BOX-NOTES.md`
  on the node records the ufw and Caddy rules of the road; new listeners need their own
  `ufw allow`.
