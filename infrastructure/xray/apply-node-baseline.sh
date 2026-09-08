#!/usr/bin/env bash
# Doppler — apply node-baseline.json to ONE exit node, ONE stage at a time.
#
#   ./apply-node-baseline.sh --stage 1 <host>      additive: api/stats/policy + block rules
#   ./apply-node-baseline.sh --stage 2 <host>      the DNS change (needs stage 1 verified first)
#   ./apply-node-baseline.sh --stage N --dry-run <host>       merge + xray -test, write nothing
#   ./apply-node-baseline.sh --merge-only <file> <bare|marzban> <1|2>    offline merge to stdout
#
# Options:
#   --allow-existing            proceed even if the node's starting shape is not the fleet default
#   --accept-untested-version   proceed on an xray version this fragment has not been validated on
#                               (the in-binary `xray -test` gate below still has to pass)
#
# WHY TWO STAGES. Stage 1 is purely additive — new api block, new inbound, new
# blackhole outbound, new rules. It cannot change how traffic that works today is
# resolved or dialled, and it is expected on every node. Stage 2 changes how the node
# resolves EVERY destination for EVERY user. Keeping them apart means a DNS-shaped
# regression rolls back the DNS change alone and leaves the api block and the abuse
# rules in place. Two backups, two rollback paths, two verification runs.
#
# One host per invocation, on purpose. Verify with ./verify-node-baseline.sh before
# touching the next node. There is no fleet loop and there will not be one.
#
# SSH conventions mirror ../monitoring/deploy-stats-agent.sh:
#   Azure fleet        azureuser@<ip> + sudo          bare xray-core
#   Netherlands        ssh doppler-nl   (root)        bare xray-core
#   Poland             ssh doppler-poland (root)      Marzban in Docker  <-- different branch
#
# Exit codes: 0 applied/ok, 1 refused or failed (config restored), 2 usage.
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
FRAGMENT="$DIR/node-baseline.json"
STAMP="$(date +%Y%m%d%H%M%S)"
STATE=/etc/doppler-xray-baseline.state

# xray versions this fragment has been validated against. 26.3.27 was validated by
# assembling a full synthetic config (fragment + six representative REALITY inbounds)
# and running `xray -test` on it, with and without the geo assets present.
# Poland runs 24.12.31 — roughly nine months older — and is NOT on this list.
KNOWN_GOOD_VERSIONS="26.3.27"

