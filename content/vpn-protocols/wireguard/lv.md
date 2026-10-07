> **Īsumā.** WireGuard ir ātrākais un vienkāršākais no plaši lietotajiem VPN protokoliem, un nefiltrētā tīklā tā ir lieliska izvēle. Tas nekad nav veidots, lai slēptu, ka tas ir VPN, un Krievijā, Irānā un Ķīnā tas ir starp pirmajiem protokoliem, ko bloķē.

## Kas ir WireGuard?

WireGuard ir VPN protokols, ko uzrakstīja Jason A. Donenfeld un pirmo reizi izlaida 2015. gadā. Tā mērķis bija aizstāt lielos, konfigurējamos protokolus, kas bija pirms tā, ar kaut ko pietiekami mazu, lai to varētu auditēt. 2020. gada martā tas tika [iekļauts Linux 5.6 kodolā](https://en.wikipedia.org/wiki/WireGuard), un oficiālās lietotnes tagad ir pieejamas operētājsistēmām Windows, macOS, iOS, Android un Linux.

Tā vietā, lai katra puse vienotos par šifru komplektu, WireGuard fiksē vienu mūsdienīgu primitīvu kopu. Tā [protokola lapa](https://www.wireguard.com/protocol/) tos uzskaita: ChaCha20 ar Poly1305 šifrēšanai, Curve25519 atslēgu apmaiņai un BLAKE2s hešēšanai. Nav nekā, ko nepareizi konfigurēt, un nav vecāka, vājāka varianta, uz kuru atkāpties.

## Kā tas darbojas?

Katrai ierīcei ir atslēgu pāris, līdzīgi kā SSH. Klients un serveris iepriekš zina viens otra publiskās atslēgas, un rokasspiediens balstās uz Noise protokola ietvaru (protokola lapa nosauc precīzo konstrukciju, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Visas paketes tiek sūtītas pa UDP](https://www.wireguard.com/protocol/), un jauna sesija tiek izveidota vienā apmaiņā turp un atpakaļ.

Tāpēc WireGuard šķiet ātrs. Gandrīz nav par ko vienoties, operētājsistēmā Linux kods darbojas kodolā, un pāreja starp Wi-Fi un mobilo datu tīklu notiek klusi, jo protokols netur atvērtu ilglaicīgu savienojumu.

## Kāpēc WireGuard bloķē?

Tā pati vienkāršība, kas padara WireGuard viegli auditējamu, padara to viegli atpazīstamu. Tā [baltā grāmata](https://www.wireguard.com/papers/wireguard.pdf) apraksta rokasspiediena ziņojumus pa baitiem, tāpēc pirmā pakete no klienta vienmēr ir 148 baiti un atbilde vienmēr ir 92 baiti, un katra sākas ar fiksētu ziņojuma tipa lauku. Dziļās pakešu inspekcijas (DPI) sistēmai pietiek ar īsu noteikumu, lai pamanītu šo rakstu UDP.

Cenzori tieši tā arī dara. 2023. gada augustā lietotāji Krievijā [ziņoja](https://github.com/net4people/bbs/issues/274), ka lielie mobilo sakaru operatori pārtrauc WireGuard sesijas tūlīt pēc rokasspiediena. Šifrēšana joprojām aizsargāja saturu, bet pats savienojums bija pazudis.

Tas ir apzināts kompromiss, nevis kļūda. WireGuard autori izvēlējās fiksētu, minimālu protokolu, un maskēšanās nebija mērķu sarakstā. Tādi projekti kā [AmneziaWG](/vpn-protocols/amneziawg) maina pakešu formas, lai atgūtu daļu maskēšanās.

## Kad lietot WireGuard?

- **Nefiltrētos tīklos.** Mājās, darbā vai ceļojot valstī, kas nebloķē VPN, WireGuard ir grūti pārspēt ātrumā un akumulatora darbības laikā.
- **Pašam savam serverim.** Ja darbināt savu serveri, WireGuard ir viens no vienkāršākajiem protokoliem, ko pareizi iestatīt.
- **Ne zem DPI filtrēšanas.** Ja tīkls bloķē VPN, labāk der protokols, kas veidots, lai izskatītos pēc parastas tīmekļa datplūsmas, piemēram, [VLESS-Reality](/vpn-protocols/vless-reality). Mūsu salīdzinājums [VLESS-Reality un WireGuard](/blog/vless-reality-vs-wireguard) šo kompromisu aplūko sīkāk.

## Vai Doppler izmanto WireGuard?

Nē. Doppler lietotnes savienojas caur VLESS-Reality, jo Doppler ir veidots tīkliem, kuros WireGuard tiek filtrēts. [Kāpēc VLESS](/vpn-protocols/why-vless) ceļvedis skaidro šo izvēli.
