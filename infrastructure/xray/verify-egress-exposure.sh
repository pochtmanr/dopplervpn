#!/usr/bin/env bash
# Doppler — READ-ONLY diagnostic: can a VPN client reach things it should not?
#
# Answers three separate questions, and reports them separately because they have
# different answers on different nodes:
#   A. link-local instance metadata  169.254.169.254   (the Azure fleet's real item)
#   B. the node's own loopback       127.0.0.1:<ports> (near-worthless on Azure, see below)
#   C. Poland specifically           127.0.0.1:8000    (the Marzban admin API)
#
# Makes NO changes anywhere. It does not restart anything, does not write to any
# node, and does not request an identity token — see the SAFETY note below.
#
# Usage:
#   ./verify-egress-exposure.sh --vless 'vless://UUID@IP:8443?...#tag' [--node-ip IP]
#   ./verify-egress-exposure.sh --client-config ./client.json --socks 127.0.0.1:10808 --node-ip IP
#   ./verify-egress-exposure.sh --on-node <host>
#
# The first two forms are the honest test: they build (or reuse) a throwaway local
# xray VLESS client, exactly the pattern the fleet's test-reality.sh uses, and then
# dial the targets THROUGH the tunnel with curl --socks5-hostname. That is the only
# way to ask the question, because a client's own OS short-circuits 127.0.0.1 to its
# own loopback — a TUN client can never test the node's loopback by typing
# "127.0.0.1", the packet never enters the tunnel. It has to be a proxied dial whose
# DESTINATION ADDRESS is 127.0.0.1, so that xray on the node is the one dialling.
#
# --on-node is the weak form. Read the caveat it prints. It cannot answer the
# question this script exists to ask.
#
# SAFETY — do not "improve" this:
#   * It probes /metadata/instance only. It must NEVER request
#     /metadata/identity/oauth2/token. Reaching the metadata endpoint is sufficient
#     to justify blocking link-local; whether these VMs even have a managed identity
#     assigned is unverified, and nobody should establish that by taking a token.
#   * Read-only. No config is written, no service touched.
set -uo pipefail

MODE=""; VLESS=""; CLIENT_CFG=""; SOCKS=""; NODE_IP=""; ON_NODE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --vless) MODE=client; VLESS="$2"; shift 2 ;;
    --client-config) MODE=client; CLIENT_CFG="$2"; shift 2 ;;
    --socks) SOCKS="$2"; shift 2 ;;
    --node-ip) NODE_IP="$2"; shift 2 ;;
    --on-node) MODE=node; ON_NODE="$2"; shift 2 ;;
    -h|--help) sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; exit 2 ;;
    *) printf 'unknown arg: %s\n' "$1" >&2; exit 2 ;;
  esac
done
[ -n "$MODE" ] || { sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; exit 2; }

hr()  { printf '%s\n' "------------------------------------------------------------"; }
head2(){ printf '\n== %s\n' "$*"; }

# =============================================================== on-node mode
if [ "$MODE" = node ]; then
  case "$ON_NODE" in
    doppler-poland|185.203.240.174) T=doppler-poland; SUDO="" ;;
    doppler-nl|103.246.146.20)      T=doppler-nl;     SUDO="" ;;
    *)                              T="${SSH_USER:-azureuser}@$ON_NODE"; SUDO="sudo" ;;
  esac
  cat <<'CAV'
READ THIS BEFORE READING THE OUTPUT
  Running from the node tells you what is LISTENING and what the node itself can
  reach. It does NOT tell you whether a VPN client can reach any of it, and the two
  are not the same question:
    * "connection refused" here means nothing is listening on the node. It does not
      mean a client is blocked — a client dialling that address would get the same
      refusal, from the node, having successfully been routed there.
    * "200 OK" here means the node can reach it. Whether a client can depends
      entirely on xray's routing rules, which is the thing being changed.
  The only test that answers the real question is --vless / --client-config.
