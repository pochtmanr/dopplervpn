#!/usr/bin/env python3
"""Doppler VPN stats agent (v2).

Tiny stdlib-only HTTP endpoint exposing host/xray metrics for the n8n
service monitor and for the admin panel's Servers tab. Runs on bare-xray
servers that have no Marzban panel.

GET /stats with `Authorization: Bearer $STATS_TOKEN` returns JSON:
  xray process state, established connection counts per REALITY port
  (8443-8448), optional xray traffic stats, CPU load, memory, a *cached*
  ChatGPT reachability verdict, uptime.

What changed in v2 (2026-09-08):

  * `xray api statsquery` is no longer called blind. No node has an `api` block
    in its xray config, and the failing gRPC call does not fail fast: measured
    on Hong Kong it burns 3.0s before erroring, which run()'s 2s cap turned into
    a flat 2s tax on EVERY /stats request. That -- not the reachability probe --
    is why the admin panel showed 2258-2527ms for every bare-xray node. A 250ms
    TCP connect to the API port now gates the subprocess, and the answer is
    cached, so a node with no api block costs approximately nothing. (For scale:
    `ss` on that same box, holding 2,198 established sockets, takes 0.007s.)
  * The reachability probe moved off the request path into a background thread
    that runs roughly every 15 minutes (jittered). v1 made a live 4 s HTTPS GET
    to chatgpt.com inside EVERY /stats request. That was a SECOND multi-second
    cost, not the one above and not the one the admin panel was actually
    showing -- the Azure fleet still runs a build that predates the probe
    entirely, so it was latent there rather than paid. It would have become
    real the moment v2 landed, and with the panel auto-refreshing 10 nodes
    every 60 s it also meant ~600 requests/hour at OpenAI from datacenter IPs
    with a spoofed Chrome UA, which is a fine way to CAUSE the IP flagging the
    probe exists to detect. /stats now serves the last cached verdict and never
    blocks on the network.
  * `reachability.status` is an explicit blocked/ok/unknown tri-state. In v1
    any probe exception returned flagged=false, so a broken probe read as
    healthy. `flagged` stays in the payload (both n8n and the admin panel
    read it) but is now true only for `blocked`, never for `unknown`.
  * `agent_compute_ms` lets a consumer separate agent time from network time.
  * `connections.distinct_peers` is 0 (not null) on a genuinely idle node;
    null is now reserved for the /proc fallback, which cannot measure peers.
  * `xray.traffic` sums ONE named counter family (see TRAFFIC_FAMILY) instead of
    every stat ending in uplink/downlink, which would have double- or
    triple-counted the same bytes as soon as the api block lands, and reports
    `counter_family` plus a per-user `users` map.

`agent_version` is how a consumer tells these payloads apart. Measured on the
fleet 2026-09-08: all seven Azure nodes report `agent_version: 1` and their
payloads carry NO `reachability` object and NO `distinct_peers` key at all, so:
1 => pre-reachability build, those keys are simply missing and nothing may be
inferred from their absence; 2 => every key documented here is present, and
`reachability.status == "unknown"` with a null
`checked_at` means "no probe has completed yet", which is NOT the same as a
probe that came back clean. A missing `reachability` object must read as
unknown, never as healthy.

Deployed via deploy-stats-agent.sh; systemd unit doppler-stats-agent.service.
Access is restricted twice: an Azure NSG source restriction (see README) and
the bearer token (unique per server) in /etc/doppler-stats-agent.env.
"""
import hmac
import json
import os
import random
import socket
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

AGENT_VERSION = 2

PORT = int(os.environ.get("STATS_PORT", "9101"))
TOKEN = os.environ.get("STATS_TOKEN", "")
XRAY_PORTS = list(range(8443, 8449))
XRAY_API = os.environ.get("XRAY_API", "127.0.0.1:10085")
# A TCP connect to the xray gRPC API port stands in for "is the api block
# configured". Local, so 250ms is generous; the verdict is cached for 5 min so
# even that cheap check is not paid per request.
XRAY_API_CONNECT_TIMEOUT = float(os.environ.get("XRAY_API_CONNECT_TIMEOUT_S", "0.25"))
XRAY_API_RECHECK = float(os.environ.get("XRAY_API_RECHECK_S", "300"))

