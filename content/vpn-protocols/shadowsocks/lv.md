> **Īsumā.** Shadowsocks ir viegls šifrēts starpnieks, kas tika radīts Ķīnā, lai izkļūtu cauri Lielajam ugunsmūrim. Gadiem ilgi tas darbojās, izskatoties pēc nekā. Kopš 2021. gada pētījumi rāda, ka ugunsmūris bloķē tieši šāda veida datplūsmu, jo īsta datplūsma reti ir tik nejauša.

## Kas ir Shadowsocks?

Shadowsocks ir atvērtā koda starpniekprotokols, kas pirmo reizi izlaists [2012. gada aprīlī](https://en.wikipedia.org/wiki/Shadowsocks). Stingri ņemot, tas nav VPN: tas ir SOCKS5 stila starpnieks ar šifrēšanu, un lietotnes izlemj, kuru datplūsmu caur to sūtīt. Praksē lielākā daļa Shadowsocks klientu tagad piedāvā visas sistēmas režīmu, kas uzvedas kā VPN.

Tas ir populārs, jo ir vienkāršs un ātrs. Pašreizējās versijas izmanto [AEAD šifrus](https://shadowsocks.org/doc/aead.html), kas vienā solī nodrošina konfidencialitāti, integritāti un autentiskumu, un protokola [2022. gada redakcija](https://shadowsocks.org/doc/sip022.html) pastiprināja aizsardzību pret atkārtošanu.

## Kā tas darbojas?

Klients un serveris koplieto paroli, kas tiek pārvērsta šifrēšanas atslēgā. Viss, ko klients sūta, ieskaitot tās vietnes adresi, kuru tas vēlas, ir šifrēts no paša pirmā baita. Nav atpazīstama rokasspiediena, nav sertifikāta un nav atklāta teksta galvenes. Novērotājam Shadowsocks savienojums ir nejauši izskatošu baitu plūsma.

## Kā Lielais ugunsmūris atklāj Shadowsocks?

Vispirms ar aktīvo zondēšanu. GFW Report pētnieki [ierakstīja](https://gfw.report/publications/imc20/en/), kā ugunsmūris sūta desmitiem tūkstošu zonžu uz aizdomīgiem Shadowsocks serveriem, atkārtojot un pārveidojot īstus savienojumus, lai redzētu, kā serveris reaģēja.

Pēc tam, no 2021. gada novembra, ar rupjāku un plašāku metodi. [USENIX Security 2023 pētījums](https://gfw.report/publications/usenixsecurity23/en/) konstatēja, ka ugunsmūris reāllaikā bloķē "pilnībā šifrētu" datplūsmu. Tas skatās savienojuma pirmo paketi un atbrīvo visu, kas izskatās pēc zināma protokola vai satur pietiekami daudz drukājama teksta. Viens noteikums mēra vidējo iestatīto bitu skaitu baitā: vērtības 3.4 vai zemāk, vai 4.6 un augstāk, tiek atbrīvotas, bet nejauši izskatošie dati pa vidu — nē. To, kas paliek, var bloķēt.

Pētnieki arī konstatēja, ka ugunsmūris to piemēroja aptuveni 26% savienojumu un tikai populāru datu centru IP diapazoniem, iespējams, lai ierobežotu blakuszaudējumus. Mācība protokolu autoriem bija skaidra: izskatīties nejauši pati par sevi ir pirkstu nospiedums.

## Kad lietot Shadowsocks?

- **Vieglai, ātrai starpniekošanai** tīklos, kas datplūsmu cieši nepārbauda.
- **Pašam savam serverim** ar tādiem rīkiem kā Outline, kas iestatīšanu padara vienkāršu.
- **Uzmanīgi zem smagas filtrēšanas.** Ķīnā un citur, kur bloķē pilnībā šifrētu datplūsmu, Shadowsocks ir daudz mazāk uzticams nekā protokoli, kas atdarina īstu TLS, piemēram, [VLESS-Reality](/vpn-protocols/vless-reality). Mūsu [cenzūras protokolu vēsture](/blog/censorship-protocol-history) izseko, kā šī joma ir virzījusies tālāk.

## Vai Doppler izmanto Shadowsocks?

Nē. Doppler izmanto VLESS-Reality iemeslu dēļ, kas aprakstīti [kāpēc VLESS](/vpn-protocols/why-vless).
