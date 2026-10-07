> **簡短版本。** Trojan 把代理流量藏在連往你所掌控的真實網站的真實 TLS 連線中。沒有密碼就連上來的人，只會得到那個網站。它運作得很好，但你需要自己的網域和憑證，而這些是可能被找出並封鎖的。

## 什麼是 Trojan？

Trojan 是來自 [trojan-gfw 專案](https://github.com/trojan-gfw/trojan)的代理協定，於 2017 年 10 月首次發布。它的想法就在名字裡：它不是發明一種偽裝，而是躲進網際網路上最常見的加密流量 HTTPS 之中。

## 它是如何運作的？

[協定說明](https://trojan-gfw.github.io/trojan/protocol)很簡短。Trojan 伺服器像一般的 HTTPS 伺服器一樣監聽，並持有真實網域的真實憑證。客戶端執行真正的 TLS 交握。接著，在加密連線內，客戶端會傳送：

- 共用密碼經十六進位編碼的 SHA-224 雜湊值，共 56 個字元，
- 一個換行，
- 一個小型請求，以類似 SOCKS5 的格式說明流量要送往哪裡，
- 另一個換行，後面接著第一段資料。

如果雜湊值和請求有效，伺服器就會開啟通往目的地的通道。如果有任何問題，伺服器會把該連線視為「其他協定」，轉交給備援網頁伺服器，因此訪客看到的是一個普通的網站。

## Trojan 有多難封鎖？

從外部看，Trojan 連線就是一個連往你網域、使用你憑證的 TLS 連線。主動探測得到的是一個真實的網站。這讓 Trojan 比 [Shadowsocks](/vpn-protocols/shadowsocks) 這類看似隨機的協定更難被挑出來。

它的弱點在於網域本身。每台伺服器都需要網域和憑證，而一旦審查機構得知哪些網域屬於代理，就能依網域名稱或 IP 封鎖它們。研究人員也已證明，TLS 內再承載 TLS 會留下時間和大小的模式，可以被[辨識特徵](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting)，這會影響 Trojan 和類似的設計。

[VLESS-Reality](/vpn-protocols/vless-reality) 借用現有熱門網站的 TLS 交握，而不是你自己的，從而消除了網域問題。

## 什麼時候該使用 Trojan？

- **當你掌控一個網域**，並想要簡單、廣為人知、看起來像 HTTPS 的設定時。
- **在過濾程度中等的網路上**，你的網域不太可能成為目標。
- 如果你正在選擇協定，我們對 [VLESS、VMess 和 Trojan](/blog/vless-vs-vmess-vs-trojan) 的比較會有幫助。

## Doppler 使用 Trojan 嗎？

不使用。Doppler 使用 VLESS-Reality，它不需要自己的網域。請參閱[為什麼選擇 VLESS](/vpn-protocols/why-vless)。
