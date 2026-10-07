> **The short version.** IKEv2/IPsec is the VPN your phone and laptop already know how to speak without any app. It is fast and handles switching between Wi-Fi and mobile data well. It also runs on fixed, well-known ports, which makes it one of the simplest protocols for a censor to block.

## What is IKEv2/IPsec?

"IKEv2" is really two pieces working together. IPsec is the suite that encrypts and authenticates IP packets. IKE, the Internet Key Exchange, is the protocol the two sides use to authenticate each other and agree on IPsec keys. Version 2 of IKE was standardised [in December 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), and the current specification is [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Because it is an IETF standard, IKEv2 is built into iOS, macOS and Windows, and into Android since version 11. Many corporate VPN gateways use it.

## How does it work?

The key exchange runs over UDP, [usually on port 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Once the two sides agree on keys, the operating system's IPsec stack encrypts your traffic using the Encapsulating Security Payload (ESP). When there is a NAT router in the way, as on almost every home and mobile network, both IKE and ESP are wrapped in UDP on port 4500.

IKEv2 has a standard extension called [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) that lets a connection survive a change of IP address. That is why IKEv2 is pleasant on phones: walk out of Wi-Fi range onto mobile data and the tunnel carries on instead of reconnecting from scratch.

## Why is IKEv2 easy to block?

IKEv2 makes no attempt to look like anything else. Its traffic uses well-known UDP ports and has the standard IKE and ESP formats that any network tool can parse. Blocking it does not even require deep packet inspection: a filter can drop UDP ports 500 and 4500, or recognise the IKE exchange directly.

That is a reasonable trade-off for corporate networks and travel in open countries, where being recognised as a VPN costs nothing. On networks that filter VPNs on purpose, it is usually the first thing to stop working.

## When should you use IKEv2?

- **No app allowed.** On a managed device where you cannot install software, the built-in IKEv2 client may be the only option.
- **Mobile roaming on open networks.** MOBIKE makes it smooth when you move between networks.
- **Not under censorship.** On filtered networks, choose a protocol designed to blend in, such as [VLESS-Reality](/vpn-protocols/vless-reality). Our [censorship guide](/bypass-censorship) explains how blocking works.

## Does Doppler use IKEv2?

No. Doppler connects with VLESS-Reality inside its own apps. See [why VLESS](/vpn-protocols/why-vless) for the reasons.
