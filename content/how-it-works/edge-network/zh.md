> **简短版。** 边缘节点是你的流量走出隧道、进入开放互联网的地方。它把你的真实 IP 换成自己的，替你解析 DNS，并且在网络条件允许的范围内尽量离你近一些，因为光纤每多 100 km，往返就要多花大约一毫秒。它同时也是一家 VPN 的“无日志”承诺兑现或者破产的地方。下面是我们的节点保存什么、不保存什么，包括其他服务商通常略过不提的那几行。

## 边缘节点到底做什么？

如果你是在拨号上网的年代上的网，一定还记得运营商曾经是你通往互联网的唯一一扇门。每一个请求都从他们的机房出去，挂着他们的名字。VPN 的边缘节点是在别处开的第二扇门，并且把自己的名字借给你用。

用技术语言讲，它做三件事。

1. **它终结隧道。** 从[第二步](/how-it-works/vless-reality-tunnel)过来的加密 VLESS-Reality 连接在这里落地并被拆封。
2. **它替换地址。** 节点用自己的公网 IP 转发你的请求，这个技术叫网络地址端口转换，早在 2001 年就由 [RFC 3022](https://www.rfc-editor.org/rfc/rfc3022) 定义。你访问的网站看到的是节点，不是你家里或手机上的那条连接。
3. **它回答你的 DNS 查询。** Doppler 在隧道内部解析 DNS，所以你访问过的域名清单，从不经过运营商的解析服务器。

```chart
schema-edge
```

第三点很容易被忽略。未加密的 DNS 是老式明文互联网留下的尾巴，一个把流量送进隧道、却把 DNS 留在外面的 VPN，等于照样给运营商递上了一本你打开过哪些网站的流水账。我们的 [DNS 泄漏测试](/tools/dns-leak-test)几秒钟就能告诉你，你的 VPN 是不是正在这么干。

## 离服务器越远，为什么就越慢？

因为光很快，但还没快到可以忽略不计。当年用 56k 猫打网游的人，早在弄明白原因之前就学会了“卡”这个字。原因里总有一份是距离。

光在光纤里的速度大约是真空中的三分之二，约每秒 200,000 km。Cloudflare 的工程师[把这件事算得很清楚](https://blog.cloudflare.com/fastest-internet/)：一台 100 km 外的服务器，在任何计算机开始干活之前，就已经要花掉你至少 **1 ms** 的往返时间。真实的线路从来不是直线，所以真实的数字总是更高。

```chart
latency-distance
```

虚线和实测点之间的差距就是路由：沿着海岸线铺设的海缆、在不同网络之间跳转的流量、以及单纯就是很忙的链路。测试过的最快跨大西洋海缆 Hibernia Express 在 2015 年于纽约和伦敦之间[跑进了 59 ms 以内](https://www.submarinenetworks.com/en/systems/trans-atlantic/project-express/hibernia-express-connects-new-york-to-london-in-under-58-95ms)。同样这两座城市之间，普通互联网路径实测约为 70 ms。

### 多大的延迟人能感觉出来？

关于通话，电信行业早就有定论。国际电信联盟的 [G.114 建议书](https://www.itu.int/rec/T-REC-G.114-200305-I/en)写明了一场对话能承受多少单向延迟。

| 单向延迟 | 实际感受（ITU-T G.114） |
|---|---|
| 0 到 150 ms | 基本无感。多数人察觉不到任何异常。 |
| 150 到 400 ms | 还能用，但双方开始抢话。 |
| 超过 400 ms | 对正常对话而言无法接受。 |

至于网页，人们的耐心比嘴上承认的还要少。谷歌的研究发现，页面加载超过三秒时，[53% 的移动端访问](https://www.marketingdive.com/news/google-53-of-mobile-users-abandon-sites-that-take-over-3-seconds-to-load/426070/)会被直接放弃。绕道一台远在天边的服务器，会在你发出的每一个请求上吃掉这份预算。

正因如此，Doppler 应用会自动为你所在的位置挑选最快的节点。一个就近的节点只多出几毫秒。挑错了，挑到地球另一边，可能给你做的每一件事都加上四分之一秒。

## “零日志”到底意味着什么？

每一家 VPN 都说自己不留日志。有些说的是实话，有些不是。唯一算数的检验，是有人拿着法院命令上门的时候会发生什么，而这种事发生得够多，多到已经攒出了一份记录。

| 年份 | 服务商 | 发生了什么 | 结果 |
|---|---|---|---|
| 2011 | HideMyAss | LulzSec 案中的英国法院命令 | 会话日志被[交了出去](https://www.theregister.com/2011/09/26/hidemyass_lulzsec_controversy/)，一名用户被捕 |
| 2016 | Private Internet Access | 炸弹恶作剧案中的 FBI 传票 | 只能说出这些 IP [“来自东海岸”](https://torrentfreak.com/vpn-providers-no-logging-claims-tested-in-fbi-case-160312/) |
| 2016 | IPVanish | 美国国土安全部传唤 | 尽管宣称“零日志”，真实 IP 和连接时间还是被[交了出去](https://torrentfreak.com/ipvanish-no-logging-vpn-led-homeland-security-to-comcast-user-180505/) |
| 2017 | PureVPN | FBI 网络跟踪骚扰案 | 记录把账户[关联](https://torrentfreak.com/purevpn-logs-helped-fbi-net-alleged-cyberstalker-171009/)到了嫌疑人的家庭和工作 IP |
| 2017 | ExpressVPN | 服务器在土耳其被扣押 | 警方[什么都没找到](https://torrentfreak.com/vpn-server-seized-to-investigate-russian-ambassadors-assassination-1171219/)，没有任何能识别用户的信息 |
| 2023 | Mullvad | 瑞典警方持搜查令上门 | 警员[空手而归](https://mullvad.net/en/blog/mullvad-vpn-was-subject-to-a-search-warrant-customer-data-not-compromised)，那些数据根本不存在 |
| 2025 | Windscribe | CEO 因一名用户的行为在希腊被起诉 | 法院[驳回了指控](https://windscribe.com/blog/windscribe-greek-court-case/)，没有日志可以把任何人关联起来 |

这张表要讲的不是哪个牌子好。它要讲的是，隐私政策里的承诺，强度取决于它背后的系统。挺过来的那几家，建的是一开始就不把数据写下来的服务器。

行业也在往“可以验证”的方向走。自 ExpressVPN 在 2019 年[宣布](https://www.expressvpn.com/blog/introducing-trustedserver/)服务器完全在内存中运行以来，纯内存架构已经相当普遍。大型服务商如今会付费请德勤、毕马威和 Cure53 这类机构定期做无日志审计。

## Doppler 的边缘节点保存哪些数据？

下面是完整清单，用词与我们的[安全页面](/security)和[隐私政策](/privacy)一致。

| 数据 | 是否存储？ |
|---|---|
| 你访问的网站，或你的浏览历史 | **从不** |
| 你的流量内容 | **从不** |
| DNS 查询 | **从不** |
| 使用的流量，或你连接了多久 | **从不** |
| 任何能把一个人和特定网络活动关联起来的信息 | **从不** |
| 匿名的聚合服务器性能指标 | 是，用于维持网络健康 |
| 针对我们 API 的认证记录（IP、匿名账户 ID、设备 ID、时间） | 是，为防止滥用最长保留 90 天 |

最后一行说的不是边缘节点。它讲的是你的应用向我们的 API 完成认证的那一刻，那时隧道还不存在；我们把它列出来，是因为我们宁可说得精确，也不愿把话说得听起来很绝对。这条记录能说明有一台设备完成了认证。它说明不了那台设备此后做了什么，因为根本没有任何流量记录可以拿来跟它对上。

### Doppler 注册在哪个国家？

Doppler VPN 由 SIMNETIQ LTD 运营，该公司注册于英格兰和威尔士。英国是[五眼联盟](https://www.dni.gov/files/ICIG/Documents/Partnerships/FIORC/FIORC-Charter-2025.pdf)情报伙伴之一，其[《调查权力法》](https://www.legislation.gov.uk/ukpga/2016/25/section/87)允许政府要求电信运营商留存连接记录。我们不会假装不是这样。我们能说的，就是上面那张表所说的：这类要求想找的流量记录，我们从一开始就没有生成，而法律要求没办法变出一份从未被写下来的数据。

## 边缘网络怎么帮着对抗封锁？

读不到你流量的审查方，会转而去封服务器。所以边缘网络必须一直动。

- **服务器分布在多个国家。** 一条线路慢了或者被封了，还有另一条，自动选择会挑出对你而言最快且可用的那条。
- **轮换。** 地址和配置会随着封锁手段的变化而更换，你不需要更新任何东西。
- **服务端的协议更新。** 当某张网络开始过滤某种传输方式时，就像 2025 年底部分俄罗斯运营商对 Reality 所做的那样，修复从我们这边发出，你的应用自己取走。

这是对抗审查中不光彩照人的那一半。拿到头条的是协议。让一大堆琐碎配置始终比过滤系统快一步，才是让你在某个平常的星期二依然连得上的原因。

## 你的流量接下来去哪里？

从边缘节点出去，你的请求抵达开放互联网，你要访问的网站看到的是节点的地址，不是你的。这是整段旅程的最后一步，也是你可以自己动手验证的一步。

我们的免费工具都在你的浏览器里运行，无需注册，不保存任何东西：[IP 地址查询](/tools/what-is-my-ip)、[DNS 泄漏测试](/tools/dns-leak-test)和 [WebRTC 泄漏测试](/tools/webrtc-leak-test)。关掉 Doppler 跑一遍，打开 Doppler 再跑一遍，然后对比。那个对比说明的东西，比我们在这里写的任何话都多。