CAV
  head2 "loopback listeners (ss -ltnp)"
  ssh -o StrictHostKeyChecking=accept-new "$T" "$SUDO ss -ltnp 2>/dev/null | awk 'NR==1 || \$4 ~ /^(127\\.|\\[::1\\])/'"
  head2 "all TCP listeners"
  ssh -o StrictHostKeyChecking=accept-new "$T" "$SUDO ss -ltn 2>/dev/null"
  head2 "link-local metadata reachable from the node itself?"
  ssh -o StrictHostKeyChecking=accept-new "$T" \
    "curl -s -o /dev/null -w 'HTTP %{http_code} in %{time_total}s\n' --max-time 5 -H 'Metadata: true' 'http://169.254.169.254/metadata/instance?api-version=2021-02-01' || echo 'no response'"
  head2 "xray egress posture in the live config"
  ssh -o StrictHostKeyChecking=accept-new "$T" "$SUDO jq -c '{top:keys, log, outbounds:[.outbounds[]|{tag,protocol}], routing_rules:[.routing.rules[]? | {ruleTag,outboundTag}], has_api:has(\"api\"), has_dns:has(\"dns\"), has_stats:has(\"stats\")}' /usr/local/etc/xray/config.json 2>/dev/null || $SUDO jq -c '{top:keys}' /var/lib/marzban/xray_config.json"
  head2 "interpretation"
  cat <<'INT'
  No routing rules at all  -> nothing is restricting egress; every result above that
                              is reachable from the node is also reachable from a
                              client, because xray will dial whatever it is asked to.
  block-private present    -> re-run in --vless mode to confirm it actually bites.
INT
  exit 0
fi

# =============================================================== client mode
command -v xray >/dev/null || { echo "need xray on PATH to build the throwaway client" >&2; exit 2; }
command -v curl >/dev/null || { echo "need curl" >&2; exit 2; }

WORK="$(mktemp -d)"
CLEAN_PID=""
cleanup() { [ -n "$CLEAN_PID" ] && kill "$CLEAN_PID" 2>/dev/null; rm -rf "$WORK"; }
trap cleanup EXIT

if [ -z "$CLIENT_CFG" ]; then
  # ---- parse vless://UUID@host:port?query#tag into a throwaway socks->vless client
  U="${VLESS#vless://}"; TAGLESS="${U%%#*}"
  CRED="${TAGLESS%%\?*}"; QS="${TAGLESS#*\?}"; [ "$QS" = "$TAGLESS" ] && QS=""
  UUID="${CRED%%@*}"; HOSTPORT="${CRED##*@}"
  VHOST="${HOSTPORT%%:*}"; VPORT="${HOSTPORT##*:}"
  q() { printf '%s' "$QS" | tr '&' '\n' | sed -n "s/^$1=//p" | head -1 \
        | sed 's/%2F/\//g; s/%3A/:/g; s/%2C/,/g'; }
  SNI="$(q sni)"; PBK="$(q pbk)"; SID="$(q sid)"; FP="$(q fp)"; FLOW="$(q flow)"
  [ -n "$UUID" ] && [ -n "$VHOST" ] && [ -n "$VPORT" ] && [ -n "$PBK" ] \
    || { echo "could not parse the vless:// URI (need uuid, host, port, pbk)" >&2; exit 2; }
  [ -n "$NODE_IP" ] || NODE_IP="$VHOST"
  SOCKS="${SOCKS:-127.0.0.1:11080}"
  SPORT="${SOCKS##*:}"
  # Built outside the heredoc: an unquoted here-document does NOT unescape \" , so
  # inlining ${FLOW:+...} with escaped quotes emits literal backslashes and xray
  # rejects the config. (Found the hard way, 2026-09-08.)
  FLOWJSON=""
  [ -n "$FLOW" ] && FLOWJSON=", \"flow\": \"$FLOW\""
  cat > "$WORK/client.json" <<EOF
{
  "log": {"loglevel": "warning", "access": "none"},
  "inbounds": [{"tag":"s","listen":"127.0.0.1","port":$SPORT,"protocol":"socks",
                "settings":{"auth":"noauth","udp":false}}],
  "outbounds": [{
    "tag":"proxy","protocol":"vless",
    "settings":{"vnext":[{"address":"$VHOST","port":$VPORT,
      "users":[{"id":"$UUID","encryption":"none"$FLOWJSON}]}]},
    "streamSettings":{"network":"tcp","security":"reality",
      "realitySettings":{"serverName":"${SNI}","publicKey":"$PBK",
                         "shortId":"${SID}","fingerprint":"${FP:-chrome}"}}
  }]
}
EOF
  CLIENT_CFG="$WORK/client.json"
  xray -test -c "$CLIENT_CFG" >/dev/null 2>&1 || { echo "generated client config failed xray -test" >&2; xray -test -c "$CLIENT_CFG"; exit 2; }
  xray run -c "$CLIENT_CFG" >"$WORK/xray.log" 2>&1 &
  CLEAN_PID=$!
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    (exec 3<>/dev/tcp/127.0.0.1/"$SPORT") 2>/dev/null && break
    command sleep 0.3 2>/dev/null || :
  done
