#!/usr/bin/env python3
"""Doppler node sync agent.

Reconciles ONE VPN node's live xray state with what Supabase says it should be.
Python 3 stdlib only, no pip dependencies -- same constraints and house style as
../monitoring/stats-agent.py.

Two responsibilities, independent and separately switchable:

  WS4  VLESS user reconciliation.  Every customer currently shares one VLESS
       UUID, so nobody can be counted or revoked. Per-account UUIDs are being
       introduced; this agent keeps each node's authorised client set in step
       with `accounts` by diffing Supabase against the node and applying the
       delta through xray's HandlerService gRPC API -- NOT by restarting xray,
       which would drop every connected user.

  WS6  Exit proxy rendering.  Renders one outbound per attached exit proxy plus
       a health-probed balancer, and prepends domain routing rules ahead of the
       catch-all, so flagged domains leave through a clean IP and a dead
       upstream is skipped automatically.

DRY RUN IS THE DEFAULT. Without --apply this prints the diff and the rendered
config and changes nothing, so a careless invocation is harmless.

Safety contract for every write to the node's xray config (see README.md):
  1. timestamped backup first,
  2. `xray -test` must pass on the candidate before it is installed,
  3. `log.access` must be "none" after the merge (privacy commitment -- an
     UNSET key means stdout, not off; see xray/RUNBOOK-add-node.md section 2a),
  4. the six REALITY inbounds' keys/shortIds/SNIs/ports must be bit-identical
     before and after,
  5. any failure restores the backup.
A merge that cannot be done surgically aborts rather than rewriting.

Exit codes:  0 = converged   1 = aborted, nothing changed   2 = disk converged
but the live xray API step failed or was unreachable (next run retries).
"""
import argparse
import copy
import hashlib
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

AGENT_VERSION = 1

# --------------------------------------------------------------------------
# Configuration (env file /etc/doppler-node-sync.env, mode 600)
# --------------------------------------------------------------------------

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
# Per-node shared secret. The RPCs authenticate the CALLER with this, so a node
# never holds the service-role key -- a stolen node env file can then only read
# that one node's own user list, not the whole database.
NODE_TOKEN = os.environ.get("NODE_SYNC_TOKEN", "")
SERVER_ID = os.environ.get("SERVER_ID", "")

XRAY_CONFIG = os.environ.get("XRAY_CONFIG", "/usr/local/etc/xray/config.json")
XRAY_API = os.environ.get("XRAY_API", "127.0.0.1:10085")
XRAY_BIN = os.environ.get("XRAY_BIN", "xray")
BACKUP_DIR = os.environ.get("BACKUP_DIR", "/var/backups/doppler-node-sync")
BACKUP_KEEP = int(os.environ.get("BACKUP_KEEP", "20"))

# Which halves to run. Set SYNC_USERS=0 on the Marzban node (Poland): Marzban
# owns its own user table and regenerates xray_config.json from it, so user
# reconciliation there would fight the panel and lose. WS6 is safe on Marzban.
SYNC_USERS = os.environ.get("SYNC_USERS", "1") == "1"
SYNC_PROXIES = os.environ.get("SYNC_PROXIES", "1") == "1"

# >>> TRANSITION FLAG -- READ BEFORE CHANGING <<<
# While this is 1 the legacy shared VLESS UUID stays authorised on every
# inbound alongside the new per-account UUIDs. Every already-installed client
# out there holds that shared UUID in a cached config; clearing this flag
# BEFORE those clients have all fetched a per-account config disconnects the
# entire customer base at once, with no client-side error message that says
# why. Turn it off only when telemetry shows the old-config population is
# effectively zero, and turn it off on ONE node first.
TRANSITION_KEEP_SHARED_UUID = os.environ.get("TRANSITION_KEEP_SHARED_UUID", "1") == "1"
SHARED_UUID = os.environ.get("SHARED_UUID", "")

# Tag namespace this agent owns. Anything with these prefixes is considered
# ours and is rebuilt from Supabase on every run; anything else is never
# touched. Renaming these strands the previously-rendered objects on the node.
MANAGED_PREFIX = "doppler-exit-"
BALANCER_TAG = "doppler-exit-balancer"
OBSERVATORY_PROBE_URL = os.environ.get("OBSERVATORY_PROBE_URL", "https://www.gstatic.com/generate_204")
OBSERVATORY_PROBE_INTERVAL = os.environ.get("OBSERVATORY_PROBE_INTERVAL", "5m")
# roundRobin rotates across the healthy set; leastPing pins to the fastest.
# Verified accepted by xray 26.3.27: random, roundRobin, leastPing, leastLoad.
EXIT_BALANCER_STRATEGY = os.environ.get("EXIT_BALANCER_STRATEGY", "roundRobin")
# Where flagged-domain traffic goes when every exit proxy fails its probe.
# "direct" degrades to the node's own (flagged) IP, which is what happens today
# anyway; "blocked" would hard-fail ChatGPT instead.
EXIT_FALLBACK_TAG = os.environ.get("EXIT_FALLBACK_TAG", "direct")

# An unset log.access means stdout->journald, i.e. a browsing history on disk.
# With this on, the agent normalises it to "none" as part of the merge and says
# so loudly. The post-merge assertion is unconditional either way.
ENFORCE_ACCESS_LOG_NONE = os.environ.get("ENFORCE_ACCESS_LOG_NONE", "1") == "1"
# Refuse to write proxy credentials into a world-readable config. See README
# "What a human must verify before first run" -- xray must still be able to
# read the file, so the agent never changes its mode on its own.
ALLOW_WORLD_READABLE_CONFIG = os.environ.get("ALLOW_WORLD_READABLE_CONFIG", "0") == "1"

HTTP_TIMEOUT = float(os.environ.get("HTTP_TIMEOUT_S", "10"))
# A node whose config has no `api` block does not fail fast: `xray api ...`
# spends ~3 s before erroring (measured on Hong Kong, see ../monitoring/README
# "Agent v2"). Six inbounds would be ~18 s of nothing. Gate the whole live step
# behind one cheap TCP connect instead.
XRAY_API_CONNECT_TIMEOUT = float(os.environ.get("XRAY_API_CONNECT_TIMEOUT_S", "0.25"))

