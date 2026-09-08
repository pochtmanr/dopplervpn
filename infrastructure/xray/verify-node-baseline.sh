#!/usr/bin/env bash
# Doppler — verify node-baseline.json on ONE node after apply-node-baseline.sh.
#
#   ./verify-node-baseline.sh --stage 1|2 <host> [--vless 'vless://...'] [--skip-handshake]
#
# On a clean pass (no FAIL) this writes ONE line into /etc/doppler-xray-baseline.state
# on the node: stage<N>_verified=<iso8601>. That is the only thing it writes, it is not
# a config file, and apply-node-baseline.sh --stage 2 refuses to run without the
# stage1_verified line. Applying a stage clears its own line, so a re-apply always
# needs a re-verify. (verify-egress-exposure.sh, by contrast, writes nothing at all.)
#
# Seven checks. 1-5 run over SSH on the node; 6-7 need a VLESS URI because they are
# client-side questions and cannot be answered from the node.
#
#   1  xray -test passes on the live config
#   2  the service is up and the six REALITY inbounds are still listening
#   3  all six inbounds still handshake end to end   (needs --vless, see below)
#   4  journalctl -u xray | grep -c " accepted "  is 0        (access log still off)
#   5  xray api statsquery returns data
#   6  the link-local metadata address is no longer reachable from a client
#   7  the node's loopback is no longer reachable from a client
#
# Check 3 follows the fleet's existing test-reality.sh pattern: a throwaway local
# xray socks client per inbound, curl --socks5-hostname to an echo service, assert
# the exit IP equals the node IP. If the node has its own /root/test-reality.sh
# (the Netherlands box does — it can hairpin) this delegates to it instead.
#
# Read-only. Changes nothing.
set -uo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
STATE=/etc/doppler-xray-baseline.state
HOST=""; VLESS=""; SKIP_HS=0; STAGE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --stage) STAGE="$2"; shift 2 ;;
    --vless) VLESS="$2"; shift 2 ;;
    --skip-handshake) SKIP_HS=1; shift ;;
    --*) printf 'unknown arg: %s\n' "$1" >&2; exit 2 ;;
    *) [ -z "$HOST" ] || { echo "one host per run" >&2; exit 2; }; HOST="$1"; shift ;;
  esac
done
[ -n "$HOST" ] || { sed -n '2,32p' "$0" | sed 's/^# \{0,1\}//'; exit 2; }
case "$STAGE" in 1|2) ;; *) echo "--stage 1 or --stage 2 is required" >&2; exit 2 ;; esac
case "$HOST" in *[[:space:],]*) echo "one host per run" >&2; exit 2 ;; esac

case "$HOST" in
  doppler-poland|185.203.240.174)
    T=doppler-poland; SUDO=""; PROFILE=marzban; NODE_IP=185.203.240.174
    CFG=/var/lib/marzban/xray_config.json ;;
  doppler-nl|103.246.146.20)
    T=doppler-nl; SUDO=""; PROFILE=bare; NODE_IP=103.246.146.20
    CFG=/usr/local/etc/xray/config.json ;;
  *)
    T="${SSH_USER:-azureuser}@$HOST"; SUDO="sudo"; PROFILE=bare; NODE_IP="$HOST"
    CFG=/usr/local/etc/xray/config.json ;;
esac
SSH=(ssh -o StrictHostKeyChecking=accept-new "$T")
PORTS="8443 8444 8445 8446 8447 8448"

PASS=0; FAIL=0; SKIP=0
ok()   { printf '  PASS  %s\n' "$*"; PASS=$((PASS+1)); }
bad()  { printf '  FAIL  %s\n' "$*"; FAIL=$((FAIL+1)); }
skip() { printf '  SKIP  %s\n' "$*"; SKIP=$((SKIP+1)); }
step() { printf '\n%s\n' "$*"; }

printf 'node    %s (%s, %s)\n' "$HOST" "$T" "$PROFILE"
printf 'stage   %s\n' "$STAGE"
printf 'config  %s\n' "$CFG"