fi
[ -n "$SOCKS" ] || { echo "--socks is required with --client-config" >&2; exit 2; }

P=(--socks5-hostname "$SOCKS" -s --max-time 8)

printf 'node under test : %s\n' "${NODE_IP:-<unknown>}"
printf 'local socks     : %s\n' "$SOCKS"
printf 'read-only       : yes. nothing is written, no token is ever requested.\n'

# ---------------------------------------------------------- CONTROL (mandatory)
head2 "CONTROL — is the tunnel actually up and exiting at the node?"
EXIT_IP="$(curl "${P[@]}" https://ifconfig.me/ip 2>/dev/null || true)"
printf '  exit IP via tunnel : %s\n' "${EXIT_IP:-<no answer>}"
if [ -z "$EXIT_IP" ]; then
  hr; echo "ABORT: the control probe failed. Every result below would be meaningless —"
  echo "a failure could be the tunnel, not a block. Fix the client and re-run."
  echo; echo "throwaway client log:"; sed 's/^/    /' "$WORK/xray.log" 2>/dev/null | tail -20
  exit 1
fi
if [ -n "$NODE_IP" ] && [ "$EXIT_IP" != "$NODE_IP" ]; then
  hr; echo "ABORT: exit IP $EXIT_IP != node IP $NODE_IP. You are not testing the node you think."
  exit 1
fi
echo "  control OK — from here, 'no answer' is evidence of a block, not of a broken tunnel."

# ------------------------------------------------- A. link-local metadata (IMDS)
head2 "A. link-local instance metadata — 169.254.169.254"
IMDS_BODY="$(curl "${P[@]}" -H 'Metadata: true' \
  'http://169.254.169.254/metadata/instance?api-version=2021-02-01' 2>/dev/null || true)"
if printf '%s' "$IMDS_BODY" | grep -q '"compute"'; then
  echo "  RESULT: EXPOSED. A VPN client reached the instance metadata service and got"
  echo "          a real instance document back. Proof, not inference:"
  printf '%s' "$IMDS_BODY" | head -c 300 | sed 's/^/            /'; echo
  echo "  Severity, stated honestly: link-local is reachable and blocking it is free."
  echo "  Whether this VM has a managed identity assigned is UNVERIFIED. Do not claim"
  echo "  credential theft, and do not go and take a token to find out."
elif [ -n "$IMDS_BODY" ]; then
  echo "  RESULT: reachable, unexpected body (see below). Treat as EXPOSED."
  printf '%s' "$IMDS_BODY" | head -c 200 | sed 's/^/            /'; echo
else
  echo "  RESULT: no answer. With the control passing, this is consistent with the"
  echo "          block-private rule doing its job. It is NOT proof on its own —"
  echo "          a non-Azure host has no IMDS to answer in the first place (the"
  echo "          Netherlands node is one). Cross-check against the node type."
fi

# ------------------------------------------------------ B. node loopback (oracle)
head2 "B. node loopback — 127.0.0.1"
echo "  Oracle probe first: 127.0.0.1:22. sshd is listening on every node, and it"
echo "  emits its version banner before it cares that the input was not SSH. So a"
echo "  banner here is unambiguous proof that a client reached the node's loopback."
BANNER="$(curl "${P[@]}" --http0.9 http://127.0.0.1:22/ 2>/dev/null | head -c 120 || true)"
if printf '%s' "$BANNER" | grep -q '^SSH-'; then
  echo "  RESULT: EXPOSED — got a live banner from the node's own loopback:"
  printf '            %s\n' "$(printf '%s' "$BANNER" | head -1)"
