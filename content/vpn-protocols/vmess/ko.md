> **요약.** VMess는 V2Ray 프로젝트의 최초 프로토콜입니다. 자체 헤더를 암호화하며, 웹 트래픽처럼 보이도록 TLS 위의 WebSocket 같은 다른 전송 방식으로 감싸서 쓰는 경우가 일반적입니다. 지금도 작동하지만, 후속인 VLESS와 Trojan이 더 적은 오버헤드로 같은 역할을 합니다.

## VMess란?

VMess는 [V2Ray 프로젝트](https://github.com/v2fly/v2ray-core)가 2015년에 시작되면서 도입한 암호화 프록시 프로토콜입니다. V2Ray는 하나의 코어에 여러 프로토콜과 전송 방식, 어떤 트래픽을 어디로 보낼지 결정하는 라우팅 엔진을 갖춘, 프록시를 만들기 위한 모듈식 플랫폼으로 성장했습니다. VMess는 그 첫 프로토콜이었으며 몇 년 동안 주력 프로토콜이었습니다.

Shadowsocks와 마찬가지로 VMess도 기술적으로는 VPN이 아니라 프록시이지만, V2Ray 기반 앱은 기기 전체의 트래픽을 VMess로 보낼 수 있습니다.

## 어떻게 작동하나요?

각 사용자는 자격 증명 역할을 하는 UUID를 가집니다. [프로토콜 문서](https://www.v2fly.org/en_US/developer/protocols/vmess.html)에 따르면 클라이언트의 요청 헤더에는 Unix 타임스탬프, 난수, 체크섬으로 만든 인증 ID가 포함되며, 이는 사용자 ID에서 파생한 키로 암호화됩니다. 서버는 이를 이용해 사용자를 식별한 뒤 나머지 헤더와 데이터를 복호화합니다.

문서는 헤더를 보호하는 두 가지 방식을 설명합니다. 최신 방식은 AEAD 암호화를 사용하여 헤더가 변조되지 않았음을 보장합니다. 이전 방식은 MD5와 AES-128-CFB를 사용했고 헤더의 무결성을 보장할 수 없었기 때문에, 문서는 이를 쓰지 말라고 경고합니다. 인증 ID에 타임스탬프가 포함되므로 클라이언트와 서버의 시계가 대략 맞아야 하며, 이는 "도무지 연결이 안 된다"는 문제의 흔한 원인입니다.

## VMess는 차단하기 얼마나 어려운가요?

VMess 단독으로는 무작위 바이트처럼 보이며, [Shadowsocks](/vpn-protocols/shadowsocks)와 같은 처지에 놓입니다. 즉 완전히 암호화된 트래픽을 차단하는 방화벽에 노출됩니다. 그래서 VMess는 보통 도메인과 인증서를 갖춘 TLS 위의 WebSocket이나 gRPC 안에 넣어 배포하며, 관찰자에게는 웹사이트에 대한 일반 HTTPS 연결처럼 보이게 합니다.

트래픽을 숨기는 일은 대부분 이 포장이 맡으며, 그만큼 비용이 따릅니다. 도메인과 인증서가 필요하고 서버 앞에 CDN을 두는 경우도 많으며, 서버는 TLS와 VMess로 데이터를 두 번 암호화하게 됩니다.

## VMess, VLESS, Trojan 중 무엇이 좋을까요?

[VLESS](/vpn-protocols/vless-reality)는 Xray 프로젝트가 더 가벼운 후속으로 설계했습니다. UUID 기반 신원은 유지하되 VMess 고유의 암호화를 없애고 TLS 계층에만 의존하므로 이중 암호화를 피합니다. [Trojan](/vpn-protocols/trojan)도 UUID 대신 비밀번호를 사용한다는 점만 다를 뿐 비슷한 접근을 취합니다. 자세한 내용은 [VLESS, VMess, Trojan](/blog/vless-vs-vmess-vs-trojan) 비교에서 다룹니다.

## Doppler는 VMess를 사용하나요?

아니요. Doppler는 Reality를 적용한 VLESS를 사용합니다. 이유는 [왜 VLESS인가](/vpn-protocols/why-vless) 가이드에서 설명합니다.