# ------------------------------------------------------------------ 1 xray -test
step "1. xray -test on the live config"
if [ "$PROFILE" = marzban ]; then
  MZ="$("${SSH[@]}" "docker ps --format '{{.Names}}' | grep -m1 -i marzban" 2>/dev/null || true)"
  if [ -n "$MZ" ] && "${SSH[@]}" "docker exec $MZ xray -test -c $CFG" >/dev/null 2>&1; then
    ok "xray -test (inside $MZ)"
  else
    bad "xray -test failed inside the marzban container (or no container found)"
  fi
else
  if "${SSH[@]}" "$SUDO xray -test -c $CFG" >/dev/null 2>&1; then ok "xray -test"
  else bad "xray -test FAILED — restore the .bak and look"; fi
fi

# ------------------------------------------------------- 2 service + listeners
step "2. service up, six REALITY inbounds listening"
if [ "$PROFILE" = marzban ]; then
  if "${SSH[@]}" "docker ps --filter status=running --format '{{.Names}}' | grep -qi marzban"
  then ok "marzban container running"; else bad "marzban container not running"; fi
else
  if "${SSH[@]}" "systemctl is-active --quiet xray"; then ok "xray active"; else bad "xray not active"; fi
fi
LISTEN="$("${SSH[@]}" "$SUDO ss -ltn 2>/dev/null" || true)"
for p in $PORTS; do
  if printf '%s' "$LISTEN" | grep -qE "[:.]$p\b"; then ok "listening on $p"; else bad "NOT listening on $p"; fi
done
# The api inbound must be on loopback only. A 0.0.0.0 bind here is a serious finding.
if [ "$PROFILE" = bare ]; then
  if printf '%s' "$LISTEN" | grep -qE '127\.0\.0\.1:10085'; then
    ok "api inbound bound to 127.0.0.1:10085 only"
  elif printf '%s' "$LISTEN" | grep -qE '(0\.0\.0\.0|\*):10085'; then
    bad "api inbound is bound to a PUBLIC interface on 10085 — fix immediately"
  else
    bad "nothing listening on 10085 — the api inbound did not come up"
  fi
fi

# ------------------------------------------------------------- 3 handshake x6
step "3. all six inbounds still handshake (exit IP == node IP)"
if [ "$SKIP_HS" = 1 ]; then
  skip "handshake test (--skip-handshake)"
elif "${SSH[@]}" "test -x /root/test-reality.sh" 2>/dev/null; then
  echo "  node has its own /root/test-reality.sh (it can hairpin) — delegating"
  if "${SSH[@]}" "/root/test-reality.sh"; then ok "test-reality.sh on the node"
  else bad "test-reality.sh on the node reported a failure"; fi
elif [ -z "$VLESS" ]; then
  skip "handshake test — pass --vless 'vless://...' for one inbound, or run the node's own test-reality.sh"
elif ! command -v xray >/dev/null; then
  skip "handshake test — no local xray binary to build the throwaway client"
else
  # Same URI for all six ports: only the port, SNI and shortId differ per inbound, so
  # the operator must pass one URI per port to test them all. We test the port in the
  # URI properly, and report the rest as untested rather than pretending.
  WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
  U="${VLESS#vless://}"; TL="${U%%#*}"; CRED="${TL%%\?*}"; QS="${TL#*\?}"
  UUID="${CRED%%@*}"; HP="${CRED##*@}"; VH="${HP%%:*}"; VP="${HP##*:}"
  q() { printf '%s' "$QS" | tr '&' '\n' | sed -n "s/^$1=//p" | head -1; }
  cat > "$WORK/c.json" <<EOF
{"log":{"loglevel":"warning","access":"none"},
 "inbounds":[{"listen":"127.0.0.1","port":11081,"protocol":"socks","settings":{"auth":"noauth"}}],
 "outbounds":[{"tag":"proxy","protocol":"vless",
  "settings":{"vnext":[{"address":"$VH","port":$VP,
    "users":[{"id":"$UUID","encryption":"none","flow":"$(q flow)"}]}]},
  "streamSettings":{"network":"tcp","security":"reality",
    "realitySettings":{"serverName":"$(q sni)","publicKey":"$(q pbk)","shortId":"$(q sid)","fingerprint":"$(q fp)"}}}]}
