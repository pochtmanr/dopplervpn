> **简而言之。** VLESS 是 Xray 项目的一种极简代理协议。Reality 则是让 VLESS 连接看起来像一次通往真实热门网站的普通 TLS 1.3 访问的 TLS 层，无需您自己的域名或证书。二者结合，是目前审查方最难封锁的主流组合。本页是概要，我们的[深度指南](/how-it-works/vless-reality-tunnel)有完整的介绍。

## 什么是 VLESS？

VLESS 于 [2020 年 7 月提出](https://github.com/v2ray/v2ray-core/issues/2636)，是 [VMess](/vpn-protocols/vmess) 的轻量后继者。它的[规范](https://xtls.github.io/en/development/protocols/vless.html)刻意保持简短：协议版本、标识用户的 16 字节 UUID、一个可选的附加字段，以及目的地的命令、端口和地址。VLESS 本身没有加密，而是依赖底层的 TLS 层，因此流量不会被加密两次。

VLESS 是 [Xray-core](https://github.com/XTLS/Xray-core) 的一部分。该项目于 2020 年 11 月从 V2Ray 分出，如今主导着这一协议家族的开发。

## Reality 增加了什么？

[Trojan](/vpn-protocols/trojan) 这类协议隐藏在通往您自己域名的 TLS 中，而这个域名就成了审查方可以封锁的目标。[Reality](https://github.com/XTLS/REALITY) 在 Xray-core [2023 年 3 月的 1.8.0 版](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0)中发布，消除了这一点。

Reality 服务器会呈现某个真实第三方网站的 TLS 握手。在观察者看来，这条连接就是一次通往该网站的普通 TLS 1.3 访问。知道服务器密钥的客户端会被放行进入 VLESS 隧道；其他任何人，包括审查方的主动探测，都会被转交给那个真实网站，看到的是它真实的证书。没有 Doppler 的域名或证书可以被列入封锁名单。

## VLESS-Reality 有多难封锁？

这是我们所知最具韧性的主流方案，但并非隐形。2024 年发表的研究表明，[TLS 套在 TLS 里可以通过](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting)其时间和数据包大小识别出指纹，而在 2025 年 11 月，用户[反映](https://github.com/net4people/bbs/issues/546)一些俄罗斯运营商切断了 Reality 连接。服务提供商的应对办法是调整服务器设置和所借用的网站，这场猫鼠游戏仍在继续。

## 速度有多快？

在日常使用中，额外开销很小。VLESS 包头每个连接只发送一次，而 XTLS Vision 流控避免了对已加密的网页流量再加密一次。由于运行在 TCP 之上，在丢包较多的网络中，VLESS-Reality 可能比 [WireGuard](/vpn-protocols/wireguard) 这样的 UDP 协议更慢，但在那些协议被封锁的地方它依然可用。

## 在哪里可以了解更多？

- [深入解析 VLESS-Reality 隧道](/how-it-works/vless-reality-tunnel)：历史、机制、局限。
- 我们博客上的[什么是 VLESS？](/blog/what-is-vless)和 [VLESS URI 格式](/blog/vless-uri-format)。
- [VLESS VPN](/vless-vpn)：Doppler 如何把 VLESS-Reality 打包成一键使用的应用。
