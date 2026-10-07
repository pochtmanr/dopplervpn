> **Īsumā.** Trojan slēpj starpnieka datplūsmu īstā TLS savienojumā ar īstu vietni, ko jūs kontrolējat. Ikviens, kas savienojas bez paroles, vienkārši saņem vietni. Tas darbojas labi, bet vajag savu domēnu un sertifikātu, un tos var atrast un bloķēt.

## Kas ir Trojan?

Trojan ir starpniekprotokols no [trojan-gfw projekta](https://github.com/trojan-gfw/trojan), pirmo reizi izlaists 2017. gada oktobrī. Ideja ir nosaukumā: tā vietā, lai izgudrotu masku, tas slēpjas visizplatītākajā šifrētajā datplūsmā internetā — HTTPS.

## Kā tas darbojas?

[Protokola apraksts](https://trojan-gfw.github.io/trojan/protocol) ir īss. Trojan serveris klausās kā parasts HTTPS serveris ar īstu sertifikātu īstam domēnam. Klients veic īstu TLS rokasspiedienu. Pēc tam šifrētā savienojuma iekšienē tas sūta:

- koplietotās paroles SHA-224 heša heksadecimālo kodējumu, kas ir 56 rakstzīmes,
- rindiņas pārtraukumu,
- nelielu pieprasījumu, kas pasaka, kur datplūsmai jādodas, SOCKS5 līdzīgā formātā,
- vēl vienu rindiņas pārtraukumu, kam seko pirmais datu gabals.

Ja hešs un pieprasījums ir derīgi, serveris atver tuneli uz galamērķi. Ja kaut kas nav kārtībā, serveris uztver savienojumu kā "citus protokolus" un nodod to rezerves tīmekļa serverim, tāpēc apmeklētājs redz parasto vietni.

## Cik grūti ir bloķēt Trojan?

No ārpuses Trojan savienojums ir TLS sesija uz jūsu domēnu ar jūsu sertifikātu. Aktīvās zondes saņem atpakaļ īstu vietni. Tas padara Trojan daudz grūtāk izceļamu nekā protokolus, kas izskatās nejauši, piemēram, [Shadowsocks](/vpn-protocols/shadowsocks).

Tā vājā vieta ir pats domēns. Katram serverim vajag domēnu un sertifikātu, un cenzors, kas uzzina, kuri domēni pieder starpniekiem, var tos bloķēt pēc nosaukuma vai pēc IP. Pētnieki ir arī parādījuši, ka TLS, kas nests TLS iekšienē, atstāj laika un izmēra rakstus, kurus var [atpazīt pēc pirkstu nospieduma](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), un tas skar Trojan un līdzīgus risinājumus.

[VLESS-Reality](/vpn-protocols/vless-reality) noņem domēna problēmu, aizņemoties esošas, populāras vietnes TLS rokasspiedienu jūsu paša vietā.

## Kad lietot Trojan?

- **Kad jūs kontrolējat domēnu** un vēlaties vienkāršu, labi saprotamu iestatījumu, kas izskatās pēc HTTPS.
- **Mēreni filtrētos tīklos**, kur jūsu domēnu, visticamāk, neizvēlēsies par mērķi.
- Mūsu salīdzinājums [VLESS, VMess un Trojan](/blog/vless-vs-vmess-vs-trojan) palīdz, ja izvēlaties starp tiem.

## Vai Doppler izmanto Trojan?

Nē. Doppler izmanto VLESS-Reality, kam nav vajadzīgs savs domēns. Skatiet [kāpēc VLESS](/vpn-protocols/why-vless).