EOF
  if ! xray -test -c "$WORK/c.json" >/dev/null 2>&1; then
    bad "could not build a valid client from the --vless URI"; xray -test -c "$WORK/c.json" 2>&1 | tail -3
  fi
  xray run -c "$WORK/c.json" >"$WORK/x.log" 2>&1 &
  HSPID=$!
  for _ in 1 2 3 4 5 6; do (exec 3<>/dev/tcp/127.0.0.1/11081) 2>/dev/null && break; done
  GOT="$(curl -s --max-time 10 --socks5-hostname 127.0.0.1:11081 https://ifconfig.me/ip || true)"
  kill "$HSPID" 2>/dev/null
  if [ "$GOT" = "$NODE_IP" ]; then ok "port $VP handshake, exit IP $GOT == node IP"
  else
    bad "port $VP handshake: exit IP '${GOT:-<none>}' != node IP $NODE_IP"
    sed 's/^/        /' "$WORK/x.log" | tail -15
  fi
  UNTESTED=""; for p in $PORTS; do [ "$p" = "$VP" ] || UNTESTED="$UNTESTED $p"; done
  skip "ports$UNTESTED — one --vless URI tests one inbound. Re-run per port, or use the node's test-reality.sh, before calling this node done."
fi

# ------------------------------------------------------------ 4 access log off
step "4. access log still off (regression guard — it was already off fleet-wide)"
ACC="$("${SSH[@]}" "$SUDO jq -r '.log.access // \"UNSET\"' $CFG" 2>/dev/null || echo ERR)"
if [ "$ACC" = "none" ]; then ok "log.access = none"; else bad "log.access = '$ACC'"; fi
N="$("${SSH[@]}" "journalctl -u xray 2>/dev/null | grep -c ' accepted ' || true")"
if [ "${N:-0}" = "0" ]; then ok "journalctl ' accepted ' count = 0"; else bad "journalctl ' accepted ' count = $N"; fi
if [ "$PROFILE" = marzban ]; then
  if "${SSH[@]}" "test ! -e /var/lib/marzban/access.log"
  then ok "/var/lib/marzban/access.log absent"; else bad "/var/lib/marzban/access.log exists"; fi
fi

# --------------------------------------------------------------- 5 stats api
step "5. xray api statsquery returns data (stage 1)"
if [ "$PROFILE" = marzban ]; then
  skip "statsquery — Marzban owns the api block on this node; read traffic from the panel/API"
else
  OUT="$("${SSH[@]}" "$SUDO xray api statsquery --server=127.0.0.1:10085 2>&1" || true)"
  if printf '%s' "$OUT" | grep -q '"name"'; then
    ok "statsquery answered ($(printf '%s' "$OUT" | grep -c '"name"') counters)"
    printf '%s' "$OUT" | grep '"name"' | head -6 | sed 's/^/        /'
    if printf '%s' "$OUT" | grep -q 'inbound>>>'; then ok "per-inbound counters present"
    else bad "no inbound>>> counters — check policy.system.statsInbound*"; fi
    # Deliberately OFF. The same bytes are already counted under inbound>>>, and a
    # consumer that sums every name ending in 'uplink' would double them. If these
    # appear, someone turned statsOutbound* back on — see the policy comment in
    # node-baseline.json before "fixing" the consumer.
    if printf '%s' "$OUT" | grep -q 'outbound>>>'; then
      bad "outbound>>> counters present — they are meant to be off (double-count risk)"
    else ok "outbound>>> counters absent, as intended"; fi
    if printf '%s' "$OUT" | grep -q 'user>>>'; then
      ok "per-user counters present"
    else
      skip "no user>>> counters. Expected if the VLESS clients have no 'email' field:
        the key is user>>>{email}>>>traffic>>>uplink, so no email means no counter,
        whatever policy.levels.0.statsUser* says. Per-inbound totals are unaffected."
    fi
  elif printf '%s' "$OUT" | grep -qi 'empty\|\[\]'; then
    skip "statsquery answered but returned nothing yet — send some traffic and re-run"
  else
    bad "statsquery did not answer: $(printf '%s' "$OUT" | head -2 | tr '\n' ' ')"
  fi
  # This is also the fix for the 2s the monitoring agent used to burn per request.
  TIMING="$("${SSH[@]}" "$SUDO sh -c 'S=\$(date +%s%N); xray api statsquery --server=127.0.0.1:10085 >/dev/null 2>&1; E=\$(date +%s%N); echo \$(( (E-S)/1000000 ))'" 2>/dev/null || echo "")"
  [ -n "$TIMING" ] && printf '        statsquery round trip: %s ms (it was ~3010 ms failing, before the api block)\n' "$TIMING"
