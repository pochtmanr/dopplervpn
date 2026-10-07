> **Pe scurt.** Am construit Doppler pentru oamenii din rețele care blochează VPN-urile. În acele rețele, întrebarea nu este care protocol este cel mai rapid pe hârtie, ci care rămâne conectat și mâine. Am ales VLESS cu Reality pentru că îi dă unui cenzor cel mai puțin de recunoscut și cel mai puțin de blocat, și acceptăm compromisurile care vin odată cu el.

## Pentru ce alegeam?

Doppler este construit pentru oamenii care se conectează din locuri unde VPN-urile sunt filtrate intenționat: Rusia, Iran, China, părți din Golful Persic. În acele rețele, criptarea este partea ușoară. Fiecare protocol din [comparația](/vpn-protocols) noastră criptează bine. Ce le desparte este dacă un sistem de filtrare poate spune că conexiunea este un VPN și ce poate bloca după ce își dă seama.

Așa că am judecat fiecare opțiune după trei întrebări:

1. **Are o amprentă fixă?** Un handshake de mărime fixă sau un port standard poate fi prins cu o singură regulă.
2. **Ce se întâmplă când un cenzor sondează serverul?** Firewall-urile se conectează activ la proxy-urile bănuite, ca să vadă cum răspund.
3. **Există ceva de pus pe o listă de blocare?** Un domeniu, un certificat sau un server recognoscibil este o țintă chiar dacă traficul însuși este bine ascuns.

## De ce nu WireGuard, OpenVPN sau IKEv2?

Toate trei pică la prima întrebare. Pachetele de handshake ale [WireGuard](/vpn-protocols/wireguard) au mereu 148 de octeți și 92 de octeți. [OpenVPN](/vpn-protocols/openvpn) a fost identificat în peste 85% din fluxuri de cercetători care lucrau în interiorul unui ISP real. [IKEv2](/vpn-protocols/ikev2) rulează pe porturi UDP standard, care pot fi blocate în bloc. În august 2023, utilizatori din Rusia [au raportat](https://github.com/net4people/bbs/issues/274) că operatorii tăiau WireGuard și OpenVPN încă din primele pachete. Sunt protocoale bune pentru rețele deschise. Nu au fost proiectate pentru rețelele noastre.

## De ce nu Shadowsocks sau VMess?

Trec de prima întrebare pentru că arată ca octeți aleatorii, iar asta s-a dovedit o amprentă în sine. Din noiembrie 2021, Marele Firewall [blochează traficul complet criptat](https://gfw.report/publications/usenixsecurity23/en/) care nu seamănă cu niciun protocol cunoscut. [VMess](/vpn-protocols/vmess) poate fi învelit în TLS ca să evite asta, dar atunci are nevoie de un domeniu, ceea ce ne aduce la a treia întrebare.

## De ce nu Trojan?

[Trojan](/vpn-protocols/trojan) răspunde bine la primele două întrebări: este TLS real, iar sondele văd un site real. Dar fiecare server Trojan are nevoie de propriul domeniu și de propriul certificat. Odată ce un cenzor află domeniul acela, îl poate bloca, iar a ține multe domenii este o goană continuă.

## Ce face bine VLESS-Reality

[VLESS-Reality](/vpn-protocols/vless-reality) răspunde la toate trei:

- **Nicio amprentă fixă.** Conexiunea este TLS 1.3 peste TCP, cel mai răspândit trafic criptat de pe internet.
- **Sondele văd un site real.** Reality trimite mai departe pe oricine nu se poate autentifica către site-ul real al cărui handshake îl împrumută, cu certificatul autentic al acelui site.
- **Nimic de-al nostru de blocat după nume.** În handshake nu este niciun domeniu Doppler și niciun certificat Doppler.

Rulează și peste TCP, așa că continuă să funcționeze în rețelele care limitează sau blochează UDP, acolo unde [Hysteria 2](/vpn-protocols/hysteria2) și [AmneziaWG](/vpn-protocols/amneziawg) se descurcă greu. Iar VLESS însuși este mic: se bazează pe TLS pentru criptare, în loc să adauge una proprie, așa că nu există criptare dublă.

## La ce am renunțat

- **Viteza brută pe legături cu pierderi.** TCP își revine după pierderea de pachete mai puțin lin decât QUIC sau decât UDP-ul WireGuard. Pe o conexiune curată, diferența este mică; pe una slabă, poate fi vizibilă.
- **Suport integrat în sistemul de operare.** Niciun sistem de operare nu vine cu un client VLESS, așa că îți trebuie o aplicație. Am considerat că este acceptabil și am construit-o pe a noastră, pentru iOS, Android, macOS și Windows.
- **Invizibilitate perfectă.** Nu există. Cercetarea a arătat că [TLS în interiorul TLS poate fi amprentat](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), iar în noiembrie 2025 s-a [raportat](https://github.com/net4people/bbs/issues/546) că unii ISP din Rusia tăiau conexiunile Reality. VLESS-Reality este o concepție de rezistență la cenzură, nu o garanție.

## Ce facem în privința limitelor

Cenzura se schimbă, așa că alegerea protocolului nu este sfârșitul muncii. Ajustăm setările serverelor și site-urile pe care Reality le împrumută, pe măsură ce filtrarea se schimbă, și urmărim în continuare aceeași cercetare și aceleași raportări din comunitate citate în aceste pagini. Dacă apare o abordare mai bună, pagina aceasta o va spune.

Pentru povestea tehnică completă a modului în care funcționează VLESS-Reality, citește [tunelul VLESS-Reality](/how-it-works/vless-reality-tunnel). Ca să-l încerci, vezi [VPN VLESS](/vless-vpn).