# --------------------------------------------------------------------------
# xray CLI surface -- VERIFIED against xray-core 26.3.27, not guessed
# --------------------------------------------------------------------------
# `xray api adduser` / `rmuser` DO NOT EXIST. The real subcommands are `adu`
# and `rmu`. If a future xray renames them again, these four constants and
# _TRAILER_RE below are the only call sites that need editing.
#
#   xray api adu [--server=127.0.0.1:10085] <c1.json> [c2.json]...
#       c1.json is a full xray config fragment; each inbound needs BOTH `tag`
#       AND `port` or the fragment fails to build ("Listen on AnyIP but no
#       Port(s) set in InboundDetour"). One file may carry every inbound.
#   xray api rmu [--server=...] -tag=<inbound tag> <email1> [email2]...
#       Removal is BY EMAIL, never by UUID. This is why every managed client
#       gets the deterministic email f"{uuid}@{EMAIL_DOMAIN}" -- a client
#       without an email cannot be revoked through the API at all.
#   xray api inbounduser [--server=...] -tag=<tag>   -> {"users":[...]} JSON
#
# !! These commands EXIT 0 EVEN WHEN THEY FAIL. Verified on 26.3.27: adding a
# duplicate, removing an unknown email and naming a nonexistent inbound tag all
# print an rpc error and still exit 0. The ONLY trustworthy signal is the
# trailing "Added N user(s) in total." / "Removed N user(s) in total." line.
XRAY_API_ADD = "adu"
XRAY_API_DEL = "rmu"
XRAY_API_LIST = "inbounduser"

# --------------------------------------------------------------------------
# The `email` field is an IDENTITY DECISION, not a formality. Read this.
# --------------------------------------------------------------------------
# xray keys its per-user traffic counters as
#     user>>>{email}>>>traffic>>>{uplink,downlink}
# so this string is the ONLY identifier that ever appears in stats output, in
# `xray api statsquery`, in ../monitoring/stats-agent.py's parsed output, and in
# whatever the admin panel eventually charts. It lands on an exit node, in
# journald, and in a monitoring pipeline.
#
# Therefore the local part is the ACCOUNT ID:      {account_id}@doppler
#   * it maps back to an account, so stats are attributable;
#   * it is not personally identifying -- never a real email address;
#   * it is NOT the VLESS UUID. The UUID is a live credential: anyone who reads
#     it can connect as that customer. Putting it in a stat name would publish
#     the whole customer keyset into monitoring. An earlier revision of this
#     agent used `{uuid}@doppler` and was wrong for exactly that reason.
#
# When the RPC omits an account id, the fallback is a NON-REVERSIBLE truncated
# SHA-256 of the UUID -- still never the UUID itself -- and the agent warns.
EMAIL_DOMAIN = os.environ.get("EMAIL_DOMAIN", "doppler")
_EMAIL_LOCAL_SAFE = re.compile(r"[^A-Za-z0-9._-]")
_TRAILER_RE = re.compile(r"(?:Added|Removed)\s+(\d+)\s+user\(s\) in total")

# --------------------------------------------------------------------------
# Logging, with unconditional secret scrubbing
# --------------------------------------------------------------------------

_SECRETS = set()


def remember_secret(value):
    """Register a credential so it can never reach a log line or a traceback."""
    if value and isinstance(value, str) and len(value) >= 3:
        _SECRETS.add(value)


def scrub(text):
    out = str(text)
    for s in _SECRETS:
        out = out.replace(s, "***")
    return out


def log(level, msg):
    ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
    print(f"{ts} {level} {scrub(msg)}", file=sys.stderr, flush=True)


def info(m):
    log("INFO", m)


def warn(m):
    log("WARN", m)


def error(m):
    log("ERROR", m)


class Abort(Exception):
    """Raised for any condition that must stop the run without changing state."""


def run_ok(cmd, timeout=15, stdin_data=None):
    """(ran_and_exited_0, stdout, stderr). Same shape as stats-agent.run_ok."""
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, input=stdin_data)
        return p.returncode == 0, p.stdout, p.stderr
    except Exception as e:
        return False, "", f"{type(e).__name__}: {e}"


# --------------------------------------------------------------------------
# SUPABASE CONTRACT -- thin client layer, deliberately isolated
# --------------------------------------------------------------------------
# The two RPCs are being written concurrently by another agent, so this layer
# is written to be reconciled in one place rather than threaded through the
# service. See README.md "Supabase RPC contract" for the exact shapes assumed.
# Both parsers are intentionally TOLERANT of several plausible response shapes
# so a naming mismatch in the migration costs a README edit, not an outage.
# --------------------------------------------------------------------------

RPC_AUTHORIZED_USERS = os.environ.get("RPC_AUTHORIZED_USERS", "node_authorized_users")
RPC_EXIT_PROXIES = os.environ.get("RPC_EXIT_PROXIES", "node_exit_proxies")

_UUID_RE = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")


def rpc(name, args):
    """POST {SUPABASE_URL}/rest/v1/rpc/{name}. Raises Abort on any failure."""
    if not (SUPABASE_URL and SUPABASE_KEY):
        raise Abort("SUPABASE_URL / SUPABASE_ANON_KEY not set")
    url = f"{SUPABASE_URL}/rest/v1/rpc/{name}"
    body = json.dumps(args).encode()
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
            return json.loads(resp.read().decode() or "null")
    except urllib.error.HTTPError as e:
        detail = ""
        try:
            detail = e.read().decode()[:300]
        except Exception:
            pass
        raise Abort(f"rpc {name} failed: HTTP {e.code} {scrub(detail)}")
    except Exception as e:
        raise Abort(f"rpc {name} failed: {type(e).__name__}")


def _unwrap(payload, *keys):
    """PostgREST hands back a bare value, a 1-row list, or {key: value}.

    A wrapper is unwrapped ONLY when one of `keys` is actually present. An
    earlier version unwrapped any single-element list of dicts first, which
    turned the perfectly ordinary one-authorised-user response
    `[{"vless_uuid": ...}]` into a bare dict and then aborted the run.
    """
    if isinstance(payload, dict):
        for k in keys:
            if k in payload:
                return payload[k]
        return payload
    if isinstance(payload, list) and len(payload) == 1 and isinstance(payload[0], dict):
        for k in keys:
            if k in payload[0]:
                return payload[0][k]
    return payload


