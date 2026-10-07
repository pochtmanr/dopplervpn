> **The short version.** Shadowsocks is a lightweight encrypted proxy that was built in China to get through the Great Firewall. For years it worked by looking like nothing at all. Since 2021, research shows the firewall has been blocking exactly that kind of traffic, because real traffic is rarely that random.

## What is Shadowsocks?

Shadowsocks is an open-source proxy protocol first released [in April 2012](https://en.wikipedia.org/wiki/Shadowsocks). Strictly speaking it is not a VPN: it is a SOCKS5-style proxy with encryption, and apps decide which traffic to send through it. In practice, most Shadowsocks clients now offer a system-wide mode that behaves like a VPN.

It is popular because it is simple and fast. The current versions use [AEAD ciphers](https://shadowsocks.org/doc/aead.html), which provide confidentiality, integrity and authenticity in one step, and the [2022 edition](https://shadowsocks.org/doc/sip022.html) of the protocol tightened replay protection.

## How does it work?

The client and server share a password, which is turned into an encryption key. Everything the client sends, including the address of the website it wants, is encrypted from the very first byte. There is no recognisable handshake, no certificate and no plaintext header. To an observer, a Shadowsocks connection is a stream of random-looking bytes.

## How does the Great Firewall detect Shadowsocks?

First, through active probing. Researchers at GFW Report [recorded](https://gfw.report/publications/imc20/en/) the firewall sending tens of thousands of probes to suspected Shadowsocks servers, replaying and altering real connections to see how the server reacted.

Then, from November 2021, through a cruder and broader method. A [USENIX Security 2023 study](https://gfw.report/publications/usenixsecurity23/en/) found the firewall blocking "fully encrypted" traffic in real time. It looks at the first packet of a connection and exempts anything that looks like a known protocol or contains enough printable text. One rule measures the average number of bits set per byte: values at or below 3.4, or at or above 4.6, are exempt, and random-looking data in between is not. Whatever is left can be blocked.

The researchers also found the firewall applied this to about 26% of connections, and only to IP ranges of popular data centres, probably to limit collateral damage. The lesson for protocol designers was clear: looking random is itself a fingerprint.

## When should you use Shadowsocks?

- **Light, fast proxying** on networks that do not inspect traffic closely.
- **Self-hosting** with tools like Outline, which make setup straightforward.
- **With care under heavy filtering.** In China and other places that block fully encrypted traffic, Shadowsocks is far less reliable than protocols that imitate real TLS, such as [VLESS-Reality](/vpn-protocols/vless-reality). Our [history of censorship protocols](/blog/censorship-protocol-history) traces how the field moved on.

## Does Doppler use Shadowsocks?

No. Doppler uses VLESS-Reality, for the reasons in [why VLESS](/vpn-protocols/why-vless).
