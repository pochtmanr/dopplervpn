> **Ang maikling bersyon.** Ang AmneziaWG ay fork ng WireGuard na pinananatili ang bilis at cryptography nito ngunit binabago ang mga hugis ng packet at header na nagpapadaling makita ang WireGuard. Matibay itong opsyon kung saan naka-block ang plain na WireGuard, na may isang kundisyon: hindi na ito nakikipag-usap sa mga karaniwang WireGuard server kapag naka-on ang obfuscation nito.

## Ano ang AmneziaWG?

Binubuo ang AmneziaWG ng pangkat sa likod ng [Amnezia VPN](https://amnezia.org/), isang open-source na app para sa pagpapatakbo ng sarili mong VPN server. Sinimulan ang [implementasyon sa Go](https://github.com/amnezia-vpn/amneziawg-go) ng proyekto noong 2023. Kinukuha nito ang [WireGuard](/vpn-protocols/wireguard), na mabilis at simple ngunit may nakapirmi at makikilalang handshake, at nagdadagdag ng layer na nagtatago rito.

## Ano ang binabago nito?

Inilalarawan ng [dokumentasyon ng AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) ang ilang mekanismo, na bawat isa ay kontrolado ng mga parameter ng configuration:

- **Mga dynamic na header (H1–H4).** Nagsisimula ang mga karaniwang packet ng WireGuard sa isang nakapirming message type para sa bawat isa sa apat nitong format ng packet. Pinapalitan ng AmneziaWG ang mga halagang iyon ng mga numerong pinili mula sa mga naka-configure na range, kaya hindi nagsasalo ng header ang dalawang magkaibang setup at walang iisang filter rule na tumutugma sa lahat.
- **Randomisasyon ng haba ng packet (S1–S4).** Sa WireGuard, ang unang handshake packet ay laging eksaktong 148 bytes. Nagdadagdag ang AmneziaWG ng mga random na prefix sa bawat uri ng packet para mag-iba ang mga laki.
- **Mga junk packet (Jc, Jmin, Jmax).** Bago ang handshake, nagpapadala ang client ng nako-configure na bilang ng mga pseudorandom na packet na may random na haba, na nagpapalabo sa simula ng session sa oras at sa laki.
- **Proteksyon ng header.** Maaari ring i-encrypt ng mas bagong mga bersyon ang mismong message type field.

Sa ilalim, nananatili ang cryptography at ang pangkalahatang disenyo ng WireGuard.

## Gaano kahirap i-block ang AmneziaWG?

Inaalis nito ang mga simpleng signature na ginagamit ng mga filter laban sa WireGuard: mga nakapirming laki at nakapirming halaga ng header. Dahil dito, mas matibay ito kaysa sa plain na WireGuard sa mga network na nagba-block ng mga VPN.

Tumatakbo pa rin ito sa UDP, kaya maaapektuhan ito ng mga network na nag-throttle o nagba-block ng UDP nang malawakan, at hindi ginagaya ng traffic nito ang anumang partikular na application sa paraang ginagaya ng [VLESS-Reality](/vpn-protocols/vless-reality) ang pagbisita ng TLS sa isang tunay na website. Maaari pa rin itong mahuli ng filter na ganap na nagba-block ng hindi makilalang UDP.

## Kailan mo dapat gamitin ang AmneziaWG?

- **Kung saan naka-block ang WireGuard** ngunit gumagana pa ang UDP, at gusto mo ng bilis na tulad ng WireGuard.
- **Mga self-hosted na server**, gamit ang Amnezia VPN app para i-set up ang mga ito.
- Magtabi ng opsyong nakabatay sa TCP, tulad ng VLESS-Reality, para sa mga network na nagsasala ng UDP. Tinatalakay ng aming [gabay para sa Russia](/vpn-for-russia) kung ano ang kasalukuyang nakakalusot doon.

## Gumagamit ba ang Doppler ng AmneziaWG?

Hindi. Gumagamit ang Doppler ng VLESS-Reality. Tingnan ang [bakit VLESS](/vpn-protocols/why-vless).