def parse_authorized_users(payload):
    """-> ordered, de-duplicated list of {"uuid": ..., "account_id": ... | None}.

    `account_id` becomes the stats identity (see the EMAIL_DOMAIN block); the
    UUID is the credential and never appears in a stat name.

    Accepts: ["uuid", ...] | [{"vless_uuid"|"uuid"|"id": ...,
                               "account_id"|"account"|"acct": ...}, ...]
             | {"users"|"uuids": <either of the above>}
    """
    rows = _unwrap(payload, "users", "uuids", "authorized_uuids")
    if rows is None:
        rows = []
    if not isinstance(rows, list):
        raise Abort(f"{RPC_AUTHORIZED_USERS}: expected a list, got {type(rows).__name__}")
    out, seen, without_account = [], set(), 0
    for row in rows:
        if isinstance(row, str):
            val, acct = row, None
        elif isinstance(row, dict):
            val = row.get("vless_uuid") or row.get("uuid") or row.get("id") or ""
            acct = row.get("account_id") or row.get("account") or row.get("acct")
        else:
            raise Abort(f"{RPC_AUTHORIZED_USERS}: unexpected row type {type(row).__name__}")
        val = str(val).strip().lower()
        if not _UUID_RE.match(val):
            # Never log the value itself -- it is a live credential.
            raise Abort(f"{RPC_AUTHORIZED_USERS}: returned a row that is not a UUID")
        if val in seen:
            continue
        seen.add(val)
        if not acct:
            without_account += 1
        out.append({"uuid": val, "account_id": str(acct).strip() if acct else None})
    if without_account:
        warn(f"{RPC_AUTHORIZED_USERS}: {without_account} of {len(out)} row(s) carry no "
             "account_id. Falling back to a hashed identity, so per-user traffic stats "
             "will not be attributable to an account. Add account_id to the RPC.")
    return out


def parse_exit_proxies(payload):
    """-> (proxies, domain_sets).

    proxies: [{tag, protocol, address, port, user, password}] in priority order.
    domain_sets: [{name, domains:[...]}] in the order the rules should appear.
    Accepts a bare list of proxies (no domain sets) or the full object.
    """
    data = payload
    # A plpgsql function that RETURNS NULL, or an empty PostgREST result, is the
    # ordinary "this server has no proxies attached" answer -- which is the
    # entire fleet today. It must mean zero proxies, never an error.
    if data is None or data == [] or data == {}:
        return [], []
    if isinstance(data, list) and len(data) == 1 and isinstance(data[0], dict) and "proxies" in data[0]:
        data = data[0]
    if isinstance(data, list):
        data = {"proxies": data, "domain_sets": []}
    if not isinstance(data, dict):
        raise Abort(f"{RPC_EXIT_PROXIES}: unexpected payload {type(data).__name__}")

    raw = data.get("proxies") or data.get("exit_proxies") or []
    if not isinstance(raw, list):
        raise Abort(f"{RPC_EXIT_PROXIES}: 'proxies' is not a list")

    def prio(p):
        v = p.get("priority")
        return v if isinstance(v, int) else 10_000

    proxies = []
    for i, p in enumerate(sorted(raw, key=prio)):
        if not isinstance(p, dict):
            raise Abort(f"{RPC_EXIT_PROXIES}: proxy row {i} is not an object")
        proto = (p.get("protocol") or "socks").lower()
        if proto not in ("socks", "http"):
            raise Abort(f"{RPC_EXIT_PROXIES}: proxy row {i} has unsupported protocol {proto!r}")
        addr = str(p.get("address") or p.get("host") or "").strip()
        try:
            port = int(p.get("port"))
        except (TypeError, ValueError):
            raise Abort(f"{RPC_EXIT_PROXIES}: proxy row {i} has a non-integer port")
        if not addr or not (0 < port < 65536):
            raise Abort(f"{RPC_EXIT_PROXIES}: proxy row {i} has no usable address/port")
        user = p.get("username") or p.get("user") or ""
        pw = p.get("password") or p.get("pass") or ""
        remember_secret(pw)
        remember_secret(user)
        tag = str(p.get("tag") or "").strip() or f"{MANAGED_PREFIX}{i + 1}"
        if not tag.startswith(MANAGED_PREFIX):
            tag = f"{MANAGED_PREFIX}{tag}"
        proxies.append({"tag": tag, "protocol": proto, "address": addr,
                        "port": port, "user": str(user), "password": str(pw)})

    tags = [p["tag"] for p in proxies]
    if len(set(tags)) != len(tags):
        raise Abort(f"{RPC_EXIT_PROXIES}: duplicate proxy tags")

    sets_raw = data.get("domain_sets") or data.get("domains") or []
    if isinstance(sets_raw, list) and sets_raw and isinstance(sets_raw[0], str):
        sets_raw = [{"name": "flagged", "domains": sets_raw}]
    domain_sets = []
    for i, s in enumerate(sets_raw or []):
        if not isinstance(s, dict):
            raise Abort(f"{RPC_EXIT_PROXIES}: domain set {i} is not an object")
        doms = [str(d) for d in (s.get("domains") or []) if str(d).strip()]
        if not doms:
            continue
        name = re.sub(r"[^a-z0-9-]", "-", str(s.get("name") or f"set{i + 1}").lower())
        domain_sets.append({"name": name, "domains": doms})
    return proxies, domain_sets


def fetch_authorized_users():
    args = {"p_server_id": SERVER_ID, "p_node_token": NODE_TOKEN}
    return parse_authorized_users(rpc(RPC_AUTHORIZED_USERS, args))


def fetch_exit_proxies():
    args = {"p_server_id": SERVER_ID, "p_node_token": NODE_TOKEN}
    return parse_exit_proxies(rpc(RPC_EXIT_PROXIES, args))


# --------------------------------------------------------------------------
# Config load / inspect
# --------------------------------------------------------------------------


def user_email(u):
    """Stats identity for one authorised user. See the EMAIL_DOMAIN block."""
    local = str(u.get("account_id") or "").strip()
    if not local:
        # Never the UUID itself: it is a credential and this string reaches
        # stats, journald and the admin panel.
        local = "acct-" + hashlib.sha256(u["uuid"].encode()).hexdigest()[:16]
    return f"{_EMAIL_LOCAL_SAFE.sub('-', local)}@{EMAIL_DOMAIN}"


def load_config(path):
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    try:
        cfg = json.loads(raw)
    except ValueError as e:
        raise Abort(f"{path} is not valid JSON: {e}")
    if not isinstance(cfg, dict):
        raise Abort(f"{path} is not a JSON object")
    return raw, cfg


