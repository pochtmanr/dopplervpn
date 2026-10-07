> **Ukratko.** Shadowsocks je lagani šifrirani proxy nastao u Kini da prođe kroz Veliki kineski vatrozid. Godinama je radio tako što je izgledao kao ništa. Od 2021. istraživanja pokazuju da vatrozid blokira upravo takav promet, jer pravi promet rijetko bude toliko slučajan.

## Što je Shadowsocks?

Shadowsocks je proxy protokol otvorenog koda, prvi put objavljen [u travnju 2012.](https://en.wikipedia.org/wiki/Shadowsocks). Strogo uzevši, nije VPN: to je proxy u stilu SOCKS5 sa šifriranjem, a aplikacije odlučuju koji promet kroz njega poslati. U praksi većina klijenata Shadowsocksa sada nudi način rada za cijeli sustav koji se ponaša kao VPN.

Popularan je jer je jednostavan i brz. Aktualne inačice koriste [šifre AEAD](https://shadowsocks.org/doc/aead.html), koje u jednom koraku daju povjerljivost, cjelovitost i autentičnost, a [inačica protokola iz 2022.](https://shadowsocks.org/doc/sip022.html) pojačala je zaštitu od ponovne reprodukcije.

## Kako radi?

Klijent i poslužitelj dijele lozinku, od koje nastaje ključ za šifriranje. Sve što klijent pošalje, uključujući adresu web-mjesta koje želi, šifrirano je od prvog bajta. Nema prepoznatljivog rukovanja, certifikata ni zaglavlja u otvorenom tekstu. Promatraču je veza Shadowsocksa tok bajtova koji izgledaju slučajno.

## Kako Veliki kineski vatrozid prepoznaje Shadowsocks?

Prvo, aktivnim ispitivanjem. Istraživači GFW Reporta [zabilježili su](https://gfw.report/publications/imc20/en/) kako vatrozid šalje desetke tisuća proba na sumnjive poslužitelje Shadowsocksa, ponavljajući i mijenjajući stvarne veze da vidi kako poslužitelj reagira.

Zatim, od studenoga 2021., grubljom i širom metodom. [Studija USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) utvrdila je da vatrozid u stvarnom vremenu blokira „potpuno šifrirani” promet. Gleda prvi paket veze i izuzima sve što izgleda kao poznati protokol ili sadrži dovoljno ispisivog teksta. Jedno pravilo mjeri prosječan broj postavljenih bitova po bajtu: vrijednosti od 3,4 naniže ili od 4,6 naviše izuzete su, a slučajni na izgled podaci između nisu. Što ostane, može se blokirati.

Istraživači su također utvrdili da je vatrozid to primjenjivao na oko 26 % veza, i samo na raspone IP adresa popularnih podatkovnih centara, vjerojatno da ograniči popratnu štetu. Pouka za autore protokola bila je jasna: izgledati slučajno samo je po sebi otisak.

## Kada koristiti Shadowsocks?

- **Lagano, brzo proxyiranje** na mrežama koje promet ne ispituju pomno.
- **Vlastiti poslužitelj** s alatima poput Outlinea, koji postavljanje čine jednostavnim.
- **Oprezno pod jakim filtriranjem.** U Kini i drugdje gdje se blokira potpuno šifrirani promet Shadowsocks je znatno manje pouzdan od protokola koji oponašaju pravi TLS, poput [VLESS-Reality](/vpn-protocols/vless-reality). Naša [povijest protokola za zaobilaženje cenzure](/blog/censorship-protocol-history) prati kako je to područje krenulo dalje.

## Koristi li Doppler Shadowsocks?

Ne. Doppler koristi VLESS-Reality, iz razloga u vodiču [zašto VLESS](/vpn-protocols/why-vless).
