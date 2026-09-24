> **The short version.** Encryption hides *what* you send. It does not hide *that you are using a VPN*, and in a growing number of countries that alone gets a connection cut. VLESS-Reality is built to answer that second problem. From the outside it looks like a normal TLS 1.3 visit to a real, well-known website, and anyone who pokes at the server gets that real website back. This guide covers where it came from, how it works, and where its limits are.

## Why isn't encryption enough?

Classic VPN protocols were designed to keep traffic secret, not to keep it quiet. OpenVPN and WireGuard both encrypt well. Both also have a recognisable shape on the wire, and deep packet inspection (DPI) systems have learned to read it.

None of this is new. Anyone who ran LimeWire or early BitTorrent on 2000s broadband lived through round one: providers spotted file-sharing traffic by its pattern and throttled it without reading a single file. Censors now do the same with better tools.

Researchers have measured it. A team from the University of Michigan and others [ran a fingerprinting system](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) inside an ISP serving about a million users. It picked out **over 85% of OpenVPN flows** with almost no false alarms. It also caught **34 of 41** VPN setups that were sold as "obfuscated".

WireGuard is even easier to spot, for a simple reason. Its [handshake messages](https://www.wireguard.com/papers/wireguard.pdf) are always the same size, 148 bytes to start and 92 bytes in reply, over UDP. That is excellent engineering for speed and a gift to anyone writing a filter. Those of us who got online over a 56k modem will recognise the problem: the screech of the handshake told everyone in the house you were dialling in, even if nobody could understand a note of it. A fixed-size handshake is the silent version of that noise. In August 2023 users in Russia [reported](https://github.com/net4people/bbs/issues/274) that major mobile carriers were cutting WireGuard sessions after the first two data packets, and OpenVPN after about fifteen.

```chart
detection-rates
```

This matters well beyond Russia. Freedom House's [Freedom on the Net 2025](https://freedomhouse.org/report/freedom-net/2025/uncertain-future-global-internet) recorded the **15th year in a row** of declining internet freedom across the 72 countries it tracks. In at least 21 of them, the tools people use to get around censorship were [themselves blocked](https://freedomhouse.org/report/special-report/2025/tunnel-vision-anti-censorship-tools-end-end-encryption-and-fight-free).

## How did we get from Shadowsocks to Reality?

Every protocol on this list was a response to the one before it being caught.

```chart
protocol-timeline
```

Shadowsocks tried to look like nothing at all, as pure random bytes. The Great Firewall learned to [actively probe](https://gfw.report/publications/imc20/en/) suspicious servers: researchers logged **51,837 probes from 12,300 Chinese IP addresses** in under four months, and more than half arrived within a minute of a real connection. Then, from November 2021, China began [blocking "fully encrypted" traffic](https://gfw.report/publications/usenixsecurity23/en/) wholesale, using simple rules about how random the first packet looks.

The lesson the community drew was blunt. Looking random is suspicious, because normal traffic isn't random. Normal traffic is TLS. Back when the SSL padlock showed up only on checkout pages, encrypted traffic was rare enough to stand out on its own. Now it is the background noise of the whole web, and the best cover there is. So the next generation stopped hiding and started imitating.

Trojan wrapped proxy traffic in real TLS, but it needed its own domain and certificate, which a censor can list and block. VLESS, proposed by a developer known as RPRX in [July 2020](https://github.com/v2ray/v2ray-core/issues/2636), stripped the proxy layer down to a tiny header and left encryption to TLS underneath. Reality, released in [Xray-core v1.8.0](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0) in March 2023, removed the need for your own domain entirely.

## What is VLESS?

VLESS is the part that tells the server where your traffic should go. It is deliberately minimal. A request header is 1 byte for the version, 16 bytes for a user ID, a few bytes for the command and port, and then the destination address: about [22 bytes plus the address](https://xtls.github.io/en/development/protocols/vless.html), sent once per connection. After that, your data flows through untouched.

VLESS has no encryption of its own, and that is on purpose. Encrypting inside an already encrypted TLS stream wastes battery and adds a second layer that stands out. VLESS relies on the TLS layer underneath, which is where Reality comes in.

## How does Reality work?

Reality answers one question: how do you run TLS without a certificate a censor can block?

Its answer is to borrow someone else's. A Reality server is configured with a real, popular destination website that supports TLS 1.3. Here is what happens when a connection arrives.

1. **Your app starts a normal TLS 1.3 handshake.** The site name in it (SNI) is that real website's name, and the handshake fingerprint matches a mainstream browser.
2. **The server checks a hidden token.** Your app mixes in proof, built from an x25519 key pair, that only a genuine Doppler client can produce. To an observer it looks like ordinary handshake randomness.
3. **Genuine client: the tunnel opens.** The server completes the handshake with a temporary certificate and starts carrying your VLESS traffic.
4. **Anyone else: the connection is passed through.** A censor's probe, a curious scanner or a plain browser gets forwarded to the real website and sees its real, valid certificate. There is nothing unusual to find.

```chart
schema-reality
```

Step 4 is the clever part. Active probing, the technique that caught Shadowsocks, now finds a real website where it expected a proxy. Blocking the server by SNI would mean blocking a major site that millions of people rely on.

On top of this Doppler uses **XTLS Vision**, a flow mode released in [October 2022](https://xtls.github.io/en/about/news.html). When the traffic inside the tunnel is already TLS, which is most web traffic today, Vision stops encrypting it a second time. That saves CPU and battery, and it removes the tell-tale sizes of TLS nested inside TLS.

## How does it compare with other protocols?

| Protocol | What an observer sees | How it gets caught | Needs its own domain and certificate |
|---|---|---|---|
| OpenVPN | Distinctive OpenVPN packets | Fingerprinting, [over 85% of flows](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) in one study | No |
| WireGuard | Fixed 148 and 92 byte UDP handshake | Fixed message sizes; cut after 2 packets in Russia (user reports, 2023) | No |
| Shadowsocks | Random-looking bytes | Randomness rules and active probing | No |
| Trojan | Real TLS to your own domain | The domain and certificate can be listed | **Yes** |
| **VLESS + Reality** | TLS 1.3 to a real, popular website | Hardest of the set; see the limits below | **No** |

As for weight on the wire: each TLS 1.3 record adds [22 bytes](https://www.rfc-editor.org/rfc/rfc8446#section-5.2) for a record of up to 16 KB of data. WireGuard adds 32 bytes to every packet, plus its UDP and IP headers. In everyday use neither is a number you will notice. The difference that matters is whether the connection survives at all.

## Is VLESS-Reality undetectable?

No protocol is, and anyone who says otherwise is selling something. Here is what the research and field reports actually show.

- **TLS inside TLS leaves traces.** A [2024 USENIX Security paper](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) showed that the pattern of a TLS handshake carried inside another TLS connection can identify obfuscated proxies, with detection rates above 70% across 23 setups tested. XTLS Vision was designed against exactly this pattern, and the authors needed a dedicated classifier to handle its padding.
- **Censors keep adapting.** In November 2025 users [reported](https://github.com/net4people/bbs/issues/546) that some Russian home ISPs had started cutting VLESS + Reality + Vision connections once data began to flow. The workarounds they shared included different ports and transports.

This is why the protocol is only half of the job. The other half is running it well: rotating settings, changing transports when a network changes its rules, and doing it without asking you to reconfigure anything. Doppler handles that on the server side, which is covered in [step 3: the edge network](/how-it-works/edge-network).

## What does this mean for you?

- On ordinary networks you get a fast, modern TLS 1.3 tunnel with no double encryption.
- On censored networks your connection looks like a visit to a popular website, which is the hardest kind of traffic to block without breaking the internet for everyone.
- You never touch a config file. The app picks the right setup for you.

For a shorter overview aimed at people choosing a VPN, see our [VLESS protocol guide](/vless-vpn). Next, follow your traffic to the place where it leaves the tunnel: [step 3, the Doppler edge node](/how-it-works/edge-network).
