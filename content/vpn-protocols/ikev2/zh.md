> **简而言之。** IKEv2/IPsec 是您的手机和笔记本电脑无需安装任何应用就能使用的 VPN。它速度快，在 Wi-Fi 与移动数据之间切换时表现良好。但它运行在固定且众所周知的端口上，因此是审查方最容易封锁的协议之一。

## 什么是 IKEv2/IPsec？

“IKEv2”实际上是两部分协同工作。IPsec 是对 IP 数据包进行加密和认证的一套协议。IKE（Internet Key Exchange，互联网密钥交换）则是双方用来相互认证并协商 IPsec 密钥的协议。IKE 第 2 版于 [2005 年 12 月](https://en.wikipedia.org/wiki/Internet_Key_Exchange)完成标准化，现行规范是 [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296)。

由于它是 IETF 标准，IKEv2 内置于 iOS、macOS 和 Windows，Android 自 11 版起也内置了它。许多企业 VPN 网关都使用它。

## 它是如何工作的？

密钥交换通过 UDP 进行，[通常使用 500 端口](https://en.wikipedia.org/wiki/Internet_Key_Exchange)。双方协商好密钥后，操作系统的 IPsec 协议栈使用封装安全载荷（ESP）对您的流量进行加密。当中间存在 NAT 路由器时（几乎所有家庭和移动网络都是如此），IKE 和 ESP 都会被封装在 4500 端口的 UDP 中。

IKEv2 有一个名为 [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) 的标准扩展，可以让连接在 IP 地址变化后继续保持。这就是 IKEv2 在手机上用起来很顺手的原因：离开 Wi-Fi 范围转到移动数据时，隧道会继续工作，而不是从头重新连接。

## 为什么 IKEv2 容易被封锁？

IKEv2 不会尝试伪装成别的东西。它的流量使用众所周知的 UDP 端口，并采用任何网络工具都能解析的标准 IKE 和 ESP 格式。封锁它甚至不需要深度包检测：过滤器可以直接丢弃 UDP 500 和 4500 端口，也可以直接识别 IKE 交换。

对于企业网络和在开放国家旅行的场景来说，这是合理的取舍，因为被识别为 VPN 不会带来任何代价。而在有意过滤 VPN 的网络中，它通常是最先失效的。

## 什么时候应该使用 IKEv2？

- **不允许安装应用。** 在无法安装软件的受管设备上，内置的 IKEv2 客户端可能是唯一的选择。
- **开放网络中的移动漫游。** 在网络之间切换时，MOBIKE 能让连接保持顺畅。
- **不适用于有审查的环境。** 在有过滤的网络中，请选择为融入普通流量而设计的协议，例如 [VLESS-Reality](/vpn-protocols/vless-reality)。我们的[审查指南](/bypass-censorship)解释了封锁是如何运作的。

## Doppler 使用 IKEv2 吗？

不使用。Doppler 在自己的应用内通过 VLESS-Reality 连接。原因请参阅[为什么选择 VLESS](/vpn-protocols/why-vless)。