def vless_inbounds(cfg):
    """The REALITY client-bearing inbounds, in config order.

    Selected by protocol+reality rather than by port so a node with a dest swap
    or an extra inbound is still handled. The api/dokodemo inbound has no
    clients and is skipped.
    """
    out = []
    for ib in cfg.get("inbounds", []):
        if not isinstance(ib, dict):
            continue
        if ib.get("protocol") != "vless":
            continue
        ss = ib.get("streamSettings") or {}
        if ss.get("security") != "reality":
            continue
        if not ib.get("tag"):
            raise Abort("a REALITY inbound has no tag; the xray API cannot address it")
        out.append(ib)
    return out


def access_log_value(cfg):
    return (cfg.get("log") or {}).get("access", "<unset>")


def enforce_access_log(cfg):
    """Normalise log.access to "none". See RUNBOOK-add-node.md section 2a."""
    cur = access_log_value(cfg)
    if cur == "none":
        return False
    if not ENFORCE_ACCESS_LOG_NONE:
        raise Abort(
            f"log.access is {cur!r}, not \"none\" (an unset key means stdout, not off). "
            "Refusing to touch this node's config while it is logging a browsing "
            "history. Fix it per xray/RUNBOOK-add-node.md 2a, or set "
            "ENFORCE_ACCESS_LOG_NONE=1 to have this agent set it."
        )
    warn(f"log.access was {cur!r}; normalising to \"none\" (privacy commitment)")
    cfg.setdefault("log", {})["access"] = "none"
    return True


def assert_access_log_none(cfg):
    val = access_log_value(cfg)
    if val != "none":
        raise Abort(f"post-merge assertion failed: log.access is {val!r}, expected \"none\"")


def protected_projection(cfg):
    """Everything this agent promises never to change.

    Compared before and after the merge; any difference aborts the run. Covers
    the REALITY keys/shortIds/SNIs/ports/dest, every non-managed outbound, and
    every non-managed routing rule in order.
    """
    proj = {k: v for k, v in cfg.items()
            if k not in ("inbounds", "outbounds", "routing", "observatory", "log")}
    ibs = []
    for ib in cfg.get("inbounds", []):
        settings = ib.get("settings") if isinstance(ib.get("settings"), dict) else {}
        ibs.append({
            "tag": ib.get("tag"),
            "listen": ib.get("listen"),
            "port": ib.get("port"),
            "protocol": ib.get("protocol"),
            "streamSettings": ib.get("streamSettings"),
            "sniffing": ib.get("sniffing"),
            # clients is the ONLY key this agent may edit
            "settings_minus_clients": {k: v for k, v in settings.items() if k != "clients"},
        })
    proj["inbounds"] = ibs
    proj["outbounds"] = [o for o in cfg.get("outbounds", [])
                         if not str(o.get("tag", "")).startswith(MANAGED_PREFIX)]
    routing = cfg.get("routing") or {}
    proj["routing_rules"] = [r for r in (routing.get("rules") or [])
                             if not str(r.get("ruleTag", "")).startswith(MANAGED_PREFIX)]
    proj["routing_other"] = {k: v for k, v in routing.items() if k not in ("rules", "balancers")}
    proj["routing_balancers"] = [b for b in (routing.get("balancers") or [])
                                 if not str(b.get("tag", "")).startswith(MANAGED_PREFIX)]
    proj["log"] = {k: v for k, v in (cfg.get("log") or {}).items() if k != "access"}
    return proj


def assert_protected_unchanged(before, after):
    a, b = protected_projection(before), protected_projection(after)
    if a != b:
        for key in sorted(set(a) | set(b)):
            if a.get(key) != b.get(key):
                raise Abort(
                    f"merge is not surgical: protected section {key!r} changed. "
                    "Aborting rather than rewriting the config."
                )
        raise Abort("merge is not surgical: protected projection changed")


# --------------------------------------------------------------------------
# WS4 -- user set merge
# --------------------------------------------------------------------------


def client_uuid(c):
    return str(c.get("id", "")).strip().lower()


def is_managed_client(c):
    """True for a client THIS agent created.

    Keyed on the email DOMAIN, deliberately not on the local part: the local
    part is an account id that can legitimately change (a hash fallback being
    replaced by a real account id, say), and if identity depended on its exact
    format then every such change would reclassify a managed client as legacy
    and protect it forever.

    The fleet's legacy shared client has NO email at all -- ../xray's applier
    refuses to add one, because that would mean editing a REALITY inbound --
    so it can never be mistaken for a managed client. Neither can a
    hand-added client with some other address.
    """
    return str(c.get("email", "")).endswith("@" + EMAIL_DOMAIN)


def legacy_uuids(inbounds):
    """UUIDs on the node that this agent did not create, in config order.

    This replaces an earlier heuristic ("the first client of the first inbound
    is the shared UUID") that was WRONG on the second run: once the agent had
    written per-account clients, position 0 was a per-account UUID, the shared
    one no longer looked special, and the next tick would have removed it --
    silently disconnecting every device still holding the cached shared config.
    Identity, not position.
    """
    out = []
    for ib in inbounds:
        for c in (ib.get("settings") or {}).get("clients") or []:
            u = client_uuid(c)
            if u and not is_managed_client(c) and u not in out:
                out.append(u)
    return out


def dedup_users(users):
    """De-duplicate on uuid, first occurrence wins, order preserved."""
    out, seen = [], set()
    for u in users:
        if u["uuid"] not in seen:
            seen.add(u["uuid"])
            out.append(u)
    return out


def plan_users(cfg, desired_users):
    """Diff the desired set against the on-disk client list of each inbound.

    Returns {inbound_tag: {"add": [(uuid, email)],
                           "remove": [(uuid, email_or_None)],
                           "reissue": [(uuid, old_email, new_email)]}}
    """
    desired = dedup_users(desired_users)
    desired_set = {u["uuid"] for u in desired}
    plan = {}
    for ib in vless_inbounds(cfg):
        settings = ib.setdefault("settings", {})
        clients = settings.get("clients")
        if clients is None:
            clients = []
        if not isinstance(clients, list):
            raise Abort(f"inbound {ib.get('tag')!r}: settings.clients is not a list")
        present = {}
        for c in clients:
            if not isinstance(c, dict):
                raise Abort(f"inbound {ib.get('tag')!r}: a client entry is not an object")
            u = client_uuid(c)
            if u:
                present[u] = c
        add, reissue = [], []
        for u in desired:
            c = present.get(u["uuid"])
            if c is None:
                add.append((u["uuid"], user_email(u)))
            elif is_managed_client(c) and c.get("email") != user_email(u):
                reissue.append((u["uuid"], c.get("email"), user_email(u)))
        remove = [(u, present[u].get("email")) for u in present if u not in desired_set]
        plan[ib["tag"]] = {"add": add, "remove": remove, "reissue": reissue}
    return plan


