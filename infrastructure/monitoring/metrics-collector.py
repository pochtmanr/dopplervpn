#!/usr/bin/env python3
"""Doppler fleet metrics collector — writes server_metrics history.

Runs on the Poland VPS 185.203.240.174 ONLY. That is the one source address the
stats agents' NSG rules allow (Allow-DopplerStats, 9101, 185.203.240.174/32),
and it is where n8n and the admin panel already live. It is also the only place
the Supabase service-role key may sit: the key must never reach a VPN node.

Every 60s (systemd timer, see doppler-metrics-collector.timer) it:
  1. reads `vpn_servers` for every row with a stats_agent_url,
  2. polls each node in parallel — a TCP handshake to the REALITY port, then
     GET {stats_agent_url} with the per-node bearer token,
  3. writes exactly one `server_metrics` row per node per sweep.

THE RULE THIS FILE EXISTS TO HONOUR: a missing measurement is NULL, never 0.
An older agent, a failed probe and a genuinely-zero reading are three different
facts and only NULL carries the first two. Every extractor here returns None on
anything that is not a real number, and `0` survives only when the payload
actually said 0. A collector that helpfully writes zeros destroys the table's
entire design at the source, which is why `_num`/`_int`/`_bool` are so fussy.

TWO DELIBERATE DIVERGENCES from the comments in
`VPnReact/supabase/migrations/20260908T202000_server_metrics_history.sql`.
Both were directed, both are argued here, and the migration's prose should be
corrected to match rather than this file being "fixed" back:

  1. §8 says a node that does not answer writes NO ROW, on the grounds that
     absence is what coverage_pct reads. We write a row for EVERY node on
     EVERY sweep, with xray_active NULL and the metrics NULL.

     Read the rollup before objecting. `uptime_pct` is
     `count(*) FILTER (WHERE xray_active IS TRUE) / expected_samples` -- the
     denominator is expected samples, not rows present, and the migration's own
     comment says that is so "an agent that stopped answering counts as downtime
     rather than vanishing". Writing a null row therefore CANNOT inflate
     uptime_pct: a down node contributes no xray_active-true row either way.
     What changes is coverage_pct, and it changes for the better. With failure
     rows, the two failure modes separate cleanly:
         collector dead  -> every node's coverage_pct collapses
         one node down   -> that node's coverage_pct stays ~100, uptime_pct 0
     Without them, both look identical (coverage 0), coverage_pct merely
     duplicates uptime_pct, and the question "is my collector alive?" becomes
     unanswerable from the data. A gap that means two different things is the
     exact class of bug this whole project is about.

  2. The `net_rtt_ms` column comment says "round trip to GET /stats". We store
     the TCP handshake time to the node's REALITY port instead, matching
     `doppler-admin/src/lib/tcp-ping.ts` and the panel's Ping column. It is the
     same measurement on every node with no agent in the path, it still yields a
     number when the agent is dead but xray is alive, and the agent's own share
     of a /stats round trip is already reported separately as agent_compute_ms.

Config lives in /etc/doppler-metrics-collector.env (mode 600):
    SUPABASE_URL=https://fzlrhmjdjjzcgstaeblu.supabase.co
    SUPABASE_SERVICE_ROLE_KEY=...

Usage:
    metrics-collector.py            one sweep, writes rows
    metrics-collector.py --dry-run  one sweep, prints the rows, writes nothing
    metrics-collector.py --prune    retention only (see doppler-metrics-prune.timer)
"""
import argparse
import json
import os
import socket
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

AGENT_TIMEOUT = float(os.environ.get("AGENT_TIMEOUT_S", "8"))
PING_TIMEOUT = float(os.environ.get("PING_TIMEOUT_S", "2.5"))
SUPABASE_TIMEOUT = float(os.environ.get("SUPABASE_TIMEOUT_S", "20"))
MAX_WORKERS = int(os.environ.get("POLL_WORKERS", "16"))
PRUNE_KEEP_DAYS = int(os.environ.get("PRUNE_KEEP_DAYS", "30"))

# An agent whose clock is wrong -- or frozen -- would otherwise write one row and
# then collide with itself forever under UNIQUE (server_id, sampled_at), losing
# every later sample silently. Past this much skew we use our own clock instead.
MAX_CLOCK_SKEW_S = float(os.environ.get("MAX_CLOCK_SKEW_S", "300"))

# Same table as the agent's, applied to a raw status code from ANY agent build.
# We never read a v1 payload's own `flagged` boolean: v1 called only 403 a block.
BLOCKED_CODES = {403, 429, 503, 1020}

SERVER_COLUMNS = "id,name,ip_address,port,stats_agent_url,stats_agent_token"


def log(msg):
    print(msg, file=sys.stderr, flush=True)