else
  echo "  RESULT: no banner. With the control passing this is consistent with a block."
fi
echo
echo "  Port sweep (INFORMATIONAL — these results are ambiguous by nature: an empty"
echo "  reply means either 'blackholed by xray' or 'the node dialled it and nothing"
echo "  was listening'. Only a BODY proves reachability. On the Azure nodes the only"
echo "  loopback listener is systemd-resolved on 127.0.0.53:53, so expect nothing"
echo "  here even when loopback is wide open — that is why :22 above is the oracle.)"
for port in 22 53 80 443 3060 5678 8000 8080 9090 9101 10085 23246 33765 62050 62051; do
  body="$(curl "${P[@]}" --http0.9 -o - -w '' "http://127.0.0.1:$port/" 2>/dev/null | head -c 60 || true)"
  code="$(curl "${P[@]}" -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/" 2>/dev/null || true)"
  if [ -n "$body" ] || { [ -n "$code" ] && [ "$code" != "000" ]; }; then
    printf '    127.0.0.1:%-6s REACHED  http=%s  %s\n' "$port" "${code:-000}" "$(printf '%s' "$body" | tr -d '\r\n' | head -c 50)"
  else
    printf '    127.0.0.1:%-6s no answer (ambiguous)\n' "$port"
  fi
done
echo "  Also worth knowing: 127.0.0.53:53 (systemd-resolved) is the one loopback"
echo "  listener the Azure nodes have. Reaching it is not itself interesting; it is"
echo "  simply the cheapest confirmation that loopback routing is unrestricted."
RESOLVED="$(curl "${P[@]}" --http0.9 http://127.0.0.53:53/ -o /dev/null -w '%{http_code}' 2>/dev/null || true)"
printf '    127.0.0.53:53 -> curl http_code %s (000 = no HTTP, expected; it is a DNS port)\n' "${RESOLVED:-000}"

# ------------------------------------------------------------- C. Poland special
head2 "C. Poland — 127.0.0.1:8000, the Marzban admin API"
if [ "$NODE_IP" = "185.203.240.174" ]; then
  echo "  This node is Poland. Loopback exposure here is materially worse than on the"
  echo "  Azure boxes: 8000 is the Marzban admin API, bound to loopback precisely so"
  echo "  that it is not exposed, plus 23246 and 33765. (3060/admin, 5678/n8n and"
  echo "  nginx on 80/443/9090 are bound to 0.0.0.0 and reachable from the internet"
  echo "  regardless — they are not incremental exposure and this rule is not what"
  echo "  protects them.)"
  for port in 8000 23246 33765; do
    code="$(curl "${P[@]}" -o "$WORK/b.$port" -w '%{http_code}' "http://127.0.0.1:$port/" 2>/dev/null || true)"
    if [ -n "$code" ] && [ "$code" != "000" ]; then
      printf '    127.0.0.1:%-6s EXPOSED  http=%s  %s\n' "$port" "$code" "$(head -c 80 "$WORK/b.$port" 2>/dev/null | tr -d '\r\n')"
    else
      printf '    127.0.0.1:%-6s no answer (consistent with a block)\n' "$port"
    fi
  done
  code8000="$(curl "${P[@]}" -o /dev/null -w '%{http_code}' 'http://127.0.0.1:8000/docs' 2>/dev/null || true)"
  printf '    127.0.0.1:8000/docs -> http=%s  (a 200 here is the Marzban admin API answering a VPN client)\n' "${code8000:-000}"
else
  echo "  Skipped: this is not Poland (185.203.240.174). Nothing on this node's"
  echo "  loopback is known to be interesting — see B."
fi

hr
echo "Done. Nothing was changed. Re-run this after apply-node-baseline.sh; the"
echo "A/B/C sections flipping to 'no answer' with the CONTROL still passing is the"
echo "evidence that the block rules bite."