def merge_users(cfg, desired_users):
    """Apply the desired user set to the parsed config, in place.

    Rewrites ONLY settings.clients. A surviving client object is preserved
    byte-for-byte (so any per-client field a panel added survives); new ones
    inherit `flow`/`level` from an existing client.

    A LEGACY client (no managed email) is never given one. The fleet's shared
    entry stays emailless for its whole transition life -- ../xray's applier
    refuses to add one because that means editing a REALITY inbound -- so it
    reports no per-user traffic. That is expected, not a fault.
    """
    desired = dedup_users(desired_users)
    for ib in vless_inbounds(cfg):
        settings = ib.setdefault("settings", {})
        clients = settings.get("clients") or []
        present = {client_uuid(c): c for c in clients if client_uuid(c)}
        template = clients[0] if clients else {}
        new_clients = []
        for u in desired:
            c = present.get(u["uuid"])
            want = user_email(u)
            if c is None:
                c = {"id": u["uuid"], "email": want}
                if "flow" in template:
                    c["flow"] = template["flow"]
                if "level" in template:
                    c["level"] = template["level"]
            elif is_managed_client(c) and c.get("email") != want:
                # The account id changed (typically a hash fallback being
                # replaced by a real one). Re-issue the stats identity; the
                # counter series restarts under the new name.
                c = dict(c)
                c["email"] = want
            new_clients.append(c)
        # Anything not in `desired` is simply absent from new_clients. Callers
        # must have folded the legacy clients into `desired` if the transition
        # flag is on -- this function has no opinion about it.
        settings["clients"] = new_clients
    return cfg


# --------------------------------------------------------------------------
# WS6 -- exit proxy rendering
# --------------------------------------------------------------------------


def strip_managed(cfg):
    """Remove every object this agent owns. Idempotent.

    The zero-proxy acceptance criterion rests on this: strip_managed of a
    config that has never had proxies is a no-op, so render(strip(cfg), []) is
    deep-equal to cfg and the writer then skips the write entirely.
    """
    obs = cfg.get("observatory")
    if isinstance(obs, dict) and any(
        str(s).startswith(MANAGED_PREFIX) for s in (obs.get("subjectSelector") or [])
    ):
        cfg.pop("observatory", None)

    if "outbounds" in cfg:
        kept = [o for o in cfg["outbounds"] if not str(o.get("tag", "")).startswith(MANAGED_PREFIX)]
        if kept != cfg["outbounds"]:
            cfg["outbounds"] = kept

    routing = cfg.get("routing")
    if isinstance(routing, dict):
        if "rules" in routing:
            kept = [r for r in routing["rules"]
                    if not str(r.get("ruleTag", "")).startswith(MANAGED_PREFIX)]
            if kept != routing["rules"]:
                routing["rules"] = kept
        if "balancers" in routing:
            kept = [b for b in routing["balancers"]
                    if not str(b.get("tag", "")).startswith(MANAGED_PREFIX)]
            if not kept:
                routing.pop("balancers")
            elif kept != routing["balancers"]:
                routing["balancers"] = kept
    return cfg


def render_proxies(cfg, proxies, domain_sets):
    """Render outbounds + balancer + observatory + routing rules, in place.

    With `proxies` empty this is exactly strip_managed() and nothing else --
    that is the "byte-identical with zero proxies" acceptance criterion.
    """
    strip_managed(cfg)
    if not proxies:
        return cfg

    outbounds = []
    for p in proxies:
        server = {"address": p["address"], "port": p["port"]}
        if p["protocol"] == "socks":
            if p["user"] or p["password"]:
                server["users"] = [{"user": p["user"], "pass": p["password"]}]
            settings = {"servers": [server]}
        else:  # http
            if p["user"] or p["password"]:
                server["users"] = [{"user": p["user"], "pass": p["password"]}]
            settings = {"servers": [server]}
        outbounds.append({
            "tag": p["tag"],
            "protocol": p["protocol"],
            "settings": settings,
            "streamSettings": {"sockopt": {"tcpKeepAliveIdle": 100}},
        })
    # Appended, never prepended: xray uses outbounds[0] as the default route,
    # so putting an exit proxy first would send ALL traffic through it.
    cfg.setdefault("outbounds", []).extend(outbounds)

    cfg["observatory"] = {
        "subjectSelector": [MANAGED_PREFIX],
        "probeURL": OBSERVATORY_PROBE_URL,
        "probeInterval": OBSERVATORY_PROBE_INTERVAL,
        "enableConcurrency": True,
    }

    routing = cfg.setdefault("routing", {})
    balancer = {
        "tag": BALANCER_TAG,
        "selector": [MANAGED_PREFIX],
        "strategy": {"type": EXIT_BALANCER_STRATEGY},
    }
    if EXIT_FALLBACK_TAG:
        # Every probe failing degrades to the node's own exit instead of a
        # black hole. Without this, one bad proxy bill takes ChatGPT down.
        balancer["fallbackTag"] = EXIT_FALLBACK_TAG
    routing.setdefault("balancers", []).append(balancer)

    new_rules = [{
        "type": "field",
        "ruleTag": f"{MANAGED_PREFIX}{s['name']}",
        "domain": s["domains"],
        "balancerTag": BALANCER_TAG,
    } for s in domain_sets]
    rules = list(routing.get("rules") or [])
    at = protective_prefix_len(cfg, rules)
    routing["rules"] = rules[:at] + new_rules + rules[at:]
    return cfg


def protective_prefix_len(cfg, rules):
    """Where managed rules go: after the security blocks, before the catch-all.

    A naive prepend would put a domain rule AHEAD of ../xray/node-baseline.json's
    `block-private` rule, which is the only in-xray defence against DNS
    rebinding (a name that resolves into 169.254.0.0/16 or loopback). Losing
    that for the flagged-domain list would be a real regression, and the xray
    README explicitly warns that rule order matters when both fragments are
    applied.

    So: skip the leading run of rules that route to the api tag or to a
    blackhole outbound, and insert immediately after it. Detection is by
    OUTBOUND PROTOCOL, not by tag name -- node-baseline.json tags its blackhole
    `block` while other configs use `blocked`.
    """
    protective = {o.get("tag") for o in (cfg.get("outbounds") or [])
                  if o.get("protocol") == "blackhole" and o.get("tag")}
    api_tag = (cfg.get("api") or {}).get("tag")
    if api_tag:
        protective.add(api_tag)
    i = 0
    while i < len(rules) and rules[i].get("outboundTag") in protective:
        i += 1
    return i


