> **简短版。** 从 App Store 安装 Doppler，打开应用，点 Connect。没有注册表单：应用会为你生成一个匿名账户 ID。本指南其余内容都是可选的，大多数人用不上。

## 安装并连接

Doppler 是一款面向 iPhone、iPad 和 Mac 的 App Store 应用。iPhone 和 iPad 需要 iOS 或 iPadOS 18 或更高版本。Mac 需要 macOS 15 Sequoia 或更高版本。

1. 在设备上从 App Store 获取 **Doppler VPN**。
2. 打开它。Doppler 会当场创建一个账户 ID。不会要求你提供邮箱、电话号码或密码。
3. 点 **Connect**。第一次时，iOS 或 macOS 会询问是否允许 Doppler 添加 VPN 配置。请允许。该提示来自 Apple，你只会看到一次。

那些还记得拨号上网时要在对话框里填电话号码、用户名和调制解调器初始化字符串的人，会觉得这一步很短。这是有意为之。从前要你操心的设置，现在都交给了应用。

```shots
/images/apple/iphone-connect-1000.avif | 主页 | iPhone 上的 Doppler 主屏幕，已连接到香港
/images/apple/iphone-search-1000.avif | 服务器 | iPhone 上的服务器列表，显示各位置的延迟
/images/apple/iphone-unblock-1000.avif | Connection method | iPhone 上的 Connection method 界面
```

## 主屏幕

当盾牌变成青色并显示 **Connected** 时，设备上的每个应用都会通过隧道发送流量。盾牌下方可以看到你所在的服务器及其延迟。再往下是实时下载和上传速度，以及流量出口位置的小地图。

点服务器那一行即可更换服务器。列表会在你连接前测好每个位置的延迟，方便你选最近的，或响应最快的。

在 Mac 上，同样的界面放在侧边栏里：顶部是 VPN、Servers、Speed Test、Connection 和 Smart Route，然后是你的 Profile、Subscription 和 Devices，再往下是 App Settings 和 Help。

![MacBook Pro 上的 Doppler，已连接，盾牌下方是测速与路由地图](/images/apple/mac-front-1800.avif "Mac 上的 VPN 界面：盾牌、服务器，然后是速度与路由。")

```shots
/images/apple/mac-path-1920.avif | Connection | Mac 上的 Connection 界面，地图上显示路由
/images/apple/mac-split-1920.avif | Smart Route | Mac 上的 Smart Route 界面
```

## 查看网站看到了什么

**Connection** 界面回答每个 VPN 用户迟早都会问的问题：它真的在工作吗？它会显示网站当前看到的 IP 地址、该地址所属的网络、你的 DNS 查询是否走隧道、一次查询要多久，以及画在地图上的路由。

如果显示的是你自己的地址而不是服务器的，说明隧道没有承载你的流量。Disconnect，再 Connect；若问题仍在，Help and Support 下的 Connection log 会保留最近几次尝试，供我们的支持团队查看。

## 用 Smart Route 让本地站点走本地

家里的银行、税务网站和流媒体服务常常拒绝国外地址。**Smart Route** 会把本国站点直接送出，其余流量仍走隧道。选择你的国家，或让 Doppler 自动检测，然后决定哪些走直连：例如 `.jp` 这类域名区、托管在该国的站点，或你自己添加的域名。

直连的内容不受 VPN 保护。这就是取舍，也是 Smart Route 默认关闭、需要你主动打开的原因。

## 若网络封锁了连接

有些网络会通过读取连接声称要访问的网站名来封锁 VPN。Doppler 的应对是 **Connection method** 界面，可从服务器列表顶部或 App Settings 打开。保持 **Automatic**，应用会同时尝试三个最可能的伪装站点，并保留最快的那个。[关于 SNI 的指南](/guides/what-is-sni)解释了底层发生了什么。

## 值得了解的设置

在 **App Settings** 中：

- **Connect on Launch** 会在你打开应用时立刻连接。
- **Kill Switch** 会在 VPN 断开时自动重连，而不是让流量在无保护状态下离开。
- **Language** 只切换应用语言，不影响设备其余部分。
- **Appearance** 可设置文字大小、界面风格，以及六种强调色之一。

在 iPhone 上还有带 Connect 按钮的主屏幕小组件，以及可作为遥控器的 [Apple Watch 应用](/guides/vpn-on-apple-watch)。

## 出问题时

连接失败时，Doppler 只显示一条明白的说明，绝不会甩出一墙错误代码。如果说明帮不上忙，在应用里打开 **Help and Support**，查看联系我们的方式。那里的 **Connection log** 会保留最近 50 次尝试，并允许你复制技术细节一并发送。它从不在屏幕上完整展示这些细节，因此截图也泄露不了什么。
