> **简短版。** 在任何 VPN 启动之前，你的手机或笔记本已经向网络交代了不少东西：你的 IP 地址、你查询过的域名，往往还有你连接的每一个网站的名字。多数 VPN 还要在这之上再向你索取邮箱和银行卡。Doppler 走的是相反的路。应用在你的设备上随机生成一个账户 ID，不向你索取任何信息，并把 DNS 解析放在隧道内部完成。

## 连接 VPN 之前，你的设备会暴露什么？

在咖啡馆的 Wi-Fi 上打开一个网站，至少有三方能看到其中一部分：Wi-Fi 的经营者、你的网络运营商，以及网站本身。它们都不需要入侵任何东西。每一方看到的，都是网络按设计交到它手上的。

2010 年前后把笔记本抱进咖啡馆的人，也许还记得 Firesheep，那是当年 10 月发布的一个 Firefox 扩展。谁和你共用一个开放网络，谁就能用它点几下鼠标，进入别人在热门网站上已经登录的会话，不需要任何技术。后来全站 HTTPS 堵上了这一个洞。它没有堵上全部。

下面这些，在一条普通连接上至今仍会离开你的设备。

### 你的 IP 地址

每一个数据包都带着你的公网 IP 地址，而这个地址透露的东西比多数人以为的多。互联网上相当大一部分地理定位数据来自 MaxMind，该公司[表示](https://support.maxmind.com/hc/en-us/articles/4407630607131-Geolocation-Accuracy)，它把一个 IP 归到正确国家的准确率是 99.8%。对美国的地址，它在 50 km 范围内定位到正确城市的概率大约是三分之二。这已经足够让一个网站在你敲下任何字之前，就判断出你所在的城市和你用的运营商。

### 你的 DNS 查询

浏览器在加载 `example.com` 之前，必须先向 DNS 服务器问一句它的地址在哪。在互联网历史的大部分时间里，这些询问都是明文发出去的，连使用 HTTPS 的网站也不例外。Firefox 直到 2020 年 2 月才开始为美国用户[默认开启加密 DNS](https://blog.mozilla.org/blog/2020/02/25/firefox-continues-push-to-bring-dns-over-https-by-default-for-us-users/)。在很多手机、路由器和应用上，查询至今仍未加密，于是你的运营商手里就有了一份你访问过的全部域名清单。

### HTTPS 藏不住的那个网站名

在早期的互联网上，密码经由 HTTP 和 FTP 明文穿过网络，同一条线路上任何愿意看一眼的人都读得到。今天 HTTPS 隐藏了页面、你输入的文字和你加载的图片。它通常不隐藏你在跟*哪个网站*说话。TLS 连接的第一条消息 ClientHello 会在一个叫 SNI 的字段里写明网站名，而这个字段历来是明文传输的。补救的办法是有的，叫加密客户端问候（ECH）：Cloudflare 在 2023 年 9 月为自己的客户[启用了它](https://blog.cloudflare.com/announcing-encrypted-client-hello/)，它也成为了 IETF 标准 [RFC 9849](https://www.rfc-editor.org/info/rfc9849/)。只是它要求你的浏览器和目标网站同时支持，而很多网站至今并不支持。

### WebRTC

2015 年 1 月，一位名叫 Daniel Roesler 的开发者发布了一段很短的脚本，它向浏览器的 WebRTC 视频通话功能索要本机的网络地址。整个过程不弹出任何权限提示，而且它[暴露了真实 IP](https://thehackernews.com/2015/02/webrtc-leaks-vpn-ip-address.html)，哪怕对方正连着 VPN。此后浏览器加上了限制，但配置不当的 VPN 仍可能从这里漏出去。你可以用我们的 [WebRTC 泄漏测试](/tools/webrtc-leak-test)查一查自己的。

### 你的浏览器指纹

就算 IP 藏住了，浏览器还是会交出自己的形状：屏幕尺寸、字体、显卡、时区、语言。2010 年，EFF 的 Panopticlick 项目[采集了约 470,000 个浏览器](https://www.eff.org/press/archives/2010/05/13)，发现其中 83.6% 是独一无二的。2016 年的研究 AmIUnique 又考察了 118,934 个，[独一无二](https://www.semanticscholar.org/paper/fe2f4faec5cf209ae7d8a73100db9cce46ce53d4)的比例仍有 89.4%。

```chart
fingerprint-uniqueness
```

VPN 解决不了指纹问题。那是浏览器层面的问题，我们宁可在这里把话说明白，也不愿让下面那张表暗示相反的意思。

## 不开 VPN 和连上 Doppler，各方分别看到什么？

下面是一个人浏览 HTTPS 网站时的情形，先是不开 VPN，再是连上 Doppler。

| 可见的内容 | Wi-Fi 或运营商，不开 VPN | Wi-Fi 或运营商，连上 Doppler | 网站，连上 Doppler |
|---|---|---|---|
| 你的真实 IP 地址 | 可见 | 可见（他们就是你的运营商） | **不可见**，它看到的是边缘节点的 IP |
| 你查询的域名（DNS） | 常常可见，只要 DNS 未加密 | **不可见**，DNS 在隧道内部解析 | 只有它自己的域名 |
| TLS 握手里的网站名（SNI） | 可见，除非该网站启用了 ECH | **不可见**，它只看到一次普通的 TLS 会话 | 它自己的名字 |
| 页面内容 | 不可见（HTTPS 保护着它） | 不可见 | 可见，那本来就是他们的页面 |
| 你在用 VPN 这件事 | 对传统协议通常可见 | 很难判断，见[第二步](/how-it-works/vless-reality-tunnel) | 有可能，从 IP 推断 |
| 你的浏览器指纹 | 不可见 | 不可见 | **可见**，VPN 不会改变它 |

规律很简单。一个好的 VPN 把信任从你恰好坐在其中的那张网络上挪走。它没办法让你对你登录的那些网站隐身。

## 运营商为什么在意你上网做了什么？

因为这些数据值钱，而且在一些国家，法律要求他们留存。

2021 年 10 月，美国联邦贸易委员会（FTC）就六家运营商[发布了一份工作报告](https://www.ftc.gov/news-events/news/press-releases/2021/10/ftc-staff-report-finds-many-internet-service-providers-collect-troves-personal-data-users-have-few)，这六家合起来占该国移动互联网市场约 98%。报告发现，它们收集的数据“远多于许多消费者的预期”，其中包括访问用户全部互联网流量和实时位置的权限。有的还按种族或性取向把客户分组，用于投放广告。

留存法规又加了一层：

- **英国。** 根据 [2016 年《调查权力法》](https://www.legislation.gov.uk/ukpga/2016/25/section/87)第 87 条，运营商可被要求把“互联网连接记录”（某台设备连接过哪些服务）保存最长 12 个月。
- **俄罗斯。** 自 2018 年 7 月 1 日起，亚罗瓦娅法要求运营商[保存通信内容六个月、元数据三年](https://www.hrw.org/news/2020/06/18/russia-growing-internet-isolation-control-censorship)。
- **欧盟。** 欧盟最高法院在 2014 年[废止了《数据保留指令》](https://curia.europa.eu/site/upload/docs/application/pdf/2014-04/cp140054en.pdf)，2016 年又更进一步，裁定对流量数据的无差别留存违反欧盟法律。仍有若干成员国在执行各自的国内方案。

这些都不需要你同意。流量一旦不受保护地离开你的设备，这就是它的去处。

## 注册时要邮箱，为什么是隐私风险？

多数 VPN 应用的第一步是一张注册表：邮箱、密码，然后是银行卡。每一个字段都是服务方从此持有的一份数据，而持有的数据是会泄露的。

VPN 行业里最严重的几次泄露，恰恰出自那些承诺什么都不留的服务商：

- **2020 年。** 七款共用同一套后端的香港 VPN 应用，其中包括 UFO VPN，全都宣称“无日志”。研究人员发现了一个对外敞开的数据库，里面有[超过 10 亿条日志记录](https://www.theregister.com/2020/07/17/ufo_vpn_database/)，合计 1.2 TB，包含邮箱地址、明文密码、IP 地址和连接日志。
- **2021 年。** SuperVPN、GeckoVPN 和 ChatVPN 的 [2100 万用户记录](https://www.kaspersky.com/blog/supervpn-geckovpn-chatvopn-leak/39029/)被挂到黑客论坛上出售：邮箱、密码、姓名、国家和支付信息。
- **2023 年。** 一名研究人员发现了一个毫无防护的 SuperVPN 数据库，内含 [3.6 亿条记录](https://www.vpnmentor.com/news/report-super-vpn-breach/)，其中有用户的原始 IP 地址和访问过的网址。

VPN 绝不是特例。Troy Hunt 运营的泄露索引 [Have I Been Pwned](https://haveibeenpwned.com/) 截至 2026 年 9 月已收录超过 178 亿个被泄露的账户。Verizon 的 [2026 年数据泄露调查报告](https://www.verizon.com/business/resources/executivebriefs/2026-dbir-executive-summary.pdf)发现，在它研究过的泄露事件中，约四分之一被窃取的数据里含有登录凭据。

```chart
dbir-2026
```

欧洲的隐私法把解决办法写成了一句话。[GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj) 第 5 条第 1 款第 (c) 项规定，个人数据必须“限于必要的范围”。从未被收集的数据，不会被泄露，不会被卖掉，也没法被交出去。

## Doppler 为什么不用注册也能连上？

你第一次打开 Doppler 时，应用会在你的设备上生成一个随机账户 ID。它长得像 `VPN-XXXX-XXXX-XXXX`，而它*就是*你的订阅本身。没有邮箱输入框，没有手机号，也没有一个你会在别处重复使用的密码。

```chart
schema-device
```

如果你在 1990 年代末申请过 QQ 号，这个思路会很眼熟。联系人靠一串数字认出你，这就够了。Doppler 是同一个道理，只是少了那份联系人名单。

和常见的注册流程摆在一起，变化在这里。

| 数据项 | 常见的 VPN 注册 | Doppler |
|---|---|---|
| 邮箱地址 | 必填 | **从不索取** |
| 手机号 | 有时需要 | **从不索取** |
| 密码 | 必填，而且常被重复使用 | **没有**，随机 ID 就是凭据 |
| 真实姓名 | 从银行卡带出来 | 通过应用商店或加密货币付款时不会收集 |
| 账户标识 | 与邮箱绑定 | 随机的 `VPN-XXXX-XXXX-XXXX` |
| 设备标识 | 各家不同 | 有，用于执行你套餐的设备数量限制 |
| API 认证记录 | 各家不同，而且常常不公开 | IP、账户 ID、设备 ID 和时间，为防止滥用最长保留 90 天 |

最后一行是我们特意列出来的。应用与我们的 API 通信、完成认证或获取服务器列表时，我们会看到请求来自哪个 IP 地址，任何网络服务都是如此。这条认证记录我们最长保留 90 天，用于防止滥用和限制请求频率。它说明有一台设备完成了认证。它说明不了你此后做了什么，因为流量从不被记录。我们的[安全页面](/security)列出了完整清单。

如果你在我们的网站上付款，看到银行卡信息的是支付处理方，不是我们。如果你希望完全不关联任何姓名，可以[用加密货币付款](/pay-with-crypto)。

### 这和通行密钥（passkey）是一回事吗？

思路是相关的。自 2019 年 3 月 W3C 把 WebAuthn 定为网络标准以来，各家网站一直在转向另一种登录方式：用设备上生成的密钥，取代你亲手敲进去的密码。FIDO 联盟[统计](https://fidoalliance.org/fido-alliance-reports-accelerating-global-passkey-adoption-on-world-passkey-day-2026/)，到 2026 年 5 月已有约 50 亿个通行密钥在使用。通行密钥仍然挂在一个账户上，而那个账户背后通常还是你的邮箱。Doppler 再往前走了一步：那个 ID 背后根本没有身份。

## 接下来会发生什么？

应用完成认证之后，它会打开隧道。从那一刻起，你的 DNS 查询、TLS 握手里的网站名，以及你真正要去的地方，全都走在隧道内部，你的 Wi-Fi 主人和你的运营商再也读不到。

麻烦之处在于，一条普通的 VPN 隧道很容易被认出来，而在许多国家，被认出来就意味着被封。Doppler 如何避开这一点，是[第二步：VLESS-Reality 隧道](/how-it-works/vless-reality-tunnel)要讲的事。

想先看看自己设备的暴露程度？我们免费的 [IP 查询](/tools/what-is-my-ip)、[DNS 泄漏测试](/tools/dns-leak-test)和 [WebRTC 泄漏测试](/tools/webrtc-leak-test)会准确告诉你，一个网站此刻能从你的连接里知道些什么。
