> **The short version.** OpenVPN is the veteran of open-source VPNs: flexible, widely supported, and well understood after more than two decades. It is also slower than newer protocols and, according to published research, one of the easiest for an ISP to fingerprint.

## What is OpenVPN?

OpenVPN is free, open-source VPN software first released by James Yonan [in May 2001](https://en.wikipedia.org/wiki/OpenVPN). For most of the 2000s and 2010s it was the default choice for commercial VPN services and corporate remote access, and it still ships in many routers and enterprise products.

It runs in user space rather than in the operating system kernel, and it relies on the OpenSSL library and the TLS protocol for its key exchange. The IANA-assigned port is 1194, though OpenVPN can run over UDP or TCP on almost any port.

## How does it work?

OpenVPN uses a custom protocol with two parts. A control channel uses TLS to authenticate the two sides, usually with certificates, and to agree on keys. A data channel then carries your traffic, encrypted with those keys, inside either UDP or TCP packets.

That structure makes OpenVPN very configurable. You can choose ciphers, authentication methods, ports and transports, and run it through proxies. The cost of that flexibility is complexity: more code, more settings, and more ways to end up with a weak configuration.

## Why does OpenVPN get blocked?

TLS inside OpenVPN is not the same as an HTTPS visit to a website. OpenVPN wraps its TLS handshake in its own packet framing, so its traffic has a shape that ordinary web traffic does not.

Researchers measured how much that matters. A team from the University of Michigan and others [built a fingerprinting system](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) and ran it inside an ISP serving about a million users. It identified **over 85% of OpenVPN flows** with very few false positives, and it also caught most of the commercial "obfuscated" OpenVPN setups they tested.

Real-world filtering follows the research. In August 2023 users in Russia [reported](https://github.com/net4people/bbs/issues/274) mobile carriers cutting OpenVPN connections shortly after they started.

## When should you use OpenVPN?

- **Compatibility.** Older routers, enterprise gateways and some corporate networks support OpenVPN and nothing newer.
- **TCP-only networks.** OpenVPN can run over TCP when UDP is blocked, which [WireGuard](/vpn-protocols/wireguard) cannot do without help.
- **Not on filtered networks.** Where VPNs are blocked, OpenVPN tends to fail early. A protocol that imitates normal web traffic, such as [VLESS-Reality](/vpn-protocols/vless-reality), is the better tool. Our [censorship guide](/bypass-censorship) explains how filtering systems decide what to cut.

## Does Doppler use OpenVPN?

No. Doppler uses VLESS-Reality on every platform. The [why VLESS](/vpn-protocols/why-vless) guide explains how we chose it.
