> **Trumpai.** AmneziaWG yra WireGuard atšaka, kuri išlaiko jo greitį ir kriptografiją, bet keičia paketų formas ir antraštes, pagal kurias WireGuard lengva atpažinti. Tai stiprus variantas ten, kur paprastas WireGuard užblokuotas, su viena išlyga: įjungus maskavimą jis nebesusikalba su standartiniais WireGuard serveriais.

## Kas yra AmneziaWG?

AmneziaWG kuria komanda, sukūrusi [Amnezia VPN](https://amnezia.org/) — atvirojo kodo programėlę nuosavam VPN serveriui paleisti. Projekto [realizacija Go kalba](https://github.com/amnezia-vpn/amneziawg-go) pradėta 2023 m. AmneziaWG ima [WireGuard](/vpn-protocols/wireguard), kuris yra greitas ir paprastas, bet turi fiksuotą, atpažįstamą rankos paspaudimą, ir prideda sluoksnį, kuris jį užmaskuoja.

## Ką jis keičia?

[AmneziaWG dokumentacija](https://docs.amnezia.org/documentation/amnezia-wg/) aprašo kelis mechanizmus, ir kiekvieną valdo konfigūracijos parametrai:

- **Dinaminės antraštės (H1–H4).** Standartiniai WireGuard paketai prasideda fiksuotu pranešimo tipu kiekvienam iš keturių paketų formatų. AmneziaWG tas reikšmes pakeičia skaičiais iš nustatytų intervalų, todėl dvi skirtingos konfigūracijos neturi bendrų antraščių ir viena filtro taisyklė jų visų neatitinka.
- **Paketų ilgio atsitiktinumas (S1–S4).** WireGuard pradinis rankos paspaudimo paketas visada yra lygiai 148 baitai. AmneziaWG prie kiekvieno paketų tipo prideda atsitiktinius priešdėlius, todėl dydžiai kinta.
- **Šiukšliniai paketai (Jc, Jmin, Jmax).** Prieš rankos paspaudimą klientas siunčia nustatytą skaičių pseudoatsitiktinių atsitiktinio ilgio paketų, kurie išsklaido seanso pradžią ir laike, ir dydžiu.
- **Antraščių apsauga.** Naujesnės versijos gali užšifruoti ir patį pranešimo tipo lauką.

Po visu tuo kriptografija ir bendra sandara lieka WireGuard.

## Kaip sunku užblokuoti AmneziaWG?

Jis pašalina paprastus parašus, kuriuos filtrai naudoja prieš WireGuard: fiksuotus dydžius ir fiksuotas antraščių reikšmes. Todėl tinkluose, kuriuose blokuojami VPN, jis gerokai atsparesnis už paprastą WireGuard.

Jis vis tiek veikia per UDP, todėl tinklai, kurie plačiai sulėtina arba blokuoja UDP, jį paveiks, o jo srautas neimituoja jokios konkrečios programos taip, kaip [VLESS-Reality](/vpn-protocols/vless-reality) imituoja TLS apsilankymą tikroje svetainėje. Filtras, kuris iškart blokuoja neatpažįstamą UDP, vis tiek gali jį pagauti.

## Kada verta naudoti AmneziaWG?

- **Ten, kur WireGuard užblokuotas**, bet UDP dar veikia, ir norite greičio, panašaus į WireGuard.
- **Savo serveriams**, kuriuos patogu paruošti Amnezia VPN programėle.
- Turėkite TCP variantą, pavyzdžiui VLESS-Reality, tinklams, kurie filtruoja UDP. Kas ten šiuo metu praeina, pasakoja mūsų [vadovas apie VPN Rusijai](/vpn-for-russia).

## Ar Doppler naudoja AmneziaWG?

Ne. Doppler naudoja VLESS-Reality. Žr. [„Kodėl VLESS“](/vpn-protocols/why-vless).
