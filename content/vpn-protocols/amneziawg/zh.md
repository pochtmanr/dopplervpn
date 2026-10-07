> **简而言之。** AmneziaWG 是 WireGuard 的一个分支，保留了它的速度和加密算法，但改变了使 WireGuard 容易被发现的数据包形态和包头。在普通 WireGuard 被封锁的地方，它是个不错的选择，但有一个限制：一旦开启混淆，它就无法再与标准的 WireGuard 服务器通信。

## 什么是 AmneziaWG？

AmneziaWG 由 [Amnezia VPN](https://amnezia.org/) 背后的团队开发，后者是一款用于运行自己 VPN 服务器的开源应用。该项目的 [Go 实现](https://github.com/amnezia-vpn/amneziawg-go)始于 2023 年。它以 [WireGuard](/vpn-protocols/wireguard) 为基础，后者速度快、简单，但握手固定且容易识别，而 AmneziaWG 在其上增加了一层来加以伪装。

## 它改变了什么？

[AmneziaWG 文档](https://docs.amnezia.org/documentation/amnezia-wg/)描述了几种机制，每一种都由配置参数控制：

- **动态包头（H1–H4）。** 标准 WireGuard 数据包的四种格式，各自以固定的消息类型开头。AmneziaWG 把这些值替换成从配置范围中选取的数字，因此两套不同的部署不会共用包头，也没有哪一条过滤规则能匹配所有部署。
- **数据包长度随机化（S1–S4）。** 在 WireGuard 中，初始握手包始终恰好是 148 字节。AmneziaWG 为每种数据包类型添加随机前缀，使大小各不相同。
- **垃圾数据包（Jc、Jmin、Jmax）。** 握手之前，客户端会发送可配置数量、长度随机的伪随机数据包，在时间和大小上模糊会话的开端。
- **包头保护。** 较新的版本还可以加密消息类型字段本身。

在底层，加密算法和整体设计仍然是 WireGuard 的。

## AmneziaWG 有多难封锁？

它去除了过滤系统用来对付 WireGuard 的简单特征：固定的大小和固定的包头值。这使它在封锁 VPN 的网络中比普通 WireGuard 更具韧性。

它仍然运行在 UDP 之上，因此大范围限速或封锁 UDP 的网络会影响它，而且它的流量并不模仿任何特定的应用，不像 [VLESS-Reality](/vpn-protocols/vless-reality) 那样模仿对真实网站的 TLS 访问。直接封锁无法识别的 UDP 的过滤系统，仍然可能拦下它。

## 什么时候应该使用 AmneziaWG？

- **WireGuard 被封锁，但 UDP 仍可使用**，而您又想要接近 WireGuard 的速度时。
- **自建服务器**，使用 Amnezia VPN 应用来完成设置。
- 请保留一个基于 TCP 的选项，例如 VLESS-Reality，以应对过滤 UDP 的网络。我们的[俄罗斯指南](/vpn-for-russia)介绍了目前在那里能够通行的方案。

## Doppler 使用 AmneziaWG 吗？

不使用。Doppler 使用 VLESS-Reality。请参阅[为什么选择 VLESS](/vpn-protocols/why-vless)。
