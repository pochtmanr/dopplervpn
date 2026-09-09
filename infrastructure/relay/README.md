# Supabase relay

A plain reverse proxy that lets the apps reach the Doppler control plane when
`https://fzlrhmjdjjzcgstaeblu.supabase.co` is unreachable.

## Why

Supabase's API hostname is Cloudflare-fronted. In Iran and Russia the block is on the
**SNI**, not the IP or the account — the TLS ClientHello carrying
`fzlrhmjdjjzcgstaeblu.supabase.co` (or any `*.supabase.co`) is dropped, so a user cannot
log in, cannot fetch the server list, and cannot connect *even though the VPN nodes
themselves are reachable*. The apps are locked out at the control plane, before the
tunnel ever starts.

A relay is a different hostname on a different IP that forwards the same requests to
Supabase. Nothing about the request changes — same path, same `apikey`, same
`Authorization`. Only the SNI the censor sees is different.

**Not a security boundary.** The relay holds no secrets, makes no auth decisions and can
read every request that passes through it, exactly like Supabase's own edge. Its only job
is to be reachable.

## Current relays

| id | host | IP | Status |
|---|---|---|---|
| `sb1` | `edge.simnetiq.xyz` | `103.246.146.20` (Netherlands, `doppler-nl`) | **LIVE since 2026-09-08.** Let's Encrypt cert issued, verified off-box: `get_client_flags` returns byte-identical output through the relay and direct. |

`edge.simnetiq.xyz` is a Namecheap BasicDNS A record (plain, never proxied). The apex
`simnetiq.xyz` is a separate Vercel site and was not touched.

**Known weakness of `sb1`, recorded rather than hidden.** `simnetiq` is also the string in
the iOS bundle id (`com.simnetiq.vpnreact`) and the support address
(`support@simnetiq.store`), so this hostname is discoverable from the App Store listing —
it is not the "boring, unrelated domain" the section below asks for. It was chosen to
unblock Iranian and Russian users the same day rather than wait on a new registration.
Treat it as relay #1 of several: `sb2` onward should sit on unrelated domains, registrars
and ASNs, and the client tries the whole list in order.

`sb1` shares its box with the Netherlands VPN exit node — see
`../xray/README.md`. That is deliberate: it is one bill, and the relay is a few hundred KB
of traffic per user per day.

## The one manual step to bring a relay online

```bash
# 1. Point an A record at the box, e.g.  sb1.example.com -> 103.246.146.20
#    Confirm:  dig +short sb1.example.com
# 2. On the box (ssh doppler-nl), set the host — this is the only edit:
sudo sed -i 's/^RELAY_HOST=.*/RELAY_HOST=sb1.example.com/' /etc/caddy/relay.env
# 3. Reload:
sudo systemctl reload caddy
```

Caddy gets a Let's Encrypt cert on the first request (80/443 already open in ufw).
Verify from off-box:

```bash
curl -s https://sb1.example.com/rest/v1/ -H 'apikey: <anon key>' | head -c 200
curl -s https://sb1.example.com/            # -> bland plain-text 404
```

**Never put the relay behind Cloudflare's orange cloud.** That reintroduces exactly the
SNI surface the relay exists to route around. Grey-cloud / plain A record only.

**Pick a boring, unrelated domain.** A hostname containing `supabase`, `doppler` or `vpn`
is trivially enumerable and will be blocked as fast as it is found. Different relays
should sit on different registrars and different ASNs so one takedown does not remove all
of them.

## The Caddyfile

Live copy at `/etc/caddy/Caddyfile` on `doppler-nl`. Reproduced here so a new relay can be
stood up from this repo:

```caddyfile
{
	# The admin API must stay ON: `systemctl reload caddy` is an admin-API call, and
	# `admin off` makes it fail with "dial tcp 127.0.0.1:2019: connection refused".
	# Bind it to a root-owned unix socket instead of TCP 2019.
	admin unix//run/caddy/admin.sock
	servers {
		timeouts {
			read_body   30s
			read_header 10s
			write       30s
			idle        60s
		}
	}
}

(relay) {
	encode gzip

	# Status + latency only. remote_ip, request headers (which carry `apikey` /
	# `Authorization`) and response headers are filtered out before the line is
	# written. Goes to stderr -> journald. Same posture as xray's "access": "none".
	log {
		output stderr
		format filter {
			wrap console
			fields {
				request>remote_ip   delete
				request>remote_port delete
				request>client_ip   delete
				request>headers     delete
				resp_headers        delete
				user_id             delete
			}
		}
	}

	# Bland 404 on / so a casual probe sees a boring site, not a Supabase mirror.
	@root path /
	handle @root {
		header Content-Type "text/plain; charset=utf-8"
		respond "Not Found" 404
	}

	handle {
		request_body {
			max_size 2MB
		}
		# `apikey` and `Authorization` pass through untouched. Only Host is
		# rewritten (Supabase routes on it, and it doubles as the upstream SNI),
		# and X-Forwarded-For is stripped so client IPs never leave the box.
		reverse_proxy https://fzlrhmjdjjzcgstaeblu.supabase.co {
			header_up Host fzlrhmjdjjzcgstaeblu.supabase.co
			header_up -X-Forwarded-For
			transport http {
				tls
				tls_server_name fzlrhmjdjjzcgstaeblu.supabase.co
				dial_timeout 10s
				response_header_timeout 30s
			}
		}
	}
}

# Public relay site — generated from RELAY_HOST; absent while RELAY_HOST is empty.
import /etc/caddy/sites-enabled/*.caddy

# Always-on loopback test listener — same proxy logic, plain HTTP, 127.0.0.1 only.
http://127.0.0.1:8080 {
	bind 127.0.0.1
	import relay
}
```

