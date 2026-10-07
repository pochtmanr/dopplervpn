> **簡短版本。** WireGuard 是主流 VPN 協定中最快、最簡單的一種，在沒有過濾的網路上是很好的選擇。但它從來不是為了隱藏自己是 VPN 而設計的，在俄羅斯、伊朗和中國，它是最先被封鎖的協定之一。

## 什麼是 WireGuard？

WireGuard 是由 Jason A. Donenfeld 撰寫、於 2015 年首次發布的 VPN 協定。它的目標是取代先前那些龐大、可設定項目繁多的協定，做出一個小到可以逐行審查的協定。2020 年 3 月，它[被合併進 Linux 5.6 核心](https://en.wikipedia.org/wiki/WireGuard)，目前 Windows、macOS、iOS、Android 和 Linux 都有官方應用程式。

WireGuard 不讓雙方協商加密套件，而是固定使用一組現代的密碼學原語。它的[協定頁面](https://www.wireguard.com/protocol/)列出了這些原語：加密使用 ChaCha20 搭配 Poly1305，金鑰交換使用 Curve25519，雜湊使用 BLAKE2s。沒有可能設定錯誤的選項，也沒有可以退回使用的舊版、較弱的選項。

## 它是如何運作的？

每台裝置都有一組金鑰對，和 SSH 很類似。客戶端和伺服器事先知道彼此的公開金鑰，交握以 Noise 協定框架為基礎（協定頁面載明了確切的構造：`Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`）。[所有封包都透過 UDP 傳送](https://www.wireguard.com/protocol/)，新的連線階段只需一次往返即可建立。

這樣的設計讓 WireGuard 感覺很快。需要協商的內容很少，在 Linux 上程式碼直接在作業系統核心內執行，而且協定不會長時間保持連線開啟，因此在 Wi-Fi 與行動數據之間切換時也能安靜地處理。

## 為什麼 WireGuard 會被封鎖？

讓 WireGuard 易於審查的簡單性，同樣也讓它容易被辨識。它的[白皮書](https://www.wireguard.com/papers/wireguard.pdf)逐位元組規定了交握訊息，因此客戶端送出的第一個封包永遠是 148 位元組，回應永遠是 92 位元組，且都以固定的訊息類型欄位開頭。深度封包檢測（DPI）系統只需一條簡短的規則，就能在 UDP 上發現這種模式。

審查機構確實這麼做了。2023 年 8 月，俄羅斯的使用者[回報](https://github.com/net4people/bbs/issues/274)，主要行動電信業者會在交握之後立即切斷 WireGuard 連線。加密仍然保護著內容，但連線本身已經中斷。

這是設計上的取捨，不是缺陷。WireGuard 的作者選擇了固定而精簡的協定，偽裝並不在目標之列。[AmneziaWG](/vpn-protocols/amneziawg) 等專案則透過改變封包的形狀，恢復部分掩護效果。

## 什麼時候該使用 WireGuard？

- **沒有過濾的網路。** 在家裡、在公司，或在不封鎖 VPN 的國家旅行時，WireGuard 在速度和省電方面很難被超越。
- **自行架設。** 如果你自己架設伺服器，WireGuard 是最容易正確設定的協定之一。
- **不在 DPI 過濾之下。** 如果你的網路會封鎖 VPN，專為看起來像一般網頁流量而設計的協定（例如 [VLESS-Reality](/vpn-protocols/vless-reality)）會更合適。我們對 [VLESS-Reality 與 WireGuard](/blog/vless-reality-vs-wireguard) 的比較對這個取捨有更詳細的說明。

## Doppler 使用 WireGuard 嗎？

不使用。Doppler 的應用程式透過 VLESS-Reality 連線，因為 Doppler 是為 WireGuard 會被過濾的網路而打造的。[為什麼選擇 VLESS](/vpn-protocols/why-vless) 指南說明了其中的理由。
