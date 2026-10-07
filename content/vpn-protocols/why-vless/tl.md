> **Ang maikling bersyon.** Ginawa namin ang Doppler para sa mga tao sa mga network na nagba-block ng mga VPN. Sa mga network na iyon, ang tanong ay hindi kung aling protocol ang pinakamabilis sa papel, kundi kung alin ang konektado pa bukas. Pinili namin ang VLESS na may Reality dahil binibigyan nito ang isang censor ng pinakakaunting makikilala at pinakakaunting ma-block, at tinatanggap namin ang mga trade-off na kasama nito.

## Para saan kami pumili?

Ginawa ang Doppler para sa mga taong kumokonekta mula sa mga lugar kung saan sadyang sinasala ang mga VPN: Russia, Iran, China, at mga bahagi ng Gulf. Sa mga network na iyon, ang encryption ang madaling bahagi. Lahat ng protocol sa aming [paghahambing](/vpn-protocols) ay mahusay mag-encrypt. Ang naghihiwalay sa kanila ay kung masasabi ng isang filtering system na VPN ang koneksyon, at kung ano ang maaari nitong i-block kapag nalaman na nito.

Kaya hinusgahan namin ang bawat opsyon sa tatlong tanong:

1. **May nakapirming fingerprint ba ito?** Ang handshake na may nakapirming laki o isang karaniwang port ay maaaring tugmain ng iisang rule.
2. **Ano ang nangyayari kapag sinisiyasat ng isang censor ang server?** Aktibong kumokonekta ang mga firewall sa mga pinaghihinalaang proxy para makita kung paano sila tutugon.
3. **May mailalagay ba sa block list?** Ang domain, certificate, o makikilalang server ay target kahit na mahusay na nakatago ang mismong traffic.

## Bakit hindi WireGuard, OpenVPN, o IKEv2?

Pumapalya ang tatlo sa unang tanong. Ang mga handshake packet ng [WireGuard](/vpn-protocols/wireguard) ay laging 148 at 92 bytes. Natukoy ng mga mananaliksik na nagtatrabaho sa loob ng totoong ISP ang [OpenVPN](/vpn-protocols/openvpn) sa mahigit 85% ng mga flow. Tumatakbo ang [IKEv2](/vpn-protocols/ikev2) sa mga karaniwang UDP port na maaaring i-drop nang buo. Noong Agosto 2023, [iniulat](https://github.com/net4people/bbs/issues/274) ng mga user sa Russia na pinuputol ng mga carrier ang WireGuard at OpenVPN sa loob ng mga unang packet. Magagandang protocol ang mga ito para sa mga bukas na network. Hindi sila idinisenyo para sa mga network namin.

## Bakit hindi Shadowsocks o VMess?

Pumapasa sila sa unang tanong sa pamamagitan ng pagmumukhang random na byte, at lumabas na fingerprint din iyon sa sarili nito. Mula Nobyembre 2021, [ibina-block ng Great Firewall ang ganap na naka-encrypt na traffic](https://gfw.report/publications/usenixsecurity23/en/) na hindi kahawig ng anumang kilalang protocol. Maaaring ibalot ang [VMess](/vpn-protocols/vmess) sa TLS para maiwasan iyon, ngunit kailangan nito ng domain, na nagdadala sa atin sa ikatlong tanong.

## Bakit hindi Trojan?

Mahusay na sinasagot ng [Trojan](/vpn-protocols/trojan) ang unang dalawang tanong: tunay na TLS ito, at nakikita ng mga probe ang tunay na website. Ngunit kailangan ng bawat Trojan server ng sarili nitong domain at certificate. Kapag nalaman ng isang censor ang domain na iyon, maaari niya itong i-block, at ang pagpapatakbo ng maraming domain ay patuloy na paghabol.

## Kung saan tama ang VLESS-Reality

Sinagot ng [VLESS-Reality](/vpn-protocols/vless-reality) ang lahat ng tatlo:

- **Walang nakapirming fingerprint.** Ang koneksyon ay TLS 1.3 sa TCP, ang pinakakaraniwang naka-encrypt na traffic sa internet.
- **Nakikita ng mga probe ang tunay na website.** Ipinapasa ng Reality ang sinumang hindi maka-authenticate sa tunay na site na hiniram ang handshake, kasama ang tunay na certificate ng site na iyon.
- **Walang sa amin na ma-block ayon sa pangalan.** Walang domain o certificate ng Doppler sa handshake.

Tumatakbo rin ito sa TCP, kaya patuloy itong gumagana sa mga network na nag-throttle o nagba-block ng UDP, kung saan nahihirapan ang [Hysteria 2](/vpn-protocols/hysteria2) at [AmneziaWG](/vpn-protocols/amneziawg). At maliit ang mismong VLESS: umaasa ito sa TLS para sa encryption sa halip na magdagdag ng sarili nito, kaya walang dobleng encryption.

## Ano ang binitiwan namin

- **Purong bilis sa mga lossy na link.** Mas hindi gaanong maayos ang pagbawi ng TCP mula sa packet loss kaysa sa QUIC o sa UDP ng WireGuard. Sa malinis na koneksyon, maliit ang pagkakaiba; sa mahina, maaari itong mapansin.
- **Built-in na suporta ng OS.** Walang operating system na may kasamang VLESS client, kaya kailangan mo ng app. Napagpasyahan naming katanggap-tanggap iyon at gumawa kami ng sarili namin para sa iOS, Android, macOS, at Windows.
- **Perpektong invisibility.** Wala iyon. Ipinakita ng pananaliksik na [maaaring i-fingerprint ang TLS sa loob ng TLS](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), at noong Nobyembre 2025 ay [iniulat](https://github.com/net4people/bbs/issues/546) na pinuputol ng ilang ISP sa Russia ang mga koneksyon ng Reality. Ang VLESS-Reality ay disenyo ng paglaban sa censorship, hindi garantiya.

## Ano ang ginagawa namin sa mga limitasyon

Nagbabago ang censorship, kaya hindi dito nagtatapos ang trabaho sa pagpili ng protocol. Inaayos namin ang mga setting ng server at ang mga site na hiniram ng Reality habang nagbabago ang filtering, at patuloy naming binabantayan ang parehong pananaliksik at mga ulat ng komunidad na binanggit sa mga pahinang ito. Kung may lumitaw na mas mahusay na paraan, sasabihin ito ng pahinang ito.

Para sa buong teknikal na kuwento kung paano gumagana ang VLESS-Reality, basahin ang [tunnel ng VLESS-Reality](/how-it-works/vless-reality-tunnel). Para subukan ito, tingnan ang [VLESS VPN](/vless-vpn).
