> **The short version.** VLESS is a minimal proxy protocol from the Xray project. Reality is the TLS layer that makes a VLESS connection look like an ordinary TLS 1.3 visit to a real, popular website, with no domain or certificate of your own. Together they are currently the hardest mainstream combination for censors to block. This page is the summary; our [in-depth guide](/how-it-works/vless-reality-tunnel) has the full story.

## What is VLESS?

VLESS was [proposed in July 2020](https://github.com/v2ray/v2ray-core/issues/2636) as a lighter successor to [VMess](/vpn-protocols/vmess). Its [specification](https://xtls.github.io/en/development/protocols/vless.html) is deliberately small: a protocol version, a 16-byte UUID that identifies the user, an optional add-ons field, and the command, port and address of the destination. VLESS has no encryption of its own. It relies on the TLS layer underneath, so traffic is not encrypted twice.

VLESS is part of [Xray-core](https://github.com/XTLS/Xray-core), the project that split from V2Ray in November 2020 and now leads development of this protocol family.

## What does Reality add?

Protocols like [Trojan](/vpn-protocols/trojan) hide inside TLS to your own domain, and that domain becomes the thing a censor can block. [Reality](https://github.com/XTLS/REALITY), released in Xray-core [1.8.0 in March 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), removes it.

A Reality server presents the TLS handshake of a real third-party website. To an observer, the connection is a normal TLS 1.3 visit to that site. A client that knows the server's key is let through to the VLESS tunnel; anyone else, including a censor's active probe, is passed to the real website and sees its genuine certificate. There is no Doppler domain or certificate to put on a block list.

## How hard is VLESS-Reality to block?

It is the most resilient mainstream option we know of, but it is not invisible. Research published in 2024 showed that [TLS carried inside TLS can be fingerprinted](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) by its timing and packet sizes, and in November 2025 users [reported](https://github.com/net4people/bbs/issues/546) some Russian ISPs cutting Reality connections. Providers respond by tuning server settings and the sites they borrow, and the cat-and-mouse continues.

## How fast is it?

In everyday use the overhead is small. The VLESS header is sent once per connection, and the XTLS Vision flow avoids encrypting already encrypted web traffic a second time. Because it runs over TCP, VLESS-Reality can be slower than UDP protocols like [WireGuard](/vpn-protocols/wireguard) on lossy networks, but it keeps working where those are blocked.

## Where can I learn more?

- [The VLESS-Reality tunnel, in depth](/how-it-works/vless-reality-tunnel): history, mechanism, limits.
- [What is VLESS?](/blog/what-is-vless) and [the VLESS URI format](/blog/vless-uri-format) on our blog.
- [VLESS VPN](/vless-vpn): how Doppler packages VLESS-Reality into one-tap apps.
