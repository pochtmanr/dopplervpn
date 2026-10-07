> **簡短版本。** VMess 是 V2Ray 專案最初的協定。它會加密自己的標頭，通常會包在另一種傳輸方式中（例如 TLS 之上的 WebSocket），讓流量看起來像網頁流量。它仍然可用，但它的後繼者 VLESS 和 Trojan 以更低的開銷完成同樣的工作。

## 什麼是 VMess？

VMess 是 [V2Ray 專案](https://github.com/v2fly/v2ray-core)在 2015 年啟動時推出的加密代理協定。V2Ray 後來發展成用來建構代理的模組化平台：一個核心、多種協定和傳輸方式，以及一個決定哪些流量走哪條路的路由引擎。VMess 是它的第一個協定，並在好幾年間都是它的主要協定。

和 Shadowsocks 一樣，VMess 嚴格來說是代理而不是 VPN，但以 V2Ray 為基礎的應用程式可以將你整台裝置的流量都透過它路由。

## 它是如何運作的？

每位使用者都有一個作為憑證的 UUID。根據[協定文件](https://www.v2fly.org/en_US/developer/protocols/vmess.html)，客戶端請求標頭中包含一個加密的驗證 ID，由 Unix 時間戳記、一個隨機數和一個校驗碼組成，並以從使用者 ID 衍生的金鑰加密。伺服器用它來辨識使用者，然後解密標頭的其餘部分和資料。

文件描述了兩種保護標頭的方式。較新的方式使用 AEAD 加密，可以保證標頭沒有被竄改。較舊的方式使用 MD5 和 AES-128-CFB，無法保證標頭的完整性，文件中也警告不要使用。由於驗證 ID 包含時間戳記，客戶端與伺服器的時鐘必須大致同步，這是造成「就是連不上」問題的常見原因。

## VMess 有多難封鎖？

單獨使用時，VMess 看起來像隨機位元組，處境和 [Shadowsocks](/vpn-protocols/shadowsocks) 相同：容易受到封鎖全加密流量的防火牆影響。這就是 VMess 通常部署在 TLS 之上的 WebSocket 或 gRPC 內、並放在網域和憑證之後的原因，這樣旁觀者看到的就是一個看似正常、連往某個網站的 HTTPS 連線。

這層包裝承擔了隱藏流量的大部分工作，同時也帶來成本：你需要網域、憑證，伺服器前面往往還要有 CDN，而且伺服器現在要把資料加密兩次，一次是 TLS，一次是 VMess。

## VMess、VLESS 還是 Trojan？

[VLESS](/vpn-protocols/vless-reality) 由 Xray 專案設計，作為更輕量的後繼者：它保留以 UUID 為基礎的身分，但捨棄 VMess 自己的加密，完全依賴 TLS 層，從而避免雙重加密。[Trojan](/vpn-protocols/trojan) 採取類似的做法，只是用密碼取代 UUID。我們對 [VLESS、VMess 和 Trojan](/blog/vless-vs-vmess-vs-trojan) 的比較有更詳細的說明。

## Doppler 使用 VMess 嗎？

不使用。Doppler 使用搭配 Reality 的 VLESS。[為什麼選擇 VLESS](/vpn-protocols/why-vless) 指南說明了原因。
