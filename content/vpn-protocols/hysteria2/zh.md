> **简而言之。** Hysteria 2 是基于 QUIC 的代理协议，QUIC 正是 HTTP/3 背后的传输协议。它为在较差、丢包较多的连接上保持速度而设计，对于没有密码的任何人，它的服务器表现得就像一个普通的 HTTP/3 网站。它的弱点在于依赖 UDP，而一些网络会对 UDP 限速，甚至直接封锁。

## 什么是 Hysteria 2？

Hysteria 是来自 [apernet](https://github.com/apernet/hysteria) 的开源项目；第 2 版是经过重新设计的协议，于 2023 年 9 月发布。与 Shadowsocks 和 VLESS 一样，它是代理而不是传统意义上的 VPN，客户端可以让整台设备的流量都经由它转发。

## 它是如何工作的？

根据其[协议规范](https://v2.hysteria.network/docs/developers/Protocol/)，Hysteria 2 运行在 [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000) 所定义的 QUIC 之上，并使用不可靠数据报扩展来传输 UDP 流量。QUIC 本身已经提供 TLS 1.3 加密、多路复用的流以及快速的连接建立。

伪装就体现在认证环节。规范要求 Hysteria 服务器**必须实现一个真正的 HTTP/3 服务器**（[RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)），并像任何网页服务器一样处理请求。客户端通过一个特殊的 HTTP/3 请求完成认证；其他任何人，无论是好奇的访问者还是主动探测，得到的都是普通的网页响应。规范指出，对于没有凭据的第三方，该服务器的行为与标准的 HTTP/3 网页服务器完全一样。

## 为什么它这么快？

QUIC 运行在 UDP 之上，从丢包中恢复时不会像 TCP 那样让所有流都停滞。Hysteria 还可以使用自己针对不稳定链路的拥塞控制，因此在拥塞的移动网络、长距离线路和有干扰的 Wi-Fi 上往往能保持速度，而基于 TCP 的协议在这些场景下会变慢。

## Hysteria 2 有多难封锁？

面对主动探测，它的表现不错，因为探测者看到的是一个网页服务器。它的风险在于传输层。审查方可以对 UDP 或专门对 QUIC 限速或封锁，而不会破坏大多数网站，因为 HTTP/3 失败时，浏览器会回退到基于 TCP 的 HTTP/2。在这种情况下，Hysteria 2 无路可走，而 [VLESS-Reality](/vpn-protocols/vless-reality) 这类基于 TCP 的协议依然可用。

## 什么时候应该使用 Hysteria 2？

- **丢包较多或长距离的链路**，其拥塞控制和 QUIC 的丢包恢复能发挥作用。
- **允许 UDP 的网络。** 依赖它之前请先确认。
- 作为第二种协议，与某个基于 TCP 的选项搭配使用，这样在 UDP 被过滤时可以切换。我们的[审查指南](/bypass-censorship)介绍了过滤系统如何针对传输方式。

## Doppler 使用 Hysteria 2 吗？

不使用。Doppler 通过 TCP 使用 VLESS-Reality，在封锁 UDP 的网络中依然可用。请参阅[为什么选择 VLESS](/vpn-protocols/why-vless)。
