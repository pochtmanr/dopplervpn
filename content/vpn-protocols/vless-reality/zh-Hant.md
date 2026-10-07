> **簡短版本。** VLESS 是 Xray 專案的極簡代理協定。Reality 則是讓 VLESS 連線看起來像是對某個真實熱門網站進行一般 TLS 1.3 造訪的 TLS 層，不需要你自己的網域或憑證。兩者結合，是目前審查機構最難封鎖的主流組合。本頁是摘要，完整內容請見我們的[深入指南](/how-it-works/vless-reality-tunnel)。

## 什麼是 VLESS？

VLESS 於[2020 年 7 月提出](https://github.com/v2ray/v2ray-core/issues/2636)，作為 [VMess](/vpn-protocols/vmess) 更輕量的後繼者。它的[規格](https://xtls.github.io/en/development/protocols/vless.html)刻意保持精簡：協定版本、用來識別使用者的 16 位元組 UUID、一個可選的附加欄位，以及目的地的指令、連接埠和位址。VLESS 本身沒有加密，而是依賴底層的 TLS 層，因此流量不會被加密兩次。

VLESS 屬於 [Xray-core](https://github.com/XTLS/Xray-core)，這個專案在 2020 年 11 月從 V2Ray 分出，現在主導這個協定家族的開發。

## Reality 增加了什麼？

[Trojan](/vpn-protocols/trojan) 這類協定藏在連往你自己網域的 TLS 之中，而那個網域就成了審查機構可以封鎖的目標。[Reality](https://github.com/XTLS/REALITY) 在 Xray-core 的 [2023 年 3 月 1.8.0 版](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0)中發布，消除了這個問題。

Reality 伺服器會呈現某個真實第三方網站的 TLS 交握。對旁觀者來說，這條連線就是對該網站進行的一般 TLS 1.3 造訪。知道伺服器金鑰的客戶端會被放行到 VLESS 通道；其他任何人，包括審查機構的主動探測，都會被轉交給那個真實網站，並看到它真正的憑證。沒有 Doppler 的網域或憑證可以被列入封鎖名單。

## VLESS-Reality 有多難封鎖？

它是我們所知最有韌性的主流選項，但並非隱形。2024 年發表的研究顯示，[TLS 內再承載 TLS 可以憑時間和封包大小被辨識特徵](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting)，2025 年 11 月，使用者[回報](https://github.com/net4people/bbs/issues/546)部分俄羅斯 ISP 切斷了 Reality 連線。供應商的因應方式是調整伺服器設定和所借用的網站，這場貓捉老鼠的遊戲仍在持續。

## 它有多快？

在日常使用中，開銷很小。VLESS 標頭每條連線只傳送一次，而 XTLS Vision 流程避免對已經加密的網頁流量再加密第二次。由於它透過 TCP 執行，在有封包遺失的網路上，VLESS-Reality 可能比 [WireGuard](/vpn-protocols/wireguard) 這類 UDP 協定慢，但在那些協定被封鎖的地方，它仍能持續運作。

## 我可以在哪裡了解更多？

- [VLESS-Reality 通道深入解析](/how-it-works/vless-reality-tunnel)：歷史、機制和限制。
- 我們部落格上的[什麼是 VLESS？](/blog/what-is-vless)和 [VLESS URI 格式](/blog/vless-uri-format)。
- [VLESS VPN](/vless-vpn)：Doppler 如何把 VLESS-Reality 包裝成一鍵式應用程式。
