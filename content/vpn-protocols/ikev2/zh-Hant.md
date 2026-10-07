> **簡短版本。** IKEv2/IPsec 是你的手機和筆電不需要任何應用程式就已經會使用的 VPN。它速度快，在 Wi-Fi 與行動數據之間切換時表現良好。但它也使用固定且廣為人知的連接埠，因此是審查機構最容易封鎖的協定之一。

## 什麼是 IKEv2/IPsec？

「IKEv2」其實是兩個協同運作的部分。IPsec 是對 IP 封包進行加密和驗證的協定套件。IKE（網際網路金鑰交換，Internet Key Exchange）則是雙方用來互相驗證並協商 IPsec 金鑰的協定。IKE 第 2 版於[2005 年 12 月](https://en.wikipedia.org/wiki/Internet_Key_Exchange)標準化，目前的規範是 [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296)。

由於它是 IETF 標準，IKEv2 內建於 iOS、macOS 和 Windows，Android 則從 11 版起內建。許多企業 VPN 閘道器都使用它。

## 它是如何運作的？

金鑰交換透過 UDP 進行，[通常使用 500 連接埠](https://en.wikipedia.org/wiki/Internet_Key_Exchange)。雙方協商好金鑰後，作業系統的 IPsec 堆疊會使用封裝安全酬載（Encapsulating Security Payload，ESP）加密你的流量。當路徑上有 NAT 路由器時（幾乎所有家用和行動網路都是如此），IKE 和 ESP 都會被包在 4500 連接埠的 UDP 中。

IKEv2 有一個名為 [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) 的標準擴充，可以讓連線在 IP 位址改變後繼續存在。這就是 IKEv2 在手機上使用起來很順手的原因：走出 Wi-Fi 範圍改用行動數據時，通道會繼續運作，而不是從頭重新連線。

## 為什麼 IKEv2 容易被封鎖？

IKEv2 完全不會試圖看起來像別的東西。它的流量使用廣為人知的 UDP 連接埠，並採用任何網路工具都能解析的標準 IKE 和 ESP 格式。封鎖它甚至不需要深度封包檢測：過濾器只要丟棄 UDP 的 500 和 4500 連接埠，或直接辨識 IKE 交換即可。

對企業網路和在開放國家旅行來說，這是合理的取捨，因為被辨識為 VPN 不會有任何代價。在刻意過濾 VPN 的網路上，它通常是最先失效的。

## 什麼時候該使用 IKEv2？

- **不允許安裝應用程式。** 在無法安裝軟體的受管理裝置上，內建的 IKEv2 客戶端可能是唯一的選擇。
- **在開放網路上行動漫遊。** 在網路之間移動時，MOBIKE 讓切換更順暢。
- **不在審查環境下。** 在有過濾的網路上，請選擇專為融入一般流量而設計的協定，例如 [VLESS-Reality](/vpn-protocols/vless-reality)。我們的[審查指南](/bypass-censorship)說明了封鎖是如何運作的。

## Doppler 使用 IKEv2 嗎？

不使用。Doppler 在自己的應用程式內以 VLESS-Reality 連線。原因請參閱[為什麼選擇 VLESS](/vpn-protocols/why-vless)。
