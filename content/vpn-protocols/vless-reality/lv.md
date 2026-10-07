> **Īsumā.** VLESS ir minimāls starpniekprotokols no Xray projekta. Reality ir TLS slānis, kas liek VLESS savienojumam izskatīties pēc parasta TLS 1.3 apmeklējuma īstā, populārā vietnē, bez jūsu paša domēna vai sertifikāta. Kopā tie šobrīd ir visgrūtāk bloķējamā plaši lietotā kombinācija cenzoriem. Šī lapa ir kopsavilkums; mūsu [padziļinātajā ceļvedī](/how-it-works/vless-reality-tunnel) ir pilns stāsts.

## Kas ir VLESS?

VLESS tika [ierosināts 2020. gada jūlijā](https://github.com/v2ray/v2ray-core/issues/2636) kā vieglāks [VMess](/vpn-protocols/vmess) pēctecis. Tā [specifikācija](https://xtls.github.io/en/development/protocols/vless.html) ir apzināti maza: protokola versija, 16 baitu UUID, kas identificē lietotāju, neobligāts papildinājumu lauks un komanda, ports un galamērķa adrese. VLESS nav savas šifrēšanas. Tas paļaujas uz apakšējo TLS slāni, tāpēc datplūsma netiek šifrēta divreiz.

VLESS ir daļa no [Xray-core](https://github.com/XTLS/Xray-core), projekta, kas 2020. gada novembrī atdalījās no V2Ray un tagad vada šīs protokolu saimes izstrādi.

## Ko pievieno Reality?

Tādi protokoli kā [Trojan](/vpn-protocols/trojan) slēpjas TLS uz jūsu paša domēnu, un šis domēns kļūst par to, ko cenzors var bloķēt. [Reality](https://github.com/XTLS/REALITY), kas izlaists Xray-core [1.8.0 2023. gada martā](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), to noņem.

Reality serveris uzrāda īstas trešās puses vietnes TLS rokasspiedienu. Novērotājam savienojums ir parasts TLS 1.3 apmeklējums šajā vietnē. Klientu, kas zina servera atslēgu, laiž cauri uz VLESS tuneli; ikviens cits, ieskaitot cenzora aktīvo zondi, tiek nodots īstajai vietnei un redz tās īsto sertifikātu. Nav Doppler domēna vai sertifikāta, ko likt bloķēšanas sarakstā.

## Cik grūti ir bloķēt VLESS-Reality?

Tas ir noturīgākais plaši lietotais variants, ko mēs zinām, bet tas nav neredzams. 2024. gadā publicēts pētījums parādīja, ka [TLS, kas nests TLS iekšienē, var atpazīt pēc pirkstu nospieduma](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) pēc laika un pakešu izmēriem, un 2025. gada novembrī lietotāji [ziņoja](https://github.com/net4people/bbs/issues/546), ka daži Krievijas interneta pakalpojumu sniedzēji pārtrauc Reality savienojumus. Pakalpojumu sniedzēji atbild, pielāgojot servera iestatījumus un vietnes, kuras tie aizņemas, un kaķa un peles spēle turpinās.

## Cik ātrs tas ir?

Ikdienas lietošanā virsgalva ir maza. VLESS galvene tiek sūtīta vienreiz katrā savienojumā, un XTLS Vision plūsma izvairās no jau šifrētas tīmekļa datplūsmas šifrēšanas otrreiz. Tā kā tas darbojas pa TCP, VLESS-Reality zudumiem bagātos tīklos var būt lēnāks par UDP protokoliem, piemēram, [WireGuard](/vpn-protocols/wireguard), bet tas turpina darboties tur, kur tie ir bloķēti.

## Kur uzzināt vairāk?

- [VLESS-Reality tunelis padziļināti](/how-it-works/vless-reality-tunnel): vēsture, mehānisms, robežas.
- [Kas ir VLESS?](/blog/what-is-vless) un [VLESS URI formāts](/blog/vless-uri-format) mūsu emuārā.
- [VLESS VPN](/vless-vpn): kā Doppler iepako VLESS-Reality lietotnēs ar vienu pieskārienu.
