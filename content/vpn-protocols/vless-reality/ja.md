> **要点** VLESSは、Xrayプロジェクトが開発した最小限のプロキシプロトコルです。Realityは、VLESS接続を、実在する人気サイトへの通常のTLS 1.3アクセスに見せるTLS層で、自分のドメインや証明書は必要ありません。この2つの組み合わせは、現時点で主流のものの中で検閲当局が最もブロックしにくい構成です。このページは概要です。詳しい説明は[詳細ガイド](/how-it-works/vless-reality-tunnel)をご覧ください。

## VLESSとは

VLESSは、[VMess](/vpn-protocols/vmess)のより軽量な後継として、[2020年7月に提案されました](https://github.com/v2ray/v2ray-core/issues/2636)。[仕様](https://xtls.github.io/en/development/protocols/vless.html)は意図的に小さく作られており、プロトコルのバージョン、ユーザーを識別する16バイトのUUID、任意の追加機能フィールド、宛先のコマンド・ポート・アドレスだけで構成されます。VLESSには独自の暗号化がなく、下層のTLS層に任せるため、トラフィックが二重に暗号化されることはありません。

VLESSは、2020年11月にV2Rayから分岐し、現在このプロトコル群の開発を主導している[Xray-core](https://github.com/XTLS/Xray-core)の一部です。

## Realityは何を加えるのか

[Trojan](/vpn-protocols/trojan)のようなプロトコルは、自分のドメインへのTLSの中に隠れますが、そのドメインが検閲当局にブロックされ得る対象になります。Xray-coreの[2023年3月の1.8.0](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0)でリリースされた[Reality](https://github.com/XTLS/REALITY)は、それを取り除きます。

Realityサーバーは、実在する第三者のWebサイトのTLSハンドシェイクを提示します。傍受する側には、そのサイトへの通常のTLS 1.3アクセスに見えます。サーバーの鍵を知っているクライアントはVLESSトンネルに通され、それ以外の相手は、検閲当局のアクティブプローブも含めて、実在するWebサイトに回され、その本物の証明書が見えます。ブロックリストに載せられるようなDopplerのドメインや証明書はありません。

## VLESS-Realityのブロックのされやすさ

私たちが知る限り、主流の選択肢の中で最も耐性がありますが、見えないわけではありません。2024年に発表された研究では、[TLSの中でTLSを運ぶと](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting)、そのタイミングとパケットサイズからフィンガープリントを取れることが示されました。また2025年11月には、ロシアの一部のISPがRealityの接続を切断しているという[報告](https://github.com/net4people/bbs/issues/546)がユーザーからありました。プロバイダーはサーバーの設定や借りるサイトを調整して対応しており、いたちごっこが続いています。

## 速度は？

日常的な利用では、オーバーヘッドは小さなものです。VLESSのヘッダーは接続ごとに1回だけ送られ、XTLS Visionフローは、すでに暗号化されているWebトラフィックを再度暗号化するのを避けます。VLESS-RealityはTCPで動作するため、パケットロスの多いネットワークでは[WireGuard](/vpn-protocols/wireguard)のようなUDPプロトコルより遅くなることがありますが、それらがブロックされる環境でも動作し続けます。

## さらに詳しく知るには

- [VLESS-Realityトンネルの詳細](/how-it-works/vless-reality-tunnel)：歴史、仕組み、限界。
- ブログの[VLESSとは？](/blog/what-is-vless)と[VLESSのURI形式](/blog/vless-uri-format)。
- [VLESS VPN](/vless-vpn)：DopplerがVLESS-Realityをワンタップで使えるアプリにまとめている方法。
