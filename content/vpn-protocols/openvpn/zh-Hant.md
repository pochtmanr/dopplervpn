> **簡短版本。** OpenVPN 是開源 VPN 中的老將：彈性高、支援廣泛，經過二十多年的使用也已被充分理解。但它比較新的協定慢，而且根據已發表的研究，它是網際網路服務供應商（ISP）最容易辨識出特徵的協定之一。

## 什麼是 OpenVPN？

OpenVPN 是免費的開源 VPN 軟體，由 James Yonan 於[2001 年 5 月](https://en.wikipedia.org/wiki/OpenVPN)首次發布。在 2000 年代和 2010 年代的大部分時間裡，它是商業 VPN 服務和企業遠端存取的預設選擇，至今仍內建於許多路由器和企業產品中。

它在使用者空間而不是作業系統核心中執行，並依靠 OpenSSL 函式庫和 TLS 協定進行金鑰交換。IANA 指派的連接埠是 1194，不過 OpenVPN 幾乎可以在任何連接埠上透過 UDP 或 TCP 執行。

## 它是如何運作的？

OpenVPN 使用由兩部分組成的自訂協定。控制通道使用 TLS 驗證雙方身分（通常使用憑證）並協商金鑰。接著由資料通道攜帶你的流量，以這些金鑰加密後放在 UDP 或 TCP 封包中傳送。

這樣的結構讓 OpenVPN 的可設定性很高。你可以選擇加密演算法、驗證方式、連接埠和傳輸方式，也可以透過代理執行。這種彈性的代價是複雜度：更多的程式碼、更多的設定，以及更多最終落入弱設定的可能。

## 為什麼 OpenVPN 會被封鎖？

OpenVPN 內部的 TLS 與造訪網站時的 HTTPS 並不相同。OpenVPN 把 TLS 交握包在自己的封包框架裡，因此它的流量具有一般網頁流量所沒有的形態。

研究人員測量了這件事的影響程度。密西根大學等機構的團隊[建立了一套特徵辨識系統](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen)，並在一家服務約一百萬使用者的 ISP 內部執行。它辨識出**超過 85% 的 OpenVPN 流量**，誤判極少，而且也抓出了他們測試的大多數商業「混淆」OpenVPN 設定。

現實中的過濾與研究結果一致。2023 年 8 月，俄羅斯的使用者[回報](https://github.com/net4people/bbs/issues/274)，行動電信業者會在 OpenVPN 連線開始後不久就將其切斷。

## 什麼時候該使用 OpenVPN？

- **相容性。** 較舊的路由器、企業閘道器和部分公司網路只支援 OpenVPN，不支援更新的協定。
- **僅限 TCP 的網路。** 在 UDP 被封鎖時，OpenVPN 可以改用 TCP，而 [WireGuard](/vpn-protocols/wireguard) 在沒有額外協助的情況下做不到。
- **不適用於有過濾的網路。** 在 VPN 被封鎖的地方，OpenVPN 往往很早就失效。模仿一般網頁流量的協定（例如 [VLESS-Reality](/vpn-protocols/vless-reality)）是更合適的工具。我們的[審查指南](/bypass-censorship)說明了過濾系統如何決定要切斷什麼。

## Doppler 使用 OpenVPN 嗎？

不使用。Doppler 在所有平台上都使用 VLESS-Reality。[為什麼選擇 VLESS](/vpn-protocols/why-vless) 指南說明了我們如何做出這個選擇。
