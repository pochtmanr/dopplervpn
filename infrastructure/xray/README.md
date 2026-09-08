# Xray node config

Two separate things live here, and they are applied independently:

| | What it does | Deployed to |
|---|---|---|
| **`node-baseline.json` stage 1** | api/stats/policy + the block outbound + four routing rules. Purely additive. **Expected on every node.** | **0 of ~10 nodes** as of 2026-09-08 |
| **`node-baseline.json` stage 2** | The DNS change: `dns` block + freedom `domainStrategy` + `IPIfNonMatch`. A separate, deliberate decision. | **0 nodes** |
| `routing-flagged-domains.json` | Routes ChatGPT/OpenAI through a clean upstream | **0 nodes** — no clean-upstream credentials exist yet |

Scripts:

| File | |
|---|---|
| `node-baseline.json` | The config fragment, split into `stage1` and `stage2`. Every non-obvious decision is a `_comment` inside it — read those, they are the documentation. |
| `apply-node-baseline.sh` | Merges ONE stage into ONE node. Backs up, gates on the node's xray version, `xray -test`s with the node's own binary before anything restarts, restores on any failure. |
| `verify-node-baseline.sh` | Post-change verification for one node and one stage. Writes the `stage1_verified` stamp that gates stage 2. |
| `verify-egress-exposure.sh` | Read-only diagnostic: can a VPN client reach the node's loopback / the metadata address? Run it before AND after. |
| `routing-flagged-domains.json` | The separate ChatGPT-403 fragment (below). |

---

# Node baseline (`node-baseline.json`)

## Two stages, applied and rolled back independently

| | Stage 1 — additive | Stage 2 — the DNS change |
|---|---|---|
| Contains | `api` + the loopback api inbound, `stats`, `policy`, the `block` blackhole outbound, the four routing rules, the `log` regression guard | the `dns` block, the `direct` outbound's `domainStrategy` patch, `routing.domainStrategy: "IPIfNonMatch"` |
| Changes existing traffic? | **No.** Every object is new. Nothing about how a working destination is resolved or dialled changes. | **Yes.** Every destination for every user is resolved differently. |
| Expected on | **every node** | **a separate decision**, per node |
| Fixes | the ~2 s fake latency, per-inbound accounting, runtime user management, the egress holes | the hosting provider seeing every domain every user resolves |
| Apply | `./apply-node-baseline.sh --stage 1 <host>` | `./apply-node-baseline.sh --stage 2 <host>` |
| Gate | starting-shape + xray-version checks | **also refuses until stage 1 is verified on that node** |
| Roll back | restore that run's `…bak.stage1.<stamp>` | restore `…bak.stage2.<stamp>` — stage 1 stays in place |

**Why they are separate.** Stage 2 is by some distance the riskiest thing here, and if it rode along
with the rest then a DNS-shaped regression would force a rollback of the api block and the abuse
rules too — the parts we actually want in place. Two stages, two backups, two rollback paths, two
verification runs.

**Why stage 2 is worth doing anyway.** Today every node resolves through the hosting provider's
resolver, which means **the hosting provider sees every domain every user looks up**. That sits badly
beside the App Store "Zero activity logs" claim: killing the xray access log (runbook 2c) removed our
own copy of that history, not theirs. It is a real privacy improvement — and it is still a decision
somebody makes deliberately, per fleet, not a default that rides in on a security change.

**Its three pieces only make sense together.** The `dns` block is inert on its own; the freedom patch
is what makes it non-inert; `IPIfNonMatch` is affordable only because the freedom patch already
resolves the same name through the same cache. Apply all three or none.

## What was wrong

Measured across the fleet on 2026-09-08. All seven Azure nodes (Poland 2, Sweden, United States,
Hong Kong, Canada, Japan, UAE) are byte-for-byte identical in shape: top-level keys are exactly
`inbounds`, `log`, `outbounds` — **no `routing`, no `dns`, no `api`, no `policy`** — with six
inbounds and exactly one outbound (`freedom`, tagged `direct`).

1. **No routing rules means no egress restrictions at all.** xray dials whatever a client asks it to.
   The severity is *not* uniform, so do not describe it as one finding:
   - **Azure nodes:** the only loopback listener is systemd-resolved on `127.0.0.53:53`. There is
     nothing valuable on loopback there. What matters is the **link-local instance metadata service
     at `169.254.169.254`**, which a client can reach. Stated honestly: link-local is reachable and
     blocking it is free, but **whether these VMs have a managed identity assigned has not been
     checked**, so nobody should claim a credential-theft impact — and nobody should establish it by
     going and taking a token.
   - **Poland is materially worse.** It listens on `127.0.0.1:8000` — the Marzban admin API, bound to
     loopback precisely so it is *not* exposed — plus `127.0.0.1:23246` and `127.0.0.1:33765`. A client
     exiting through Poland can dial all three. (The admin panel on 3060, n8n on 5678 and nginx on
     80/443/9090 are bound to `0.0.0.0` and reachable from the internet anyway; they are not
     incremental exposure and this rule is not what protects them.)
