> **简而言之。** Shadowsocks 是一种轻量级加密代理，诞生于中国，目的是穿越防火长城。多年来，它靠“看起来什么都不像”而奏效。但自 2021 年起，研究表明防火长城正在封锁恰恰这类流量，因为真实流量很少如此随机。

## 什么是 Shadowsocks？

Shadowsocks 是一种开源代理协议，[于 2012 年 4 月](https://en.wikipedia.org/wiki/Shadowsocks)首次发布。严格来说它不是 VPN：它是带加密的 SOCKS5 风格代理，由应用决定哪些流量经由它发送。实际上，如今大多数 Shadowsocks 客户端都提供全局模式，行为与 VPN 类似。

它受欢迎是因为简单而快速。当前版本使用 [AEAD 密码算法](https://shadowsocks.org/doc/aead.html)，一步即可同时提供机密性、完整性和真实性，而该协议的 [2022 版](https://shadowsocks.org/doc/sip022.html)加强了重放保护。

## 它是如何工作的？

客户端和服务器共享一个密码，该密码会被转换为加密密钥。客户端发送的所有内容，包括它想访问的网站地址，从第一个字节起就是加密的。没有可识别的握手，没有证书，也没有明文包头。在观察者看来，Shadowsocks 连接就是一串看似随机的字节。

## 防火长城如何检测 Shadowsocks？

首先是通过主动探测。GFW Report 的研究人员[记录到](https://gfw.report/publications/imc20/en/)，防火长城向疑似 Shadowsocks 的服务器发送了数以万计的探测，通过重放和修改真实连接来观察服务器如何响应。

然后，从 2021 年 11 月起，采用了一种更粗放、范围更广的方法。一项 [USENIX Security 2023 研究](https://gfw.report/publications/usenixsecurity23/en/)发现，防火长城会实时封锁“完全加密”的流量。它检查连接的第一个数据包，并豁免任何看起来像已知协议或包含足够多可打印文本的流量。其中一条规则测量每字节中置位比特的平均数：小于等于 3.4 或大于等于 4.6 的值会被豁免，介于两者之间的随机数据则不会。剩下的流量都可能被封锁。

研究人员还发现，防火长城只对大约 26% 的连接应用了这一规则，且只针对热门数据中心的 IP 段，很可能是为了限制附带影响。对协议设计者而言，教训很明确：看起来随机本身就是一种指纹。

## 什么时候应该使用 Shadowsocks？

- **轻量、快速的代理**，适用于不会仔细检查流量的网络。
- **自建服务器**，可借助 Outline 等工具，设置起来很简单。
- **在严格过滤下需谨慎使用。** 在中国以及其他封锁完全加密流量的地方，Shadowsocks 远不如 [VLESS-Reality](/vpn-protocols/vless-reality) 这类模仿真实 TLS 的协议可靠。我们的[审查协议发展史](/blog/censorship-protocol-history)梳理了这一领域是如何演进的。

## Doppler 使用 Shadowsocks 吗？

不使用。Doppler 使用 VLESS-Reality，原因见[为什么选择 VLESS](/vpn-protocols/why-vless)。
