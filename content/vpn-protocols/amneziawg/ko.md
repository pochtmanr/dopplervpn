> **요약.** AmneziaWG는 WireGuard의 속도와 암호화는 그대로 두고, WireGuard를 쉽게 식별하게 만드는 패킷 형태와 헤더를 바꾼 포크입니다. 일반 WireGuard가 차단되는 곳에서 강력한 선택지이지만 한 가지 단점이 있습니다. 난독화를 켜면 더 이상 표준 WireGuard 서버와 통신하지 못합니다.

## AmneziaWG란?

AmneziaWG는 직접 VPN 서버를 운영하기 위한 오픈 소스 앱 [Amnezia VPN](https://amnezia.org/)을 만든 팀이 개발합니다. 이 프로젝트의 [Go 구현](https://github.com/amnezia-vpn/amneziawg-go)은 2023년에 시작되었습니다. 빠르고 단순하지만 고정되어 식별하기 쉬운 핸드셰이크를 가진 [WireGuard](/vpn-protocols/wireguard)에, 이를 위장하는 계층을 더한 것입니다.

## 무엇이 달라지나요?

[AmneziaWG 문서](https://docs.amnezia.org/documentation/amnezia-wg/)는 설정 매개변수로 제어하는 여러 메커니즘을 설명합니다.

- **동적 헤더(H1–H4).** 표준 WireGuard 패킷은 네 가지 패킷 형식마다 고정된 메시지 유형으로 시작합니다. AmneziaWG는 이 값을 설정된 범위에서 고른 숫자로 바꾸므로, 서로 다른 구성은 헤더를 공유하지 않으며 하나의 필터 규칙으로 모두를 잡을 수 없습니다.
- **패킷 길이 무작위화(S1–S4).** WireGuard에서 초기 핸드셰이크 패킷은 언제나 정확히 148바이트입니다. AmneziaWG는 패킷 유형마다 무작위 접두부를 붙여 크기가 달라지게 합니다.
- **더미 패킷(Jc, Jmin, Jmax).** 핸드셰이크 전에 클라이언트가 설정한 개수만큼 무작위 길이의 의사 난수 패킷을 보내, 세션의 시작 부분을 시간과 크기 양쪽에서 흐리게 합니다.
- **헤더 보호.** 최신 버전에서는 메시지 유형 필드 자체도 암호화할 수 있습니다.

그 아래의 암호화와 전체 설계는 WireGuard 그대로입니다.

## AmneziaWG는 차단하기 얼마나 어려운가요?

필터가 WireGuard에 쓰는 단순한 시그니처인 고정된 크기와 고정된 헤더 값을 없앱니다. 그래서 VPN을 차단하는 네트워크에서 일반 WireGuard보다 훨씬 견고합니다.

여전히 UDP로 실행되므로 UDP를 넓게 제한하거나 차단하는 네트워크에서는 영향을 받으며, [VLESS-Reality](/vpn-protocols/vless-reality)가 실제 웹사이트에 대한 TLS 접속을 모방하는 것처럼 특정 애플리케이션을 모방하지도 않습니다. 식별할 수 없는 UDP를 아예 차단하는 필터에는 여전히 걸릴 수 있습니다.

## AmneziaWG는 언제 쓰면 좋을까요?

- **WireGuard는 차단되지만 UDP는 여전히 작동하는** 곳에서 WireGuard와 비슷한 속도를 원할 때.
- Amnezia VPN 앱으로 설정하는 **직접 운영하는 서버**.
- UDP를 필터링하는 네트워크에 대비해 VLESS-Reality 같은 TCP 기반 선택지도 함께 갖춰 두세요. 러시아에서 현재 통하는 방식은 [러시아 가이드](/vpn-for-russia)에서 다룹니다.

## Doppler는 AmneziaWG를 사용하나요?

아니요. Doppler는 VLESS-Reality를 사용합니다. [왜 VLESS인가](/vpn-protocols/why-vless)를 참고하세요.
