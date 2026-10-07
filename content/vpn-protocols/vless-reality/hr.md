> **Ukratko.** VLESS je minimalni proxy protokol projekta Xray. Reality je sloj TLS-a koji vezu VLESS čini nalik na običan posjet TLS-om 1.3 pravom, popularnom web-mjestu, bez vlastite domene ili certifikata. Zajedno su trenutačno uobičajena kombinacija koju je cenzorima najteže blokirati. Ova je stranica sažetak; naš [podrobni vodič](/how-it-works/vless-reality-tunnel) ima cijelu priču.

## Što je VLESS?

VLESS je [predložen u srpnju 2020.](https://github.com/v2ray/v2ray-core/issues/2636) kao lakši nasljednik [VMessa](/vpn-protocols/vmess). Njegova [specifikacija](https://xtls.github.io/en/development/protocols/vless.html) namjerno je mala: inačica protokola, UUID od 16 bajtova koji identificira korisnika, neobavezno polje dodataka te naredba, port i adresa odredišta. VLESS nema vlastito šifriranje. Oslanja se na sloj TLS-a ispod, pa se promet ne šifrira dvaput.

VLESS je dio [Xray-corea](https://github.com/XTLS/Xray-core), projekta koji se odvojio od V2Raya u studenome 2020. i sada vodi razvoj ove obitelji protokola.

## Što Reality dodaje?

Protokoli poput [Trojana](/vpn-protocols/trojan) skrivaju se unutar TLS-a prema vlastitoj domeni, i ta domena postaje ono što cenzor može blokirati. [Reality](https://github.com/XTLS/REALITY), objavljen u Xray-coreu [1.8.0 u ožujku 2023.](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), to uklanja.

Poslužitelj Reality pokazuje TLS rukovanje pravog web-mjesta treće strane. Promatraču je veza običan posjet tom web-mjestu protokolom TLS 1.3. Klijent koji zna ključ poslužitelja propušta se u tunel VLESS; svi ostali, uključujući aktivnu probu cenzora, prosljeđuju se pravom web-mjestu i vide njegov pravi certifikat. Nema domene ni certifikata Dopplera koje bi se stavilo na popis za blokiranje.

## Koliko je VLESS-Reality teško blokirati?

To je najotpornija uobičajena mogućnost koju znamo, ali nije nevidljiv. Istraživanje objavljeno 2024. pokazalo je da se [TLS nošen unutar TLS-a može prepoznati po otisku](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) po vremenu i veličinama paketa, a u studenome 2025. korisnici su [javili](https://github.com/net4people/bbs/issues/546) da neki ruski davatelji usluge prekidaju veze Realityja. Pružatelji odgovaraju podešavanjem postavki poslužitelja i web-mjesta koja posuđuju, i nastavlja se igra mačke i miša.

## Koliko je brz?

U svakodnevnoj uporabi dodatno je opterećenje malo. Zaglavlje VLESS šalje se jednom po vezi, a tok XTLS Vision izbjegava da se već šifrirani web-promet šifrira drugi put. Budući da radi preko TCP-a, VLESS-Reality može biti sporiji od UDP protokola poput [WireGuarda](/vpn-protocols/wireguard) na mrežama s gubicima, ali nastavlja raditi ondje gdje su oni blokirani.

## Gdje mogu saznati više?

- [Tunel VLESS-Reality, podrobno](/how-it-works/vless-reality-tunnel): povijest, mehanizam, ograničenja.
- [Što je VLESS?](/blog/what-is-vless) i [format URI-ja za VLESS](/blog/vless-uri-format) na našem blogu.
- [VLESS VPN](/vless-vpn): kako Doppler pakira VLESS-Reality u aplikacije s povezivanjem jednim dodirom.
