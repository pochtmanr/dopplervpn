> **简而言之。** VMess 是 V2Ray 项目最初的协议。它会加密自己的包头，通常还会封装在另一种传输方式中，例如 TLS 之上的 WebSocket，使其看起来像网页流量。它仍然可用，但它的后继者 VLESS 和 Trojan 能以更小的开销完成同样的工作。

## 什么是 VMess？

VMess 是 [V2Ray 项目](https://github.com/v2fly/v2ray-core)在 2015 年启动时推出的加密代理协议。V2Ray 后来发展成一个用于构建代理的模块化平台：一个内核，多种协议和传输方式，以及一个决定各类流量去向的路由引擎。VMess 是它的第一个协议，在数年间也是它的主力协议。

与 Shadowsocks 一样，VMess 严格来说是代理而不是 VPN，但基于 V2Ray 的应用可以让整台设备的流量都经由它转发。

## 它是如何工作的？

每个用户有一个充当凭据的 UUID。根据[协议文档](https://www.v2fly.org/en_US/developer/protocols/vmess.html)，客户端请求的包头中包含一个加密的认证 ID，它由 Unix 时间戳、一个随机数和一个校验和组成，并使用从用户 ID 派生的密钥加密。服务器借此识别用户，然后解密包头的其余部分和数据。

文档描述了两种保护包头的方式。较新的一种使用 AEAD 加密，可保证包头未被篡改。较旧的一种使用 MD5 和 AES-128-CFB，无法保证包头的完整性，文档也不建议使用。由于认证 ID 包含时间戳，客户端和服务器的时钟需要大致同步，这也是“就是连不上”这类问题的常见原因。

## VMess 有多难封锁？

VMess 单独使用时看起来就是随机字节，这使它与 [Shadowsocks](/vpn-protocols/shadowsocks) 处于同样的境地：容易受到封锁完全加密流量的防火墙影响。因此 VMess 通常部署在 TLS 之上的 WebSocket 或 gRPC 内，并配有域名和证书，让观察者看到的像是一条通往某个网站的普通 HTTPS 连接。

这层封装承担了隐藏流量的大部分工作，同时也带来了代价：您需要一个域名、一张证书，服务器前面往往还要加一层 CDN，而且服务器现在要对数据加密两次，一次是 TLS，一次是 VMess。

## VMess、VLESS 还是 Trojan？

[VLESS](/vpn-protocols/vless-reality) 由 Xray 项目设计，是更轻量的后继者：它保留了基于 UUID 的身份标识，但去掉了 VMess 自带的加密，完全依赖 TLS 层，从而避免了双重加密。[Trojan](/vpn-protocols/trojan) 采用类似的思路，只是用密码取代了 UUID。我们对 [VLESS、VMess 和 Trojan](/blog/vless-vs-vmess-vs-trojan) 的对比文章详细介绍了其中的细节。

## Doppler 使用 VMess 吗？

不使用。Doppler 使用带 Reality 的 VLESS。[为什么选择 VLESS](/vpn-protocols/why-vless)一文解释了原因。
