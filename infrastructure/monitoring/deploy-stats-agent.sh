#!/usr/bin/env bash
# Deploy the Doppler stats agent to the bare-xray fleet.
#
# Usage:
#   ./deploy-stats-agent.sh                  # every node the fleet lookup returns
#   ./deploy-stats-agent.sh 20.46.122.212    # only these hosts (rollout is one node at a time)
#
# Prints one line per server on stdout: `<ip> <token>`. Feed those into
# vpn_servers.stats_agent_url (http://<ip>:9101/stats) and stats_agent_token.
# Everything else goes to stderr, so `./deploy-stats-agent.sh > pairs.txt` is clean.
#
# Fleet discovery reads Supabase (PostgREST) for every `vpn_servers` row with a
# stats_agent_url, so a node added to the table is picked up without editing this
# file. Deliberately NOT filtered on is_active: Netherlands and Russia are both
# inactive and both still need the agent. The stats_agent_url filter alone is
# what keeps Poland (Marzban, no agent) and Israel (no agent) out of the list.
# It needs, in the environment:
#   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)  e.g. https://fzlrhmjdjjzcgstaeblu.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY
# Without them it falls back to FALLBACK_FLEET below — a hand-maintained snapshot
# that cannot learn about new nodes. Treat a fallback run as "probably stale".
#
# A host that fails does not abort the run; the summary at the end names both
# lists and the script exits non-zero if anything failed.
set -uo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

# The nine vpn_servers rows that carry a stats_agent_url, read from the table on
# 2026-09-08. Used only when Supabase creds are absent; keep it in sync by hand,
# or better: export the two env vars above. The other two rows are deliberately
# absent — Poland 185.203.240.174 is a Marzban node and Israel 185.159.73.238 has
# no agent; neither should ever be deployed to from here.
FALLBACK_FLEET=(
  74.248.17.32     # Poland 2
  4.223.104.74     # Sweden
  172.202.18.40    # United States
  20.24.217.182    # Hong Kong
  20.151.116.180   # Canada
  20.46.122.212    # Japan
  20.203.125.164   # United Arab Emirates
  103.246.146.20   # Netherlands  — inactive, root login (see ssh_profile)
  72.56.36.147     # Russia       — inactive, admin login, DOWN as of 2026-09-08
)

warn() { printf '%s\n' "$*" >&2; }

# Per-host SSH profile. The fleet is not uniformly Azure, so nothing here may
# assume azureuser + sudo + ~/.ssh/id_rsa.
#   P_USER  login user
#   P_KEY   private key; empty (or missing on disk) means "let ~/.ssh/config and
#           the agent decide"
#   P_SUDO  "sudo" where we log in unprivileged, "" where we are already root
ssh_profile() {
  case "$1" in
    103.246.146.20)
      # Netherlands relay: root login with its own key. ~/.ssh/config also has a
      # `doppler-nl` alias for this box; the explicit key keeps this script
      # working on a machine whose ssh config lacks it.
      P_USER="${NL_SSH_USER:-root}"
      P_KEY="${NL_SSH_KEY:-$HOME/.ssh/doppler_nl_relay}"
      P_SUDO=""
      ;;
    72.56.36.147)
      # Russia: `admin` with passwordless sudo, own key. Expect this one to fail
      # until it is back up -- it was refusing connections on 2026-09-08. That is
      # what the per-host failure isolation below is for.
      P_USER="${RU_SSH_USER:-admin}"
      P_KEY="${RU_SSH_KEY:-$HOME/.ssh/iron_blog_ed25519}"
      P_SUDO="sudo"
      ;;
    *)
      # The seven Azure VMs.
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
  local url="${SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL:-}}"
  local key="${SUPABASE_SERVICE_ROLE_KEY:-}"
  if [ -z "$url" ] || [ -z "$key" ]; then
    warn "No SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in env — using FALLBACK_FLEET (may be stale)."
    printf '%s\n' "${FALLBACK_FLEET[@]}"
    return
  fi
  # No is_active filter -- see the header. stats_agent_url alone selects the fleet.
  local q="${url%/}/rest/v1/vpn_servers?select=ip_address&stats_agent_url=not.is.null"
  local body ips
  if ! body=$(curl -fsS --max-time 20 -H "apikey: $key" -H "Authorization: Bearer $key" "$q"); then
    warn "Supabase fleet query failed — using FALLBACK_FLEET (may be stale)."
    printf '%s\n' "${FALLBACK_FLEET[@]}"
    return
  fi
  ips=$(printf '%s' "$body" | tr ',' '\n' \
        | sed -n 's/.*"ip_address"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
  if [ -z "$ips" ]; then
    warn "Supabase returned no rows with a stats_agent_url — using FALLBACK_FLEET."
    printf '%s\n' "${FALLBACK_FLEET[@]}"
    return
  fi
  warn "Fleet from Supabase: $(printf '%s' "$ips" | tr '\n' ' ')"
  printf '%s\n' "$ips"
}

