> **Trumpai.** WireGuard yra greičiausias ir paprasčiausias iš plačiai naudojamų VPN protokolų, o nefiltruojamame tinkle tai puikus pasirinkimas. Jis niekada nebuvo kurtas tam, kad slėptų, jog tai VPN, ir Rusijoje, Irane bei Kinijoje jį blokuoja vieną iš pirmųjų.

## Kas yra WireGuard?

WireGuard yra VPN protokolas, kurį Jason A. Donenfeld parašė ir pirmą kartą išleido 2015 m. Jo tikslas buvo pakeisti didelius, konfigūruojamus ankstesnius protokolus tokiu, kuris būtų pakankamai mažas, kad jį būtų galima patikrinti. 2020 m. kovą jis buvo [įtrauktas į Linux 5.6 branduolį](https://en.wikipedia.org/wiki/WireGuard), o oficialios programėlės dabar yra skirtos Windows, macOS, iOS, Android ir Linux.

Užuot leidęs pusėms derėtis dėl šifrų rinkinio, WireGuard fiksuoja vieną šiuolaikinių primityvų rinkinį. Jo [protokolo puslapyje](https://www.wireguard.com/protocol/) jie išvardyti: ChaCha20 su Poly1305 šifravimui, Curve25519 raktų apsikeitimui ir BLAKE2s maišai. Nėra ko sukonfigūruoti neteisingai ir nėra senesnio, silpnesnio varianto, prie kurio būtų galima grįžti.

## Kaip jis veikia?

Kiekvienas įrenginys turi raktų porą, panašiai kaip SSH. Klientas ir serveris iš anksto žino vienas kito viešuosius raktus, o rankos paspaudimas remiasi Noise protokolo karkasu (protokolo puslapyje nurodyta tiksli konstrukcija — `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Visi paketai siunčiami per UDP](https://www.wireguard.com/protocol/), o naujas seansas užmezgamas per vieną apsikeitimą pirmyn ir atgal.

Dėl tokios sandaros WireGuard ir jaučiamas greitas. Derėtis beveik nėra dėl ko, Linux sistemoje kodas veikia operacinės sistemos branduolyje, o perėjimas tarp Wi-Fi ir mobiliojo ryšio vyksta nepastebimai, nes protokolas nelaiko atviro ilgalaikio ryšio.

## Kodėl WireGuard blokuoja?

Tas pats paprastumas, dėl kurio WireGuard lengva patikrinti, daro jį lengvai atpažįstamą. Jo [techninis aprašas](https://www.wireguard.com/papers/wireguard.pdf) rankos paspaudimo pranešimus aprašo baitas po baito, todėl pirmasis kliento paketas visada yra 148 baitai, o atsakymas visada 92 baitai, ir kiekvienas prasideda fiksuotu pranešimo tipo lauku. Giluminės paketų patikros (DPI) sistemai pakanka trumpos taisyklės, kad šį šabloną pastebėtų UDP sraute.

Cenzoriai būtent taip ir daro. 2023 m. rugpjūtį naudotojai Rusijoje [pranešė](https://github.com/net4people/bbs/issues/274), kad didieji mobiliojo ryšio operatoriai nutraukia WireGuard seansus iškart po rankos paspaudimo. Šifravimas vis dar saugojo turinį, bet pats ryšys jau būdavo nutrūkęs.

Tai projektinis kompromisas, o ne klaida. WireGuard autoriai pasirinko fiksuotą, minimalų protokolą, ir maskavimas nebuvo tarp tikslų. Tokie projektai kaip [AmneziaWG](/vpn-protocols/amneziawg) keičia paketų formą, kad dalį maskuotės sugrąžintų.

## Kada verta naudoti WireGuard?

- **Nefiltruojamuose tinkluose.** Namuose, darbe ar keliaujant šalyje, kuri neblokuoja VPN, WireGuard sunku pranokti greičiu ir akumuliatoriaus veikimo trukme.
- **Savo serveriui.** Jei patys valdote serverį, WireGuard yra vienas lengviausiai teisingai paruošiamų protokolų.
- **Ne ten, kur veikia DPI filtravimas.** Jei jūsų tinklas blokuoja VPN, geriau tinka protokolas, sukurtas atrodyti kaip įprastas žiniatinklio srautas, pavyzdžiui [VLESS-Reality](/vpn-protocols/vless-reality). Mūsų palyginimas [VLESS-Reality ir WireGuard](/blog/vless-reality-vs-wireguard) šį kompromisą aptaria išsamiau.

## Ar Doppler naudoja WireGuard?

Ne. Doppler programėlės jungiasi per VLESS-Reality, nes Doppler skirtas tinklams, kuriuose WireGuard filtruojamas. Sprendimą paaiškina vadovas [„Kodėl VLESS“](/vpn-protocols/why-vless).
