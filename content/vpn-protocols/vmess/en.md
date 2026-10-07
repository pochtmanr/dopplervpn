> **The short version.** VMess is the original protocol of the V2Ray project. It encrypts its own headers and is usually wrapped in another transport, such as WebSocket over TLS, to look like web traffic. It still works, but its successors, VLESS and Trojan, do the same job with less overhead.

## What is VMess?

VMess is the encrypted proxy protocol that the [V2Ray project](https://github.com/v2fly/v2ray-core) introduced when it started in 2015. V2Ray grew into a modular platform for building proxies: one core, many protocols and transports, and a routing engine that decides which traffic goes where. VMess was its first protocol and for several years its main one.

Like Shadowsocks, VMess is technically a proxy rather than a VPN, but V2Ray-based apps can route your whole device through it.

## How does it work?

Each user has a UUID that acts as their credential. According to the [protocol documentation](https://www.v2fly.org/en_US/developer/protocols/vmess.html), the client's request header includes an encrypted authentication ID built from a Unix timestamp, a random number and a checksum, encrypted with a key derived from the user's ID. The server uses it to recognise the user, then decrypts the rest of the header and the data.

The documentation describes two ways of protecting the header. The modern one uses AEAD encryption, which guarantees the header has not been altered. The older one used MD5 and AES-128-CFB and could not guarantee the header's integrity; the documentation warns against it. Because the authentication ID includes a timestamp, client and server clocks need to be roughly in sync, a common source of "it just won't connect" problems.

## How hard is VMess to block?

On its own, VMess looks like random bytes, which puts it in the same position as [Shadowsocks](/vpn-protocols/shadowsocks): exposed to firewalls that block fully encrypted traffic. That is why VMess is usually deployed inside WebSocket or gRPC over TLS, behind a domain and a certificate, so that an observer sees what looks like a normal HTTPS connection to a website.

That wrapper does most of the work of hiding the traffic, and it brings costs: you need a domain, a certificate and often a CDN in front of the server, and the server now encrypts data twice, once for TLS and once for VMess.

## VMess, VLESS or Trojan?

[VLESS](/vpn-protocols/vless-reality) was designed by the Xray project as a lighter successor: it keeps the UUID-based identity but drops VMess's own encryption and relies entirely on the TLS layer, which avoids double encryption. [Trojan](/vpn-protocols/trojan) takes a similar approach with a password instead of a UUID. Our comparison of [VLESS, VMess and Trojan](/blog/vless-vs-vmess-vs-trojan) goes into the details.

## Does Doppler use VMess?

No. Doppler uses VLESS with Reality. The [why VLESS](/vpn-protocols/why-vless) guide explains why.
