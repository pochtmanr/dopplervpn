> **简而言之。** WireGuard 是主流 VPN 协议中最快、最简单的一种，在没有过滤的网络中是极佳的选择。但它从未打算隐藏自己是 VPN 这一事实，在俄罗斯、伊朗和中国，它是最先被封锁的协议之一。

## 什么是 WireGuard？

WireGuard 是由 Jason A. Donenfeld 编写的 VPN 协议，于 2015 年首次发布。它的目标是取代此前那些庞大、可配置项繁多的协议，做到足够小巧，便于完整审计。2020 年 3 月，它[被合并进 Linux 5.6 内核](https://en.wikipedia.org/wiki/WireGuard)，如今已有面向 Windows、macOS、iOS、Android 和 Linux 的官方应用。

WireGuard 不让双方协商密码套件，而是固定使用一组现代加密原语。其[协议页面](https://www.wireguard.com/protocol/)列出了这些原语：用 ChaCha20 搭配 Poly1305 加密，用 Curve25519 交换密钥，用 BLAKE2s 做哈希。没有可以配置错的选项，也没有可以回退的旧版、较弱方案。

## 它是如何工作的？

每台设备都有一对密钥，与 SSH 十分相似。客户端和服务器事先知道对方的公钥，握手基于 Noise 协议框架（协议页面给出了具体构造：`Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`）。[所有数据包都通过 UDP 发送](https://www.wireguard.com/protocol/)，新会话只需一次往返即可建立。

这样的设计让 WireGuard 用起来很快。需要协商的内容很少，在 Linux 上代码直接运行在操作系统内核中，而且协议不会长期保持连接，因此在 Wi-Fi 与移动数据之间切换时也能悄无声息地完成。

## 为什么 WireGuard 会被封锁？

让 WireGuard 易于审计的简洁性，同样让它容易被识别。其[白皮书](https://www.wireguard.com/papers/wireguard.pdf)逐字节规定了握手消息，因此客户端发出的第一个数据包始终是 148 字节，回复始终是 92 字节，且都以固定的消息类型字段开头。深度包检测（DPI）系统只需一条简短的规则，就能在 UDP 流量中发现这一特征。

审查方确实这样做了。2023 年 8 月，俄罗斯的用户[反映](https://github.com/net4people/bbs/issues/274)，主要移动运营商在握手之后立即切断了 WireGuard 会话。加密仍然保护着内容，但连接本身已经中断。

这是设计上的取舍，而不是漏洞。WireGuard 的作者选择了固定且精简的协议，伪装并不在其目标之列。[AmneziaWG](/vpn-protocols/amneziawg) 等项目通过改变数据包的形态，恢复了一定程度的掩护。

## 什么时候应该使用 WireGuard？

- **没有过滤的网络。** 在家里、公司，或是在不封锁 VPN 的国家旅行时，WireGuard 在速度和耗电方面都很难被超越。
- **自建服务器。** 如果您自己运行服务器，WireGuard 是最容易正确配置的协议之一。
- **不适用于有 DPI 过滤的网络。** 如果您所在的网络封锁 VPN，更适合使用专为模仿普通网页流量而设计的协议，例如 [VLESS-Reality](/vpn-protocols/vless-reality)。我们对 [VLESS-Reality 与 WireGuard](/blog/vless-reality-vs-wireguard) 的对比文章更详细地分析了这种取舍。

## Doppler 使用 WireGuard 吗？

不使用。Doppler 的应用通过 VLESS-Reality 连接，因为 Doppler 就是为 WireGuard 被过滤的网络而打造的。[为什么选择 VLESS](/vpn-protocols/why-vless)一文解释了其中的理由。
