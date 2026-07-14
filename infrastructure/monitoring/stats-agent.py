#!/usr/bin/env python3
"""Doppler VPN stats agent.

Tiny stdlib-only HTTP endpoint exposing host/xray metrics for the n8n
service monitor. Runs on bare-xray servers that have no Marzban panel.

GET /stats with `Authorization: Bearer $STATS_TOKEN` returns JSON:
  xray systemd state, established connection counts per REALITY port
  (8443-8448), optional xray traffic stats, CPU load, memory, uptime.

Deployed via deploy-stats-agent.sh; systemd unit doppler-stats-agent.service.
Access is restricted twice: Azure NSG allows only the n8n host as source,
and the bearer token (unique per server) lives in /etc/doppler-stats-agent.env.
"""
import json
import os
import socket
import subprocess
import sys
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("STATS_PORT", "9101"))
TOKEN = os.environ.get("STATS_TOKEN", "")
XRAY_PORTS = list(range(8443, 8449))
XRAY_API = os.environ.get("XRAY_API", "127.0.0.1:10085")


def run(cmd, timeout=3):
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout).stdout
    except Exception:
        return ""


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


def connections():
    """Established connections per xray port, via ss with /proc fallback."""
    counts = {p: 0 for p in XRAY_PORTS}
    out = run(["ss", "-Htn", "state", "established"])
    if out:
        for line in out.splitlines():
            parts = line.split()
            # local address is 3rd column in `ss -Htn state established` output
            if len(parts) >= 3:
                local = parts[2] if not parts[0].isdigit() else parts[2]
                port_s = local.rsplit(":", 1)[-1]
                if port_s.isdigit() and int(port_s) in counts:
                    counts[int(port_s)] += 1
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
    return result


def xray_traffic():
    """Optional: xray stats API. Bare installs usually lack the api block -> null."""
    out = run(["xray", "api", "statsquery", f"--server={XRAY_API}"], timeout=2)
    if not out:
        return None
    try:
        stats = json.loads(out).get("stat", [])
        up = sum(int(s.get("value", 0)) for s in stats if s.get("name", "").endswith("uplink"))
        down = sum(int(s.get("value", 0)) for s in stats if s.get("name", "").endswith("downlink"))
        return {"uplink": up, "downlink": down}
    except (ValueError, AttributeError):
        return None


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


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/stats":
            self.send_error(404)
            return
        auth = self.headers.get("Authorization", "")
        if not TOKEN or auth != f"Bearer {TOKEN}":
            self.send_error(401)
            return
        payload = {
            "agent_version": 1,
            "hostname": socket.gethostname(),
            "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "xray": {
                "active": xray_active(),
                "connections": connections(),
                "traffic": xray_traffic(),
            },
            "cpu": cpu(),
            "mem": mem(),
            "uptime_s": uptime(),
        }
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
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
