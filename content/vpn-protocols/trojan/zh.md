> **简而言之。** Trojan 把代理流量隐藏在一条通往您所控制的真实网站的真实 TLS 连接中。没有密码就连接的人，得到的只是那个网站。它效果很好，但您需要自己的域名和证书，而这些是可以被发现并封锁的。

## 什么是 Trojan？

Trojan 是来自 [trojan-gfw 项目](https://github.com/trojan-gfw/trojan)的代理协议，于 2017 年 10 月首次发布。它的思路就在名字里：与其发明一种伪装，不如藏身于互联网上最常见的加密流量，也就是 HTTPS 之中。

## 它是如何工作的？

[协议说明](https://trojan-gfw.github.io/trojan/protocol)很简短。Trojan 服务器像普通 HTTPS 服务器一样监听，并持有某个真实域名的真实证书。客户端执行一次真正的 TLS 握手。随后，在加密连接内部，它会发送：

- 共享密码的 SHA-224 哈希值的十六进制编码，长度为 56 个字符，
- 一个换行，
- 一个小型请求，用类似 SOCKS5 的格式说明流量应该发往哪里，
- 再一个换行，之后是第一段数据。

如果哈希值和请求有效，服务器就会打开通往目的地的隧道。如果有任何错误，服务器会把该连接视为“其他协议”，并转交给后备网页服务器，因此访问者看到的是一个普通网站。

## Trojan 有多难封锁？

从外部看，Trojan 连接就是一次通往您域名、使用您证书的 TLS 会话。主动探测得到的是一个真实的网站。这使 Trojan 比 [Shadowsocks](/vpn-protocols/shadowsocks) 这类看起来随机的协议更难被挑出来。

它的弱点在于域名本身。每台服务器都需要一个域名和一张证书，而审查方一旦得知哪些域名属于代理，就可以按名称或按 IP 封锁它们。研究人员还表明，TLS 套在 TLS 里会留下时间和大小上的特征，可以被[识别指纹](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting)，这会影响 Trojan 及类似的设计。

[VLESS-Reality](/vpn-protocols/vless-reality) 借用现有热门网站的 TLS 握手，而不是您自己域名的握手，从而消除了域名问题。

## 什么时候应该使用 Trojan？

- **当您掌控一个域名**，并想要一种简单、已被充分了解、看起来像 HTTPS 的方案时。
- **在过滤程度中等的网络中**，您的域名不太可能成为目标。
- 如果您正在几种协议之间做选择，我们对 [VLESS、VMess 和 Trojan](/blog/vless-vs-vmess-vs-trojan) 的对比文章可以帮到您。

## Doppler 使用 Trojan 吗？

不使用。Doppler 使用 VLESS-Reality，它不需要自己的域名。请参阅[为什么选择 VLESS](/vpn-protocols/why-vless)。