fi

# ------------------------------------------------------- 5b stage-2 specifics
if [ "$STAGE" = 2 ]; then
  step "5b. the DNS change is actually in effect (not inert)"
  CFGJSON="$("${SSH[@]}" "$SUDO cat $CFG" 2>/dev/null || echo '{}')"
  DS="$(printf '%s' "$CFGJSON" | jq -r '.routing.domainStrategy // "unset"')"
  if [ "$DS" = "IPIfNonMatch" ]; then ok "routing.domainStrategy = IPIfNonMatch"
  else bad "routing.domainStrategy = $DS (expected IPIfNonMatch)"; fi
  FDS="$(printf '%s' "$CFGJSON" | jq -r '[.outbounds[]|select(.tag=="direct")][0].settings.domainStrategy // "unset"')"
  if [ "$FDS" = "UseIPv4" ]; then ok "direct/freedom domainStrategy = UseIPv4 (the dns block is NOT inert)"
  else bad "direct/freedom domainStrategy = $FDS — without this the dns block does nothing at all"; fi
  NS="$(printf '%s' "$CFGJSON" | jq -r '.dns.servers // [] | join(" ")')"
  if [ -n "$NS" ]; then ok "dns servers: $NS"; else bad "no dns block"; fi
  # If DoH is broken from this node, IPIfNonMatch stalls routing on unmatched
  # destinations. Cheapest proof it is not: resolve something through the tunnel.
  if [ -n "$VLESS" ]; then
    skip "DoH reachability is exercised by the CONTROL probe in section 6+7 below — a
        working exit IP lookup through the tunnel means resolution completed."
  else
    skip "DoH reachability — pass --vless so the control probe can exercise it"
  fi
fi

# --------------------------------------------------- 6/7 client-side exposure
step "6+7. metadata and loopback no longer reachable from a client"
if [ -n "$VLESS" ] && [ -x "$DIR/verify-egress-exposure.sh" ]; then
  echo "  delegating to verify-egress-exposure.sh (read-only)"
  "$DIR/verify-egress-exposure.sh" --vless "$VLESS" --node-ip "$NODE_IP" \
    | sed 's/^/  | /'
  echo "  Read the A/B/C sections above. The pass condition is: CONTROL passes AND"
  echo "  A/B/C all report no answer. A control failure invalidates the whole section."
else
  skip "exposure re-test — pass --vless to run verify-egress-exposure.sh against this node"
fi

printf '\n----------------------------------------\n'
printf 'PASS %d   FAIL %d   SKIP %d\n' "$PASS" "$FAIL" "$SKIP"
[ "$FAIL" = 0 ] || { echo "NOT OK — do not move to the next node."
                     [ "$STAGE" = 1 ] && echo "Stage 2 will keep refusing to run until this passes."
                     exit 1; }
[ "$SKIP" = 0 ] || echo "No failures, but there are SKIPs. A skip is not a pass — read them."

# The gate stage 2 reads. Written only here, only on a clean pass.
NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
# grep/mv rather than `sed -i`: no GNU-sed dependency, and it copes with the file
# not existing yet. Rewrites the whole file so re-verifying never appends a duplicate.
STATE_CMD="$SUDO touch $STATE; { $SUDO grep -v '^stage${STAGE}_verified=' $STATE || true; printf 'stage${STAGE}_verified=%s\n' '$NOW'; } | $SUDO tee $STATE.new >/dev/null; $SUDO mv $STATE.new $STATE; $SUDO chmod 644 $STATE"
if "${SSH[@]}" "$STATE_CMD"; then
  echo "stamped: stage${STAGE}_verified=$NOW in $STATE"
else
  echo "WARNING: could not write $STATE. Stage 2 will refuse to run until it exists."
fi
echo "Node verified for stage $STAGE. Wait, watch the monitor, then do the next one."
if [ "$STAGE" = 1 ]; then
  echo "Stage 2 (the DNS change) is now unblocked for this node — but it is a separate"
  echo "decision, not an automatic next step. See README.md."
fi
