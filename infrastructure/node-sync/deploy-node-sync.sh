#!/usr/bin/env bash
# Deploy doppler-node-sync to the VPN fleet.
#
# Usage:
#   ./deploy-node-sync.sh                    # every node the fleet lookup returns
#   ./deploy-node-sync.sh 20.46.122.212      # only these hosts (roll out ONE node first)
#   ENABLE_TIMER=0 ./deploy-node-sync.sh ... # install but leave the timer stopped
#
# Prints one line per server on stdout: `<ip> <node_token>`. Feed those into the
# per-server row the RPCs authenticate against (see README.md "Supabase RPC
# contract"). Everything else goes to stderr, so `./deploy-node-sync.sh > pairs.txt`
# is clean.
#
# Conventions are inherited from ../monitoring/deploy-stats-agent.sh:
#   * fleet discovery from Supabase, with a hand-maintained fallback list,
#   * per-host SSH profiles (azureuser+sudo on Azure, root on NL and Poland),
#   * TOKEN REUSE: an existing token on the box is never rotated, because
#     rotating it desyncs the database row and locks the node out of its RPCs.
#     A new token is minted only on a first deploy.
#   * a failing host does not abort the run; the summary names both lists and
#     the script exits non-zero if anything failed.
#
# Deliberately conservative defaults:
#   * the timer is installed ENABLED but the first manual run is a DRY RUN, so
#     `--apply` never happens before a human has read the diff;
#   * SYNC_PROXIES is on but no node has proxies attached yet, which is a no-op
#     by construction (see README "The zero-proxy guarantee").
set -uo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

SUPA_URL="${SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL:-}}"
SUPA_ANON="${SUPABASE_ANON_KEY:-${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}}"

# Snapshot of the fleet as of 2026-09-08, used only when Supabase creds are
# absent. Keep it in sync by hand, or better: export the env vars above.
FALLBACK_FLEET=(
  74.248.17.32
  4.223.104.74
  172.202.18.40
  20.24.217.182
  20.151.116.180
  20.46.122.212    # Japan
  20.203.125.164   # UAE
  103.246.146.20   # Netherlands — root login, not azureuser
)

warn() { printf '%s\n' "$*" >&2; }

# Per-host SSH profile. The fleet is not uniformly Azure, so nothing here may
# assume azureuser + sudo + ~/.ssh/id_rsa.
#   P_USER  login user
#   P_KEY   private key; empty (or missing on disk) means "let ~/.ssh/config and
#           the agent decide"
#   P_SUDO  "sudo" where we log in unprivileged, "" where we are already root
#   P_CFG   path to this node's xray config
#   P_KIND  bare | marzban
ssh_profile() {
  P_CFG="/usr/local/etc/xray/config.json"
  P_KIND="bare"
  case "$1" in
    103.246.146.20)
      # Netherlands relay: root login with its own key. ~/.ssh/config also has a
      # `doppler-nl` alias; the explicit key keeps this working on a machine
      # whose ssh config lacks it.
      P_USER="${NL_SSH_USER:-root}"
      P_KEY="${NL_SSH_KEY:-$HOME/.ssh/doppler_nl_relay}"
      P_SUDO=""
      ;;
    185.203.240.174)
      # Poland: the Marzban node. root login, and xray runs inside a Docker
      # container with its config at a different path. Marzban owns its own
      # user table and regenerates that file from it, so WS4 is FORCED OFF here
      # — see README "The Marzban node".
      P_USER="${PL_SSH_USER:-root}"
      P_KEY="${PL_SSH_KEY:-}"
      P_SUDO=""
      P_CFG="/var/lib/marzban/xray_config.json"
      P_KIND="marzban"
      ;;
    *)
      # Azure VMs.
      P_USER="${SSH_USER:-azureuser}"
      P_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
      P_SUDO="sudo"
      ;;
  esac
  SSH_ARGS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=10)
  if [ -n "$P_KEY" ]; then
    if [ -f "$P_KEY" ]; then
      SSH_ARGS+=(-i "$P_KEY")
    else
      warn "  $1: key $P_KEY not found — falling back to ssh-agent / ~/.ssh/config"
    fi
  fi
}

