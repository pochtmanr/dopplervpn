> **Trumpai.** Shadowsocks yra lengvas šifruotas proksi, sukurtas Kinijoje Didžiajai ugniasienei apeiti. Daugelį metų jis veikė todėl, kad atrodė kaip niekas. Nuo 2021 m. tyrimai rodo, kad ugniasienė blokuoja būtent tokį srautą, nes tikras srautas retai būna toks atsitiktinis.

## Kas yra Shadowsocks?

Shadowsocks yra atvirojo kodo proksi protokolas, pirmą kartą išleistas [2012 m. balandį](https://en.wikipedia.org/wiki/Shadowsocks). Griežtai kalbant, tai ne VPN: tai SOCKS5 tipo proksi su šifravimu, ir programėlės pačios nusprendžia, kurį srautą per jį siųsti. Praktiškai dauguma Shadowsocks klientų dabar siūlo visos sistemos režimą, kuris elgiasi kaip VPN.

Jis populiarus, nes yra paprastas ir greitas. Dabartinės versijos naudoja [AEAD šifrus](https://shadowsocks.org/doc/aead.html), kurie vienu žingsniu užtikrina konfidencialumą, vientisumą ir autentiškumą, o [2022 m. protokolo redakcija](https://shadowsocks.org/doc/sip022.html) sustiprino apsaugą nuo pakartotinio atkūrimo.

## Kaip jis veikia?

Klientas ir serveris dalijasi slaptažodžiu, iš kurio gaunamas šifravimo raktas. Viskas, ką siunčia klientas, įskaitant norimos svetainės adresą, užšifruota nuo pat pirmo baito. Nėra atpažįstamo rankos paspaudimo, sertifikato ir atviro teksto antraštės. Stebėtojui Shadowsocks ryšys yra srautas baitų, panašių į atsitiktinius.

## Kaip Didžioji ugniasienė aptinka Shadowsocks?

Pirma, aktyviuoju zondavimu. GFW Report tyrėjai [užfiksavo](https://gfw.report/publications/imc20/en/), kaip ugniasienė įtariamiems Shadowsocks serveriams siuntė dešimtis tūkstančių zondų, atkartodama ir keisdama tikrus ryšius, kad pamatytų, kaip serveris reaguoja.

Tada, nuo 2021 m. lapkričio, grubesniu ir platesniu būdu. [USENIX Security 2023 tyrimas](https://gfw.report/publications/usenixsecurity23/en/) nustatė, kad ugniasienė realiuoju laiku blokuoja „visiškai užšifruotą“ srautą. Ji žiūri į pirmąjį ryšio paketą ir praleidžia viską, kas panašu į žinomą protokolą arba turi pakankamai spausdinamo teksto. Viena taisyklė matuoja vidutinį nustatytų bitų skaičių baite: reikšmės, lygios 3.4 arba mažesnės, ir reikšmės, lygios 4.6 arba didesnės, praleidžiamos, o tarp jų esantys į atsitiktinius panašūs duomenys — ne. Visa, kas lieka, gali būti užblokuota.

Tyrėjai taip pat nustatė, kad ugniasienė tai taikė maždaug 26% ryšių ir tik populiarių duomenų centrų IP intervalams, tikriausiai siekdama apriboti šalutinę žalą. Protokolų kūrėjams išvada buvo aiški: atrodyti atsitiktinai irgi yra atspaudas.

## Kada verta naudoti Shadowsocks?

- **Lengvam, greitam proksiavimui** tinkluose, kurie srauto atidžiai netikrina.
- **Savo serveriui** su tokiomis priemonėmis kaip Outline, kurios palengvina sąranką.
- **Atsargiai, kai filtravimas griežtas.** Kinijoje ir kitur, kur blokuojamas visiškai užšifruotas srautas, Shadowsocks gerokai mažiau patikimas už protokolus, imituojančius tikrą TLS, pavyzdžiui [VLESS-Reality](/vpn-protocols/vless-reality). Kaip ši sritis pasikeitė, pasakoja mūsų [cenzūros protokolų istorija](/blog/censorship-protocol-history).

## Ar Doppler naudoja Shadowsocks?

Ne. Doppler naudoja VLESS-Reality; priežastys — vadove [„Kodėl VLESS“](/vpn-protocols/why-vless).