### Why the public site block is a generated file

Caddy's `{$RELAY_HOST:fallback}` placeholder falls back only when the variable is
**unset**. systemd's `EnvironmentFile` sets it to the *empty string*, which expands to an
empty site key and Caddy refuses to start:

```
Error: adapting config using caddyfile: server block without any key is global
configuration, and if used, it must be first
```

So instead of a placeholder, `/usr/local/bin/doppler-relay-site.sh` reads `RELAY_HOST`
from `/etc/caddy/relay.env` and writes (or deletes) `/etc/caddy/sites-enabled/relay.caddy`.
It is wired into `caddy.service` by a drop-in as both `ExecStartPre` and the first
`ExecReload` step, `+`-prefixed so it runs as root past the unit's `ProtectSystem=full`:

```ini
[Service]
RuntimeDirectory=caddy
RuntimeDirectoryMode=0750
ExecStartPre=+/usr/local/bin/doppler-relay-site.sh
ExecReload=
ExecReload=+/usr/local/bin/doppler-relay-site.sh
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile --force --address unix//run/caddy/admin.sock
```

Net effect: an empty `RELAY_HOST` means no public site block exists at all, so Caddy never
requests a certificate for a domain nobody has registered.

### Testing without a domain

The loopback listener runs the identical `(relay)` snippet over plain HTTP:

```bash
# upstream answered -> PostgREST 401 JSON (path passthrough works)
curl -s http://127.0.0.1:8080/rest/v1/ -H 'apikey: x'

# path + POST method passthrough
curl -s -X POST http://127.0.0.1:8080/rest/v1/rpc/get_client_flags \
     -H 'Content-Type: application/json' -H 'apikey: x' -d '{}'
```

Both must return Supabase's own JSON (`{"message":"Invalid API key",...}`), which proves
the request reached PostgREST rather than being answered by Caddy. Verified on `sb1`
2026-09-06.

## Adding sb2

Diversity is the whole point — one relay is one blocklist entry away from useless.

1. Provision a VPS on a **different provider, ASN and country** from `sb1`.
2. `apt install caddy` from the official Cloudsmith repo.
3. Copy `/etc/caddy/Caddyfile`, `/etc/caddy/relay.env`,
   `/usr/local/bin/doppler-relay-site.sh` and the systemd drop-in from `sb1` (or from this
   file). Nothing in them is host-specific.
4. ufw: allow 22, 80, 443. Nothing else is needed for a relay-only box.
5. Point a **different** domain at it (different registrar; see the naming note above) and
   do the one edit + `systemctl reload caddy`.
6. Append the URL to `SUPABASE_RELAY_URLS` in every client.

Relays are stateless and interchangeable — there is no shared state to sync, and losing
one costs nothing but the entry in the client list.

## How the apps consume this

The clients keep an ordered list of base URLs: the canonical Supabase host first, then the
relays. On a network-level failure (connection refused, TLS failure, timeout — **not** an
HTTP error status; a 401 is a real answer and must not trigger failover) they retry the
same request against the next base URL and remember which one worked.

The list is a build-time constant, `SUPABASE_RELAY_URLS`:

- iOS / macOS — `dopplerswift/PulseVPN/Services/SupabaseServerService.swift`
- Android — `DopplerAndroid/app/src/main/kotlin/org/dopplervpn/android/services/ServerRepository.kt`
- Windows — `dopplerWindows/DopplerVPN/Services/SupabaseService.cs`

Implementation notes:

- **Only the base URL changes.** Path, method, body and the `apikey` / `Authorization`
  headers are byte-identical. If a relay needed a different request shape, it would be a
  second API to maintain and to break.
- **Order matters.** Canonical host first, so users who are not blocked never touch a
  relay and the relay stays cheap and low-profile.
- **Cache the winner, but re-probe.** Pin the working host for the session; re-try the
  canonical host on the next cold start, otherwise a user who travels out of a censored
  country is stuck on a relay forever.
- A relay URL going stale is harmless — it just fails and the next candidate is tried. So
  shipping a relay list slightly ahead of DNS is safe.

Related: `landing/infrastructure/xray/README.md` (the fleet), and the host-failover work
recorded in the `doppler-supabase-host-failover` memory note.
