> **Ang maikling bersyon.** Ang Shadowsocks ay magaan at naka-encrypt na proxy na ginawa sa China para makalusot sa Great Firewall. Sa loob ng maraming taon, gumana ito sa pamamagitan ng hindi pagmukhang anuman. Mula 2021, ipinapakita ng pananaliksik na ibina-block na ng firewall ang eksaktong ganoong uri ng traffic, dahil bihirang ganoon karandom ang tunay na traffic.

## Ano ang Shadowsocks?

Ang Shadowsocks ay open-source na proxy protocol na unang inilabas [noong Abril 2012](https://en.wikipedia.org/wiki/Shadowsocks). Sa mahigpit na pagsasalita, hindi ito VPN: isa itong proxy na kahawig ng SOCKS5 na may encryption, at ang mga app ang nagpapasya kung aling traffic ang ipapadaan dito. Sa praktika, karamihan sa mga Shadowsocks client ngayon ay may system-wide na mode na kumikilos na parang VPN.

Popular ito dahil simple at mabilis. Gumagamit ang mga kasalukuyang bersyon ng [mga AEAD cipher](https://shadowsocks.org/doc/aead.html), na nagbibigay ng confidentiality, integrity, at authenticity sa isang hakbang, at pinahigpit ng [edisyong 2022](https://shadowsocks.org/doc/sip022.html) ng protocol ang proteksyon laban sa replay.

## Paano ito gumagana?

Iisang password ang ginagamit ng client at ng server, na ginagawang encryption key. Naka-encrypt na mula sa pinakaunang byte ang lahat ng ipinapadala ng client, kasama ang address ng website na gusto nito. Walang makikilalang handshake, walang certificate, at walang plaintext na header. Para sa isang nagmamasid, ang koneksyon ng Shadowsocks ay agos ng mga byte na mukhang random.

## Paano natutukoy ng Great Firewall ang Shadowsocks?

Una, sa pamamagitan ng active probing. [Naitala](https://gfw.report/publications/imc20/en/) ng mga mananaliksik sa GFW Report na nagpapadala ang firewall ng sampu-sampung libong probe sa mga pinaghihinalaang Shadowsocks server, na inuulit at binabago ang mga tunay na koneksyon para makita kung paano tutugon ang server.

Pagkatapos, mula Nobyembre 2021, sa pamamagitan ng mas magaspang at mas malawak na paraan. Natuklasan ng isang [pag-aaral sa USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) na ibina-block ng firewall ang "ganap na naka-encrypt" na traffic nang real time. Sinusuri nito ang unang packet ng isang koneksyon at ine-exempt ang anumang mukhang kilalang protocol o may sapat na printable na teksto. Sinusukat ng isang rule ang average na bilang ng mga bit na naka-set sa bawat byte: exempt ang mga halagang 3.4 pababa o 4.6 pataas, at hindi exempt ang data na mukhang random sa pagitan ng mga ito. Ang matitira ay maaaring i-block.

Natuklasan din ng mga mananaliksik na inilapat ng firewall ito sa humigit-kumulang 26% ng mga koneksyon, at sa mga IP range lang ng mga sikat na data center, marahil para limitahan ang pinsala sa iba. Malinaw ang aral para sa mga nagdidisenyo ng protocol: ang pagmumukhang random ay isa na ring fingerprint.

## Kailan mo dapat gamitin ang Shadowsocks?

- **Magaan at mabilis na proxying** sa mga network na hindi mahigpit na sumusuri ng traffic.
- **Self-hosting** gamit ang mga tool tulad ng Outline, na nagpapadali sa setup.
- **Nang may pag-iingat sa ilalim ng mahigpit na filtering.** Sa China at iba pang lugar na nagba-block ng ganap na naka-encrypt na traffic, mas hindi maaasahan ang Shadowsocks kaysa sa mga protocol na ginagaya ang tunay na TLS, tulad ng [VLESS-Reality](/vpn-protocols/vless-reality). Binabalikan ng aming [kasaysayan ng mga censorship protocol](/blog/censorship-protocol-history) kung paano umusad ang larangang ito.

## Gumagamit ba ang Doppler ng Shadowsocks?

Hindi. Gumagamit ang Doppler ng VLESS-Reality, para sa mga dahilang nasa [bakit VLESS](/vpn-protocols/why-vless).
