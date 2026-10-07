> **Trumpai.** Hysteria 2 yra proksi protokolas, sukurtas ant QUIC — transporto, kuriuo veikia HTTP/3. Jis skirtas greičiui prastuose ryšiuose su paketų praradimais, o visiems, neturintiems slaptažodžio, jo serveris elgiasi kaip įprasta HTTP/3 svetainė. Silpnoji vieta ta, kad jis priklauso nuo UDP, kurį kai kurie tinklai sulėtina arba užblokuoja visiškai.

## Kas yra Hysteria 2?

Hysteria yra atvirojo kodo projektas iš [apernet](https://github.com/apernet/hysteria); 2 versija su perkurtu protokolu išleista 2023 m. rugsėjį. Kaip Shadowsocks ir VLESS, tai proksi, o ne klasikinis VPN, ir klientai gali per jį nukreipti viso įrenginio srautą.

## Kaip jis veikia?

Pagal jo [protokolo specifikaciją](https://v2.hysteria.network/docs/developers/Protocol/) Hysteria 2 veikia ant QUIC, apibrėžto [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), su nepatikimų datagramų plėtiniu UDP srautui. QUIC jau užtikrina TLS 1.3 šifravimą, multipleksuotus srautus ir greitą ryšio užmezgimą.

Maskuotė prasideda autentifikuojant. Pagal specifikaciją Hysteria serveris **privalo įgyvendinti tikrą HTTP/3 serverį** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) ir tvarkyti užklausas taip, kaip tai darytų bet kuris žiniatinklio serveris. Klientas autentifikuojasi specialia HTTP/3 užklausa; visi kiti — ir smalsus lankytojas, ir aktyvusis zondas — gauna įprastus žiniatinklio atsakymus. Specifikacija nurodo, kad trečiajai šaliai be tapatybės duomenų serveris elgiasi lygiai kaip standartinis HTTP/3 žiniatinklio serveris.

## Kodėl jis greitas?

QUIC veikia per UDP ir atsistato po paketų praradimo nestabdydamas visų srautų taip, kaip tai daro TCP. Hysteria taip pat gali naudoti savo perkrovos valdymą, skirtą nestabiliems kanalams, todėl paprastai išlaiko greitį perpildytuose mobiliuosiuose tinkluose, tolimuose maršrutuose ir trikdomame Wi-Fi, kur TCP protokolai sulėtėja.

## Kaip sunku užblokuoti Hysteria 2?

Prieš aktyvųjį zondavimą jis laikosi gerai, nes zondai mato žiniatinklio serverį. Pažeidžiamoji vieta yra transportas. Cenzorius gali sulėtinti arba užblokuoti UDP arba konkrečiai QUIC, nesugadindamas daugumos svetainių, nes naršyklės, kai HTTP/3 nepavyksta, pereina prie HTTP/2 per TCP. Ten, kur taip nutinka, Hysteria 2 neturi kur dėtis, o TCP protokolai, tokie kaip [VLESS-Reality](/vpn-protocols/vless-reality), veikia toliau.

## Kada verta naudoti Hysteria 2?

- **Kanaluose su paketų praradimais arba tolimuose maršrutuose**, kur atsiperka jo perkrovos valdymas ir QUIC atkūrimas po praradimų.
- **Tinkluose, kuriuose leidžiamas UDP.** Patikrinkite prieš juo pasikliaudami.
- Kaip antras protokolas šalia TCP varianto, kad galėtumėte persijungti, kai UDP filtruojamas. Kaip filtrai taikosi į transportą, pasakoja mūsų [cenzūros vadovas](/bypass-censorship).

## Ar Doppler naudoja Hysteria 2?

Ne. Doppler naudoja VLESS-Reality per TCP, kuris veikia toliau tinkluose, blokuojančiuose UDP. Žr. [„Kodėl VLESS“](/vpn-protocols/why-vless).
