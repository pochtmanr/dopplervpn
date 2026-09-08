# doppler-node-sync

Reconciles one VPN node's live xray state with Supabase, on a 5-minute timer.
Python 3 stdlib only, no pip dependencies — same constraints and house style as
`../monitoring/stats-agent.py`.

Two independent, separately switchable responsibilities:

| | What it does | Status today |
|---|---|---|
| **WS4** user reconciliation | Keeps each node's authorised VLESS client set in step with `accounts`, applying the delta through xray's HandlerService gRPC API so **connected users are never dropped** | Waiting on per-account UUIDs + the `api` block |
| **WS6** exit proxy rendering | Renders one outbound per attached exit proxy, a health-probed balancer, and domain routing rules ahead of the catch-all | **Inert** — no proxies are attached to any node |

> **Dry run is the default.** Without `--apply` the agent prints the diff and the
> rendered config and changes nothing. A careless invocation is harmless.

```bash
python3 node_sync.py                    # dry run, prints the plan
python3 node_sync.py --apply            # actually reconcile
```

---

## Supabase RPC contract (ASSUMED — reconcile this before first run)

The two RPCs were written concurrently in `VPnReact/supabase/migrations/` and
**this agent has never seen them.** Everything below is what it assumes. All of
it is isolated in the block marked `SUPABASE CONTRACT` in `node_sync.py`
(~40 lines); a mismatch is a one-place edit, not a rewrite.

Both are called as `POST {SUPABASE_URL}/rest/v1/rpc/{name}` with the **anon**
key in `apikey` + `Authorization`, and this body:

```json
{ "p_server_id": "<vpn_servers.id uuid>", "p_node_token": "<per-node secret>" }
```

**A node must never hold the service-role key.** The RPCs are expected to
authenticate the caller with `p_node_token` (compared against a per-server
column, ideally hashed) and to be `SECURITY DEFINER` with `REVOKE ALL … FROM
anon, authenticated` plus a `GRANT EXECUTE`. A stolen node env file should then
expose that one node's user list and nothing else.

### 1. `node_authorized_users` → the UUIDs that may connect

Every **active Pro** account's VLESS UUID for this server. The parser accepts
any of these, so the migration can pick whichever is natural:

```jsonc
[{ "vless_uuid": "…", "account_id": "…" }, …]   // preferred
[{ "uuid": "…", "account": "…" }, …]            // aliases: uuid/id, account/acct
{ "users": [ … ] }                              // or "uuids" / "authorized_uuids"
["uuid", "uuid"]                                // bare array (no account ids)
```

**`account_id` is required in practice — see "The `email` field" below.** It is
what identifies the account in xray's traffic stats. When it is missing the
agent falls back to a hashed identity, warns, and per-user traffic stops being
attributable to an account.

- Values must be canonical UUIDs. A non-UUID row **aborts the run** and the
  offending value is never logged (it is a live credential).
- **An empty/null result aborts the run.** Deauthorising every user on a node is
  far more likely a broken RPC than a real state, so the agent refuses. This is
  deliberate fail-closed behaviour: it is why a bad deploy cannot black out the
  fleet.
- Ordering is preserved but not significant.

### 2. `node_exit_proxies` → this server's attached proxies

```jsonc
{
  "proxies": [
    { "priority": 1, "tag": "us1", "protocol": "socks",
      "address": "…", "port": 1080, "username": "…", "password": "…" }
  ],
  "domain_sets": [
    { "name": "flagged", "domains": ["domain:openai.com", "domain:chatgpt.com"] }
  ]
}
```

- `protocol` is `socks` or `http` (the two shapes `routing-flagged-domains.json`
  already documents). Anything else aborts.
- `priority` ascending = the order outbounds are emitted in. Missing sorts last.
- `tag` is namespaced to `doppler-exit-*` automatically.
- Aliases accepted: `host`/`address`, `user`/`username`, `pass`/`password`,
  `exit_proxies`/`proxies`, `domains`/`domain_sets`. A bare array of proxies is
  accepted; a bare array of domain strings becomes one set named `flagged`.
