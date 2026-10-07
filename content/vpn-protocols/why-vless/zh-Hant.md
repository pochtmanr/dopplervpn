> **簡短版本。** 我們為身處封鎖 VPN 的網路中的人打造了 Doppler。在這些網路上，問題不在於哪種協定在紙面上最快，而在於哪一種明天仍然連得上。我們選擇搭配 Reality 的 VLESS，是因為它讓審查機構可辨識、可封鎖的東西最少，同時我們也接受隨之而來的取捨。

## 我們是為了什麼而選擇？

Doppler 是為從刻意過濾 VPN 的地方連線的人而打造的：俄羅斯、伊朗、中國、部分海灣地區。在這些網路上，加密是最容易的部分。我們[比較](/vpn-protocols)中的每一種協定加密都做得很好。真正讓它們有所區別的，是過濾系統能否分辨出這條連線是 VPN，以及一旦分辨出來之後它能封鎖什麼。

因此我們用三個問題來評判每個選項：

1. **它有固定的特徵嗎？** 固定大小的交握或標準連接埠，只要一條規則就能比對到。
2. **審查機構探測伺服器時會發生什麼？** 防火牆會主動連線到疑似的代理，觀察它們如何回應。
3. **有什麼東西可以列入封鎖名單嗎？** 網域、憑證或可辨識的伺服器，即使流量本身隱藏得很好，也會成為目標。

## 為什麼不選 WireGuard、OpenVPN 或 IKEv2？

這三者都沒通過第一個問題。[WireGuard](/vpn-protocols/wireguard) 的交握封包永遠是 148 和 92 位元組。研究人員在真實 ISP 內部的研究，在超過 85% 的流量中辨識出了 [OpenVPN](/vpn-protocols/openvpn)。[IKEv2](/vpn-protocols/ikev2) 使用標準的 UDP 連接埠，可以整批丟棄。2023 年 8 月，俄羅斯的使用者[回報](https://github.com/net4people/bbs/issues/274)，電信業者在最初的幾個封包內就切斷了 WireGuard 和 OpenVPN。它們是適用於開放網路的好協定，但並不是為我們所面對的網路而設計的。

## 為什麼不選 Shadowsocks 或 VMess？

它們靠看起來像隨機位元組通過了第一個問題，而這最後也成了一種特徵。自 2021 年 11 月起，防火長城[封鎖不像任何已知協定的全加密流量](https://gfw.report/publications/usenixsecurity23/en/)。[VMess](/vpn-protocols/vmess) 可以包在 TLS 中來避免這個問題，但這樣就需要網域，這就帶到了第三個問題。

## 為什麼不選 Trojan？

[Trojan](/vpn-protocols/trojan) 在前兩個問題上答得很好：它是真正的 TLS，而且探測看到的是真實的網站。但每台 Trojan 伺服器都需要自己的網域和憑證。一旦審查機構得知該網域，就能封鎖它，而維運大量網域則是一場不斷的追逐。

## VLESS-Reality 做對了什麼

[VLESS-Reality](/vpn-protocols/vless-reality) 回答了全部三個問題：

- **沒有固定的特徵。** 連線是 TCP 上的 TLS 1.3，是網際網路上最常見的加密流量。
- **探測看到的是真實的網站。** Reality 會把無法通過驗證的人轉交給它所借用交握的那個真實網站，並呈現該網站真正的憑證。
- **沒有我們自己的東西可供按名稱封鎖。** 交握中沒有 Doppler 的網域或憑證。

它也透過 TCP 執行，因此在限速或封鎖 UDP 的網路上仍能運作，而 [Hysteria 2](/vpn-protocols/hysteria2) 和 [AmneziaWG](/vpn-protocols/amneziawg) 在這些網路上會吃力。而且 VLESS 本身很小：它依賴 TLS 來加密，而不是自己再加一層，所以沒有雙重加密。

## 我們放棄了什麼

- **在容易掉包的連線上的原始速度。** TCP 從封包遺失中恢復的表現不如 QUIC 或 WireGuard 的 UDP。在良好的連線上差異很小；在不佳的連線上則可能很明顯。
- **作業系統內建支援。** 沒有任何作業系統內建 VLESS 客戶端，所以你需要一個應用程式。我們認為這是可以接受的，並為 iOS、Android、macOS 和 Windows 打造了自己的應用程式。
- **完美的隱形。** 這並不存在。研究已證明 [TLS 內再承載 TLS 可以被辨識特徵](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting)，2025 年 11 月，部分俄羅斯 ISP 也被[回報](https://github.com/net4people/bbs/issues/546)切斷了 Reality 連線。VLESS-Reality 是一種抗審查的設計，而不是一種保證。

## 我們如何應對這些限制

審查在不斷變化，所以選擇協定並不是工作的終點。隨著過濾方式改變，我們會調整伺服器設定和 Reality 所借用的網站，並持續關注這些頁面所引用的相同研究和社群回報。如果出現更好的做法，本頁會註明。

關於 VLESS-Reality 運作方式的完整技術說明，請閱讀 [VLESS-Reality 通道](/how-it-works/vless-reality-tunnel)。想試用的話，請參閱 [VLESS VPN](/vless-vpn)。
