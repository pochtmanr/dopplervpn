> **简而言之。** 我们打造 Doppler，是为了服务那些身处封锁 VPN 的网络中的人。在这样的网络里，问题不在于哪种协议在纸面上最快，而在于哪一种明天还能连得上。我们选择了带 Reality 的 VLESS，因为它留给审查方可识别、可封锁的东西最少，同时我们也接受随之而来的取舍。

## 我们是根据什么来选择的？

Doppler 是为在有意过滤 VPN 的地方上网的人打造的：俄罗斯、伊朗、中国以及海湾部分地区。在这些网络中，加密是最容易的部分。我们[对比](/vpn-protocols)中的每一种协议加密都做得很好。真正区分它们的是：过滤系统能否判断出这条连接是 VPN，以及判断出之后能封锁什么。

因此我们用三个问题来评判每个选项：

1. **它有固定的指纹吗？** 固定大小的握手或标准端口，用一条规则就能匹配。
2. **审查方探测服务器时会发生什么？** 防火墙会主动连接疑似代理的服务器，观察其响应。
3. **有什么可以列入封锁名单吗？** 域名、证书或可识别的服务器，即使流量本身隐藏得很好，也会成为目标。

## 为什么不选 WireGuard、OpenVPN 或 IKEv2？

这三者都没有通过第一个问题。[WireGuard](/vpn-protocols/wireguard) 的握手包始终是 148 字节和 92 字节。研究人员在真实运营商网络内部，识别出了超过 85% 的 [OpenVPN](/vpn-protocols/openvpn) 流量。[IKEv2](/vpn-protocols/ikev2) 运行在标准的 UDP 端口上，可以被整体丢弃。2023 年 8 月，俄罗斯的用户[反映](https://github.com/net4people/bbs/issues/274)，运营商在最初的几个数据包内就切断了 WireGuard 和 OpenVPN。它们都是适合开放网络的好协议，只是并非为我们所面对的网络而设计。

## 为什么不选 Shadowsocks 或 VMess？

它们靠看起来像随机字节通过了第一个问题，而这反过来成了另一种指纹。自 2021 年 11 月起，防火长城[封锁完全加密的流量](https://gfw.report/publications/usenixsecurity23/en/)，也就是不像任何已知协议的流量。[VMess](/vpn-protocols/vmess) 可以封装在 TLS 中来避开这一点，但那样就需要一个域名，这就引出了第三个问题。

## 为什么不选 Trojan？

[Trojan](/vpn-protocols/trojan) 很好地回答了前两个问题：它是真正的 TLS，探测者看到的是真实的网站。但每台 Trojan 服务器都需要自己的域名和证书。审查方一旦得知该域名，就可以将其封锁，而维护大量域名则是一场无休止的追逐。

## VLESS-Reality 做对了什么

[VLESS-Reality](/vpn-protocols/vless-reality) 回答了全部三个问题：

- **没有固定的指纹。** 连接是基于 TCP 的 TLS 1.3，这是互联网上最常见的加密流量。
- **探测者看到的是真实的网站。** Reality 会把无法通过认证的任何人转交给它所借用握手的那个真实网站，并附带该网站真实的证书。
- **没有我们自己的东西可以按名称封锁。** 握手中没有 Doppler 的域名或证书。

它还运行在 TCP 之上，因此在限速或封锁 UDP 的网络中依然可用，而 [Hysteria 2](/vpn-protocols/hysteria2) 和 [AmneziaWG](/vpn-protocols/amneziawg) 在那里会吃力。而且 VLESS 本身很小巧：它依靠 TLS 来加密，而不是另加一层自己的加密，因此不存在双重加密。

## 我们放弃了什么

- **丢包链路上的原始速度。** 与 QUIC 或 WireGuard 的 UDP 相比，TCP 从丢包中恢复得不够从容。在良好的连接上差别很小；在较差的连接上则可能很明显。
- **系统内置支持。** 没有哪个操作系统自带 VLESS 客户端，所以您需要一个应用。我们认为这是可以接受的，并为 iOS、Android、macOS 和 Windows 构建了自己的应用。
- **完美的隐形。** 这并不存在。研究表明，[TLS 套 TLS 可以被识别出指纹](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting)，而在 2025 年 11 月，据[报道](https://github.com/net4people/bbs/issues/546)一些俄罗斯运营商切断了 Reality 连接。VLESS-Reality 是一种抗审查的设计，而不是保证。

## 面对这些局限我们怎么做

审查在不断变化，所以选定协议并不是工作的终点。随着过滤方式的变化，我们会调整服务器设置和 Reality 所借用的网站，并持续关注这些页面所引用的同样的研究和社区报告。如果出现更好的方法，本页会如实说明。

想了解 VLESS-Reality 工作原理的完整技术细节，请阅读 [VLESS-Reality 隧道](/how-it-works/vless-reality-tunnel)。想要亲自试用，请参阅 [VLESS VPN](/vless-vpn)。