- **`null`, `[]` and `{}` all mean "no proxies attached"** — the normal answer
  for the entire fleet today, and it must never be an error.

---

## The `email` field is an identity decision — read before changing it

xray keys its per-user traffic counters as:

```
user>>>{email}>>>traffic>>>{uplink,downlink}
```

That string is the **only** identifier that ever reaches stats output,
`xray api statsquery`, `../monitoring/stats-agent.py`'s parsed `traffic.users`
map, and whatever the admin panel eventually charts. It lands on an exit node,
in journald, and in a monitoring pipeline.

**The format is `{account_id}@doppler`.**

- It maps back to an account, so traffic is attributable.
- It is **not personally identifying**. Never put a real email address here.
- It is **not the VLESS UUID.** The UUID is a live credential — anyone who reads
  it can connect as that customer. An earlier revision of this agent used
  `{uuid}@doppler`, which would have published the entire customer keyset into
  monitoring, journald and the admin panel. If you change this format, do not
  reintroduce the UUID.
- Missing `account_id` falls back to `acct-{sha256(uuid)[:16]}@doppler` — a
  non-reversible hash, still never the UUID — and the agent warns.

Changing the local part later (a hash fallback replaced by a real account id) is
handled as a **re-issue**: the old email is removed and the new one added, and
the counter series restarts under the new name. "Is this client ours?" is
therefore decided by the email **domain**, never the local part — otherwise every
re-issue would reclassify a managed client as legacy and protect it forever.

The dry-run printout shows the email in full and only the first 8 characters of
each UUID, for the same reason.

### The legacy shared client is invisible to the xray API

Verified on xray 26.3.27: **a VLESS client with no `email` cannot be managed at
runtime at all.** `xray api inbounduser` does not list it, and `xray api adu`
reports `Added 0 user(s) in total.` for it — with no rpc error whatsoever. It
authenticates real traffic perfectly well; xray's user manager is simply keyed
by email, so an emailless entry has no handle.

The fleet's shared client has no email, and `../xray/apply-node-baseline.sh`
deliberately **refuses** to add one, because that would mean editing a REALITY
inbound. Consequences, all of them intended:

- The shared client reports **no per-user traffic** for its whole transition
  life. During rollout, new per-account users report traffic and the legacy user
  reports nothing. **Absence from stats is not evidence the user is gone** — the
  agent never diffs against stats, only against `inbounduser`, and it skips
  emailless clients in the live diff entirely rather than retrying an add that
  silently fails on every tick.
- **Revoking the shared UUID requires an xray restart.** There is no live path.
  Setting `TRANSITION_KEEP_SHARED_UUID=0` removes it from disk; it stays live
  until xray restarts. Plan that step as a restart, not as a hot revocation.

---

## The zero-proxy guarantee (WS6 acceptance criterion)

**With no proxies attached the config is byte-identical to one without this
feature.** Not "semantically equivalent" — the same bytes.

The mechanism is not careful re-serialisation, it is *not writing*: the agent
builds the candidate config in memory, compares it to the parsed original, and
when they are deep-equal **skips the write entirely**. Nothing reopens the file,
so mtime and sha256 are untouched. Verified in
`tests/test_node_sync.py::TestZeroProxies::test_zero_proxies_leaves_file_bytes_identical`
and end to end (a no-op `--apply` run leaves sha256 and mtime unchanged).

Rendering is also reversible: attaching proxies and then detaching them returns
the file to the exact pre-proxy bytes, because everything WS6 emits is confined
to the `doppler-exit-*` tag namespace and is stripped and rebuilt on every run.

---

## What is rendered for WS6

