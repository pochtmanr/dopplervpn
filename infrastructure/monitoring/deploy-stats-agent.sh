#!/usr/bin/env bash
# Deploy the Doppler stats agent to the bare-xray fleet.
#
# Usage: ./deploy-stats-agent.sh [ip ...]
#   With no args, deploys to the full default fleet below.
#   Prints one line per server: <ip> <token>  — feed these into
#   vpn_servers.stats_agent_url / stats_agent_token (see README.md).
#
# Requires: ssh access as azureuser with sudo (key ~/.ssh/id_rsa).
set -euo pipefail

FLEET=(${@:-74.248.17.32 4.223.104.74 172.202.18.40 20.24.217.182 20.151.116.180})
DIR="$(cd "$(dirname "$0")" && pwd)"
SSH_USER="${SSH_USER:-azureuser}"

for ip in "${FLEET[@]}"; do
  token=$(openssl rand -hex 24)
  scp -q -o StrictHostKeyChecking=accept-new "$DIR/stats-agent.py" "$DIR/doppler-stats-agent.service" "$SSH_USER@$ip:/tmp/"
  ssh -o StrictHostKeyChecking=accept-new "$SSH_USER@$ip" "
    sudo install -m 755 /tmp/stats-agent.py /usr/local/bin/doppler-stats-agent.py &&
    printf 'STATS_TOKEN=%s\n' '$token' | sudo tee /etc/doppler-stats-agent.env >/dev/null &&
    sudo chmod 600 /etc/doppler-stats-agent.env &&
    sudo install -m 644 /tmp/doppler-stats-agent.service /etc/systemd/system/ &&
    sudo systemctl daemon-reload &&
    sudo systemctl enable --now doppler-stats-agent &&
    rm -f /tmp/stats-agent.py /tmp/doppler-stats-agent.service &&
    sleep 1 && curl -sf -H 'Authorization: Bearer $token' http://127.0.0.1:9101/stats >/dev/null &&
    echo 'AGENT OK'
  "
  echo "$ip $token"
done
