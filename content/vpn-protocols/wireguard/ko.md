> **요약.** WireGuard는 주류 VPN 프로토콜 중 가장 빠르고 단순하며, 필터링이 없는 네트워크에서는 훌륭한 선택입니다. 다만 VPN임을 숨기도록 설계된 적이 없어서, 러시아·이란·중국에서는 가장 먼저 차단되는 프로토콜 중 하나입니다.

## WireGuard란?

WireGuard는 Jason A. Donenfeld가 만들어 2015년에 처음 공개한 VPN 프로토콜입니다. 이전의 크고 설정 항목이 많은 프로토콜을, 감사할 수 있을 만큼 작은 프로토콜로 대체하는 것이 목표였습니다. 2020년 3월에 [Linux 5.6 커널에 병합](https://en.wikipedia.org/wiki/WireGuard)되었으며, 현재는 Windows, macOS, iOS, Android, Linux용 공식 앱이 있습니다.

WireGuard는 양쪽이 암호 스위트를 협상하게 하는 대신 최신 암호 기본 요소를 한 가지 조합으로 고정합니다. [프로토콜 페이지](https://www.wireguard.com/protocol/)에는 암호화에 ChaCha20과 Poly1305, 키 교환에 Curve25519, 해싱에 BLAKE2s가 명시되어 있습니다. 잘못 설정할 항목도 없고, 더 오래되고 약한 방식으로 되돌아갈 수도 없습니다.

## 어떻게 작동하나요?

각 기기는 SSH와 비슷하게 키 쌍을 가집니다. 클라이언트와 서버는 서로의 공개 키를 미리 알고 있으며, 핸드셰이크는 Noise 프로토콜 프레임워크를 기반으로 합니다(정확한 구성은 프로토콜 페이지에 `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`로 나와 있습니다). [모든 패킷은 UDP로 전송](https://www.wireguard.com/protocol/)되며, 새 세션은 왕복 한 번으로 설정됩니다.

이런 설계 덕분에 WireGuard는 빠르게 느껴집니다. 협상할 것이 거의 없고, Linux에서는 코드가 운영 체제 커널 안에서 실행되며, 프로토콜이 오래 유지되는 연결을 열어 두지 않기 때문에 Wi-Fi와 모바일 데이터 사이를 오갈 때도 조용히 처리됩니다.

## WireGuard는 왜 차단되나요?

WireGuard를 감사하기 쉽게 만드는 바로 그 단순함이 식별하기도 쉽게 만듭니다. [백서](https://www.wireguard.com/papers/wireguard.pdf)는 핸드셰이크 메시지를 바이트 단위로 규정하므로, 클라이언트가 보내는 첫 패킷은 항상 148바이트, 응답은 항상 92바이트이며 각각 고정된 메시지 유형 필드로 시작합니다. 심층 패킷 검사(DPI) 시스템은 짧은 규칙 하나만으로 UDP에서 이 패턴을 찾아낼 수 있습니다.

실제로 검열 당국은 그렇게 했습니다. 2023년 8월 러시아 사용자들은 주요 이동통신사가 핸드셰이크 직후 WireGuard 세션을 끊고 있다고 [보고했습니다](https://github.com/net4people/bbs/issues/274). 암호화는 여전히 내용을 보호했지만 연결 자체가 끊긴 것입니다.

이는 버그가 아니라 설계상의 절충입니다. WireGuard의 제작자들은 고정되고 최소한인 프로토콜을 선택했으며, 위장은 목표에 없었습니다. [AmneziaWG](/vpn-protocols/amneziawg) 같은 프로젝트는 패킷의 형태를 바꿔 어느 정도 은폐 효과를 되찾으려 합니다.

## WireGuard는 언제 쓰면 좋을까요?

- **필터링이 없는 네트워크.** 집이나 직장, 또는 VPN을 차단하지 않는 나라로 여행할 때는 속도와 배터리 효율 면에서 WireGuard를 따라가기 어렵습니다.
- **직접 서버 운영.** 자체 서버를 운영한다면 WireGuard는 올바르게 설정하기 가장 쉬운 프로토콜 중 하나입니다.
- **DPI 필터링 환경이 아닌 경우.** 네트워크가 VPN을 차단한다면 [VLESS-Reality](/vpn-protocols/vless-reality)처럼 일반 웹 트래픽처럼 보이도록 만든 프로토콜이 더 적합합니다. 이 절충에 대해서는 [VLESS-Reality와 WireGuard](/blog/vless-reality-vs-wireguard) 비교에서 더 자세히 다룹니다.

## Doppler는 WireGuard를 사용하나요?

아니요. Doppler 앱은 VLESS-Reality로 연결합니다. Doppler가 WireGuard가 필터링되는 네트워크를 위해 만들어졌기 때문입니다. 그 이유는 [왜 VLESS인가](/vpn-protocols/why-vless) 가이드에서 설명합니다.