Per proxy, appended to `outbounds` (**never** prepended — `outbounds[0]` is
xray's default route, so a proxy in front would send *all* traffic through it):

```json
{ "tag": "doppler-exit-us1", "protocol": "socks",
  "settings": { "servers": [{ "address": "…", "port": 1080,
                              "users": [{ "user": "…", "pass": "…" }] }] },
  "streamSettings": { "sockopt": { "tcpKeepAliveIdle": 100 } } }
```

plus a top-level `observatory` (probes `doppler-exit-*` every 5m) and a
`routing.balancers` entry, and one rule per domain set pointing at the balancer.

**Where the rules are inserted: after the security blocks, before the catch-all.**
A naive prepend would put a domain rule *ahead of* `block-private` in
`../xray/node-baseline.json`, which is the only in-xray defence against DNS
rebinding (a name resolving into `169.254.0.0/16` or loopback). The agent skips
the leading run of rules routing to the api tag or to a **blackhole outbound**
— detected by outbound *protocol*, not tag name, since the baseline tags its
blackhole `block` while other configs use `blocked` — and inserts immediately
after it. On a baselined node the order comes out:

```
api-inbound → block-private → block-bittorrent → block-smtp → doppler-exit-flagged
```

> `node-baseline.json` sets `api.services` to `HandlerService, StatsService,
> LoggerService` — **no `RoutingService`**. WS4 only needs `HandlerService`, and
> the balancer and observatory work without it, so nothing here is blocked. But
> `xray api bi` (balancer health, the natural way to debug a proxy that is being
> skipped) needs `RoutingService`; add it if you want that tool.

**Priority and rotation are in tension — pick one.** A balancer that rotates
cannot also honour a strict priority order. `EXIT_BALANCER_STRATEGY` defaults to
`roundRobin` (rotates across the *healthy* set, which is what "IPs rotate and a
dead upstream is skipped" asks for); `leastPing` pins to the fastest instead.
`priority` from Supabase always determines emission order, which is the tiebreak
under `roundRobin` and the whole answer under a future strict-priority mode.

`fallbackTag` defaults to `direct`: if **every** proxy fails its probe, flagged
domains fall back to the node's own (flagged) exit — today's behaviour — rather
than black-holing ChatGPT because a proxy bill went unpaid.

> **Sniffing must be on** for domain rules to match (`destOverride: ["tls","http"]`).
> The fleet's inbounds have it; the agent does not add it, because that would be
> a non-surgical change to a REALITY inbound.

---

## Safety rules (all enforced in code, all tested)

Every write to a node's xray config:

1. **Timestamped backup first** → `/var/backups/doppler-node-sync/config.json.<utc>`
   (mode 600, microsecond-resolution names so two manual runs in one second
   cannot collide). The newest 20 are kept.
2. **`xray -test` gates the candidate.** The new config is written to a temp file
   in the same directory, tested, and only then `os.replace`d in. A rejected
   candidate never reaches the live path. `xray -test` is a real gate, not a JSON
   check — verified locally that it rejects e.g. a bogus balancer strategy.
3. **`log.access` must be `"none"` after the merge.** An *unset* key means
   stdout → journald → a browsing history on disk, which contradicts the App
   Store "Zero activity logs" claim (`../xray/RUNBOOK-add-node.md` §2a). With
   `ENFORCE_ACCESS_LOG_NONE=1` (default) the agent normalises it and says so
   loudly; the post-merge assertion is unconditional either way.
4. **The REALITY inbounds are compared before and after.** A "protected
   projection" covers every inbound's `tag`/`listen`/`port`/`protocol`/
   `streamSettings` (keys, shortIds, SNIs, dest) / `sniffing`, every
   non-`doppler-exit-*` outbound, and every non-managed routing rule in order.
   `settings.clients` is the **only** key the agent may change. Any other
   difference aborts before anything is written.
5. **Restore on failure.** The config is read back and re-asserted after the
   write; if that fails the backup is copied back.
6. Original file **mode and ownership are preserved**. The agent never tightens
   the config's permissions on its own — xray runs as a different user on some
   installs and a silent `chmod 600` would break it. Instead it **refuses** to
   write proxy credentials into a group/world-readable config unless
   `ALLOW_WORLD_READABLE_CONFIG=1`.

Credentials never reach a log line, an error message, the dry-run printout, or
git: every secret seen is registered and scrubbed from all output, and the
printed config passes through a redactor that also masks REALITY private keys.

### Disk first, then live — and why

The disk write happens **before** the live API calls. Disk is the durable
source, and the risky step (backup + `xray -test`) happens while a clean
rollback still exists. If the live step then fails, disk is already correct, so
the node converges at its next restart and the next timer tick retries. The
agent is a **reconciler**: every operation is idempotent and a missed run is
never lost corrective work.

The two steps diff independently — disk against the file, live against
`xray api inbounduser` — because the two can legitimately differ (someone
restarted xray mid-run; a previous run wrote disk and died).

---

## The xray API (verified against xray-core 26.3.27, not guessed)

**`xray api adduser` and `xray api rmuser` do not exist.** The real subcommands
are `adu` and `rmu`. Verified against the binary; `xray api adduser` returns
`unknown command`. They are pinned to the constants `XRAY_API_ADD` /
`XRAY_API_DEL` / `XRAY_API_LIST` in `node_sync.py` — if a future xray renames
them again, those three lines and `_TRAILER_RE` are the only call sites.

```
xray api adu  --server=127.0.0.1:10085 <fragment.json>      # add
xray api rmu  --server=127.0.0.1:10085 -tag=<tag> <email>…  # remove
xray api inbounduser --server=127.0.0.1:10085 -tag=<tag>    # read
```

Three findings that shaped the implementation:

- **`rmu` removes BY EMAIL, never by UUID.** That is why every managed client
  carries a deterministic email (`{account_id}@doppler`, above) — without one it
  could never be revoked. A client with no email cannot be revoked through the
  API at all; the agent detects that and reports that it needs a restart.
- **`adu` needs a full inbound stanza**: both `tag` *and* `port`, or the
  fragment fails to build. One file may carry all six inbounds, and the agent
  sends exactly one `adu` call per run.
- **All of these exit 0 even when they fail.** Adding a duplicate, removing an
  unknown email, and naming a nonexistent inbound tag each print an `rpc error`
  and still return status 0. The **only** trustworthy signal is the trailing
  `Added N user(s) in total.` / `Removed N user(s) in total.` line, which the
  agent parses and compares against what it asked for. Never trust `$?` here.

The whole live step is gated behind a ~250 ms TCP connect to the API port,
because a node **without** an `api` block does not fail fast — `xray api …`
burns ~3 s before erroring (measured on Hong Kong, `../monitoring/README.md`
"Agent v2"), which across six inbounds would be ~18 s of nothing. **No fleet
node has an `api` block yet**; until that lands, every run logs one warning,
updates disk, and exits 2.

---

## Config toggles

Env file `/etc/doppler-node-sync.env`, **mode 600**.

| Var | Default | Meaning |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | — | required |
| `SERVER_ID` | — | `vpn_servers.id`; required |
| `NODE_SYNC_TOKEN` | — | per-node secret the RPCs authenticate; required |
| `XRAY_CONFIG` | `/usr/local/etc/xray/config.json` | `/var/lib/marzban/xray_config.json` on Poland |
| `XRAY_API` | `127.0.0.1:10085` | HandlerService endpoint |
| `SYNC_USERS` | `1` | WS4 on/off. **Must be 0 on the Marzban node** |
| `SYNC_PROXIES` | `1` | WS6 on/off (a no-op with no proxies attached) |
| **`TRANSITION_KEEP_SHARED_UUID`** | **`1`** | **see below** |
| `SHARED_UUID` | auto | explicit legacy UUID, in addition to auto-detection |
| `EMAIL_DOMAIN` | `doppler` | right-hand side of the stats identity. **Changing it reclassifies every existing managed client as legacy** — don't, without a migration |
| `EXIT_BALANCER_STRATEGY` | `roundRobin` | `random`/`roundRobin`/`leastPing`/`leastLoad` |
| `EXIT_FALLBACK_TAG` | `direct` | where flagged traffic goes if every proxy is down |
| `OBSERVATORY_PROBE_URL` / `_INTERVAL` | gstatic 204 / `5m` | health probe |
| `ENFORCE_ACCESS_LOG_NONE` | `1` | normalise `log.access` to `"none"` |
| `ALLOW_WORLD_READABLE_CONFIG` | `0` | permit credentials into a non-600 config |
| `BACKUP_DIR`, `BACKUP_KEEP` | `/var/backups/doppler-node-sync`, `20` | |

### `TRANSITION_KEEP_SHARED_UUID` — the one that can black out the fleet

While this is `1`, every client the agent did **not** create stays authorised
alongside the Supabase set. "Did not create" is decided by **identity, not
position**: a managed client is exactly one whose email is `<its uuid>@doppler`.
Anything else — the legacy shared client, an ops laptop added by hand — is
protected.

"Managed" is decided by the email **domain** (`@doppler`), not by position and
not by the local part. The fleet's shared client has no email at all, so it can
never be mistaken for one; neither can a hand-added client with another address.

> An earlier revision identified the shared client as *"the first client of the
> first inbound"*. That is correct on run 1 and **wrong on run 2**: once the
> agent has written per-account clients, position 0 is a per-account UUID, the
> shared client stops looking special, and the next tick removes it — silently
> disconnecting every device still holding the cached shared config, with no
> client-side error that says why. The bug was caught by running the agent
> twice; there is now a regression test that reconciles four times in a row.

Turning it **off** revokes the shared UUID — **on disk only, at first**: an
emailless client cannot be removed through the API, so it stays live until xray
restarts. Treat that step as a scheduled restart, not a hot revocation. Every already-installed client holds
it in a cached config. Do it only when telemetry shows the old-config population
is effectively zero, and **do it on one node first**. With the flag off the
agent logs a loud warning naming how many legacy clients are about to go.

---

## Deploying

```bash
export SUPABASE_URL=… SUPABASE_ANON_KEY=… SUPABASE_SERVICE_ROLE_KEY=…
./deploy-node-sync.sh 20.46.122.212        # ONE node first, always
./deploy-node-sync.sh                      # then the fleet
```

Follows `../monitoring/deploy-stats-agent.sh` conventions: Supabase fleet
discovery with a hand-maintained fallback list, per-host SSH profiles
(`azureuser` + sudo on Azure, `root` on Netherlands and Poland), a failing host
does not abort the run, and **token reuse** — an existing `NODE_SYNC_TOKEN` on a
box is never rotated, because rotating it desyncs the database row and locks the
node out of its own RPCs. Prints `<ip> <token>` on stdout; everything else goes
to stderr.

It writes the env file **key by key and never overwrites an existing key**, so a
redeploy cannot clobber a hand-edited toggle. It always finishes with a **dry
run** so `--apply` never happens before a human has read the diff, then enables
the timer (`ENABLE_TIMER=0` to skip).

### Why this unit is not `DynamicUser`

`doppler-stats-agent.service` uses `DynamicUser=yes`, and that is why it scans
`/proc` instead of asking systemd anything. This unit **cannot** use it: it has
to rewrite root-owned `/usr/local/etc/xray/config.json`, and `ReadWritePaths`
only lifts systemd's read-only bind mount — it does not grant file ownership. A
transient UID fails on plain DAC. The alternatives are worse: chowning the xray
config to a dynamic group makes the **REALITY private keys** group-readable to
an unpredictable GID, and a StateDirectory + root-helper split adds a second
trust boundary to write one file.

So it runs as `User=root` with every still-applicable hardening directive kept
and the writable surface cut to exactly two paths. The reasoning is repeated in
a comment in the unit so nobody "fixes" it back.

**It never reloads or restarts xray.** Live changes go through the gRPC API
(which keeps connected users online); the disk write exists only so a reboot
does not deauthorise everyone. Nothing calls `systemctl`, so the D-Bus question
never arises at all.

### The Marzban node (Poland, 185.203.240.174)

Marzban owns its own user table and regenerates `xray_config.json` from it, so
WS4 there would fight the panel and lose. `deploy-node-sync.sh` forces
`SYNC_USERS=0` on that host. WS6 is safe. Its xray also runs inside Docker, so
the config path differs — the deploy script sets it.

---

## What a human must verify before first run

1. **The `api` block exists** in the node's config (`services` must include
   `HandlerService`) and something is listening on `127.0.0.1:10085`. This is
   what `../xray/apply-node-baseline.sh` installs, and as of 2026-09-08 it is
   applied to **zero** nodes — so WS4's live step is inert fleet-wide until that
   rollout happens. Until then every run exits 2 with a warning and only disk is
   updated.
   `xray api inbounduser --server=127.0.0.1:10085 -tag=<a real tag>` is the
   quickest check.
2. **The two RPCs exist and match the contract above.** Run the agent's dry run
   — it calls both for real and prints what came back.
3. **`SERVER_ID` is this node's actual `vpn_servers.id`.** A wrong id yields
   another node's user set. The deploy script resolves it by `ip_address`.
4. **`log.access` is `"none"`** already (`journalctl -u xray | grep -c " accepted "`
   must be 0). The agent will fix it, but a node that was logging has a
   pre-existing privacy problem worth knowing about.
5. **The config's mode**, if you are about to attach proxies. Credentials go
   into that file; the agent refuses a group/world-readable one rather than
   silently tightening it and possibly breaking xray's own read.
6. **`account_id` comes back from the RPC.** The dry run prints each client's
   email; if they read `acct-<hex>@doppler` instead of a real account id, the
   RPC is not returning `account_id` and per-user traffic will not be
   attributable. Fix that before the stats pipeline starts recording.
7. **Read the dry run.** Confirm the add/remove counts are what you expect,
   *especially* that the shared UUID appears as a kept legacy client and not in
   the remove list.

## Rolling back

- **A bad config:** every write leaves a timestamped backup.
  `cp /var/backups/doppler-node-sync/config.json.<stamp> /usr/local/etc/xray/config.json`
  then restart xray. Because the agent never restarts xray, a bad *disk* write
  is not even live until something else restarts it.
- **A bad user set:** stop the timer (`systemctl disable --now
  doppler-node-sync.timer`), fix Supabase, run `--apply` by hand. Live state
  re-converges without dropping connections.
- **Undo WS6 entirely:** detach the proxies in Supabase. The next run strips
  every `doppler-exit-*` object and returns the file to its pre-proxy bytes.
  `SYNC_PROXIES=0` does the same locally.
- **Undo everything:** `systemctl disable --now doppler-node-sync.timer`. The
  node keeps whatever config it has and nothing further changes.

## Failure modes

| Symptom | Cause | Effect |
|---|---|---|
| exit 1, "SERVER_ID / NODE_SYNC_TOKEN not set" | env file missing | nothing changed |
| exit 1, "rpc … failed: HTTP 4xx" | RPC missing, renamed, or token rejected | nothing changed |
| exit 1, "returned an EMPTY authorised user set" | broken RPC or a bad `p_server_id` | **nothing changed** — deliberate fail-closed |
| exit 1, "merge is not surgical" | config shape the agent will not touch | nothing changed |
| exit 1, "xray -test rejected the candidate" | bad render or a pre-existing config problem | original file intact |
| exit 2, "PRECONDITION NOT MET: … no `api` block" | node baseline stage 1 not applied | disk updated, live pending the baseline |
| exit 2, "PRECONDITION NOT MET: … does not include HandlerService" | baseline applied but misconfigured | disk updated, live skipped |
| exit 2, "PRECONDITION NOT MET: … nothing is listening" | xray down, or running an older config than the file | disk updated, live pending a restart |
| exit 2, "removed N of M users" | a stale live entry | next run retries |
| warning, "clients have no email" | a hand-added client | gone from disk, drops at next restart |

## Tests

```bash
python3 tests/test_node_sync.py
```

49 tests, stdlib `unittest`. `tests/fake-node-config.json` is a realistic
bare-xray node — six VLESS-REALITY inbounds on 8443–8448 with real x25519
keypairs and shortIds, the api inbound, sniffing, `log.access: "none"` — and is
itself validated by `xray -test`. Tests needing the xray binary **skip loudly**
when it is absent rather than silently passing.
