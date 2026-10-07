> **簡短版本。** Hysteria 2 是建立在 QUIC 之上的代理協定，QUIC 正是 HTTP/3 背後的傳輸協定。它為了在不佳、容易掉包的連線上保持速度而設計，對於沒有密碼的人來說，它的伺服器表現得就像一般的 HTTP/3 網站。它的弱點是依賴 UDP，而有些網路會對 UDP 限速或直接封鎖。

## 什麼是 Hysteria 2？

Hysteria 是 [apernet](https://github.com/apernet/hysteria) 的開源專案；第 2 版是重新設計的協定，於 2023 年 9 月發布。和 Shadowsocks 及 VLESS 一樣，它是代理而不是傳統的 VPN，客戶端可以將整台裝置的流量透過它路由。

## 它是如何運作的？

根據它的[協定規格](https://v2.hysteria.network/docs/developers/Protocol/)，Hysteria 2 在 [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000) 所定義的 QUIC 之上執行，並使用不可靠資料報擴充來傳送 UDP 流量。QUIC 本身就提供 TLS 1.3 加密、多工串流和快速的連線建立。

偽裝是在驗證環節中達成的。規格要求 Hysteria 伺服器**必須實作真正的 HTTP/3 伺服器**（[RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)），並像任何網頁伺服器一樣處理請求。客戶端以一個特殊的 HTTP/3 請求進行驗證；其他任何人，無論是好奇的訪客還是主動探測，得到的都是一般的網頁回應。規格指出，對於沒有憑證的第三方，該伺服器的行為與標準的 HTTP/3 網頁伺服器完全相同。

## 為什麼它很快？

QUIC 在 UDP 之上執行，從封包遺失中恢復時不會像 TCP 那樣讓每條串流都停頓。Hysteria 也可以使用自己針對不穩定連線設計的壅塞控制，因此在壅塞的行動網路、長距離路由和有干擾的 Wi-Fi 上往往能維持速度，而這些情況下以 TCP 為基礎的協定會變慢。

## Hysteria 2 有多難封鎖？

面對主動探測，它的表現不錯，因為探測看到的是網頁伺服器。它的弱點在於傳輸層。審查機構可以對 UDP 或專門對 QUIC 限速或封鎖，而不會讓大多數網站無法使用，因為 HTTP/3 失敗時，瀏覽器會退回使用 TCP 上的 HTTP/2。在這種情況下，Hysteria 2 無路可走，而 [VLESS-Reality](/vpn-protocols/vless-reality) 這類以 TCP 為基礎的協定仍能繼續運作。

## 什麼時候該使用 Hysteria 2？

- **容易掉包或長距離的連線**，它的壅塞控制和 QUIC 的遺失恢復機制在這類連線上能發揮作用。
- **允許 UDP 的網路。** 在依賴它之前請先確認。
- 作為與 TCP 選項並用的第二種協定，這樣在 UDP 被過濾時就能切換。我們的[審查指南](/bypass-censorship)說明了過濾系統如何針對傳輸方式。

## Doppler 使用 Hysteria 2 嗎？

不使用。Doppler 透過 TCP 使用 VLESS-Reality，在封鎖 UDP 的網路上仍能持續運作。請參閱[為什麼選擇 VLESS](/vpn-protocols/why-vless)。