# Probed through THIS node's egress to detect a flagged exit IP. Browser-like UA
# so the probe mirrors a real client.
#
# Measured across all seven Azure nodes on 2026-09-08: every one gets 403 from
# chatgpt.com and 200 from BOTH cloudflare.com and google.com. So the block is
# OpenAI-specific, not Cloudflare-wide and not general egress trouble -- which is
# exactly why the probe targets chatgpt.com and why a `blocked` verdict should be
# read as "OpenAI refuses this IP", not "this node has no internet".
REACH_URL = os.environ.get("REACH_URL", "https://chatgpt.com/")
REACH_UA = os.environ.get(
    "REACH_UA",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
)
REACH_TIMEOUT = float(os.environ.get("REACH_TIMEOUT_S", "4"))
# ~15 min between probes: often enough to catch a freshly flagged IP within one
# alerting window, rare enough that ten nodes together stay well under one
# request per minute at the far end.
REACH_INTERVAL = float(os.environ.get("REACH_INTERVAL_S", "900"))
# First probe runs shortly after start, at a random offset, so that a fleet
# redeployed in one pass does not line its probes up.
_start_delay = os.environ.get("REACH_START_DELAY_S")
REACH_START_DELAY = float(_start_delay) if _start_delay else random.uniform(2, 15)

# Which xray counter family the fleet-wide totals are summed from.
#
# xray emits several families over the SAME bytes:
#     inbound>>>{tag}>>>traffic>>>{uplink,downlink}
#     outbound>>>{tag}>>>traffic>>>{uplink,downlink}
#     user>>>{id}>>>traffic>>>{uplink,downlink}
# so v1's "sum every name ending in uplink" would count each byte two or three
# times the moment the api block enables more than one of them. We sum INBOUNDS
# only: those are the REALITY listeners clients connect to, every client byte
# crosses exactly one of them, and the total does not depend on whether per-user
# accounting happens to be on.
#
# Directions are from the NODE's point of view, as xray defines them:
#   uplink   = bytes the node RECEIVED from clients
#   downlink = bytes the node SENT to clients
# If no inbound counter is present at all, uplink/downlink are null rather than
# 0 -- a missing measurement must not render as a real zero.
TRAFFIC_FAMILY = "inbound"

# Codes that mean "this exit IP is being refused", as opposed to "the probe
# broke". 1020 is Cloudflare's access-denied error; it normally rides inside a
# 403 body, but some edges surface it as the status itself.
BLOCKED_CODES = {403, 429, 503, 1020}


def run_ok(cmd, timeout=3):
    """(ran_and_exited_0, stdout).

    Empty stdout from a command that DID run is a real answer -- an idle node --
    not a failure, and callers have to be able to tell the two apart.
    """
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode == 0, p.stdout
    except Exception:
        return False, ""


def run(cmd, timeout=3):
    return run_ok(cmd, timeout)[1]


def xray_active():
    # /proc scan instead of systemctl: D-Bus rejects the DynamicUser UID.
    for pid in os.listdir("/proc"):
        if not pid.isdigit():
            continue
        try:
            with open(f"/proc/{pid}/comm") as f:
                if f.read().strip() == "xray":
                    return True
        except OSError:
            continue
    return False


def _peer_ip(addr):
    """`[::ffff:1.2.3.4]:5678` / `1.2.3.4:5678` -> `1.2.3.4`."""
    host = addr.rsplit(":", 1)[0]
    if host.startswith("[") and host.endswith("]"):
        host = host[1:-1]
    if host.startswith("::ffff:"):
        host = host[7:]
    return host


def connections():
    """Established connections per xray port, via ss with /proc fallback.

    `total` counts SOCKETS, not people: a TUN client opens one socket per
    destination flow, so one device routinely holds hundreds. `distinct_peers`
    counts unique remote IPs, which is the closest thing this box can measure to
    a device count -- still not an account count, since every client presents the
    same shared VLESS UUID and several devices can share one NAT address.

    `distinct_peers` is 0 when `ss` ran and saw nobody, and null ONLY on the
    /proc fallback, which cannot cheaply resolve peers. v1 wrote
    `len(peers) if peers else None`, so an idle node was indistinguishable from
    an unmeasurable one -- and keyed the fallback off empty ss OUTPUT, which an
    idle node also produces, so it fell back when it did not need to.
    """
    counts = {p: 0 for p in XRAY_PORTS}
    peers = set()
    peers_measured, out = run_ok(["ss", "-Htn", "state", "established"])
    if peers_measured:
        for line in out.splitlines():
            parts = line.split()
            # `ss -Htn state established` drops the State column:
            # Recv-Q Send-Q Local:Port Peer:Port
            if len(parts) >= 4:
                port_s = parts[2].rsplit(":", 1)[-1]
                if port_s.isdigit() and int(port_s) in counts:
                    counts[int(port_s)] += 1
                    peers.add(_peer_ip(parts[3]))
    else:
        for path in ("/proc/net/tcp", "/proc/net/tcp6"):
            try:
                with open(path) as f:
                    next(f)
                    for line in f:
                        fields = line.split()
                        if fields[3] != "01":  # 01 = ESTABLISHED
                            continue
                        port = int(fields[1].rsplit(":", 1)[-1], 16)
                        if port in counts:
                            counts[port] += 1
            except OSError:
                pass
    result = {str(p): counts[p] for p in XRAY_PORTS}
    result["total"] = sum(counts.values())
    result["distinct_peers"] = len(peers) if peers_measured else None
    return result


