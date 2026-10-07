> **Ang maikling bersyon.** Ang WireGuard ang pinakamabilis at pinakasimpleng mainstream na VPN protocol, at sa network na walang filter ay mahusay itong pagpipilian. Hindi ito idinisenyo para itago na VPN ito, gayunpaman, at sa Russia, Iran, at China ay isa ito sa mga unang protocol na na-block.

## Ano ang WireGuard?

Ang WireGuard ay isang VPN protocol na isinulat ni Jason A. Donenfeld at unang inilabas noong 2015. Layunin nitong palitan ang mga malalaki at napakaraming setting na protocol na nauna rito ng isang bagay na sapat na maliit para ma-audit. Noong Marso 2020, [isinama ito sa Linux 5.6 kernel](https://en.wikipedia.org/wiki/WireGuard), at may mga opisyal nang app para sa Windows, macOS, iOS, Android, at Linux.

Sa halip na hayaang mag-negotiate ang bawat panig ng cipher suite, nagtatakda ang WireGuard ng iisang set ng mga makabagong primitive. Nakalista ang mga ito sa [pahina ng protocol](https://www.wireguard.com/protocol/) nito: ChaCha20 na may Poly1305 para sa encryption, Curve25519 para sa key exchange, at BLAKE2s para sa hashing. Walang maaaring maling ma-configure at walang mas luma at mas mahinang opsyon na mapagbabalikan.

## Paano ito gumagana?

May key pair ang bawat device, tulad ng sa SSH. Alam na nang maaga ng client at ng server ang public key ng isa't isa, at ang handshake ay batay sa Noise protocol framework (pinangalanan ng pahina ng protocol ang eksaktong konstruksyon, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Lahat ng packet ay ipinapadala sa UDP](https://www.wireguard.com/protocol/), at nagagawa ang bagong session sa isang round trip lang.

Iyon ang dahilan kung bakit mabilis ang pakiramdam ng WireGuard. Kaunti lang ang kailangang pag-usapan, tumatakbo ang code sa loob ng operating system kernel sa Linux, at tahimik na nahahawakan ang paglipat sa pagitan ng Wi-Fi at mobile data dahil hindi nito pinananatiling bukas ang isang pangmatagalang koneksyon.

## Bakit nabo-block ang WireGuard?

Ang parehong pagiging simple na nagpapadali sa pag-audit ng WireGuard ay nagpapadali ring makilala ito. Tinutukoy ng [whitepaper](https://www.wireguard.com/papers/wireguard.pdf) nito ang mga handshake message byte por byte, kaya ang unang packet mula sa client ay laging 148 bytes at ang sagot ay laging 92 bytes, na bawat isa ay nagsisimula sa isang nakapirming message-type field. Sapat na ang maikling rule para sa isang deep packet inspection (DPI) system para makita ang pattern na iyon sa UDP.

Ginawa na ito mismo ng mga censor. Noong Agosto 2023, [iniulat](https://github.com/net4people/bbs/issues/274) ng mga user sa Russia na pinuputol ng mga pangunahing mobile carrier ang mga WireGuard session pagkatapos mismo ng handshake. Pinoprotektahan pa rin ng encryption ang laman, ngunit nawala na ang mismong koneksyon.

Isa itong design trade-off, hindi bug. Pinili ng mga may-akda ng WireGuard ang isang nakapirmi at minimal na protocol, at hindi kasama sa kanilang mga layunin ang pagtatago. Binabago ng mga proyektong tulad ng [AmneziaWG](/vpn-protocols/amneziawg) ang hugis ng mga packet para maibalik ang bahagyang pagtatago.

## Kailan mo dapat gamitin ang WireGuard?

- **Mga network na walang filter.** Sa bahay, sa trabaho, o habang bumibiyahe sa bansang hindi nagba-block ng mga VPN, mahirap talunin ang WireGuard sa bilis at tipid sa baterya.
- **Self-hosting.** Kung ikaw mismo ang nagpapatakbo ng server, isa ang WireGuard sa pinakamadaling protocol na i-set up nang tama.
- **Hindi para sa network na may DPI filtering.** Kung ibina-block ng network mo ang mga VPN, mas bagay ang protocol na ginawang magmukhang karaniwang web traffic, tulad ng [VLESS-Reality](/vpn-protocols/vless-reality). Mas detalyadong tinatalakay ng aming paghahambing ng [VLESS-Reality at WireGuard](/blog/vless-reality-vs-wireguard) ang trade-off na ito.

## Gumagamit ba ang Doppler ng WireGuard?

Hindi. Kumokonekta ang mga app ng Doppler sa pamamagitan ng VLESS-Reality, dahil ginawa ang Doppler para sa mga network kung saan sinasala ang WireGuard. Ipinaliliwanag ng gabay na [bakit VLESS](/vpn-protocols/why-vless) ang dahilan.