2. **Nothing blocks BitTorrent or outbound SMTP**, both of which wreck exit-IP reputation.
3. **No `api`/`stats` block**, so per-user traffic is unmeasurable — `xray.traffic` is `null` in
   `../monitoring/`. Two side effects worth knowing (see below).
4. **No `dns` block**, so nodes resolve through the hosting provider's resolver.

The access log is **not** on this list. `log.access` is already `"none"` on all seven nodes and
`journalctl -u xray | grep -c " accepted "` is `0` on all seven, so the August 2026 fix has held.
Carrying the `log` block in the fragment and asserting it after the merge is a **regression guard,
not a fix**.

### Standing fleet observation: Poland runs a nine-month-old core

```
Hong Kong  : Xray 26.3.27  (go1.26.1)
Japan      : Xray 26.3.27  (go1.26.1)
Poland     : Xray 24.12.31 (go1.23.4)   <- inside marzban_marzban_1
```

This is worth someone's attention **independently of this work**: the one node running an old core is
also the node running the panel, n8n and the admin app.

For this work it means one concrete thing. The fragment was validated by running `xray -test` on a
full synthetic config against **26.3.27 only**; that says nothing about how a core nine months older
parses it. So `apply-node-baseline.sh` reads the running version first and **refuses** on anything not
in its `KNOWN_GOOD_VERSIONS` list, rather than merging hopefully. `--accept-untested-version`
overrides the refusal, and the honest gate then becomes the `xray -test` the script runs **inside the
container, with the binary that actually has to parse the config**, before anything restarts. That is
a better check than anything that can be done off-box, and it costs nothing.

### What the abuse rules can and cannot do

Curled directly from all seven Azure nodes with a browser User-Agent on 2026-09-08:
`chatgpt.com` returns **403 on every one**; `cloudflare.com` and `google.com` return **200 on every
one**. So these exit IPs are already burnt with OpenAI specifically, while Cloudflare as a network is
not refusing them. **The BitTorrent and SMTP rules cannot undo that.** They exist to stop the
reputation degrading further, and to protect the next service that starts checking. Recovering the
OpenAI reputation needs a cleaner exit IP or the `flagged-upstream` routing further down this file.

### Two side effects of the `api` block that are not obvious

- **It removes ~2 seconds of fake latency per node.** With no api block,
  `time xray api statsquery --server=127.0.0.1:10085` on Hong Kong takes **3.010 s** before failing,
  and the monitoring agent pays a 2 s timeout on *every* request because of it. That is the whole of
  the ~2.2 s of per-node "latency" the admin panel shows.
- **It unlocks runtime user management.** `HandlerService` can add and remove VLESS users with no
  restart and no dropped sessions. A later workstream depends on this. It is also why the restart
  this rollout costs is a one-time price.

## Counter families — read before touching `policy`

`../monitoring/stats-agent.py` sums xray stat names and the admin panel renders the result as fleet
bandwidth. That sum is empty today and **goes live the moment the first node gets this**. xray emits
three families and the same bytes appear in more than one:

| Family | Stat name | Enabled here |
|---|---|---|
| per-inbound | `inbound>>>{inboundTag}>>>traffic>>>uplink` / `downlink` | **yes** |
| per-user | `user>>>{email}>>>traffic>>>uplink` / `downlink` | **yes** |
| per-outbound | `outbound>>>{outboundTag}>>>traffic>>>uplink` / `downlink` | **no, explicitly false** |

**Sum `inbound>>>` and nothing else.** Summing every name ending in `uplink` double-counts.
Per-outbound is off because with exactly one non-blackhole outbound it is a third copy of the same
bytes carrying no new information.

**Expect `user>>>` to be empty on day one.** The key is `user>>>{email}>>>…`, and the fleet's shared
VLESS client has no `email` field, so no per-user counter appears no matter what `policy` says.
Adding emails means editing a REALITY inbound; `apply-node-baseline.sh` reports the count and
deliberately does not do it.

## Interactions the plan did not anticipate

These are the things that will break a node if you change the fragment without knowing them.

- **The private-range rule uses explicit CIDR literals, not `geoip:private` — for robustness, not
  necessity.** `geoip.dat` *is* present on the nodes (checked 2026-09-08: `/usr/local/share/xray/` on
  Hong Kong and Japan has both `geoip.dat` and `geosite.dat`, and Poland's Marzban container has them
  too), so `geoip:private` would resolve today. The literals are chosen because they carry no asset
  dependency, cannot break if someone prunes the geo files the way the iOS client did, and cannot
  shift meaning when the asset is updated underneath a security rule. What happens without the file is
  not hypothetical: verified against xray 26.3.27 with `XRAY_LOCATION_ASSET` pointed at a nonexistent
  directory, `geoip:private` refuses to start with `failed to load GeoIP: private` while the literals
  validate fine. Do not "simplify" them back.