deploy_one() {
  local ip="$1" token target
  ssh_profile "$ip"
  target="$P_USER@$ip"

  # Reuse the server's existing token if it already has one, so redeploying the
  # agent (e.g. to ship the reachability probe) does NOT rotate the token and
  # desync vpn_servers.stats_agent_token. Only mint a new one on first deploy.
  # shellcheck disable=SC2029  # $P_SUDO must expand HERE, not on the server.
  token=$(ssh "${SSH_ARGS[@]}" "$target" \
    "$P_SUDO sed -n 's/^STATS_TOKEN=//p' /etc/doppler-stats-agent.env 2>/dev/null" 2>/dev/null || true)
  token="${token//[[:space:]]/}"
  if [ -z "$token" ]; then
    token=$(openssl rand -hex 24) || return 1
    warn "  $ip: no token on the box — minting a new one (update vpn_servers)"
  else
    warn "  $ip: reusing the existing token"
  fi

  scp -q "${SSH_ARGS[@]}" "$DIR/stats-agent.py" "$DIR/doppler-stats-agent.service" \
    "$target:/tmp/" || return 1

  # `enable --now` alone does nothing to an already-running unit, so a redeploy
  # would leave the OLD agent in memory: restart explicitly.
  # shellcheck disable=SC2029  # $P_SUDO and $token must expand HERE; the server
  # never sees the variables, only the values.
  ssh "${SSH_ARGS[@]}" "$target" "
    $P_SUDO install -m 755 /tmp/stats-agent.py /usr/local/bin/doppler-stats-agent.py &&
    printf 'STATS_TOKEN=%s\n' '$token' | $P_SUDO tee /etc/doppler-stats-agent.env >/dev/null &&
    $P_SUDO chmod 600 /etc/doppler-stats-agent.env &&
    $P_SUDO install -m 644 /tmp/doppler-stats-agent.service /etc/systemd/system/ &&
    $P_SUDO systemctl daemon-reload &&
    $P_SUDO systemctl enable doppler-stats-agent &&
    $P_SUDO systemctl restart doppler-stats-agent &&
    rm -f /tmp/stats-agent.py /tmp/doppler-stats-agent.service &&
    sleep 1 &&
    curl -sf -H 'Authorization: Bearer $token' http://127.0.0.1:9101/stats |
      grep -q '\"agent_version\": *2' &&
    echo 'AGENT OK (v2 responding)'
  " >&2 || return 1

  printf '%s %s\n' "$ip" "$token"
}

for f in stats-agent.py doppler-stats-agent.service; do
  [ -f "$DIR/$f" ] || { warn "missing $DIR/$f"; exit 1; }
done

FLEET=()
if [ "$#" -gt 0 ]; then
  for ip in "$@"; do FLEET+=("$ip"); done
  warn "Deploying to $# host(s) named on the command line."
else
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