# Rows come back as compact JSON; pull ip_address out without requiring jq.
discover_fleet() {
  local key="${SUPABASE_SERVICE_ROLE_KEY:-}"
  if [ -z "$SUPA_URL" ] || [ -z "$key" ]; then
    warn "No SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in env — using FALLBACK_FLEET (may be stale)."
    printf '%s\n' "${FALLBACK_FLEET[@]}"
    return
  fi
  local q="${SUPA_URL%/}/rest/v1/vpn_servers?select=ip_address&is_active=eq.true"
  local body ips
  if ! body=$(curl -fsS --max-time 20 -H "apikey: $key" -H "Authorization: Bearer $key" "$q"); then
    warn "Supabase fleet query failed — using FALLBACK_FLEET (may be stale)."
    printf '%s\n' "${FALLBACK_FLEET[@]}"
    return
  fi
  ips=$(printf '%s' "$body" | tr ',' '\n' \
        | sed -n 's/.*"ip_address"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
  if [ -z "$ips" ]; then
    warn "Supabase returned no active rows — using FALLBACK_FLEET."
    printf '%s\n' "${FALLBACK_FLEET[@]}"
    return
  fi
  warn "Fleet from Supabase: $(printf '%s' "$ips" | tr '\n' ' ')"
  printf '%s\n' "$ips"
}

# The server_id the RPCs key on. Looked up from vpn_servers by ip_address so the
# operator never has to paste UUIDs by hand.
lookup_server_id() {
  local ip="$1" key="${SUPABASE_SERVICE_ROLE_KEY:-}"
  [ -n "$SUPA_URL" ] && [ -n "$key" ] || return 1
  curl -fsS --max-time 20 -H "apikey: $key" -H "Authorization: Bearer $key" \
    "${SUPA_URL%/}/rest/v1/vpn_servers?select=id&ip_address=eq.$ip" 2>/dev/null \
    | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1
}

deploy_one() {
  local ip="$1" token server_id target sync_users
  ssh_profile "$ip"
  target="$P_USER@$ip"

  server_id="$(lookup_server_id "$ip" || true)"
  if [ -z "$server_id" ]; then
    warn "  $ip: could not resolve vpn_servers.id — set SERVER_ID by hand in /etc/doppler-node-sync.env"
  fi

  # Reuse the node's existing token if it already has one. Rotating it would
  # desync the database row and lock the node out of its own RPCs.
  # shellcheck disable=SC2029  # $P_SUDO must expand HERE, not on the server.
  token=$(ssh "${SSH_ARGS[@]}" "$target" \
    "$P_SUDO sed -n 's/^NODE_SYNC_TOKEN=//p' /etc/doppler-node-sync.env 2>/dev/null" 2>/dev/null || true)
  token="${token//[[:space:]]/}"
  if [ -z "$token" ]; then
    token=$(openssl rand -hex 32) || return 1
    warn "  $ip: no token on the box — minting a new one (store it on the vpn_servers row)"
  else
    warn "  $ip: reusing the existing token"
    server_id=""   # already configured; do not clobber a hand-set SERVER_ID
  fi

  sync_users=1
  [ "$P_KIND" = "marzban" ] && sync_users=0

  scp -q "${SSH_ARGS[@]}" "$DIR/node_sync.py" "$DIR/doppler-node-sync.service" \
    "$DIR/doppler-node-sync.timer" "$target:/tmp/" || return 1

  # The env file is written key-by-key so a redeploy never drops an operator's
  # hand-edited toggle (TRANSITION_KEEP_SHARED_UUID above all).
  # shellcheck disable=SC2029  # every variable must expand HERE, not on the server.
  ssh "${SSH_ARGS[@]}" "$target" "
    set -e
    $P_SUDO install -m 755 /tmp/node_sync.py /usr/local/bin/doppler-node-sync.py
    $P_SUDO install -d -m 700 /var/backups/doppler-node-sync
    $P_SUDO touch /etc/doppler-node-sync.env
    $P_SUDO chmod 600 /etc/doppler-node-sync.env
    set_kv() {
      $P_SUDO grep -q \"^\$1=\" /etc/doppler-node-sync.env 2>/dev/null && return 0
      printf '%s=%s\n' \"\$1\" \"\$2\" | $P_SUDO tee -a /etc/doppler-node-sync.env >/dev/null
    }
    set_kv NODE_SYNC_TOKEN '$token'
    [ -n '$server_id' ] && set_kv SERVER_ID '$server_id'
    set_kv SUPABASE_URL '$SUPA_URL'
    set_kv SUPABASE_ANON_KEY '$SUPA_ANON'
    set_kv XRAY_CONFIG '$P_CFG'
    set_kv XRAY_API '127.0.0.1:10085'
    set_kv SYNC_USERS '$sync_users'
    set_kv SYNC_PROXIES '1'
    set_kv TRANSITION_KEEP_SHARED_UUID '1'
    $P_SUDO install -m 644 /tmp/doppler-node-sync.service /etc/systemd/system/
    $P_SUDO install -m 644 /tmp/doppler-node-sync.timer /etc/systemd/system/
    $P_SUDO systemctl daemon-reload
    rm -f /tmp/node_sync.py /tmp/doppler-node-sync.service /tmp/doppler-node-sync.timer
    echo 'INSTALLED'
  " >&2 || return 1

  # Always finish with a DRY RUN. It proves the env file, the RPCs and the
  # config parse all work, and it changes nothing.
  warn "  $ip: dry run —"
  # shellcheck disable=SC2029
  ssh "${SSH_ARGS[@]}" "$target" \
    "$P_SUDO env \$($P_SUDO cat /etc/doppler-node-sync.env | tr '\n' ' ') \
       /usr/bin/python3 /usr/local/bin/doppler-node-sync.py" >&2 \
    || warn "  $ip: DRY RUN REPORTED A PROBLEM — read the output above before enabling the timer"

  if [ "${ENABLE_TIMER:-1}" = "1" ]; then
    # shellcheck disable=SC2029
    ssh "${SSH_ARGS[@]}" "$target" \
      "$P_SUDO systemctl enable --now doppler-node-sync.timer && \
       $P_SUDO systemctl list-timers doppler-node-sync.timer --no-pager | head -3" >&2 || return 1
  else
    warn "  $ip: ENABLE_TIMER=0 — timer installed but NOT started"
  fi

  printf '%s %s\n' "$ip" "$token"
}

for f in node_sync.py doppler-node-sync.service doppler-node-sync.timer; do
  [ -f "$DIR/$f" ] || { warn "missing $DIR/$f"; exit 1; }
done
if [ -z "$SUPA_URL" ] || [ -z "$SUPA_ANON" ]; then
  warn "SUPABASE_URL / SUPABASE_ANON_KEY must be exported — the nodes need them to call the RPCs."
  exit 1
fi

FLEET=()
if [ "$#" -gt 0 ]; then
  for ip in "$@"; do FLEET+=("$ip"); done
  warn "Deploying to $# host(s) named on the command line."
else
  warn "No hosts named. Roll out to ONE node first and read its dry run before doing the fleet."
  while IFS= read -r line; do
    [ -n "$line" ] && FLEET+=("$line")
  done < <(discover_fleet)
fi
[ "${#FLEET[@]}" -gt 0 ] || { warn "no hosts to deploy to"; exit 1; }

OK_LIST=""; OK_N=0
FAIL_LIST=""; FAIL_N=0
for ip in "${FLEET[@]}"; do
  warn "==> $ip"
  if deploy_one "$ip"; then
    OK_LIST="$OK_LIST $ip"; OK_N=$((OK_N + 1))
  else
    warn "  $ip: FAILED"
    FAIL_LIST="$FAIL_LIST $ip"; FAIL_N=$((FAIL_N + 1))
  fi
done

warn ""
warn "Deployed ($OK_N):${OK_LIST:- none}"
warn "Failed   ($FAIL_N):${FAIL_LIST:- none}"
[ "$FAIL_N" -eq 0 ] || exit 1