- **Blocking private ranges does not break REALITY.** xray's REALITY server dials its own `dest`
  (`www.yahoo.com:443`, …) from inside the transport layer, not through the routing tree, so no
  routing rule is consulted for it. Those dests are public names regardless.
- **The `dns` block does not affect REALITY either.** REALITY's dest hostnames are resolved by Go's
  stdlib resolver inside the transport, never by xray's DNS module — so a broken DoH path cannot
  break a REALITY handshake.
- **A `dns` block on its own is inert.** freedom's default `domainStrategy` is `AsIs`, which hands
  the hostname straight to Go's dialer and therefore to `/etc/resolv.conf`. The fragment patches the
  existing `direct` outbound to `domainStrategy: "UseIPv4"`; that patch is what makes the DoH
  resolvers actually used. `UseIPv4` because the fleet's egress is IPv4-only.
  *Honest cost:* 1.1.1.1/8.8.8.8 do not send EDNS Client Subnet, so a CDN that leans on ECS may hand
  out a slightly worse edge than the hosting provider's resolver did. Anycast lands in the node's own
  region so this is close to a no-op in practice — but if a streaming complaint appears on a node
  right after this rollout, revert `domainStrategy` to `AsIs` first.
- **`routing.domainStrategy` is `IPIfNonMatch`, not `AsIs`.** That second matching pass is the only
  in-xray defence against DNS rebinding: a client dialling a name that resolves to `169.254.169.254`
  is caught on the second pass, where `AsIs` would let it through. It is affordable *only because*
  the freedom patch above already resolves that same name through the same cache. If DoH ever fails
  from a node, routing stalls on unmatched destinations — the rollback is `AsIs`, which keeps every
  literal-IP block working and gives up only the rebinding pass.
- **`api.listen` is deliberately unset.** Setting it makes xray bind the gRPC server itself, which
  collides with the dokodemo-door inbound on the same `127.0.0.1:10085`. Use one mechanism, not both.
- **The api inbound needs two defences, not one.** `listen: "127.0.0.1"` keeps it off every public
  interface, but that alone would not stop a *tunnelled* client, because from xray's point of view
  that connection originates on the node. The `block-private` rule is what stops that, which is why
  the `api-inbound` rule must sit above it.
- **BitTorrent blocking is hygiene, not enforcement.** The sniffer catches the plaintext handshake.
  It does not catch MSE/PE-encrypted BitTorrent, UDP trackers, or DHT.
- **Port 25 only.** 465 and 587 are how real people send mail from real clients and are left open —
  they are authenticated to a provider and cannot be used to spray mail from the exit IP.

## Rollout — one node at a time

There is no fleet loop and there will not be one. `apply-node-baseline.sh` refuses more than one host.

```bash
cd landing/infrastructure/xray
V='vless://…@<ip>:8443?…'      # one of the node's inbounds. Not in git — take it from the app or the box.

# 0. Establish the exposure BEFORE the change, from a client, so the "after" means something.
./verify-egress-exposure.sh --vless "$V" --node-ip <ip>

# --- stage 1: additive. Expected on every node. ---
./apply-node-baseline.sh --stage 1 --dry-run <ip>     # fetch, merge, xray -test. Writes nothing.
./apply-node-baseline.sh --stage 1 <ip>
./verify-node-baseline.sh --stage 1 <ip> --vless "$V"  # writes the stage1_verified stamp on a clean pass

# --- stage 2: the DNS change. A separate decision — do not treat it as step 4. ---
./apply-node-baseline.sh --stage 2 --dry-run <ip>
./apply-node-baseline.sh --stage 2 <ip>                # refuses unless stage 1 verified above
./verify-node-baseline.sh --stage 2 <ip> --vless "$V"
```

`verify-node-baseline.sh` writes exactly one line to `/etc/doppler-xray-baseline.state` on the node —
`stage<N>_verified=<iso8601>` — and only on a clean pass. That line is the gate stage 2 reads.
Re-applying a stage clears its own line, so a re-apply always needs a re-verify.
(`verify-egress-exposure.sh` writes nothing at all, anywhere.)

Then **stop**. Watch the n8n Doppler Service Monitor and the admin panel for that node before doing
the next one. `verify-node-baseline.sh` distinguishes PASS from SKIP on purpose: a skip is not a pass.

Host conventions match `../monitoring/deploy-stats-agent.sh` and are resolved automatically:

