> **The short version.** Trojan hides proxy traffic inside a real TLS connection to a real website you control. Anyone who connects without the password simply gets the website. It works well, but you need your own domain and certificate, and those can be found and blocked.

## What is Trojan?

Trojan is a proxy protocol from the [trojan-gfw project](https://github.com/trojan-gfw/trojan), first released in October 2017. Its idea is in the name: instead of inventing a disguise, it hides inside the most common encrypted traffic on the internet, HTTPS.

## How does it work?

The [protocol description](https://trojan-gfw.github.io/trojan/protocol) is short. A Trojan server listens like a normal HTTPS server, with a real certificate for a real domain. The client performs a genuine TLS handshake. Then, inside the encrypted connection, it sends:

- the hex-encoded SHA-224 hash of the shared password, which is 56 characters,
- a line break,
- a small request saying where the traffic should go, in a SOCKS5-like format,
- another line break, followed by the first piece of data.

If the hash and request are valid, the server opens a tunnel to the destination. If anything is wrong, the server treats the connection as "other protocols" and passes it to a fallback web server, so the visitor sees an ordinary website.

## How hard is Trojan to block?

From the outside, a Trojan connection is a TLS session to your domain, with your certificate. Active probes get a real website back. That makes Trojan much harder to single out than protocols that look random, such as [Shadowsocks](/vpn-protocols/shadowsocks).

Its weak point is the domain itself. Every server needs a domain and a certificate, and a censor that learns which domains belong to proxies can block them by name or by IP. Researchers have also shown that TLS carried inside TLS leaves timing and size patterns that can be [fingerprinted](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), which affects Trojan and similar designs.

[VLESS-Reality](/vpn-protocols/vless-reality) removes the domain problem by borrowing the TLS handshake of an existing, popular website instead of your own.

## When should you use Trojan?

- **When you control a domain** and want a simple, well-understood setup that looks like HTTPS.
- **On moderately filtered networks** where your domain is unlikely to be targeted.
- Our comparison of [VLESS, VMess and Trojan](/blog/vless-vs-vmess-vs-trojan) helps if you are choosing between them.

## Does Doppler use Trojan?

No. Doppler uses VLESS-Reality, which needs no domain of its own. See [why VLESS](/vpn-protocols/why-vless).
