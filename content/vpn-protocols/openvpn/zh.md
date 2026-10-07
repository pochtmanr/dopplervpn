> **简而言之。** OpenVPN 是开源 VPN 中的老将：灵活、支持广泛，历经二十多年已被充分了解。但它比较新的协议更慢，而且根据已发表的研究，它也是最容易被运营商识别出指纹的协议之一。

## 什么是 OpenVPN？

OpenVPN 是免费的开源 VPN 软件，由 James Yonan [于 2001 年 5 月](https://en.wikipedia.org/wiki/OpenVPN)首次发布。在 2000 年代和 2010 年代的大部分时间里，它是商业 VPN 服务和企业远程访问的默认选择，如今仍内置于许多路由器和企业产品中。

它运行在用户空间而不是操作系统内核中，密钥交换依赖 OpenSSL 库和 TLS 协议。IANA 分配的端口是 1194，不过 OpenVPN 几乎可以在任何端口上通过 UDP 或 TCP 运行。

## 它是如何工作的？

OpenVPN 使用自定义协议，由两部分组成。控制通道用 TLS 对双方进行认证（通常使用证书）并协商密钥；随后数据通道用这些密钥加密您的流量，并放在 UDP 或 TCP 数据包中传输。

这样的结构使 OpenVPN 的可配置性很强。您可以选择密码算法、认证方式、端口和传输方式，还可以通过代理运行。灵活性的代价是复杂：代码更多、设置更多，也就更容易配置出薄弱的方案。

## 为什么 OpenVPN 会被封锁？

OpenVPN 内部的 TLS 与访问网站时的 HTTPS 并不相同。OpenVPN 把 TLS 握手包裹在自己的数据包封装格式中，因此它的流量具有普通网页流量所没有的形态。

研究人员测量了这一点的影响。密歇根大学等机构的一个团队[构建了一套指纹识别系统](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen)，并在一家服务约一百万用户的运营商网络内运行。它识别出了**超过 85% 的 OpenVPN 流量**，误报极少，并且还识别出了他们所测试的大部分商业“混淆”OpenVPN 方案。

现实中的过滤与研究结果相符。2023 年 8 月，俄罗斯的用户[反映](https://github.com/net4people/bbs/issues/274)，移动运营商在 OpenVPN 连接开始后不久就将其切断。

## 什么时候应该使用 OpenVPN？

- **兼容性。** 较旧的路由器、企业网关和一些公司网络只支持 OpenVPN，不支持更新的协议。
- **仅支持 TCP 的网络。** 当 UDP 被封锁时，OpenVPN 可以通过 TCP 运行，而 [WireGuard](/vpn-protocols/wireguard) 在没有额外辅助的情况下做不到这一点。
- **不适用于有过滤的网络。** 在封锁 VPN 的地方，OpenVPN 往往很早就会失效。模仿正常网页流量的协议，例如 [VLESS-Reality](/vpn-protocols/vless-reality)，是更合适的工具。我们的[审查指南](/bypass-censorship)解释了过滤系统如何决定切断哪些流量。

## Doppler 使用 OpenVPN 吗？

不使用。Doppler 在所有平台上都使用 VLESS-Reality。[为什么选择 VLESS](/vpn-protocols/why-vless)一文解释了我们是如何选定它的。