# --- value extraction: everything that is not a real measurement is None ----

def _num(value):
    """A JSON number, or None. bool is not a number (isinstance(True, int))."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    return value


def _int(value):
    n = _num(value)
    return None if n is None else int(n)


def _bool(value):
    return value if isinstance(value, bool) else None


def _dig(obj, *path):
    """Walk nested dicts; any missing/!dict level yields None, never a default."""
    for key in path:
        if not isinstance(obj, dict):
            return None
        obj = obj.get(key)
    return obj


def reachability_of(payload):
    """(status, raw_code) from any agent build, or (None, None) if absent.

    NULL status means the payload carried no reachability object at all -- a
    pre-v2 agent -- which is a different fact from 'unknown', and different
    again from 'ok'. Never collapse them.

    v2 states its own status. A v1 payload has {chatgpt_status, flagged, error}
    and no status, and the Netherlands node runs exactly that build while being
    the only node reporting a 403 -- too valuable to drop on the floor. So we
    re-derive the verdict from the RAW STATUS CODE with the v2 table. The
    provenance is not lost: agent_version records which build it came from.
    """
    reach = _dig(payload, "reachability")
    if not isinstance(reach, dict):
        return None, None
    code = _int(reach.get("chatgpt_status"))
    status = reach.get("status")
    if status in ("ok", "blocked", "unknown"):
        return status, code
    if code is None:
        return "unknown", None
    if code in BLOCKED_CODES:
        return "blocked", code
    return ("ok" if 200 <= code < 400 else "unknown"), code


def traffic_of(payload):
    """(up, down) from the inbound counter family the agent settled on.

    Agent v2 already sums one family and says which in `counter_family`; a v1
    payload's totals summed every counter family and would double-count, so we
    take them only when the agent tells us what they mean. Null until an xray
    `api` block exists, which is correct rather than unfortunate.
    """
    traffic = _dig(payload, "xray", "traffic")
    if not isinstance(traffic, dict):
        return None, None
    if traffic.get("counter_family") is None:
        return None, None
    return _int(traffic.get("uplink")), _int(traffic.get("downlink"))


# --- probes -----------------------------------------------------------------

def tcp_ping(host, port):
    """Milliseconds for a TCP handshake to the node's REALITY port, or None.

    A Python transcription of doppler-admin/src/lib/tcp-ping.ts: one handshake,
    tight timeout, socket closed the instant it connects, nothing exchanged.
    """
    if not host or not isinstance(port, int) or not 0 < port <= 65535:
        return None
    started = time.perf_counter()
    try:
        with socket.create_connection((host, port), PING_TIMEOUT):
            return int(round((time.perf_counter() - started) * 1000))
    except OSError:
        return None


def fetch_stats(url, token):
    """(payload, error). Never raises; a failure is data, not an exception."""
    req = urllib.request.Request(url, method="GET")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=AGENT_TIMEOUT) as resp:
            body = resp.read(1 << 20)
        return json.loads(body.decode("utf-8", "replace")), None
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code}"
    except json.JSONDecodeError:
        return None, "agent returned non-JSON"
    except Exception as e:
        return None, type(e).__name__


def sampled_at_for(payload, sweep_iso, sweep_dt):
    """The agent's own `ts` when it is usable, else the sweep clock.

    The agent's ts is second-resolution, which is what makes a retried poll
    collide with the row it already wrote and ingestion idempotent under
    UNIQUE (server_id, sampled_at). But a node that did not answer has no ts at
    all, and a node with a broken clock has a poisonous one -- so both fall back
    to the sweep's own second-truncated timestamp. All fallback rows in one
    sweep share it, which makes a sweep one clean point on the series.
    """
    ts = _dig(payload, "ts")
    if not isinstance(ts, str):
        return sweep_iso
    try:
        parsed = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except ValueError:
        return sweep_iso
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    if abs(parsed - sweep_dt) > timedelta(seconds=MAX_CLOCK_SKEW_S):
        log(f"    clock skew {parsed.isoformat()} vs sweep {sweep_iso}; using sweep clock")
        return sweep_iso
    return parsed.isoformat()


def collect_one(server, sweep_iso, sweep_dt):
    """One node -> exactly one row. Unreachable nodes included, all-NULL."""
    name = server.get("name") or server.get("id")
    rtt = tcp_ping(server.get("ip_address"), _int(server.get("port")))
    payload, error = fetch_stats(server.get("stats_agent_url"), server.get("stats_agent_token"))

    if payload is None or not isinstance(payload, dict):
        # Still a row. xray_active NULL = "we could not measure", distinct from
        # FALSE = "the agent answered and xray is down". The TCP ping may well
        # have succeeded, which says the node lives and only the agent is gone.
        log(f"    {name}: no payload ({error}); writing NULL row, rtt={rtt}")
        return {
            "server_id": server["id"], "sampled_at": sweep_iso,
            "agent_version": None, "connections": None, "distinct_peers": None,
            "cpu_load1": None, "cpu_cores": None, "memory_used_pct": None,
            "traffic_up_bytes": None, "traffic_down_bytes": None,
            "reachability_status": None, "reachability_status_code": None,
            "xray_active": None, "uptime_s": None, "agent_compute_ms": None,
            "net_rtt_ms": rtt,
        }

    status, code = reachability_of(payload)
    up, down = traffic_of(payload)
    return {
        "server_id": server["id"],
        "sampled_at": sampled_at_for(payload, sweep_iso, sweep_dt),
        "agent_version": _int(_dig(payload, "agent_version")),
        "connections": _int(_dig(payload, "xray", "connections", "total")),
        "distinct_peers": _int(_dig(payload, "xray", "connections", "distinct_peers")),
        "cpu_load1": _num(_dig(payload, "cpu", "load1")),
        "cpu_cores": _int(_dig(payload, "cpu", "cores")),
        "memory_used_pct": _num(_dig(payload, "mem", "used_pct")),
        "traffic_up_bytes": up,
        "traffic_down_bytes": down,
        "reachability_status": status,
        "reachability_status_code": code,
        "xray_active": _bool(_dig(payload, "xray", "active")),
        "uptime_s": _int(_dig(payload, "uptime_s")),
        "agent_compute_ms": _num(_dig(payload, "agent_compute_ms")),
        "net_rtt_ms": rtt,
    }


# --- Supabase ---------------------------------------------------------------

def supabase(method, path, body=None, prefer=None):
    if not SUPABASE_URL or not SERVICE_KEY:
        raise SystemExit("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set; refusing to run")
    req = urllib.request.Request(f"{SUPABASE_URL}{path}", method=method)
    req.add_header("apikey", SERVICE_KEY)
    req.add_header("Authorization", f"Bearer {SERVICE_KEY}")
    if prefer:
        req.add_header("Prefer", prefer)
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, data, timeout=SUPABASE_TIMEOUT) as resp:
        raw = resp.read()
    return json.loads(raw) if raw else None


def fetch_servers():
    """Every row with a stats_agent_url. Deliberately NOT filtered on is_active:
    Netherlands and Russia are inactive and still need their history recorded."""
    rows = supabase("GET", f"/rest/v1/vpn_servers?select={SERVER_COLUMNS}"
                           "&stats_agent_url=not.is.null")
    return [r for r in (rows or []) if r.get("id") and r.get("stats_agent_url")]


def write_rows(rows):
    # ignore-duplicates, not merge: a re-run must never rewrite history that is
    # already stored. Combined with the agent's second-resolution ts, a retried
    # sweep is idempotent.
    supabase("POST", "/rest/v1/server_metrics", rows,
             prefer="return=minimal,resolution=ignore-duplicates")


def prune():
    kept = supabase("POST", "/rest/v1/rpc/prune_server_metrics",
                    {"p_keep_days": PRUNE_KEEP_DAYS})
    log(f"prune_server_metrics(keep_days={PRUNE_KEEP_DAYS}) deleted {kept} row(s)")
    return kept


def sweep(dry_run=False):
    started = time.perf_counter()
    sweep_dt = datetime.now(timezone.utc).replace(microsecond=0)
    sweep_iso = sweep_dt.isoformat()
    servers = fetch_servers()
    if not servers:
        log("no vpn_servers rows carry a stats_agent_url; nothing to collect")
        return 0
    log(f"sweep {sweep_iso}: polling {len(servers)} node(s)")
    workers = max(1, min(MAX_WORKERS, len(servers)))
    with ThreadPoolExecutor(max_workers=workers) as pool:
        rows = list(pool.map(lambda s: collect_one(s, sweep_iso, sweep_dt), servers))
    if dry_run:
        print(json.dumps(rows, indent=2, sort_keys=True))
        log(f"dry run: {len(rows)} row(s) NOT written, {time.perf_counter() - started:.2f}s")
        return len(rows)
    write_rows(rows)
    log(f"wrote {len(rows)} row(s) in {time.perf_counter() - started:.2f}s")
    return len(rows)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--dry-run", action="store_true", help="print rows, write nothing")
    ap.add_argument("--prune", action="store_true", help="run retention only")
    args = ap.parse_args()
    try:
        if args.prune:
            prune()
        else:
            sweep(dry_run=args.dry_run)
    except urllib.error.HTTPError as e:
        detail = e.read()[:500].decode("utf-8", "replace")
        log(f"Supabase {e.code}: {detail}")
        sys.exit(1)
    except Exception as e:
        log(f"{type(e).__name__}: {e}")
        sys.exit(1)
