> **요약.** IKEv2/IPsec은 휴대폰과 노트북이 별도의 앱 없이도 이미 사용할 수 있는 VPN입니다. 빠르고 Wi-Fi와 모바일 데이터 사이를 오갈 때도 잘 대응합니다. 다만 고정된 잘 알려진 포트에서 실행되기 때문에, 검열 측이 차단하기 가장 쉬운 프로토콜 중 하나입니다.

## IKEv2/IPsec이란?

"IKEv2"는 사실 함께 작동하는 두 부분으로 이루어져 있습니다. IPsec은 IP 패킷을 암호화하고 인증하는 프로토콜 모음입니다. 인터넷 키 교환(Internet Key Exchange)인 IKE는 양쪽이 서로를 인증하고 IPsec 키를 합의하는 데 사용하는 프로토콜입니다. IKE 버전 2는 [2005년 12월](https://en.wikipedia.org/wiki/Internet_Key_Exchange)에 표준화되었으며, 현재 사양은 [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296)입니다.

IETF 표준이기 때문에 IKEv2는 iOS, macOS, Windows에 내장되어 있고 Android에는 11 버전부터 내장되어 있습니다. 많은 기업용 VPN 게이트웨이도 IKEv2를 사용합니다.

## 어떻게 작동하나요?

키 교환은 [보통 500번 포트](https://en.wikipedia.org/wiki/Internet_Key_Exchange)의 UDP로 이루어집니다. 양쪽이 키를 합의하면 운영 체제의 IPsec 스택이 ESP(Encapsulating Security Payload)로 트래픽을 암호화합니다. 거의 모든 가정용·모바일 네트워크처럼 중간에 NAT 라우터가 있으면 IKE와 ESP는 모두 4500번 포트의 UDP로 감싸집니다.

IKEv2에는 [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555)라는 표준 확장이 있어서 IP 주소가 바뀌어도 연결이 유지됩니다. 그래서 IKEv2는 휴대폰에서 쓰기 편합니다. Wi-Fi 범위를 벗어나 모바일 데이터로 넘어가도 처음부터 다시 연결하지 않고 터널이 이어집니다.

## IKEv2는 왜 차단하기 쉬운가요?

IKEv2는 다른 무언가처럼 보이려는 시도를 하지 않습니다. 트래픽은 잘 알려진 UDP 포트를 사용하고, 어떤 네트워크 도구로도 분석할 수 있는 표준 IKE 및 ESP 형식을 따릅니다. 차단하는 데 심층 패킷 검사조차 필요하지 않습니다. 필터가 UDP 500번과 4500번 포트를 차단하거나 IKE 교환을 직접 식별하면 됩니다.

VPN으로 식별되어도 잃을 것이 없는 기업 네트워크나 개방된 나라로의 여행에서는 합리적인 절충입니다. 하지만 VPN을 의도적으로 필터링하는 네트워크에서는 대개 가장 먼저 작동을 멈춥니다.

## IKEv2는 언제 쓰면 좋을까요?

- **앱을 설치할 수 없는 경우.** 소프트웨어를 설치할 수 없는 관리형 기기에서는 내장 IKEv2 클라이언트가 유일한 선택일 수 있습니다.
- **열린 네트워크에서의 모바일 로밍.** MOBIKE 덕분에 네트워크를 옮겨 다닐 때도 매끄럽게 이어집니다.
- **검열 환경이 아닌 경우.** 필터링되는 네트워크에서는 [VLESS-Reality](/vpn-protocols/vless-reality)처럼 트래픽에 섞여 들어가도록 설계된 프로토콜을 선택하세요. 차단이 이루어지는 방식은 [검열 가이드](/bypass-censorship)에서 설명합니다.

## Doppler는 IKEv2를 사용하나요?

아니요. Doppler는 자체 앱 안에서 VLESS-Reality로 연결합니다. 이유는 [왜 VLESS인가](/vpn-protocols/why-vless)를 참고하세요.