def redact(obj):
    """Deep copy with every credential replaced. Used for ALL printed output."""
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            if k in ("pass", "password", "user", "username", "privateKey", "secret"):
                out[k] = "***" if v else v
            else:
                out[k] = redact(v)
        return out
    if isinstance(obj, list):
        return [redact(v) for v in obj]
    return obj


# --------------------------------------------------------------------------
# Disk write -- backup, xray -test gate, restore on failure
# --------------------------------------------------------------------------


def xray_test(path):
    ok, out, err = run_ok([XRAY_BIN, "-test", "-config", path], timeout=30)
    return ok, (out + err)


def prune_backups():
    try:
        names = sorted(n for n in os.listdir(BACKUP_DIR) if n.startswith("config.json."))
    except OSError:
        return
    for n in names[:-BACKUP_KEEP] if len(names) > BACKUP_KEEP else []:
        try:
            os.unlink(os.path.join(BACKUP_DIR, n))
        except OSError:
            pass


def write_config(path, new_cfg, has_credentials):
    """Backup -> write temp -> xray -test -> atomic replace -> verify.

    Restores the backup on any failure and re-raises. Preserves the original
    file's mode and ownership: xray may run as a non-root user on some nodes,
    and silently tightening the mode would break it.
    """
    st = os.stat(path)
    if has_credentials and (st.st_mode & 0o077) and not ALLOW_WORLD_READABLE_CONFIG:
        raise Abort(
            f"{path} is mode {oct(st.st_mode & 0o777)} and this run would write proxy "
            "credentials into it. Tighten it to 600 (and confirm xray can still read "
            "it), or set ALLOW_WORLD_READABLE_CONFIG=1 to accept the exposure."
        )

    os.makedirs(BACKUP_DIR, exist_ok=True)
    # Microseconds, not seconds: two manual runs in the same second must not
    # collide and silently overwrite the only copy of the previous config.
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S.%fZ")
    backup = os.path.join(BACKUP_DIR, f"config.json.{stamp}")
    shutil.copy2(path, backup)
    os.chmod(backup, 0o600)
    info(f"backed up {path} -> {backup}")

    body = json.dumps(new_cfg, indent=2, ensure_ascii=False) + "\n"
    tmp_dir = os.path.dirname(os.path.abspath(path))
    fd, tmp = tempfile.mkstemp(dir=tmp_dir, prefix=".node-sync.", suffix=".json")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(body)
        os.chmod(tmp, st.st_mode & 0o777)
        try:
            os.chown(tmp, st.st_uid, st.st_gid)
        except (OSError, AttributeError):
            pass  # not root, or a filesystem without ownership

        ok, out = xray_test(tmp)
        if not ok:
            raise Abort(f"xray -test rejected the candidate config; not installing.\n{scrub(out)}")
        info("xray -test passed on the candidate config")

        os.replace(tmp, path)
        tmp = None
    except BaseException:
        if tmp and os.path.exists(tmp):
            os.unlink(tmp)
        raise
    finally:
        pass

    # Read back and re-assert. A truncated write that still parses is the
    # failure mode this catches.
    try:
        _, back = load_config(path)
        assert_access_log_none(back)
        if back != new_cfg:
            raise Abort("config read-back does not match what was written")
    except BaseException as e:
        error(f"post-write verification failed ({scrub(e)}); restoring backup")
        shutil.copy2(backup, path)
        os.chmod(path, st.st_mode & 0o777)
        raise
    prune_backups()
    return backup


# --------------------------------------------------------------------------
# Live apply -- xray HandlerService via the CLI
# --------------------------------------------------------------------------


def api_reachable():
    """~250 ms TCP connect to the xray API port.

    No fleet node carries an `api` block yet (another workstream is adding it),
    so this is the common path today, not an edge case.
    """
    host, _, port = XRAY_API.rpartition(":")
    try:
        with socket.create_connection((host or "127.0.0.1", int(port)),
                                      timeout=XRAY_API_CONNECT_TIMEOUT):
            return True
    except Exception:
        return False


def api_precondition(cfg):
    """(ok, human-readable reason). Checked BEFORE any gRPC call is attempted.

    WS4's live path depends on stage one of ../xray/node-baseline.json having
    been applied and verified on this node -- that is what adds the `api` block
    and the dokodemo-door listener. Without it the only symptom would be a
    connection error against 127.0.0.1:10085, which says nothing about the
    cause, so the config is inspected first and the missing precondition is
    named explicitly.
    """
    api = cfg.get("api") or {}
    services = api.get("services") or []
    if not api or not api.get("tag"):
        return False, (
            "PRECONDITION NOT MET: this node's xray config has no `api` block, so "
            "runtime user management is impossible. Apply stage one of the node "
            "baseline first:  cd landing/infrastructure/xray && "
            "./apply-node-baseline.sh <ip> && ./verify-node-baseline.sh <ip>. "
            "Until then this agent keeps the on-disk config correct and the node "
            "picks the changes up at its next xray restart.")
    if "HandlerService" not in services:
        return False, (
            f"PRECONDITION NOT MET: the `api` block exists but services={services} "
            "does not include HandlerService, which is the one that adds and removes "
            "users at runtime. Fix the node baseline before relying on live sync.")
    if not api_reachable():
        return False, (
            f"PRECONDITION NOT MET: the config declares an `api` block but nothing is "
            f"listening on {XRAY_API}. Either xray is down, or it is running an older "
            "config than the file on disk (the api block was added but xray was never "
            "restarted). Disk stays correct; the live step is skipped.")
    return True, ""


def live_users(tag):
    """(reachable, {uuid: email}) for one inbound, via `xray api inbounduser`."""
    ok, out, err = run_ok([XRAY_BIN, "api", XRAY_API_LIST, f"--server={XRAY_API}", f"-tag={tag}"])
    if not ok or not out.strip():
        return False, {}
    try:
        users = json.loads(out).get("users") or []
    except ValueError:
        return False, {}
    found = {}
    for u in users:
        acct = u.get("account") or {}
        uid = str(acct.get("id", "")).strip().lower()
        if uid:
            found[uid] = u.get("email")
    return True, found


