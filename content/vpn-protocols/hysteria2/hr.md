> **Ukratko.** Hysteria 2 je proxy protokol građen na QUIC-u, transportu iza HTTP/3. Osmišljen je za brzinu na lošim vezama s gubicima, a svakome bez lozinke njegov se poslužitelj ponaša kao obično web-mjesto HTTP/3. Slaba mu je točka što ovisi o UDP-u, koji neke mreže usporavaju ili blokiraju u potpunosti.

## Što je Hysteria 2?

Hysteria je projekt otvorenog koda od [aperneta](https://github.com/apernet/hysteria); inačica 2, redizajnirani protokol, objavljena je u rujnu 2023. Kao Shadowsocks i VLESS, to je proxy, a ne klasični VPN, i klijenti mogu kroz njega usmjeriti cijeli uređaj.

## Kako radi?

Prema [specifikaciji protokola](https://v2.hysteria.network/docs/developers/Protocol/), Hysteria 2 radi preko QUIC-a kako je definiran u [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), s proširenjem za nepouzdane datagramove za UDP promet. QUIC već daje šifriranje TLS 1.3, multipleksirane tokove i brzo uspostavljanje veze.

Autentifikacija je mjesto gdje nastaje prikrivanje. Specifikacija zahtijeva da poslužitelj Hysteria **mora implementirati pravi HTTP/3 poslužitelj** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) i obrađivati zahtjeve kao bilo koji web-poslužitelj. Klijent se autentificira posebnim HTTP/3 zahtjevom; svi ostali, bio to znatiželjni posjetitelj ili aktivna proba, dobivaju obične web-odgovore. Specifikacija navodi da se poslužitelj, trećoj strani bez vjerodajnica, ponaša baš kao standardni web-poslužitelj HTTP/3.

## Zašto je brza?

QUIC radi preko UDP-a i oporavlja se od gubitka paketa bez zaustavljanja svakog toka, kao što to radi TCP. Hysteria može koristiti i vlastito upravljanje zagušenjem, usmjereno na nestabilne veze, pa obično drži brzinu na zagušenim mobilnim mrežama, na dugim rutama i na Wi-Fi-ju sa smetnjama, gdje se protokoli na TCP-u usporavaju.

## Koliko je Hysteria 2 teško blokirati?

Protiv aktivnog ispitivanja dobro drži, jer probe vide web-poslužitelj. Izloženost je u transportu. Cenzor može usporiti ili blokirati UDP, ili posebno QUIC, a da ne pokvari većinu web-mjesta, jer preglednici padaju natrag na HTTP/2 preko TCP-a kad HTTP/3 zakaže. Gdje se to dogodi, Hysteria 2 nema kamo, dok protokoli na TCP-u, poput [VLESS-Reality](/vpn-protocols/vless-reality), nastavljaju raditi.

## Kada koristiti Hysteria 2?

- **Veze s gubicima ili na veliku udaljenost**, gdje se isplate njegovo upravljanje zagušenjem i oporavak od gubitaka u QUIC-u.
- **Mreže koje dopuštaju UDP.** Provjerite prije nego što se na njega oslonite.
- Kao drugi protokol uz mogućnost na TCP-u, da možete prijeći kad se UDP filtrira. Naš [vodič o cenzuri](/bypass-censorship) opisuje kako filtri ciljaju transporte.

## Koristi li Doppler Hysteria 2?

Ne. Doppler koristi VLESS-Reality preko TCP-a, koji nastavlja raditi na mrežama koje blokiraju UDP. Pogledajte [zašto VLESS](/vpn-protocols/why-vless).
