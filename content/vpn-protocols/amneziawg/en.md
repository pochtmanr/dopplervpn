> **The short version.** AmneziaWG is a fork of WireGuard that keeps its speed and cryptography but changes the packet shapes and headers that make WireGuard easy to spot. It is a strong option where plain WireGuard is blocked, with one catch: it no longer talks to standard WireGuard servers once its obfuscation is on.

## What is AmneziaWG?

AmneziaWG is developed by the team behind [Amnezia VPN](https://amnezia.org/), an open-source app for running your own VPN server. The project's [Go implementation](https://github.com/amnezia-vpn/amneziawg-go) was started in 2023. It takes [WireGuard](/vpn-protocols/wireguard), which is fast and simple but has a fixed, recognisable handshake, and adds a layer that disguises it.

## What does it change?

The [AmneziaWG documentation](https://docs.amnezia.org/documentation/amnezia-wg/) describes several mechanisms, each controlled by configuration parameters:

- **Dynamic headers (H1–H4).** Standard WireGuard packets start with a fixed message type for each of its four packet formats. AmneziaWG replaces those values with numbers chosen from configured ranges, so two different setups do not share headers and no single filter rule matches them all.
- **Packet length randomisation (S1–S4).** In WireGuard the initial handshake packet is always exactly 148 bytes. AmneziaWG adds random prefixes to each packet type so sizes vary.
- **Junk packets (Jc, Jmin, Jmax).** Before the handshake, the client sends a configurable number of pseudorandom packets of random length, which blur the start of the session in both time and size.
- **Header protection.** Newer versions can also encrypt the message type field itself.

Underneath, the cryptography and the overall design remain WireGuard's.

## How hard is AmneziaWG to block?

It removes the simple signatures that filters use against WireGuard: fixed sizes and fixed header values. That makes it far more resilient than plain WireGuard on networks that block VPNs.

It still runs over UDP, so networks that throttle or block UDP broadly will affect it, and its traffic does not imitate any particular application the way [VLESS-Reality](/vpn-protocols/vless-reality) imitates a TLS visit to a real website. A filter that blocks unrecognisable UDP outright could still catch it.

## When should you use AmneziaWG?

- **Where WireGuard is blocked** but UDP still works, and you want WireGuard-like speed.
- **Self-hosted servers**, using the Amnezia VPN app to set them up.
- Keep a TCP-based option, such as VLESS-Reality, for networks that filter UDP. Our [guide for Russia](/vpn-for-russia) covers what currently gets through there.

## Does Doppler use AmneziaWG?

No. Doppler uses VLESS-Reality. See [why VLESS](/vpn-protocols/why-vless).
