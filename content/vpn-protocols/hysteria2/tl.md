> **Ang maikling bersyon.** Ang Hysteria 2 ay proxy protocol na nakabatay sa QUIC, ang transport sa likod ng HTTP/3. Idinisenyo ito para sa bilis sa mahihina at lossy na koneksyon, at sa sinumang walang password ay kumikilos ang server nito na parang karaniwang website ng HTTP/3. Ang mahinang punto nito ay umaasa ito sa UDP, na ini-throttle o ganap na ibina-block ng ilang network.

## Ano ang Hysteria 2?

Ang Hysteria ay open-source na proyekto mula sa [apernet](https://github.com/apernet/hysteria); ang bersyon 2, isang muling idinisenyong protocol, ay inilabas noong Setyembre 2023. Tulad ng Shadowsocks at VLESS, isa itong proxy at hindi klasikong VPN, at maaaring iruta ng mga client ang buong device sa pamamagitan nito.

## Paano ito gumagana?

Ayon sa [specification ng protocol](https://v2.hysteria.network/docs/developers/Protocol/) nito, tumatakbo ang Hysteria 2 sa QUIC ayon sa kahulugan sa [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), na may unreliable datagram extension para sa UDP traffic. Nagbibigay na ang QUIC ng TLS 1.3 encryption, multiplexed na stream, at mabilis na pag-set up ng koneksyon.

Dito pumapasok ang pagbabalatkayo sa authentication. Inaatasan ng specification na ang isang Hysteria server ay **dapat magpatupad ng tunay na HTTP/3 server** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) at hawakan ang mga request sa paraang gagawin ng anumang web server. Nag-aauthenticate ang client gamit ang espesyal na HTTP/3 request; ang sinumang iba, maging mausisang bisita o active probe, ay nakakakuha ng karaniwang tugon ng web. Nakasaad sa specification na, para sa isang third party na walang credential, kumikilos ang server na parang karaniwang HTTP/3 web server.

## Bakit ito mabilis?

Tumatakbo ang QUIC sa UDP at nakakabawi ito mula sa packet loss nang hindi pinipigil ang bawat stream sa paraang ginagawa ng TCP. Maaari ring gumamit ang Hysteria ng sarili nitong congestion control, na nakatuon sa hindi matatag na link, kaya karaniwan nitong pinananatili ang bilis sa mga masikip na mobile network, malalayong ruta, at Wi-Fi na may interference, kung saan bumabagal ang mga protocol na nakabatay sa TCP.

## Gaano kahirap i-block ang Hysteria 2?

Mahusay itong tumatagal laban sa active probing, dahil nakikita ng mga probe ang isang web server. Ang nalalantad ay ang transport. Maaaring i-throttle o i-block ng isang censor ang UDP, o ang QUIC mismo, nang hindi sinisira ang karamihan ng mga website, dahil bumabalik ang mga browser sa HTTP/2 sa TCP kapag pumalya ang HTTP/3. Kung saan nangyayari iyon, wala nang mapupuntahan ang Hysteria 2, habang patuloy na gumagana ang mga protocol na nakabatay sa TCP tulad ng [VLESS-Reality](/vpn-protocols/vless-reality).

## Kailan mo dapat gamitin ang Hysteria 2?

- **Mga lossy o malayuang link**, kung saan nagbubunga ang congestion control nito at ang pagbawi ng QUIC mula sa packet loss.
- **Mga network na nagpapahintulot ng UDP.** Suriin bago umasa rito.
- Bilang pangalawang protocol kasabay ng opsyong TCP, para makalipat ka kapag sinasala ang UDP. Tinatalakay ng aming [gabay sa censorship](/bypass-censorship) kung paano tinatarget ng mga filter ang mga transport.

## Gumagamit ba ang Doppler ng Hysteria 2?

Hindi. Gumagamit ang Doppler ng VLESS-Reality sa TCP, na patuloy na gumagana sa mga network na nagba-block ng UDP. Tingnan ang [bakit VLESS](/vpn-protocols/why-vless).
