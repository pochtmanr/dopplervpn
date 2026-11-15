> **简短版。** Apple Watch 上的 Doppler 是你 iPhone 上 VPN 的遥控器。从手腕上可以 Connect 和 Disconnect、切换服务器、查看流量、跑测速并查看套餐。隧道、设置和账户都留在 iPhone 上。

## 手表应用是什么，不是什么

手表应用本身不运行 VPN。它向配对 iPhone 上的 Doppler 应用发送一条短指令，由 iPhone 完成工作，再把当前状态回传。这样手表保持轻量，也意味着始终只有一条隧道要管：手机上的那条。

这也意味着手表需要 iPhone 在附近，并且蓝牙已开启。手机超出范围时，手表会显示它最后听到的状态，并标明是何时听到的。

```shots
/images/apple/watch-servers-422.avif | Servers | Apple Watch 上的 Doppler 服务器列表
/images/apple/watch-devices-422.avif | Devices | Apple Watch 上账户下的 Devices
/images/apple/watch-profile-422.avif | Profile | Apple Watch 上的 Doppler Pro Profile
```

## 安装

手表应用需要 **watchOS 26**，以及你 iPhone 上的 Doppler 应用。

1. 确认 Doppler 已安装并在你的 iPhone 上登录。
2. 在 iPhone 上打开 **Watch** 应用，在可用应用中找到 Doppler，或在手表上从 App Store 安装。
3. 在手表上打开 Doppler。一段简短引导会带你熟悉界面，并以 “You're all set” 结束。

设置还会建议把 Doppler 加到表盘：长按表盘，点 Edit，然后为复杂功能选择 Doppler。复杂功能一眼就能看出 VPN 是否开启，点一下即可打开应用。

## 手腕上能做什么

- **Connect 和 Disconnect。** Connect 会回到你在 iPhone 上上次使用的服务器。从手表连接需要 Doppler Pro。免费套餐下手表会说明这一点，并不会真正拨号。
- **选择服务器。** 列表与手机相同。若 iOS 已在后台关闭 Doppler 应用，iPhone 会改为显示 “Finish switching” 通知，点一下即可完成切换。
- **查看流量。** 连接期间，手表会显示直接从隧道读取的实时下载和上传数据。
- **跑测速。** 测速在 iPhone 上运行，大约 20 秒，结果会流式传到手表。若 VPN 关闭，测试测的是 iPhone 自身连接，并会标明这一点。
- **查看设备和套餐。** Devices 界面列出登录你账户的所有设备。Profile 显示你的套餐、付费至的日期，以及账户 ID 的后四位。完整 ID 从不出现在手表上，因为它就是登录凭证。

## 当 VPN 断开时

若 iPhone 上的隧道失败，例如手机没了信号，Doppler 会发出 “VPN disconnected” 通知。在 iPhone 锁定且手表在手腕上时，iOS 会把它显示在手表上。它只在失败时出现，从不因你自己点 Disconnect 而出现，而且只有在允许 Doppler 发送通知时才会显示。

## 什么留在 iPhone 上

移除设备、更改 Connection method、Smart Route 以及所有其他设置都留在 iPhone 上。这是有意为之：小屏幕适合一键操作，不适合编辑路由规则。

若希望手表不再跟随手机，手表应用里有 **Disconnect from iPhone** 选项。它不会改动你的账户或隧道，之后在手表应用里再点任何内容就会重新关联。