_api_lock = threading.Lock()
_api_probe = {"at": None, "listening": False}  # monotonic ts, last verdict


def api_listening():
    """Is anything accepting on the xray gRPC API port?

    `xray api statsquery` against a node whose config has no `api` block does
    not fail fast -- 3.0s measured on Hong Kong, capped at 2s by run(), on every
    single request. This answers the same question in under a millisecond and
    caches it, so the subprocess is only spawned on a node that could actually
    answer. Cost of the cache: after xray gains an api block, traffic stats
    appear up to XRAY_API_RECHECK late.
    """
    now = time.monotonic()
    with _api_lock:
        at, listening = _api_probe["at"], _api_probe["listening"]
    if at is not None and (now - at) < XRAY_API_RECHECK:
        return listening
    host, _, port = XRAY_API.rpartition(":")
    host = host.strip("[]") or "127.0.0.1"
    try:
        with socket.create_connection((host, int(port)), XRAY_API_CONNECT_TIMEOUT):
            listening = True
    except (OSError, ValueError, OverflowError):
        listening = False
    with _api_lock:
        _api_probe["at"] = time.monotonic()
        _api_probe["listening"] = listening
    return listening


def xray_traffic():
    """Optional: xray stats API. Bare installs lack the `api` block -> null,
    and are not made to wait for a gRPC call that cannot succeed (see
    api_listening).

    Returns fleet-wide `uplink`/`downlink` summed over the TRAFFIC_FAMILY
    counters only (see that constant for why, and for what the directions mean),
    `counter_family` naming the family that was summed so a consumer never has
    to guess, and `users`: a per-user breakdown keyed by the identifier xray
    puts in `user>>>{id}>>>traffic>>>uplink`. `users` stays empty until the nodes
    carry an `api` block with per-user accounting enabled.

    uplink/downlink are null when the family emitted no counters at all, so a
    node whose api block exposes something else does not report a fake 0.
    """
    if not api_listening():
        return None
    out = run(["xray", "api", "statsquery", f"--server={XRAY_API}"], timeout=2)
    if not out:
        return None
    try:
        stats = json.loads(out).get("stat", []) or []
    except (ValueError, AttributeError):
        return None
    totals = {"uplink": 0, "downlink": 0}
    seen_family = False
    users = {}
    for s in stats:
        if not isinstance(s, dict):
            continue
        # "inbound>>>vless-8443>>>traffic>>>uplink" -> ["inbound", tag, "traffic", dir]
        parts = (s.get("name") or "").split(">>>")
        if len(parts) != 4 or parts[2] != "traffic":
            continue
        family, ident, direction = parts[0], parts[1], parts[3]
        if direction not in totals:
            continue
        try:
            value = int(s.get("value", 0) or 0)
        except (TypeError, ValueError):
            continue
        if family == TRAFFIC_FAMILY:
            totals[direction] += value
            seen_family = True
        if family == "user":
            users.setdefault(ident, {"uplink": 0, "downlink": 0})[direction] += value
    return {
        "uplink": totals["uplink"] if seen_family else None,
        "downlink": totals["downlink"] if seen_family else None,
        "counter_family": TRAFFIC_FAMILY,
        "users": users,
    }


# --- reachability: probed in the background, served from cache -------------

_reach_lock = threading.Lock()
_reach_state = {
    "status": "unknown",       # blocked | ok | unknown
    "chatgpt_status": None,    # raw HTTP status of the most recent probe
    "flagged": False,          # kept for n8n + admin panel; true only if blocked
    "error": None,             # exception name of the most recent probe, if any
    "checked_epoch": None,     # last probe that came back with a status code
    "attempted_epoch": None,   # last probe attempt, whatever the outcome
}


def _iso(epoch):
    if epoch is None:
        return None
    return datetime.fromtimestamp(epoch, timezone.utc).isoformat(timespec="seconds")


def _classify(code):
    if code in BLOCKED_CODES:
        return "blocked"
    if 200 <= code < 400:
        return "ok"
    # 4xx/5xx that is not a known block: real, but not evidence of flagging.
    return "unknown"