def _trailer_count(out):
    """The only trustworthy result signal -- adu/rmu exit 0 even on failure."""
    m = None
    for m in _TRAILER_RE.finditer(out):
        pass
    return int(m.group(1)) if m else None


def live_add(inbound_specs):
    """inbound_specs: [{tag, port, clients:[{id,email,flow?}]}] -> (added, output).

    One `adu` call carries every inbound. Each fragment needs BOTH tag and port
    or xray fails to build it.
    """
    if not inbound_specs:
        return 0, ""
    frag = {"inbounds": [{
        "tag": s["tag"],
        "port": s["port"],
        "protocol": "vless",
        "settings": {"clients": s["clients"], "decryption": "none"},
    } for s in inbound_specs]}
    fd, path = tempfile.mkstemp(prefix="node-sync-adu.", suffix=".json")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(frag, f)
        os.chmod(path, 0o600)
        ok, out, err = run_ok([XRAY_BIN, "api", XRAY_API_ADD, f"--server={XRAY_API}", path])
        return _trailer_count(out + err), (out + err)
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


def live_remove(tag, emails):
    if not emails:
        return 0, ""
    ok, out, err = run_ok(
        [XRAY_BIN, "api", XRAY_API_DEL, f"--server={XRAY_API}", f"-tag={tag}"] + list(emails))
    return _trailer_count(out + err), (out + err)


def apply_live(cfg, desired_users):
    """Reconcile the RUNNING xray against the desired set. True if clean.

    Diffed against live state read from the HandlerService API, never against
    traffic stats: a user with no counter is not an absent user. The fleet's
    legacy shared client has no email and therefore no per-user counter at all,
    and reading absence-from-stats as absence would revoke it on every run.

    Disk and live can also legitimately differ (someone restarted xray mid-run,
    or a previous run wrote disk and died), which is why this re-reads live.
    """
    ok, why = api_precondition(cfg)
    if not ok:
        warn(why)
        return False
    desired = dedup_users(desired_users)
    desired_set = {u["uuid"] for u in desired}
    clean = True
    add_specs = []
    for ib in vless_inbounds(cfg):
        tag = ib["tag"]
        reachable, present = live_users(tag)
        if not reachable:
            warn(f"xray API unreachable for inbound {tag!r} at {XRAY_API}; "
                 "skipping the live step (disk is already correct, next run retries)")
            return False
        # Take the client OBJECTS straight from the (already merged) config so
        # the live set and the on-disk set are identical down to the email --
        # synthesising them here would give a legacy client a managed email
        # live while disk kept the old one, and the two would then disagree
        # about which clients this agent owns.
        invisible = []
        by_uuid = {client_uuid(c): c for c in ((ib.get("settings") or {}).get("clients") or [])}
        missing = [u["uuid"] for u in desired if u["uuid"] not in by_uuid]
        if missing:
            raise Abort(f"inbound {tag}: {len(missing)} desired UUID(s) are absent from the "
                        "merged config; refusing to guess their client settings")
        new = []
        reissue_emails = []
        for u in desired:
            uid = u["uuid"]
            cobj = by_uuid[uid]
            if not cobj.get("email"):
                # INVISIBLE TO THE API. Verified on xray 26.3.27: a VLESS client
                # with no `email` is not listed by `inbounduser` and `adu`
                # silently reports "Added 0 user(s)" for it -- with no rpc error
                # at all. It authenticates real traffic perfectly well; it simply
                # cannot be enumerated, added or removed at runtime, because
                # xray's user manager is keyed by email.
                #
                # This is exactly the fleet's legacy shared client, and ../xray's
                # applier will not give it an email (that means editing a REALITY
                # inbound). So it is config-only for its whole transition life,
                # and REVOKING IT REQUIRES AN XRAY RESTART -- there is no live
                # path. Skipping it here is what keeps the agent from retrying a
                # silently-failing add on every single tick.
                invisible.append(uid)
                continue
            if uid not in present:
                new.append(cobj)
            elif is_managed_client(cobj) and present[uid] != cobj.get("email"):
                # Stats identity changed: remove the old name, add the new one.
                if present[uid]:
                    reissue_emails.append(present[uid])
                new.append(cobj)
        if reissue_emails:
            n, out = live_remove(tag, reissue_emails)
            if n != len(reissue_emails):
                error(f"inbound {tag}: re-issue removed {n} of {len(reissue_emails)}\n{scrub(out)}")
                clean = False
        if invisible and tag == vless_inbounds(cfg)[0].get("tag"):
            info(f"{len(invisible)} authorised client(s) have no email and are invisible to "
                 "the xray API (the legacy shared client). They are correct on disk and "
                 "authenticate normally; they simply cannot be managed at runtime, and "
                 "revoking one needs an xray restart.")
        if new:
            add_specs.append({"tag": tag, "port": ib.get("port"), "clients": new})

        stale = [(u, present[u]) for u in present if u not in desired_set]
        emails = [e for _, e in stale if e]
        nameless = [u for u, e in stale if not e]
        if nameless:
            # rmu removes BY EMAIL. A client with no email cannot be revoked
            # live; the disk write already dropped it, so it goes at restart.
            warn(f"inbound {tag}: {len(nameless)} live client(s) have no email and "
                 "cannot be removed through the API; they are gone from the config "
                 "and will drop at the next xray restart")
            clean = False
        if emails:
            n, out = live_remove(tag, emails)
            if n != len(emails):
                error(f"inbound {tag}: removed {n} of {len(emails)} users\n{scrub(out)}")
                clean = False
            else:
                info(f"inbound {tag}: removed {n} user(s) live")

    if add_specs:
        want = sum(len(s["clients"]) for s in add_specs)
        n, out = live_add(add_specs)
        if n != want:
            error(f"added {n} of {want} users live\n{scrub(out)}")
            clean = False
        else:
            info(f"added {n} user(s) live across {len(add_specs)} inbound(s)")
    return clean


# --------------------------------------------------------------------------
# Reporting
# --------------------------------------------------------------------------


