> **Ukratko.** OpenVPN je veteran VPN-ova otvorenog koda: fleksibilan, široko podržan i dobro poznat nakon više od dva desetljeća. Sporiji je od novijih protokola i, prema objavljenim istraživanjima, jedan od najlakših koje davatelj usluge može prepoznati po otisku.

## Što je OpenVPN?

OpenVPN je besplatan VPN softver otvorenog koda koji je James Yonan prvi put objavio [u svibnju 2001.](https://en.wikipedia.org/wiki/OpenVPN). Veći dio 2000-ih i 2010-ih bio je zadani izbor komercijalnih VPN usluga i poslovnog udaljenog pristupa, a i dalje dolazi u mnogim usmjerivačima i poslovnim proizvodima.

Radi u korisničkom prostoru, a ne u jezgri operacijskog sustava, i za razmjenu ključeva oslanja se na biblioteku OpenSSL i protokol TLS. Port koji je dodijelio IANA jest 1194, ali OpenVPN može raditi preko UDP-a ili TCP-a na gotovo bilo kojem portu.

## Kako radi?

OpenVPN koristi vlastiti protokol u dva dijela. Upravljački kanal koristi TLS kako bi potvrdio identitet dviju strana, obično certifikatima, i dogovorio ključeve. Podatkovni kanal zatim prenosi vaš promet, šifriran tim ključevima, unutar paketa UDP ili TCP.

Ta struktura čini OpenVPN vrlo podesivim. Možete birati šifre, načine autentifikacije, portove i transporte te ga puštati kroz proxyje. Cijena te fleksibilnosti jest složenost: više koda, više postavki i više načina da se završi sa slabom konfiguracijom.

## Zašto se OpenVPN blokira?

TLS unutar OpenVPN-a nije isto što i HTTPS posjet web-mjestu. OpenVPN omata svoje TLS rukovanje u vlastito uokvirivanje paketa, pa njegov promet ima oblik kakav običan web-promet nema.

Istraživači su izmjerili koliko je to važno. Tim sa Sveučilišta Michigan i drugi [izgradili su sustav za prepoznavanje otisaka](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) i pokrenuli ga unutar davatelja usluge s oko milijun korisnika. Prepoznao je **više od 85 % tokova OpenVPN-a** uz vrlo malo lažno pozitivnih rezultata, a uhvatio je i većinu komercijalnih „prikrivenih” postavki OpenVPN-a koje su testirali.

Filtriranje u stvarnom svijetu slijedi istraživanja. U kolovozu 2023. korisnici u Rusiji [javili su](https://github.com/net4people/bbs/issues/274) da mobilni operateri prekidaju veze OpenVPN-a ubrzo nakon što počnu.

## Kada koristiti OpenVPN?

- **Kompatibilnost.** Stariji usmjerivači, poslovni pristupnici i neke poslovne mreže podržavaju OpenVPN i ništa novije.
- **Mreže samo s TCP-om.** OpenVPN može raditi preko TCP-a kad je UDP blokiran, što [WireGuard](/vpn-protocols/wireguard) ne može bez pomoći.
- **Ne na filtriranim mrežama.** Gdje se VPN-ovi blokiraju, OpenVPN obično zakazuje rano. Bolji je alat protokol koji oponaša običan web-promet, poput [VLESS-Reality](/vpn-protocols/vless-reality). Naš [vodič o cenzuri](/bypass-censorship) objašnjava kako sustavi filtriranja odlučuju što prekinuti.

## Koristi li Doppler OpenVPN?

Ne. Doppler koristi VLESS-Reality na svakoj platformi. Vodič [zašto VLESS](/vpn-protocols/why-vless) objašnjava kako smo ga odabrali.
