> **요약.** VLESS는 Xray 프로젝트의 최소한의 프록시 프로토콜입니다. Reality는 VLESS 연결이 실제 인기 웹사이트에 대한 평범한 TLS 1.3 접속처럼 보이게 하는 TLS 계층이며, 별도의 도메인이나 인증서가 필요 없습니다. 둘을 합친 조합은 현재 주류 조합 중 검열 측이 차단하기 가장 어려운 편입니다. 이 페이지는 요약이며, 전체 내용은 [심층 가이드](/how-it-works/vless-reality-tunnel)에 있습니다.

## VLESS란?

VLESS는 [2020년 7월에 제안](https://github.com/v2ray/v2ray-core/issues/2636)된, [VMess](/vpn-protocols/vmess)를 더 가볍게 계승하는 프로토콜입니다. [사양](https://xtls.github.io/en/development/protocols/vless.html)은 의도적으로 작습니다. 프로토콜 버전, 사용자를 식별하는 16바이트 UUID, 선택 사항인 부가 기능 필드, 그리고 목적지의 명령, 포트, 주소로 구성됩니다. VLESS에는 자체 암호화가 없습니다. 하위의 TLS 계층에 의존하므로 트래픽이 두 번 암호화되지 않습니다.

VLESS는 2020년 11월 V2Ray에서 갈라져 나와 현재 이 프로토콜 계열의 개발을 이끌고 있는 프로젝트인 [Xray-core](https://github.com/XTLS/Xray-core)의 일부입니다.

## Reality는 무엇을 더하나요?

[Trojan](/vpn-protocols/trojan) 같은 프로토콜은 내 도메인에 대한 TLS 안에 숨으며, 그 도메인이 검열 측이 차단할 수 있는 대상이 됩니다. [Reality](https://github.com/XTLS/REALITY)는 Xray-core [2023년 3월 1.8.0](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0)에서 공개되었으며, 이 문제를 없앱니다.

Reality 서버는 실제 제3자 웹사이트의 TLS 핸드셰이크를 제시합니다. 관찰자에게 이 연결은 그 사이트에 대한 평범한 TLS 1.3 접속입니다. 서버의 키를 아는 클라이언트는 VLESS 터널로 통과시키고, 검열 측의 능동적 프로브를 포함한 그 밖의 모든 요청은 실제 웹사이트로 넘겨져 그 사이트의 진짜 인증서를 보게 됩니다. 차단 목록에 올릴 Doppler 도메인이나 인증서가 없습니다.

## VLESS-Reality는 차단하기 얼마나 어려운가요?

저희가 아는 한 주류 방식 중 가장 견고하지만 보이지 않는 것은 아닙니다. 2024년에 발표된 연구에서는 [TLS 안에서 전송되는 TLS는 지문 식별이 가능](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting)하며 타이밍과 패킷 크기로 드러난다고 밝혔고, 2025년 11월에는 일부 러시아 ISP가 Reality 연결을 끊고 있다는 사용자 [보고](https://github.com/net4people/bbs/issues/546)가 있었습니다. 제공자들은 서버 설정과 빌려 쓰는 사이트를 조정해 대응하며, 쫓고 쫓기는 싸움은 계속됩니다.

## 속도는 어떤가요?

일상적으로 사용할 때 오버헤드는 작습니다. VLESS 헤더는 연결당 한 번만 전송되고, XTLS Vision 플로는 이미 암호화된 웹 트래픽을 한 번 더 암호화하지 않도록 합니다. TCP로 실행되므로 패킷 손실이 있는 네트워크에서는 [WireGuard](/vpn-protocols/wireguard) 같은 UDP 프로토콜보다 VLESS-Reality가 느릴 수 있지만, 그런 프로토콜이 차단되는 곳에서도 계속 작동합니다.

## 더 알아보려면 어디를 보면 되나요?

- [VLESS-Reality 터널 심층 분석](/how-it-works/vless-reality-tunnel): 역사, 작동 원리, 한계.
- 블로그의 [VLESS란 무엇인가](/blog/what-is-vless)와 [VLESS URI 형식](/blog/vless-uri-format).
- [VLESS VPN](/vless-vpn): Doppler가 VLESS-Reality를 탭 한 번으로 쓰는 앱으로 구현한 방식.
