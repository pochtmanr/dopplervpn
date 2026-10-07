> **The short version.** WireGuard is the fastest and simplest mainstream VPN protocol, and on an unfiltered network it is an excellent choice. It was never designed to hide that it is a VPN, though, and in Russia, Iran and China it is among the first protocols to be blocked.

## What is WireGuard?

WireGuard is a VPN protocol written by Jason A. Donenfeld and first released in 2015. Its goal was to replace the large, configurable protocols that came before it with something small enough to audit. In March 2020 it was [merged into the Linux 5.6 kernel](https://en.wikipedia.org/wiki/WireGuard), and official apps now exist for Windows, macOS, iOS, Android and Linux.

Instead of letting each side negotiate a cipher suite, WireGuard fixes one set of modern primitives. Its [protocol page](https://www.wireguard.com/protocol/) lists them: ChaCha20 with Poly1305 for encryption, Curve25519 for key exchange, and BLAKE2s for hashing. There is nothing to misconfigure and no older, weaker option to fall back to.

## How does it work?

Each device has a key pair, much like SSH. The client and server know each other's public keys in advance, and the handshake is based on the Noise protocol framework (the protocol page names the exact construction, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [All packets are sent over UDP](https://www.wireguard.com/protocol/), and a new session is set up in a single round trip.

That design is why WireGuard feels fast. There is little to negotiate, the code runs inside the operating system kernel on Linux, and roaming between Wi-Fi and mobile data is handled quietly because the protocol does not hold a long-lived connection open.

## Why does WireGuard get blocked?

The same simplicity that makes WireGuard easy to audit makes it easy to recognise. Its [whitepaper](https://www.wireguard.com/papers/wireguard.pdf) specifies the handshake messages byte by byte, so the first packet from a client is always 148 bytes and the reply is always 92 bytes, each starting with a fixed message-type field. A deep packet inspection (DPI) system needs only a short rule to spot that pattern on UDP.

Censors have done exactly that. In August 2023 users in Russia [reported](https://github.com/net4people/bbs/issues/274) that major mobile carriers were cutting WireGuard sessions right after the handshake. Encryption still protected the contents, but the connection itself was gone.

This is a design trade-off, not a bug. WireGuard's authors chose a fixed, minimal protocol, and disguise was not on the list of goals. Projects such as [AmneziaWG](/vpn-protocols/amneziawg) change the packet shapes to restore some cover.

## When should you use WireGuard?

- **Unfiltered networks.** At home, at work, or while travelling in a country that does not block VPNs, WireGuard is hard to beat for speed and battery life.
- **Self-hosting.** If you run your own server, WireGuard is one of the easiest protocols to set up correctly.
- **Not under DPI filtering.** If your network blocks VPNs, a protocol built to look like ordinary web traffic, such as [VLESS-Reality](/vpn-protocols/vless-reality), is a better fit. Our comparison of [VLESS-Reality and WireGuard](/blog/vless-reality-vs-wireguard) covers the trade-off in more detail.

## Does Doppler use WireGuard?

No. Doppler's apps connect over VLESS-Reality, because Doppler is built for networks where WireGuard is filtered. The [why VLESS](/vpn-protocols/why-vless) guide explains the reasoning.
