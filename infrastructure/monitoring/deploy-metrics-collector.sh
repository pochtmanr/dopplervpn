#!/usr/bin/env bash
# Deploy the Doppler metrics collector to the Poland VPS — and ONLY there.
#
# Usage:
#   SUPABASE_SERVICE_ROLE_KEY=... ./deploy-metrics-collector.sh
#   ./deploy-metrics-collector.sh --dry-run     # deploy, then one dry sweep, no write
#
# WHY ONE HOST, ENFORCED IN CODE: this program holds the Supabase service-role
# key. A VPN node must never see that key — a node is the thing most likely to
# be seized, resold or reimaged, and the key rewrites every table in the
# project. 185.203.240.174 is also the only source address the agents' NSG rules
# accept (Allow-DopplerStats, 9101, 185.203.240.174/32), so a collector anywhere
# else could not poll them anyway. To deploy elsewhere you must set
# COLLECTOR_HOST deliberately; there is no positional argument for it.
#
# Key handling: the existing /etc/doppler-metrics-collector.env is reused if the
# box already has one, exactly like deploy-stats-agent.sh reuses agent tokens, so
# redeploying never rotates credentials. The key is written with `install -m 600`
# from stdin and is never echoed, never passed as an argv, and never logged.
set -uo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
COLLECTOR_HOST="${COLLECTOR_HOST:-185.203.240.174}"
COLLECTOR_USER="${COLLECTOR_USER:-root}"
COLLECTOR_KEY="${COLLECTOR_KEY:-}"
DRY_RUN=""
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

warn() { printf '%s\n' "$*" >&2; }

if [ "$COLLECTOR_HOST" != "185.203.240.174" ]; then
  warn "COLLECTOR_HOST is $COLLECTOR_HOST, not the Poland VPS."
  warn "This ships a Supabase service-role key. Confirm that host is not a VPN node."
  printf 'Type the host again to continue: ' >&2
  read -r confirm
  [ "$confirm" = "$COLLECTOR_HOST" ] || { warn "aborted"; exit 1; }
fi

SSH_ARGS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=10)
[ -n "$COLLECTOR_KEY" ] && [ -f "$COLLECTOR_KEY" ] && SSH_ARGS+=(-i "$COLLECTOR_KEY")
TARGET="$COLLECTOR_USER@$COLLECTOR_HOST"

FILES=(metrics-collector.py
       doppler-metrics-collector.service doppler-metrics-collector.timer
       doppler-metrics-prune.service doppler-metrics-prune.timer)
for f in "${FILES[@]}"; do
  [ -f "$DIR/$f" ] || { warn "missing $DIR/$f"; exit 1; }
done

# Reuse the env file already on the box if it has both keys; only then fall back
# to the local environment. Same reasoning as the stats agent's token reuse:
# redeploying must not silently change credentials.
warn "==> $TARGET: checking for an existing env file"
existing=$(ssh "${SSH_ARGS[@]}" "$TARGET" \
  "grep -c '^SUPABASE_SERVICE_ROLE_KEY=.' /etc/doppler-metrics-collector.env 2>/dev/null" \
  2>/dev/null || true)
existing="${existing//[[:space:]]/}"

if [ "${existing:-0}" = "1" ]; then
  warn "    reusing the key already on the box"
  WRITE_ENV=0
else
  : "${SUPABASE_SERVICE_ROLE_KEY:?no key on the box and SUPABASE_SERVICE_ROLE_KEY is unset}"
  SUPABASE_URL="${SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL:-https://fzlrhmjdjjzcgstaeblu.supabase.co}}"
  warn "    no key on the box; installing one from the local environment"
  WRITE_ENV=1
fi

scp -q "${SSH_ARGS[@]}" "${FILES[@]/#/$DIR/}" "$TARGET:/tmp/" || {
  warn "scp failed"; exit 1; }

if [ "$WRITE_ENV" = "1" ]; then
  # Piped on stdin, never in argv: `ps` on a shared box must not show the key.
  printf 'SUPABASE_URL=%s\nSUPABASE_SERVICE_ROLE_KEY=%s\n' \
    "$SUPABASE_URL" "$SUPABASE_SERVICE_ROLE_KEY" \
    | ssh "${SSH_ARGS[@]}" "$TARGET" \
        "install -m 600 /dev/stdin /etc/doppler-metrics-collector.env" || {
    warn "failed to install the env file"; exit 1; }
fi

ssh "${SSH_ARGS[@]}" "$TARGET" '
  set -e
  install -m 755 /tmp/metrics-collector.py /usr/local/bin/doppler-metrics-collector.py
  install -m 644 /tmp/doppler-metrics-collector.service /tmp/doppler-metrics-collector.timer \
                 /tmp/doppler-metrics-prune.service /tmp/doppler-metrics-prune.timer \
                 /etc/systemd/system/
  rm -f /tmp/metrics-collector.py /tmp/doppler-metrics-*.service /tmp/doppler-metrics-*.timer
  chmod 600 /etc/doppler-metrics-collector.env
  systemctl daemon-reload
  # enable --now on a TIMER is safe (it has no running instance to skip), but
  # restart the timers anyway so a changed interval actually takes effect.
  systemctl enable doppler-metrics-collector.timer doppler-metrics-prune.timer
  systemctl restart doppler-metrics-collector.timer doppler-metrics-prune.timer
  systemctl list-timers --no-pager doppler-metrics-\*
' >&2 || { warn "remote install failed"; exit 1; }

if [ -n "$DRY_RUN" ]; then
  warn "==> one dry sweep (no rows written)"
  ssh "${SSH_ARGS[@]}" "$TARGET" \
    "set -a; . /etc/doppler-metrics-collector.env; set +a;
     python3 /usr/local/bin/doppler-metrics-collector.py --dry-run" >&2 \
    || { warn "dry sweep failed"; exit 1; }
else
  warn "==> one real sweep to prove it writes"
  ssh "${SSH_ARGS[@]}" "$TARGET" \
    "systemctl start doppler-metrics-collector.service &&
     systemctl status --no-pager -n 20 doppler-metrics-collector.service" >&2 \
    || { warn "first sweep failed — check: journalctl -u doppler-metrics-collector -n 50"; exit 1; }
fi

warn ""
warn "Collector deployed to $TARGET."
warn "Watch it:    journalctl -fu doppler-metrics-collector"
warn "Timers:      systemctl list-timers 'doppler-metrics-*'"
warn "Verify rows: select count(*), max(sampled_at) from server_metrics;"