die()  { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
note() { printf '  %s\n' "$*"; }
step() { printf '\n== %s\n' "$*"; }
usage(){ sed -n '2,22p' "$0" | sed 's/^# \{0,1\}//'; exit 2; }

# ---------------------------------------------------------------- jq merge
# $frag  = node-baseline.json, $profile = bare|marzban, $stage = 1|2
read -r -d '' MERGE_JQ <<'JQ' || true
def stripc:
  if type == "object" then
    reduce (to_entries[] | select(.key | startswith("_") | not)) as $e
      ({}; .[$e.key] = ($e.value | stripc))
  elif type == "array" then map(stripc)
  else . end;

($frag.stage1 | stripc) as $S1
| ($frag.stage2 | stripc) as $S2
| ["api-inbound","block-private","block-bittorrent","block-smtp"] as $OURRULES
| $frag.stage2._outbound_patch as $P
| $live
| if $stage == "1" then
    # log: forced to the mandated value (runbook 2c). Never inherited.
      .log = $S1.log
    # inbounds: drop a previously applied api inbound, then append ours (bare only).
    | .inbounds = (((.inbounds // []) | map(select(.tag != "api")))
                   + (if $profile == "bare" then $S1.inbounds else [] end))
    # outbounds: drop a previously applied block, then append. The freedom outbound
    # is NOT touched here — that is stage 2's only structural change.
    | .outbounds = (((.outbounds // []) | map(select(.tag != "block"))) + $S1.outbounds)
    # routing: our rules first, in order; every pre-existing non-baseline rule kept
    # below. domainStrategy is only filled in if absent, so re-running stage 1 on a
    # node that already has stage 2 does not downgrade IPIfNonMatch back to AsIs.
    | .routing = ((.routing // {})
        | .domainStrategy = (.domainStrategy // $S1.routing.domainStrategy)
        | .rules = (($S1.routing.rules
                     | map(select($profile == "bare" or .ruleTag != "api-inbound")))
                    + ((.rules // []) | map(. as $r | select(($OURRULES | index($r.ruleTag // "")) == null)))))
    | if $profile == "bare" then
          .api = $S1.api
        | .stats = $S1.stats
        | .policy = ((.policy // {})
            | .levels = ((.levels // {}) | .["0"] = ((.["0"] // {}) + $S1.policy.levels["0"]))
            | .system = ((.system // {}) + $S1.policy.system))
      else . end
  else
    # Stage 2: the three pieces that only make sense together. Adds no rules,
    # reorders nothing, touches no inbound.
      .dns = $S2.dns
    | .routing = ((.routing // {}) | .domainStrategy = $S2.routing.domainStrategy)
    | .outbounds = ((.outbounds // [])
        | map(if .tag == $P.tag and .protocol == "freedom"
              then .settings = ((.settings // {}) + $P.settings) else . end))
  end
JQ

merge_local() {   # merge_local <live.json> <profile> <stage>  -> merged json on stdout
  jq --slurpfile _f "$FRAGMENT" --arg profile "$2" --arg stage "$3" \
     '. as $live | $_f[0] as $frag | '"$MERGE_JQ" "$1"
}

# ---------------------------------------------------------------- offline mode
if [ "${1:-}" = "--merge-only" ]; then
  [ $# -eq 4 ] || die "--merge-only needs <file> <bare|marzban> <1|2>"
  [ -f "$2" ] || die "no such file: $2"
  merge_local "$2" "$3" "$4"
  exit 0
fi

# ---------------------------------------------------------------- arg parsing
DRY=0; ALLOW_EXISTING=0; ACCEPT_VER=0; STAGE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --stage) STAGE="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    --allow-existing) ALLOW_EXISTING=1; shift ;;
    --accept-untested-version) ACCEPT_VER=1; shift ;;
    -h|--help) usage ;;
    --*) die "unknown option: $1" ;;
    *) break ;;
  esac
done
case "$STAGE" in
  1|2) ;;
  "") printf 'ERROR: --stage 1 or --stage 2 is required.\n' >&2
      printf 'Stage 1 is additive and goes on every node. Stage 2 is the DNS change and\n' >&2
      printf 'is a separate decision. See node-baseline.json and README.md.\n' >&2; exit 2 ;;
  *)  die "--stage must be 1 or 2, got '$STAGE'" ;;
esac
[ $# -eq 1 ] || { printf 'ERROR: exactly one host, got %d.\n' "$#" >&2
                  printf 'This script applies to ONE node per run, on purpose.\n' >&2; exit 2; }
HOST="$1"
case "$HOST" in *[[:space:],]*) die "'$HOST' looks like a list. One host per run." ;; esac

# ---------------------------------------------------------------- host profile
case "$HOST" in
  doppler-poland|185.203.240.174)
    SSH_TARGET="doppler-poland"; SUDO=""; PROFILE="marzban"
    CFG="/var/lib/marzban/xray_config.json" ;;
  doppler-nl|103.246.146.20)
    SSH_TARGET="doppler-nl"; SUDO=""; PROFILE="bare"
    CFG="/usr/local/etc/xray/config.json" ;;
  *)
    SSH_TARGET="${SSH_USER:-azureuser}@$HOST"; SUDO="sudo"; PROFILE="bare"
    CFG="/usr/local/etc/xray/config.json" ;;
esac
SSH=(ssh -o StrictHostKeyChecking=accept-new "$SSH_TARGET")

printf 'host      %s\n' "$HOST"
printf 'ssh       %s%s\n' "$SSH_TARGET" "${SUDO:+  (sudo)}"
printf 'profile   %s\n' "$PROFILE"
printf 'stage     %s  (%s)\n' "$STAGE" \
  "$([ "$STAGE" = 1 ] && echo 'additive: api/stats/policy + block rules' || echo 'DNS change: dns block + freedom domainStrategy + IPIfNonMatch')"
printf 'config    %s\n' "$CFG"
printf 'backup    %s.bak.stage%s.%s\n' "$CFG" "$STAGE" "$STAMP"
[ "$DRY" = 1 ] && printf 'mode      DRY RUN — nothing will be written\n'
BAK="$CFG.bak.stage$STAGE.$STAMP"

if [ "$PROFILE" = "marzban" ] && [ "$STAGE" = 1 ]; then
  cat <<'MZ'

  NOTE — Marzban node. Stage 1 here applies only: log, the `block` outbound, and the
  routing block rules. It deliberately does NOT apply api / stats / policy / the api
  dokodemo inbound. Marzban generates those itself at start (its own API_INBOUND on
  XRAY_API_PORT, its own stats and per-user policy) and injects the user list; a
  second copy in xray_config.json is at best duplicated and at worst a port
  collision. Per-user traffic on this node is already readable through the panel.

  Marzban also REGENERATES xray_config.json from its own panel state, which the
  bare-xray nodes never do. A hand-edit here — including this one — can be
  overwritten by a panel action in a way it cannot be on the Azure fleet. After this
  runs, open the panel's Core Config, confirm the rules are present and that there is
  exactly one api block, and re-check after any panel change.
MZ
fi

# ---------------------------------------------------------------- version gate
step "0/8  xray version gate"
if [ "$PROFILE" = "marzban" ]; then
  MZ_CT="$("${SSH[@]}" "docker ps --format '{{.Names}}' | grep -m1 -i marzban" || true)"
  [ -n "$MZ_CT" ] || die "no running marzban container found"
  note "marzban container: $MZ_CT"
  VER_RAW="$("${SSH[@]}" "docker exec $MZ_CT xray version 2>/dev/null | head -1" || true)"
else
  VER_RAW="$("${SSH[@]}" "$SUDO xray version 2>/dev/null | head -1" || true)"
fi
VER="$(printf '%s' "$VER_RAW" | awk '{print $2}')"
note "running: ${VER_RAW:-<could not read>}"
[ -n "$VER" ] || die "could not read the xray version — refusing to merge blind"
if ! printf '%s ' $KNOWN_GOOD_VERSIONS | grep -q " $VER "; then
  note "xray $VER is NOT in the validated list ($KNOWN_GOOD_VERSIONS)."
  note "Poland runs 24.12.31, roughly nine months behind the Azure fleet's 26.3.27."
  note "The fragment was validated by running xray -test on a full synthetic config"
  note "against 26.3.27 only. That says nothing about how an older core parses it."
  if [ "$ACCEPT_VER" = 0 ]; then
    die "refusing to merge onto an unvalidated xray version. Re-run with --accept-untested-version if you accept that the in-binary 'xray -test' below is the real gate."
  fi
  note "--accept-untested-version given: continuing. The xray -test that runs against"
  note "THIS binary, before anything restarts, is now the only thing standing between"
  note "you and a node that will not start. Do not skip step 4."
else
  note "version validated: OK"
fi

# ---------------------------------------------------------------- stage 2 gate
if [ "$STAGE" = 2 ]; then
  step "0b/8  stage-1-verified gate"
  ST="$("${SSH[@]}" "$SUDO cat $STATE 2>/dev/null" || true)"
  printf '%s' "$ST" | grep -q '^stage1_verified=' \
    || die "stage 1 has not been VERIFIED on this node ($STATE has no stage1_verified line).
       Run:  ./apply-node-baseline.sh --stage 1 $HOST
             ./verify-node-baseline.sh --stage 1 $HOST --vless 'vless://…'
       The verifier writes that line only on a clean pass. Stage 2 changes how every
       destination is resolved; doing that on a node whose additive stage was never
       confirmed working means a regression has two possible causes instead of one."
  note "$(printf '%s' "$ST" | grep '^stage1_verified=')"
fi

# ---------------------------------------------------------------- fetch + merge
step "1/8  fetch live config"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
"${SSH[@]}" "$SUDO cat $CFG" > "$WORK/live.json" || die "cannot read $CFG"
jq -e . "$WORK/live.json" >/dev/null || die "live config is not valid JSON — stop and look at it by hand"
note "$(wc -c < "$WORK/live.json") bytes"
note "inbounds: $(jq '.inbounds | length' "$WORK/live.json")  outbounds: $(jq '.outbounds | length' "$WORK/live.json")  routing rules: $(jq '.routing.rules // [] | length' "$WORK/live.json")"
note "log.access currently: $(jq -r '.log.access // "UNSET (= stdout = journald = a browsing history)"' "$WORK/live.json")"

step "2/8  starting-shape assertions"
# Swept 2026-09-08 across all seven Azure nodes (Poland 2, Sweden, United States,
# Hong Kong, Canada, Japan, UAE): the shape is byte-for-byte uniform. Top-level keys
# are exactly inbounds/log/outbounds. log.access is already "none" on all seven and
# `journalctl -u xray | grep -c " accepted "` is 0 on all seven, so the August
# access-log fix has held; the assertion later is a REGRESSION GUARD, not a fix.
# Deviation is signal: a node that does not match this is a node someone edited by
# hand, and it deserves a human look rather than an automated merge.
if [ "$PROFILE" = "marzban" ] || [ "$STAGE" = 2 ]; then ALLOW_EXISTING=1; fi
UNEXPECTED=$(jq -r '(keys - ["inbounds","log","outbounds"]) | join(",")' "$WORK/live.json")
if [ -n "$UNEXPECTED" ]; then
  note "top-level keys beyond inbounds/log/outbounds present: $UNEXPECTED"
  if [ "$ALLOW_EXISTING" = 0 ]; then
    die "unexpected starting shape (extra top-level keys: $UNEXPECTED). Read the config, then re-run with --allow-existing if it is fine."
  fi
  note "(expected here; our rules are PREPENDED above any existing ones)"
fi
if [ "$PROFILE" = "bare" ] && [ "$STAGE" = 1 ] && [ "$ALLOW_EXISTING" = 0 ]; then
  NIN=$(jq '.inbounds | length' "$WORK/live.json")
  NOUT=$(jq '.outbounds | length' "$WORK/live.json")
  [ "$NIN" = "6" ]  || die "expected exactly 6 inbounds, found $NIN — someone edited this node. Look at it."
  [ "$NOUT" = "1" ] || die "expected exactly 1 outbound, found $NOUT — someone edited this node. Look at it."
  [ "$(jq -r '.log.access // "UNSET"' "$WORK/live.json")" = "none" ] \
    || die "log.access is not already \"none\" on this node. That is a separate incident (runbook 2c) — fix it and understand why before layering this on top."
  note "starting shape matches the fleet baseline: 6 inbounds, 1 outbound, log.access=none"
fi
# Stage 2 has nothing to patch if the freedom outbound is not where we expect it, and
# the dns block would then be inert — which would make this change a lie.
FREEDOM=$(jq '[.outbounds[]? | select(.tag=="direct" and .protocol=="freedom")] | length' "$WORK/live.json")
[ "$FREEDOM" = "1" ] || die "expected exactly one freedom outbound tagged 'direct', found $FREEDOM. Look at the config by hand."
if [ "$STAGE" = 1 ] && [ "$PROFILE" = "bare" ]; then
  SNIFF=$(jq '[.inbounds[]? | select(.protocol=="vless") | select(.sniffing.enabled == true)] | length' "$WORK/live.json")
  VLESS=$(jq '[.inbounds[]? | select(.protocol=="vless")] | length' "$WORK/live.json")
  note "vless inbounds: $VLESS, with sniffing enabled: $SNIFF"
  [ "$SNIFF" = "$VLESS" ] || note "WARNING: block-bittorrent only works on inbounds with sniffing on."
  CLIENTS=$(jq '[.inbounds[]?.settings?.clients[]?] | length' "$WORK/live.json")
  EMAILS=$(jq '[.inbounds[]?.settings?.clients[]? | select(.email? // "" != "")] | length' "$WORK/live.json")
  note "vless clients: $CLIENTS, of which $EMAILS have an email"
  if [ "$EMAILS" -lt "$CLIENTS" ]; then
    note "NOTE: per-user counters will be EMPTY on this node. The stat key is"
    note "      user>>>{email}>>>traffic>>>uplink, so a client with no email produces no"
    note "      counter whatever policy says. Per-INBOUND counters are unaffected and are"
    note "      what monitoring should sum. Adding emails means editing a REALITY inbound,"
    note "      so this script does not do it — that is a later workstream's job."
  fi
fi

step "3/8  merge stage $STAGE"
merge_local "$WORK/live.json" "$PROFILE" "$STAGE" > "$WORK/new.json"
jq -e . "$WORK/new.json" >/dev/null || die "merge produced invalid JSON"
jq -S '[.inbounds[] | select(.tag != "api")]' "$WORK/live.json" > "$WORK/in.before"
jq -S '[.inbounds[] | select(.tag != "api")]' "$WORK/new.json"  > "$WORK/in.after"
cmp -s "$WORK/in.before" "$WORK/in.after" \
  || { diff -u "$WORK/in.before" "$WORK/in.after" | head -40; die "REALITY inbounds changed. Refusing."; }
note "REALITY inbounds byte-identical: OK ($(jq 'length' "$WORK/in.after") inbounds)"
[ "$(jq -r '.log.access' "$WORK/new.json")" = "none" ] || die "merged log.access is not \"none\""
note "log.access = none: OK"
note "routing.domainStrategy: $(jq -r '.routing.domainStrategy' "$WORK/new.json")"
note "routing rules: $(jq -r '[.routing.rules[] | .ruleTag // "(untagged)"] | join(", ")' "$WORK/new.json")"
[ "$STAGE" = 2 ] && note "direct outbound settings: $(jq -c '[.outbounds[]|select(.tag=="direct")][0].settings' "$WORK/new.json")"

step "4/8  xray -test the merged config, using the node's OWN binary, before anything restarts"
"${SSH[@]}" "cat > /tmp/xray-baseline-$STAMP.json" < "$WORK/new.json"
if [ "$PROFILE" = "marzban" ]; then
  "${SSH[@]}" "docker cp /tmp/xray-baseline-$STAMP.json $MZ_CT:/tmp/x.json && docker exec $MZ_CT xray -test -c /tmp/x.json" \
    || die "xray -test FAILED inside $MZ_CT (xray $VER) — nothing was changed. This is the gate doing its job."
else
  "${SSH[@]}" "$SUDO xray -test -c /tmp/xray-baseline-$STAMP.json" \
    || die "xray -test FAILED (xray $VER) — nothing was changed"
fi
note "xray -test on $VER: OK"

if [ "$DRY" = 1 ]; then
  step "dry run complete"
  note "merged config left on the node at /tmp/xray-baseline-$STAMP.json (delete it)"
  diff -u <(jq -S '{routing,outbounds,dns,api,stats,policy,log}' "$WORK/live.json") \
          <(jq -S '{routing,outbounds,dns,api,stats,policy,log}' "$WORK/new.json") || true
  exit 0
fi

# ---------------------------------------------------------------- apply
step "5/8  back up live config"
"${SSH[@]}" "$SUDO cp -a $CFG $BAK && $SUDO ls -l $BAK" || die "backup failed — refusing to continue"

reload() {
  if [ "$PROFILE" = "marzban" ]; then
    "${SSH[@]}" "marzban restart -n || docker restart $MZ_CT"
  else
    # xray-core has no config hot-reload and the packaged systemd unit has no
    # ExecReload, so this IS a restart: live sessions drop and reconnect. That is
    # precisely why HandlerService is enabled in stage 1 — future user add/remove
    # goes through the gRPC API and will not need this.
    "${SSH[@]}" "$SUDO systemctl restart xray"
  fi
}
restore() {
  printf '\n!! restoring %s and reloading\n' "$BAK" >&2
  "${SSH[@]}" "$SUDO cp -a $BAK $CFG" || printf '!! RESTORE FAILED — go look at the node NOW\n' >&2
  reload || printf '!! RELOAD AFTER RESTORE FAILED — go look at the node NOW\n' >&2
  printf '!! stage %s rolled back. Any other stage already on this node is untouched.\n' "$STAGE" >&2
  exit 1
}

step "6/8  install merged config"
"${SSH[@]}" "$SUDO install -m 600 -o root -g root /tmp/xray-baseline-$STAMP.json $CFG && $SUDO rm -f /tmp/xray-baseline-$STAMP.json" \
  || die "install failed — live config untouched"

step "7/8  reload"
reload || restore
sleep 3

step "8/8  verify"
FAIL=0
if [ "$PROFILE" = "marzban" ]; then
  "${SSH[@]}" "docker ps --filter name=$MZ_CT --filter status=running --format '{{.Names}}' | grep -q ." \
    || { note "FAIL: marzban container not running"; FAIL=1; }
else
  "${SSH[@]}" "systemctl is-active --quiet xray" || { note "FAIL: xray not active"; FAIL=1; }
  if [ "$STAGE" = 1 ]; then
    "${SSH[@]}" "$SUDO xray api statsquery --server=127.0.0.1:10085 >/dev/null 2>&1" \
      || { note "FAIL: xray api statsquery did not answer on 127.0.0.1:10085"; FAIL=1; }
  fi
fi
ACC="$("${SSH[@]}" "$SUDO jq -r '.log.access' $CFG")"
[ "$ACC" = "none" ] || { note "FAIL: log.access is '$ACC', not none"; FAIL=1; }
ACCEPTED="$("${SSH[@]}" "journalctl -u xray --since '-2 min' 2>/dev/null | grep -c ' accepted ' || true")"
[ "${ACCEPTED:-0}" = "0" ] || { note "FAIL: $ACCEPTED ' accepted ' lines in the journal — the access log is ON"; FAIL=1; }
[ "$FAIL" = 0 ] || restore

# Applying a stage invalidates its previous verification. The verifier re-stamps.
"${SSH[@]}" "$SUDO touch $STATE; $SUDO grep -v '^stage${STAGE}_verified=' $STATE > /tmp/bl.state 2>/dev/null || true; $SUDO cp /tmp/bl.state $STATE; $SUDO rm -f /tmp/bl.state; $SUDO chmod 644 $STATE" || true

printf '\nSTAGE %s APPLIED to %s. Backup: %s\n' "$STAGE" "$HOST" "$BAK"
printf 'Now run:  ./verify-node-baseline.sh --stage %s %s --vless '\''vless://...'\''\n' "$STAGE" "$HOST"
if [ "$STAGE" = 1 ]; then
  printf 'Stage 2 (the DNS change) will refuse to run until that verification passes.\n'
fi
printf 'Do not touch the next node until it passes.\n'
