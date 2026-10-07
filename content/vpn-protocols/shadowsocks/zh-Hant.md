> **簡短版本。** Shadowsocks 是一種輕量級的加密代理，在中國為了穿越防火長城而誕生。多年來，它的做法是讓流量看起來什麼都不像。自 2021 年起，研究顯示防火長城正好在封鎖這種流量，因為真實的流量很少會那麼隨機。

## 什麼是 Shadowsocks？

Shadowsocks 是於[2012 年 4 月](https://en.wikipedia.org/wiki/Shadowsocks)首次發布的開源代理協定。嚴格來說它不是 VPN：它是帶有加密的 SOCKS5 風格代理，由應用程式決定哪些流量要透過它傳送。實務上，目前大多數 Shadowsocks 客戶端都提供行為類似 VPN 的全系統模式。

它受歡迎是因為簡單又快速。目前的版本使用 [AEAD 加密演算法](https://shadowsocks.org/doc/aead.html)，一步就能同時提供機密性、完整性和真實性，協定的 [2022 版本](https://shadowsocks.org/doc/sip022.html)則加強了重放保護。

## 它是如何運作的？

客戶端和伺服器共用一組密碼，並由它產生加密金鑰。客戶端傳送的所有內容，包括想要造訪的網站位址，從第一個位元組起就是加密的。沒有可辨識的交握、沒有憑證，也沒有明文標頭。對旁觀者來說，Shadowsocks 連線就是一串看似隨機的位元組。

## 防火長城如何偵測 Shadowsocks？

首先是透過主動探測。GFW Report 的研究人員[記錄到](https://gfw.report/publications/imc20/en/)防火長城向疑似的 Shadowsocks 伺服器發送了數萬次探測，重放並修改真實連線，以觀察伺服器的反應。

接著，從 2021 年 11 月起，採用了一種更粗略、範圍更廣的方法。一項 [USENIX Security 2023 研究](https://gfw.report/publications/usenixsecurity23/en/)發現，防火長城會即時封鎖「全加密」流量。它檢查連線的第一個封包，並放行任何看起來像已知協定、或包含足夠可列印文字的流量。其中一條規則是計算每個位元組中被設為 1 的平均位元數：小於或等於 3.4、或大於或等於 4.6 的值會被放行，介於兩者之間、看似隨機的資料則不會。剩下的流量都可能被封鎖。

研究人員還發現，防火長城只對約 26% 的連線套用這項規則，而且只針對熱門資料中心的 IP 範圍，可能是為了限制附帶損害。對協定設計者來說，教訓很明確：看起來隨機本身就是一種特徵。

## 什麼時候該使用 Shadowsocks？

- **輕量、快速的代理**，適用於不會仔細檢查流量的網路。
- **自行架設**，搭配 Outline 等工具，設定起來很簡單。
- **在嚴格過濾下要謹慎使用。** 在中國和其他封鎖全加密流量的地方，Shadowsocks 遠不如模仿真實 TLS 的協定（例如 [VLESS-Reality](/vpn-protocols/vless-reality)）可靠。我們的[審查協定演進史](/blog/censorship-protocol-history)追溯了這個領域是如何向前發展的。

## Doppler 使用 Shadowsocks 嗎？

不使用。Doppler 使用 VLESS-Reality，原因請見[為什麼選擇 VLESS](/vpn-protocols/why-vless)。
