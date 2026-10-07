> **Ang maikling bersyon.** Ang VLESS ay minimal na proxy protocol mula sa proyektong Xray. Ang Reality ang layer ng TLS na nagpapamukha sa koneksyon ng VLESS na parang karaniwang pagbisita ng TLS 1.3 sa isang tunay at sikat na website, nang walang sarili mong domain o certificate. Magkasama, sila ang kasalukuyang pinakamahirap na mainstream na kombinasyon na i-block ng mga censor. Buod ang pahinang ito; nasa aming [malalim na gabay](/how-it-works/vless-reality-tunnel) ang buong kuwento.

## Ano ang VLESS?

[Iminungkahi ang VLESS noong Hulyo 2020](https://github.com/v2ray/v2ray-core/issues/2636) bilang mas magaan na kahalili ng [VMess](/vpn-protocols/vmess). Sadyang maliit ang [specification](https://xtls.github.io/en/development/protocols/vless.html) nito: isang bersyon ng protocol, isang 16-byte na UUID na kumikilala sa user, isang opsyonal na field ng add-ons, at ang command, port, at address ng destinasyon. Walang sariling encryption ang VLESS. Umaasa ito sa layer ng TLS sa ilalim, kaya hindi dalawang beses na naka-encrypt ang traffic.

Bahagi ang VLESS ng [Xray-core](https://github.com/XTLS/Xray-core), ang proyektong humiwalay sa V2Ray noong Nobyembre 2020 at ngayon ang nangunguna sa pag-develop ng pamilya ng protocol na ito.

## Ano ang idinadagdag ng Reality?

Nagtatago ang mga protocol tulad ng [Trojan](/vpn-protocols/trojan) sa loob ng TLS patungo sa sarili mong domain, at ang domain na iyon ang nagiging bagay na maaaring i-block ng isang censor. Inalis ito ng [Reality](https://github.com/XTLS/REALITY), na inilabas sa Xray-core [1.8.0 noong Marso 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0).

Ipinapakita ng isang Reality server ang TLS handshake ng isang tunay na third-party na website. Para sa isang nagmamasid, ang koneksyon ay karaniwang pagbisita ng TLS 1.3 sa site na iyon. Ang client na alam ang key ng server ay pinapapasok sa tunnel ng VLESS; ang sinumang iba, kasama ang active probe ng isang censor, ay ipinapasa sa tunay na website at nakikita ang tunay na certificate nito. Walang domain o certificate ng Doppler na mailalagay sa isang block list.

## Gaano kahirap i-block ang VLESS-Reality?

Ito ang pinaka-matibay na mainstream na opsyon na alam namin, ngunit hindi ito invisible. Ipinakita ng pananaliksik na inilathala noong 2024 na [maaaring i-fingerprint ang TLS na dinadala sa loob ng TLS](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) ayon sa timing at laki ng packet nito, at noong Nobyembre 2025 ay [iniulat](https://github.com/net4people/bbs/issues/546) ng mga user na pinuputol ng ilang ISP sa Russia ang mga koneksyon ng Reality. Tumutugon ang mga provider sa pamamagitan ng pag-tune ng mga setting ng server at ng mga site na hiniram nila, at nagpapatuloy ang habulan.

## Gaano ito kabilis?

Sa araw-araw na paggamit, maliit ang overhead. Ipinapadala ang header ng VLESS nang isang beses bawat koneksyon, at iniiwasan ng XTLS Vision flow ang muling pag-encrypt ng web traffic na naka-encrypt na. Dahil tumatakbo ito sa TCP, maaaring mas mabagal ang VLESS-Reality kaysa sa mga UDP protocol tulad ng [WireGuard](/vpn-protocols/wireguard) sa mga lossy na network, ngunit patuloy itong gumagana kung saan naka-block ang mga iyon.

## Saan pa ako makakapag-aral?

- [Ang tunnel ng VLESS-Reality, nang malalim](/how-it-works/vless-reality-tunnel): kasaysayan, mekanismo, mga limitasyon.
- [Ano ang VLESS?](/blog/what-is-vless) at [ang format ng VLESS URI](/blog/vless-uri-format) sa aming blog.
- [VLESS VPN](/vless-vpn): kung paano ibinabalot ng Doppler ang VLESS-Reality sa mga app na isang tap lang.