def print_plan(plan, proxies, domain_sets, new_cfg, changed):
    print("=" * 70)
    print(f"doppler-node-sync v{AGENT_VERSION}  server_id={SERVER_ID or '<unset>'}")
    print("=" * 70)
    if plan is None:
        print("\nWS4 user reconciliation: DISABLED (SYNC_USERS=0)")
    else:
        print("\nWS4 user reconciliation")
        # UUIDs are credentials, so only a short prefix is printed -- enough to
        # correlate two lines, useless to anyone reading the journal. The email
        # (an account id) is the safe identifier and is shown in full.
        total_add = total_rm = total_re = 0
        for tag in sorted(plan):
            p = plan[tag]
            total_add += len(p["add"])
            total_rm += len(p["remove"])
            total_re += len(p.get("reissue", []))
            if p["add"] or p["remove"] or p.get("reissue"):
                print(f"  {tag}: +{len(p['add'])} -{len(p['remove'])} "
                      f"~{len(p.get('reissue', []))}")
                for u, e in p["add"]:
                    print(f"    + {e}  (uuid {u[:8]}…)")
                for u, e in p["remove"]:
                    print(f"    - {e or '<no email>'}  (uuid {u[:8]}…)"
                          + ("" if e else "   LIVE REMOVAL IMPOSSIBLE: needs a restart"))
                for u, old_e, new_e in p.get("reissue", []):
                    print(f"    ~ {old_e} -> {new_e}  (uuid {u[:8]}…)")
        if not (total_add or total_rm or total_re):
            print("  no changes; every inbound already matches Supabase")
        else:
            print(f"  total: +{total_add} -{total_rm} ~{total_re} (add/remove/re-issue)")
        print(f"  TRANSITION_KEEP_SHARED_UUID={'on' if TRANSITION_KEEP_SHARED_UUID else 'OFF'}")

    print("\nWS6 exit proxies")
    if not SYNC_PROXIES:
        print("  DISABLED (SYNC_PROXIES=0)")
    elif not proxies:
        print("  0 attached -> no outbound, no balancer, no observatory, no rules.")
        print("  Config is left exactly as it is (the write is skipped entirely).")
    else:
        for p in proxies:
            print(f"  {p['tag']}: {p['protocol']}://{p['address']}:{p['port']} "
                  f"(credentials {'set' if p['password'] else 'none'})")
        print(f"  balancer {BALANCER_TAG} strategy={EXIT_BALANCER_STRATEGY} "
              f"fallback={EXIT_FALLBACK_TAG}")
        for s in domain_sets:
            print(f"  rule {MANAGED_PREFIX}{s['name']}: {len(s['domains'])} domain(s)")

    print(f"\nOn-disk config would {'CHANGE' if changed else 'be left untouched (byte-identical)'}.")
    if changed:
        print("\n--- rendered config (credentials redacted) ---")
        print(json.dumps(redact(new_cfg), indent=2, ensure_ascii=False))
    print("=" * 70)


# --------------------------------------------------------------------------


def main(argv=None):
    ap = argparse.ArgumentParser(description="Reconcile this node's xray state with Supabase.")
    ap.add_argument("--apply", action="store_true",
                    help="actually change the node. Without this the run is a DRY RUN.")
    ap.add_argument("--config", default=XRAY_CONFIG, help="path to the node's xray config")
    args = ap.parse_args(argv)

    if not args.apply:
        info("DRY RUN (no --apply): nothing on this node will be changed")

    try:
        if not SERVER_ID or not NODE_TOKEN:
            raise Abort("SERVER_ID / NODE_SYNC_TOKEN not set; refusing to run")
        remember_secret(NODE_TOKEN)
        remember_secret(SUPABASE_KEY)

        raw, orig = load_config(args.config)
        info(f"loaded {args.config} ({len(raw)} bytes, "
             f"sha256={hashlib.sha256(raw.encode()).hexdigest()[:12]})")

        base = copy.deepcopy(orig)
        enforce_access_log(base)
        inbounds = vless_inbounds(base)
        if not inbounds:
            raise Abort("no VLESS-REALITY inbounds found; wrong config file?")
        info(f"{len(inbounds)} REALITY inbound(s): {', '.join(i['tag'] for i in inbounds)}")

        desired = None
        plan = None
        if SYNC_USERS:
            desired = fetch_authorized_users()
            if TRANSITION_KEEP_SHARED_UUID:
                keep = legacy_uuids(inbounds)
                explicit = SHARED_UUID.strip().lower()
                if explicit and explicit not in keep:
                    keep.append(explicit)
                have = {u["uuid"] for u in desired}
                # account_id None: a legacy client keeps whatever email it has
                # (usually none), so merge_users never assigns it one.
                extra = [{"uuid": u, "account_id": None} for u in keep if u not in have]
                if extra:
                    desired = desired + extra
                    info(f"TRANSITION_KEEP_SHARED_UUID: keeping {len(extra)} legacy "
                         "client(s) authorised alongside the Supabase set. They carry no "
                         "email, so they report no per-user traffic -- expected, and NOT "
                         "a signal that the user is gone.")
            else:
                stale = legacy_uuids(inbounds)
                if stale:
                    warn(f"TRANSITION_KEEP_SHARED_UUID is OFF and this node still has "
                         f"{len(stale)} legacy client(s); they are about to be REVOKED. "
                         "Every device still holding the old shared config disconnects.")
            if not desired:
                raise Abort("Supabase returned an EMPTY authorised user set. Refusing to "
                            "deauthorise every user on this node -- this is far more likely "
                            "a broken RPC than a real state.")
            info(f"{len(desired)} authorised UUID(s) from Supabase")

        proxies, domain_sets = [], []
        if SYNC_PROXIES:
            proxies, domain_sets = fetch_exit_proxies()
            info(f"{len(proxies)} exit proxy/proxies attached")

        new_cfg = copy.deepcopy(base)
        if SYNC_USERS:
            plan = plan_users(copy.deepcopy(base), desired)
            merge_users(new_cfg, desired)
        if SYNC_PROXIES:
            render_proxies(new_cfg, proxies, domain_sets)

        assert_protected_unchanged(base, new_cfg)
        assert_access_log_none(new_cfg)

        changed = new_cfg != orig
        print_plan(plan, proxies, domain_sets, new_cfg, changed)

        if not args.apply:
            info("dry run complete; nothing changed")
            return 0

        if changed:
            has_creds = any(p["password"] or p["user"] for p in proxies)
            write_config(args.config, new_cfg, has_creds)
            info("on-disk config updated")
        else:
            info("on-disk config already correct; write skipped (bytes untouched)")

        if SYNC_USERS:
            if apply_live(new_cfg, desired):
                info("live xray state reconciled")
                return 0
            error("live reconciliation incomplete; disk is correct, next run retries")
            return 2
        return 0

    except Abort as e:
        error(scrub(e))
        return 1
    except Exception as e:  # never let a traceback print a credential
        error(f"unhandled {type(e).__name__}: {scrub(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