| Node | ssh | Privilege | Type |
|---|---|---|---|
| Azure fleet | `azureuser@<ip>` | `sudo` | bare xray-core, `/usr/local/etc/xray/config.json` |
| Netherlands `103.246.146.20` | `doppler-nl` | root | bare xray-core |
| Poland `185.203.240.174` | `doppler-poland` | root | **Marzban in Docker**, `/var/lib/marzban/xray_config.json` |

### The Poland / Marzban branch is different, deliberately

On Poland the script applies **only** `log`, the `block` outbound, the freedom `domainStrategy` patch,
the routing block rules and `dns`. It does **not** apply `api` / `stats` / `policy` / the api inbound.
Marzban generates those itself at start — its own `API_INBOUND` on `XRAY_API_PORT`, its own stats and
per-user policy — and injects the user list. A second copy in `xray_config.json` is at best duplicated
and at worst a port collision. Per-user traffic on Poland is already readable through the Marzban
panel. `xray -test` runs inside the container (`docker exec`) — which is also the only honest way to
validate against Poland's older core — and the reload is `marzban restart` with a `docker restart`
fallback.

**Marzban regenerates `xray_config.json` from its own panel state**, which the bare-xray nodes never
do. A hand-edit there — including this one — can be overwritten by a panel action in a way it cannot
be on the Azure fleet. So after applying, open the panel's Core Config, confirm the rules are present
and that there is exactly one `api` block, and **re-check after any panel change**.

### About the restart

xray-core has no config hot-reload and the packaged systemd unit has no `ExecReload`, so applying the
baseline **is** a restart: live sessions drop and reconnect. That is a one-time cost, and enabling
`HandlerService` is what stops future user add/remove from needing it.

### Rollback — two independent paths

Every run leaves `<config>.bak.stage<N>.<timestamp>` on the node, and the script restores it
automatically on any failure. Because the stages are separate merges, **restoring a stage-2 backup
returns the node to its verified stage-1 state** — the api block and the abuse rules stay.

```bash
# roll back only the DNS change, keep stage 1:
sudo cp -a /usr/local/etc/xray/config.json.bak.stage2.<stamp> /usr/local/etc/xray/config.json
sudo xray -test -c /usr/local/etc/xray/config.json && sudo systemctl restart xray

# roll back stage 1 as well (do stage 2 first if both are on):
sudo cp -a /usr/local/etc/xray/config.json.bak.stage1.<stamp> /usr/local/etc/xray/config.json
sudo xray -test -c /usr/local/etc/xray/config.json && sudo systemctl restart xray
```

If stage 2 is the suspect but you are not sure, the cheapest partial rollback is to set
`routing.domainStrategy` back to `"AsIs"` and leave everything else: that keeps every literal-IP block
working and gives up only the DNS-rebinding pass.

## Verifying exposure honestly

`verify-egress-exposure.sh` exists because the obvious tests do not answer the question:

- **A client cannot test the node's loopback by dialling `127.0.0.1`** — its own OS short-circuits
  loopback and the packet never enters the tunnel. The test has to be a *proxied* dial whose
  destination address is `127.0.0.1`, so that xray on the node is the one dialling. That is what the
  throwaway local xray socks client is for.
- **A connection refused from the node itself proves nothing about a client.** The `--on-node` mode
  prints that caveat before its output and is only good for inventorying listeners.
- **"No answer" through the tunnel is ambiguous** — blackholed by xray, or dialled and nothing
  listening. So the script runs a **control** first (exit IP through the tunnel must equal the node
  IP; it aborts if not) and uses `127.0.0.1:22` as an **oracle**: sshd emits its version banner before
  it cares that the input was not SSH, so an `SSH-2.0-…` banner is unambiguous proof that a client
  reached the node's loopback.
- It probes `/metadata/instance` only and **never** `/metadata/identity/oauth2/token`. Do not add it.

---

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

## Order of operations with the node baseline

If both fragments are ever applied to the same node, apply **baseline stage 1 last**.
`apply-node-baseline.sh --stage 1` prepends its own rules and keeps every pre-existing rule below
them, which is the order you want: `api-inbound` → `block-private` → `block-bittorrent` →
`block-smtp` → `flagged-upstream` → catch-all `direct`. Verified locally 2026-09-08 by merging the
baseline into a config that already had the flagged-domain rule; the flagged rule survives, in the
right place, and a second merge is a no-op. (Stage 2 adds no rules and reorders nothing, so it is
order-neutral.)

The `jq` snippet below does the opposite — it *prepends* — so running it after the baseline would put
the flagged rule at index 0, **above `api-inbound`**. Do not do that; re-run
`./apply-node-baseline.sh --stage 1 <ip>` afterwards to restore the order (it is idempotent), then
re-verify.

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
