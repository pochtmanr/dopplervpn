> **簡短版本。** AmneziaWG 是 WireGuard 的分支，保留了它的速度和密碼學設計，但改變了讓 WireGuard 容易被發現的封包形態和標頭。在一般 WireGuard 被封鎖的地方，它是很強的選擇，但有一個前提：一旦開啟混淆，它就無法再與標準的 WireGuard 伺服器通訊。

## 什麼是 AmneziaWG？

AmneziaWG 由 [Amnezia VPN](https://amnezia.org/) 背後的團隊開發，Amnezia VPN 是用來架設自己 VPN 伺服器的開源應用程式。該專案的 [Go 實作](https://github.com/amnezia-vpn/amneziawg-go)始於 2023 年。它以 [WireGuard](/vpn-protocols/wireguard) 為基礎，WireGuard 快速又簡單，但交握固定且容易辨識，AmneziaWG 則加上了一層用來偽裝它的機制。

## 它改變了什麼？

[AmneziaWG 文件](https://docs.amnezia.org/documentation/amnezia-wg/)描述了數種機制，每一種都由設定參數控制：

- **動態標頭（H1–H4）。** 標準 WireGuard 封包的四種封包格式，各自以固定的訊息類型開頭。AmneziaWG 把這些值替換成從設定範圍中選出的數字，因此兩套不同的設定不會共用標頭，也沒有任何單一過濾規則能全部比對到它們。
- **封包長度隨機化（S1–S4）。** 在 WireGuard 中，初始交握封包永遠剛好是 148 位元組。AmneziaWG 為每種封包類型加上隨機前綴，使大小各不相同。
- **垃圾封包（Jc、Jmin、Jmax）。** 在交握之前，客戶端會傳送可設定數量、長度隨機的偽隨機封包，在時間和大小上都模糊了連線階段的開端。
- **標頭保護。** 較新的版本還可以加密訊息類型欄位本身。

在底層，密碼學和整體設計仍然是 WireGuard 的。

## AmneziaWG 有多難封鎖？

它去除了過濾系統用來對付 WireGuard 的簡單特徵：固定的大小和固定的標頭值。這使它在封鎖 VPN 的網路上，比一般的 WireGuard 有韌性得多。

它仍然透過 UDP 執行，因此大範圍對 UDP 限速或封鎖的網路會影響它，而且它的流量並不像 [VLESS-Reality](/vpn-protocols/vless-reality) 模仿對真實網站的 TLS 造訪那樣，去模仿任何特定的應用程式。直接封鎖無法辨識的 UDP 的過濾系統，仍然可能攔下它。

## 什麼時候該使用 AmneziaWG？

- **WireGuard 被封鎖、但 UDP 仍可使用的地方**，而且你想要接近 WireGuard 的速度。
- **自行架設的伺服器**，使用 Amnezia VPN 應用程式來設定。
- 請另外準備一個以 TCP 為基礎的選項（例如 VLESS-Reality），以應對過濾 UDP 的網路。我們的[俄羅斯指南](/vpn-for-russia)說明了目前在那裡哪些方式能夠通行。

## Doppler 使用 AmneziaWG 嗎？

不使用。Doppler 使用 VLESS-Reality。請參閱[為什麼選擇 VLESS](/vpn-protocols/why-vless)。
