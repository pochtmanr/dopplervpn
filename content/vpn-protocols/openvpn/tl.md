> **Ang maikling bersyon.** Ang OpenVPN ang beterano ng mga open-source na VPN: flexible, malawak ang suporta, at lubos nang nauunawaan makalipas ang mahigit dalawang dekada. Mas mabagal din ito kaysa sa mas bagong mga protocol at, ayon sa nailathalang pananaliksik, isa ito sa pinakamadaling makilala ng isang ISP sa pamamagitan ng fingerprinting.

## Ano ang OpenVPN?

Ang OpenVPN ay libre at open-source na VPN software na unang inilabas ni James Yonan [noong Mayo 2001](https://en.wikipedia.org/wiki/OpenVPN). Sa halos buong dekada 2000 at 2010, ito ang default na pagpipilian para sa mga komersyal na VPN service at corporate remote access, at kasama pa rin ito sa maraming router at enterprise na produkto.

Tumatakbo ito sa user space at hindi sa operating system kernel, at umaasa ito sa OpenSSL library at sa TLS protocol para sa key exchange. Ang port na itinalaga ng IANA ay 1194, bagaman maaaring tumakbo ang OpenVPN sa UDP o TCP sa halos anumang port.

## Paano ito gumagana?

Gumagamit ang OpenVPN ng custom na protocol na may dalawang bahagi. Gumagamit ang isang control channel ng TLS para i-authenticate ang dalawang panig, kadalasan gamit ang mga certificate, at para magkasundo sa mga key. Pagkatapos, dinadala ng isang data channel ang traffic mo, na naka-encrypt gamit ang mga key na iyon, sa loob ng mga UDP o TCP packet.

Dahil sa istrukturang iyon, napaka-configurable ng OpenVPN. Maaari mong piliin ang mga cipher, paraan ng authentication, port, at transport, at patakbuhin ito sa pamamagitan ng mga proxy. Ang kapalit ng flexibility na iyon ay ang pagiging kumplikado: mas maraming code, mas maraming setting, at mas maraming paraan para mauwi sa mahinang configuration.

## Bakit nabo-block ang OpenVPN?

Hindi pareho ang TLS sa loob ng OpenVPN at ang pagbisita sa website gamit ang HTTPS. Binabalot ng OpenVPN ang TLS handshake nito sa sarili nitong packet framing, kaya may hugis ang traffic nito na wala sa karaniwang web traffic.

Sinukat ng mga mananaliksik kung gaano ito kahalaga. Isang pangkat mula sa University of Michigan at iba pa ang [bumuo ng fingerprinting system](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) at pinatakbo ito sa loob ng isang ISP na may mga isang milyong user. Natukoy nito ang **mahigit 85% ng mga OpenVPN flow** na may napakakaunting false positive, at nahuli rin nito ang karamihan sa mga komersyal na "obfuscated" na OpenVPN setup na sinubukan nila.

Kasunod ng pananaliksik ang aktuwal na pag-filter. Noong Agosto 2023, [iniulat](https://github.com/net4people/bbs/issues/274) ng mga user sa Russia na pinuputol ng mga mobile carrier ang mga koneksyon ng OpenVPN ilang sandali matapos magsimula ang mga ito.

## Kailan mo dapat gamitin ang OpenVPN?

- **Compatibility.** Sinusuportahan ng mga lumang router, enterprise gateway, at ilang corporate network ang OpenVPN at wala nang mas bago pa.
- **Mga network na TCP lang.** Maaaring tumakbo ang OpenVPN sa TCP kapag naka-block ang UDP, na hindi magagawa ng [WireGuard](/vpn-protocols/wireguard) nang walang tulong.
- **Hindi para sa mga network na may filter.** Kung saan ibina-block ang mga VPN, madalas na maagang pumapalya ang OpenVPN. Mas angkop na gamit ang protocol na ginagaya ang karaniwang web traffic, tulad ng [VLESS-Reality](/vpn-protocols/vless-reality). Ipinaliliwanag ng aming [gabay sa censorship](/bypass-censorship) kung paano nagpapasya ang mga filtering system kung ano ang puputulin.

## Gumagamit ba ang Doppler ng OpenVPN?

Hindi. Gumagamit ang Doppler ng VLESS-Reality sa lahat ng platform. Ipinaliliwanag ng gabay na [bakit VLESS](/vpn-protocols/why-vless) kung paano namin ito pinili.
