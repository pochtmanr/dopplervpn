> **The short version.** Hysteria 2 is a proxy protocol built on QUIC, the transport behind HTTP/3. It is designed for speed on poor and lossy connections, and to anyone without the password its server behaves like an ordinary HTTP/3 website. Its weak spot is that it depends on UDP, which some networks throttle or block outright.

## What is Hysteria 2?

Hysteria is an open-source project from [apernet](https://github.com/apernet/hysteria); version 2, a redesigned protocol, was released in September 2023. Like Shadowsocks and VLESS it is a proxy rather than a classic VPN, and clients can route a whole device through it.

## How does it work?

According to its [protocol specification](https://v2.hysteria.network/docs/developers/Protocol/), Hysteria 2 runs over QUIC as defined in [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), with the unreliable datagram extension for UDP traffic. QUIC already provides TLS 1.3 encryption, multiplexed streams and fast connection setup.

Authentication is where the disguise comes in. The specification requires that a Hysteria server **must implement a real HTTP/3 server** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) and handle requests the way any web server would. A client authenticates with a special HTTP/3 request; anyone else, whether a curious visitor or an active probe, gets ordinary web responses. The specification states that, to a third party without credentials, the server behaves just like a standard HTTP/3 web server.

## Why is it fast?

QUIC runs over UDP and recovers from packet loss without stalling every stream the way TCP does. Hysteria can also use its own congestion control, aimed at unstable links, so it tends to hold its speed on congested mobile networks, long-distance routes and Wi-Fi with interference, where TCP-based protocols slow down.

## How hard is Hysteria 2 to block?

Against active probing it holds up well, since probes see a web server. The exposure is the transport. A censor can throttle or block UDP, or QUIC specifically, without breaking most websites, because browsers fall back to HTTP/2 over TCP when HTTP/3 fails. Where that happens, Hysteria 2 has nowhere to go, while TCP-based protocols such as [VLESS-Reality](/vpn-protocols/vless-reality) keep working.

## When should you use Hysteria 2?

- **Lossy or long-distance links**, where its congestion control and QUIC's loss recovery pay off.
- **Networks that allow UDP.** Check before you rely on it.
- As a second protocol alongside a TCP option, so you can switch when UDP is filtered. Our [censorship guide](/bypass-censorship) covers how filters target transports.

## Does Doppler use Hysteria 2?

No. Doppler uses VLESS-Reality over TCP, which keeps working on networks that block UDP. See [why VLESS](/vpn-protocols/why-vless).
