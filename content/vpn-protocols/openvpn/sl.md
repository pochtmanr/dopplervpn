> **Na kratko.** OpenVPN je veteran odprtokodnih VPN-jev: prilagodljiv, široko podprt in po več kot dveh desetletjih dobro razumljen. Je tudi počasnejši od novejših protokolov in je po objavljenih raziskavah eden najlažjih, da ga ponudnik internetnih storitev prepozna po obliki.

## Kaj je OpenVPN?

OpenVPN je brezplačna odprtokodna programska oprema VPN, ki jo je James Yonan prvič izdal [maja 2001](https://en.wikipedia.org/wiki/OpenVPN). Večino 2000-ih in 2010-ih je bil privzeta izbira komercialnih storitev VPN in poslovnega oddaljenega dostopa, še vedno pa je vgrajen v številne usmerjevalnike in poslovne izdelke.

Deluje v uporabniškem prostoru, ne v jedru operacijskega sistema, za izmenjavo ključev pa se opira na knjižnico OpenSSL in protokol TLS. Vrata, ki jih je dodelil IANA, so 1194, OpenVPN pa lahko teče prek UDP ali TCP na skoraj katerih koli vratih.

## Kako deluje?

OpenVPN uporablja lasten protokol z dvema deloma. Nadzorni kanal uporablja TLS za overjanje obeh strani, običajno s certifikati, in za dogovor o ključih. Podatkovni kanal nato prenaša vaš promet, šifriran s temi ključi, znotraj paketov UDP ali TCP.

Ta zgradba naredi OpenVPN zelo nastavljiv. Izberete lahko šifre, načine overjanja, vrata in transporte ter ga speljete skozi proxyje. Cena te prilagodljivosti je zapletenost: več kode, več nastavitev in več načinov, da končate s šibko konfiguracijo.

## Zakaj OpenVPN blokirajo?

TLS znotraj OpenVPN ni isto kot obisk spletnega mesta prek HTTPS. OpenVPN svoje rokovanje TLS ovije v lastno obliko paketov, zato ima njegov promet obliko, kakršne običajen spletni promet nima.

Raziskovalci so izmerili, koliko to šteje. Ekipa z Univerze v Michiganu in drugi so [zgradili sistem za prepoznavanje](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) in ga zagnali znotraj ponudnika z okoli milijonom uporabnikov. Sistem je prepoznal **več kot 85% tokov OpenVPN** z zelo malo lažnimi pozitivnimi rezultati in ujel tudi večino preizkušenih komercialnih »zakritih« nastavitev OpenVPN.

Resnično filtriranje sledi raziskavam. Avgusta 2023 so uporabniki v Rusiji [poročali](https://github.com/net4people/bbs/issues/274), da mobilni operaterji povezave OpenVPN prekinejo kmalu po začetku.

## Kdaj uporabiti OpenVPN?

- **Združljivost.** Starejši usmerjevalniki, poslovni prehodi in nekatera poslovna omrežja podpirajo OpenVPN in nič novejšega.
- **Omrežja samo s TCP.** OpenVPN lahko teče prek TCP, ko je UDP blokiran, česar [WireGuard](/vpn-protocols/wireguard) brez pomoči ne zmore.
- **Ne v filtriranih omrežjih.** Kjer so VPN-ji blokirani, OpenVPN običajno odpove zgodaj. Boljše orodje je protokol, ki posnema običajen spletni promet, na primer [VLESS-Reality](/vpn-protocols/vless-reality). Naš [vodnik o cenzuri](/bypass-censorship) pojasni, kako sistemi za filtriranje odločijo, kaj prekiniti.

## Ali Doppler uporablja OpenVPN?

Ne. Doppler uporablja VLESS-Reality na vseh platformah. Vodnik [zakaj VLESS](/vpn-protocols/why-vless) pojasni, kako smo ga izbrali.
