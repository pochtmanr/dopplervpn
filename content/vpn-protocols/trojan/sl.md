> **Na kratko.** Trojan skrije proxy promet znotraj prave povezave TLS z resničnim spletnim mestom, ki ga nadzorujete. Kdor se poveže brez gesla, preprosto dobi spletno mesto. Dobro deluje, vendar potrebujete lastno domeno in certifikat, ta dva pa je mogoče najti in blokirati.

## Kaj je Trojan?

Trojan je proxy protokol [projekta trojan-gfw](https://github.com/trojan-gfw/trojan), prvič izdan oktobra 2017. Ideja je v imenu: namesto da bi izumil prikrivanje, se skrije znotraj najpogostejšega šifriranega prometa na internetu, HTTPS.

## Kako deluje?

[Opis protokola](https://trojan-gfw.github.io/trojan/protocol) je kratek. Strežnik Trojan posluša kot običajen strežnik HTTPS, s pravim certifikatom za pravo domeno. Odjemalec izvede pristno rokovanje TLS. Nato znotraj šifrirane povezave pošlje:

- šestnajstiško zapisano zgoščeno vrednost SHA-224 skupnega gesla, ki ima 56 znakov,
- prelom vrstice,
- kratko zahtevo, ki pove, kam naj gre promet, v obliki, podobni SOCKS5,
- še en prelom vrstice, ki mu sledi prvi kos podatkov.

Če sta zgoščena vrednost in zahteva veljavni, strežnik odpre tunel do cilja. Če je kaj narobe, strežnik povezavo obravnava kot »druge protokole« in jo preda nadomestnemu spletnemu strežniku, tako da obiskovalec vidi običajno spletno mesto.

## Kako težko je Trojan blokirati?

Od zunaj je povezava Trojan seja TLS z vašo domeno, z vašim certifikatom. Aktivne sonde dobijo nazaj pravo spletno mesto. Zato je Trojan veliko težje izločiti kot protokole, ki so videti naključni, na primer [Shadowsocks](/vpn-protocols/shadowsocks).

Njegova šibka točka je sama domena. Vsak strežnik potrebuje domeno in certifikat, cenzor, ki izve, katere domene pripadajo proxyjem, pa jih lahko blokira po imenu ali po IP. Raziskovalci so tudi pokazali, da TLS znotraj TLS pušča vzorce v času in velikosti, po katerih ga je mogoče [prepoznati](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), kar zadeva Trojan in podobne zasnove.

[VLESS-Reality](/vpn-protocols/vless-reality) odpravi težavo z domeno tako, da si izposodi rokovanje TLS obstoječega, priljubljenega spletnega mesta namesto vašega.

## Kdaj uporabiti Trojan?

- **Ko nadzorujete domeno** in želite preprosto, dobro razumljivo nastavitev, ki je videti kot HTTPS.
- **V zmerno filtriranih omrežjih**, kjer vaša domena verjetno ne bo tarča.
- Naša primerjava [VLESS, VMess in Trojan](/blog/vless-vs-vmess-vs-trojan) pomaga, če izbirate med njimi.

## Ali Doppler uporablja Trojan?

Ne. Doppler uporablja VLESS-Reality, ki ne potrebuje lastne domene. Glejte [zakaj VLESS](/vpn-protocols/why-vless).