def probe_reachability():
    """One probe of the OpenAI-gated URL through this node's egress.

    Runs on the background thread only -- never on the request path. On an
    exception the verdict degrades to `unknown` (NOT to `ok`), keeping the
    timestamp of the last probe that did return a status so a consumer can see
    how stale the last real answer is.
    """
    now = time.time()
    try:
        # Built inside the try on purpose: a malformed REACH_URL raises here, and
        # outside the try that exception would escape into _reach_loop.
        req = urllib.request.Request(
            REACH_URL, method="GET", headers={"User-Agent": REACH_UA}
        )
        with urllib.request.urlopen(req, timeout=REACH_TIMEOUT) as resp:
            code = resp.status  # body intentionally not read -- status is enough
        result = {"chatgpt_status": code, "error": None}
    except urllib.error.HTTPError as e:
        result = {"chatgpt_status": e.code, "error": None}
    except Exception as e:
        result = {"chatgpt_status": None, "error": type(e).__name__}

    code = result["chatgpt_status"]
    status = _classify(code) if code is not None else "unknown"
    with _reach_lock:
        _reach_state["status"] = status
        _reach_state["chatgpt_status"] = code
        _reach_state["flagged"] = status == "blocked"
        _reach_state["error"] = result["error"]
        _reach_state["attempted_epoch"] = now
        if code is not None:
            _reach_state["checked_epoch"] = now


def reachability():
    """The cached verdict plus its age. Never touches the network."""
    with _reach_lock:
        state = dict(_reach_state)
    checked = state.pop("checked_epoch")
    attempted = state.pop("attempted_epoch")
    state["checked_at"] = _iso(checked)
    state["attempted_at"] = _iso(attempted)
    state["age_s"] = int(time.time() - checked) if checked is not None else None
    state["interval_s"] = int(REACH_INTERVAL)
    return state


def _reach_loop():
    """Probe forever. A single failure must never end this thread.

    If this loop dies, `probe_reachability` stops running but /stats keeps
    serving the last verdict, so a node whose probe thread died would report
    `status: "ok"` indefinitely while `age_s` grew without bound -- the exact
    "absence of data reads as a pass" bug v2 exists to remove. probe_reachability
    already swallows probe errors, so anything reaching this handler is a bug in
    the agent rather than a network problem; it is recorded in the payload as a
    thread error and the loop continues.
    """
    time.sleep(REACH_START_DELAY)
    while True:
        try:
            probe_reachability()
        except Exception as e:  # noqa: BLE001 - deliberately total
            with _reach_lock:
                _reach_state["status"] = "unknown"
                _reach_state["chatgpt_status"] = None
                _reach_state["flagged"] = False
                _reach_state["error"] = "loop:" + type(e).__name__
                _reach_state["attempted_epoch"] = time.time()
        # +/-15% jitter so nodes deployed together drift apart instead of
        # probing the far end in lockstep.
        time.sleep(REACH_INTERVAL * random.uniform(0.85, 1.15))


def cpu():
    with open("/proc/loadavg") as f:
        load1 = float(f.read().split()[0])
    return {"load1": load1, "cores": os.cpu_count() or 1}


def mem():
    info = {}
    with open("/proc/meminfo") as f:
        for line in f:
            key, val = line.split(":", 1)
            info[key] = int(val.strip().split()[0])  # kB
    total = info.get("MemTotal", 0)
    avail = info.get("MemAvailable", 0)
    used_pct = round(100.0 * (total - avail) / total, 1) if total else 0.0
    return {"total_mb": total // 1024, "available_mb": avail // 1024, "used_pct": used_pct}


def uptime():
    with open("/proc/uptime") as f:
        return int(float(f.read().split()[0]))


def authorized(header):
    """Constant-time bearer compare; no token configured means no access."""
    if not TOKEN:
        return False
    expected = f"Bearer {TOKEN}".encode()
    # Header values arrive as str; `replace` keeps a hostile byte from raising.
    return hmac.compare_digest(header.encode("utf-8", "replace"), expected)


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/stats":
            self.send_error(404)
            return
        if not authorized(self.headers.get("Authorization", "")):
            self.send_error(401)
            return
        started = time.perf_counter()
        payload = {
            "agent_version": AGENT_VERSION,
            "hostname": socket.gethostname(),
            "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "xray": {
                "active": xray_active(),
                "connections": connections(),
                "traffic": xray_traffic(),
            },
            "cpu": cpu(),
            "mem": mem(),
            "reachability": reachability(),
            "uptime_s": uptime(),
        }
        # Agent-side assembly time only. Whatever a caller measures on top of
        # this is network + its own overhead.
        payload["agent_compute_ms"] = round((time.perf_counter() - started) * 1000, 1)
        body = json.dumps(payload).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):  # keep journald quiet
        pass


if __name__ == "__main__":
    if not TOKEN:
        print("STATS_TOKEN not set; refusing to start", file=sys.stderr)
        sys.exit(1)
    threading.Thread(target=_reach_loop, name="reachability", daemon=True).start()
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
