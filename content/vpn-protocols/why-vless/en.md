> **The short version.** We built Doppler for people on networks that block VPNs. On those networks the question is not which protocol is fastest on paper, but which one is still connected tomorrow. We chose VLESS with Reality because it gives a censor the least to recognise and the least to block, and we accept the trade-offs that come with it.

## What were we choosing for?

Doppler is built for people who connect from places where VPNs are filtered on purpose: Russia, Iran, China, parts of the Gulf. On those networks, encryption is the easy part. Every protocol in our [comparison](/vpn-protocols) encrypts well. What separates them is whether a filtering system can tell the connection is a VPN, and what it can block once it does.

So we judged each option on three questions:

1. **Does it have a fixed fingerprint?** A handshake of fixed size or a standard port can be matched by a single rule.
2. **What happens when a censor probes the server?** Firewalls actively connect to suspected proxies to see how they respond.
3. **Is there something to put on a block list?** A domain, a certificate or a recognisable server is a target even if the traffic itself is well hidden.

## Why not WireGuard, OpenVPN or IKEv2?

All three fail the first question. [WireGuard](/vpn-protocols/wireguard)'s handshake packets are always 148 and 92 bytes. [OpenVPN](/vpn-protocols/openvpn) was identified in over 85% of flows by researchers working inside a real ISP. [IKEv2](/vpn-protocols/ikev2) runs on standard UDP ports that can be dropped wholesale. In August 2023 users in Russia [reported](https://github.com/net4people/bbs/issues/274) carriers cutting WireGuard and OpenVPN within the first packets. These are good protocols for open networks. They were not designed for ours.

## Why not Shadowsocks or VMess?

They pass the first question by looking like random bytes, and that turned out to be a fingerprint of its own. Since November 2021 the Great Firewall has [blocked fully encrypted traffic](https://gfw.report/publications/usenixsecurity23/en/) that does not resemble any known protocol. [VMess](/vpn-protocols/vmess) can be wrapped in TLS to avoid that, but then it needs a domain, which brings us to the third question.

## Why not Trojan?

[Trojan](/vpn-protocols/trojan) answers the first two questions well: it is real TLS, and probes see a real website. But every Trojan server needs its own domain and certificate. Once a censor learns that domain, it can block it, and running many domains is a constant chase.

## What VLESS-Reality gets right

[VLESS-Reality](/vpn-protocols/vless-reality) answers all three:

- **No fixed fingerprint.** The connection is TLS 1.3 over TCP, the most common encrypted traffic on the internet.
- **Probes see a real website.** Reality forwards anyone who cannot authenticate to the real site whose handshake it borrows, with that site's genuine certificate.
- **Nothing of ours to block by name.** There is no Doppler domain or certificate in the handshake.

It also runs over TCP, so it keeps working on networks that throttle or block UDP, where [Hysteria 2](/vpn-protocols/hysteria2) and [AmneziaWG](/vpn-protocols/amneziawg) struggle. And VLESS itself is small: it relies on TLS for encryption instead of adding its own, so there is no double encryption.

## What we gave up

- **Raw speed on lossy links.** TCP recovers from packet loss less gracefully than QUIC or WireGuard's UDP. On a clean connection the difference is small; on a poor one it can be noticeable.
- **Built-in OS support.** No operating system ships a VLESS client, so you need an app. We decided that was acceptable and built our own for iOS, Android, macOS and Windows.
- **Perfect invisibility.** It does not exist. Research has shown [TLS inside TLS can be fingerprinted](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), and in November 2025 some Russian ISPs were [reported](https://github.com/net4people/bbs/issues/546) cutting Reality connections. VLESS-Reality is a censorship-resistance design, not a guarantee.

## What we do about the limits

Censorship changes, so the protocol choice is not the end of the work. We adjust server settings and the sites Reality borrows as filtering changes, and we keep watching the same research and community reports cited on these pages. If a better approach appears, this page will say so.

For the full technical story of how VLESS-Reality works, read [the VLESS-Reality tunnel](/how-it-works/vless-reality-tunnel). To try it, see [VLESS VPN](/vless-vpn).
