> **Na kratko.** Hysteria 2 je proxy protokol, zgrajen na QUIC, transportu za HTTP/3. Zasnovan je za hitrost na slabih povezavah z izgubami, za vsakogar brez gesla pa se njegov strežnik obnaša kot običajno spletno mesto HTTP/3. Njegova šibka točka je odvisnost od UDP, ki ga nekatera omrežja dušijo ali povsem blokirajo.

## Kaj je Hysteria 2?

Hysteria je odprtokodni projekt [apernet](https://github.com/apernet/hysteria); različica 2, prenovljen protokol, je izšla septembra 2023. Tako kot Shadowsocks in VLESS je proxy, ne klasičen VPN, odjemalci pa lahko skozenj usmerijo celotno napravo.

## Kako deluje?

Po njegovi [specifikaciji protokola](https://v2.hysteria.network/docs/developers/Protocol/) Hysteria 2 teče prek QUIC, kot je določeno v [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), z razširitvijo nezanesljivih datagramov za promet UDP. QUIC že zagotavlja šifriranje TLS 1.3, multipleksirane tokove in hitro vzpostavitev povezave.

Prikrivanje se začne pri overjanju. Specifikacija zahteva, da strežnik Hysteria **mora izvajati pravi strežnik HTTP/3** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) in obravnavati zahteve tako, kot bi jih kateri koli spletni strežnik. Odjemalec se overi s posebno zahtevo HTTP/3; vsi drugi, naj bo to radoveden obiskovalec ali aktivna sonda, dobijo običajne spletne odgovore. Specifikacija navaja, da se strežnik za tretjo osebo brez poverilnic obnaša prav kot standardni spletni strežnik HTTP/3.

## Zakaj je hiter?

QUIC teče prek UDP in si po izgubi paketov opomore, ne da bi zaustavil vsak tok, kot to stori TCP. Hysteria lahko uporablja tudi lasten nadzor zasičenosti, namenjen nestabilnim povezavam, zato običajno drži hitrost v zasičenih mobilnih omrežjih, na dolgih poteh in v Wi-Fi z motnjami, kjer se protokoli na osnovi TCP upočasnijo.

## Kako težko je Hysteria 2 blokirati?

Proti aktivnemu sondiranju se dobro drži, saj sonde vidijo spletni strežnik. Izpostavljenost je transport. Cenzor lahko duši ali blokira UDP ali posebej QUIC, ne da bi pokvaril večino spletnih mest, ker brskalniki ob odpovedi HTTP/3 preidejo na HTTP/2 prek TCP. Kjer se to zgodi, Hysteria 2 nima kam, protokoli na osnovi TCP, kot je [VLESS-Reality](/vpn-protocols/vless-reality), pa še naprej delujejo.

## Kdaj uporabiti Hysteria 2?

- **Povezave z izgubami ali na dolge razdalje**, kjer se njegov nadzor zasičenosti in okrevanje po izgubah v QUIC obrestujeta.
- **Omrežja, ki dovoljujejo UDP.** Preverite, preden se nanj zanesete.
- Kot drugi protokol poleg možnosti na TCP, da lahko preklopite, ko je UDP filtriran. Naš [vodnik o cenzuri](/bypass-censorship) pokrije, kako filtri ciljajo na transporte.

## Ali Doppler uporablja Hysteria 2?

Ne. Doppler uporablja VLESS-Reality prek TCP, ki še naprej deluje v omrežjih, ki blokirajo UDP. Glejte [zakaj VLESS](/vpn-protocols/why-vless).
