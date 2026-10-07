> **Ang maikling bersyon.** Ang VMess ang orihinal na protocol ng proyektong V2Ray. Ine-encrypt nito ang sarili nitong mga header at karaniwang ibinabalot sa ibang transport, tulad ng WebSocket sa ibabaw ng TLS, para magmukhang web traffic. Gumagana pa rin ito, ngunit ginagawa ng mga kahalili nito, ang VLESS at Trojan, ang parehong trabaho na may mas kaunting overhead.

## Ano ang VMess?

Ang VMess ay naka-encrypt na proxy protocol na ipinakilala ng [proyektong V2Ray](https://github.com/v2fly/v2ray-core) nang magsimula ito noong 2015. Lumaki ang V2Ray bilang modular na platform para sa paggawa ng mga proxy: isang core, maraming protocol at transport, at isang routing engine na nagpapasya kung saan pupunta ang aling traffic. Ang VMess ang una nitong protocol at sa loob ng ilang taon ang pangunahin nito.

Tulad ng Shadowsocks, teknikal na proxy ang VMess at hindi VPN, ngunit maaaring iruta ng mga app na nakabatay sa V2Ray ang buong device mo sa pamamagitan nito.

## Paano ito gumagana?

May UUID ang bawat user na nagsisilbing credential. Ayon sa [dokumentasyon ng protocol](https://www.v2fly.org/en_US/developer/protocols/vmess.html), kasama sa request header ng client ang isang naka-encrypt na authentication ID na binuo mula sa Unix timestamp, isang random na numero, at isang checksum, na naka-encrypt gamit ang key na hango sa ID ng user. Ginagamit ito ng server para kilalanin ang user, pagkatapos ay dine-decrypt ang natitirang header at ang data.

Inilalarawan ng dokumentasyon ang dalawang paraan ng pagprotekta sa header. Ang makabago ay gumagamit ng AEAD encryption, na ginagarantiya na hindi nabago ang header. Ang mas luma ay gumamit ng MD5 at AES-128-CFB at hindi nito sinisiguro ang integridad ng header; binabalaan ng dokumentasyon laban dito. Dahil may timestamp ang authentication ID, kailangang halos magkasabay ang orasan ng client at ng server, isang karaniwang dahilan ng mga problemang "ayaw lang kumonekta".

## Gaano kahirap i-block ang VMess?

Kung mag-isa, mukhang random na byte ang VMess, na naglalagay dito sa parehong sitwasyon ng [Shadowsocks](/vpn-protocols/shadowsocks): bukas sa mga firewall na nagba-block ng ganap na naka-encrypt na traffic. Kaya karaniwang inilalagay ang VMess sa loob ng WebSocket o gRPC sa ibabaw ng TLS, sa likod ng domain at certificate, para ang makita ng nagmamasid ay mukhang karaniwang HTTPS na koneksyon sa isang website.

Ang wrapper na iyon ang gumagawa ng halos lahat ng pagtatago ng traffic, at may mga kapalit ito: kailangan mo ng domain, certificate, at madalas ng CDN sa harap ng server, at dalawang beses na ngayong ine-encrypt ng server ang data, isang beses para sa TLS at isang beses para sa VMess.

## VMess, VLESS, o Trojan?

Idinisenyo ang [VLESS](/vpn-protocols/vless-reality) ng proyektong Xray bilang mas magaan na kahalili: pinananatili nito ang pagkakakilanlan batay sa UUID ngunit iniiwan ang sariling encryption ng VMess at lubos na umaasa sa layer ng TLS, na umiiwas sa dobleng encryption. Gumagamit ang [Trojan](/vpn-protocols/trojan) ng katulad na paraan na may password sa halip na UUID. Mas detalyado ang aming paghahambing ng [VLESS, VMess, at Trojan](/blog/vless-vs-vmess-vs-trojan).

## Gumagamit ba ang Doppler ng VMess?

Hindi. Gumagamit ang Doppler ng VLESS na may Reality. Ipinaliliwanag ng gabay na [bakit VLESS](/vpn-protocols/why-vless) kung bakit.
