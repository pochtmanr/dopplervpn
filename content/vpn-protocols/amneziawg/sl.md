> **Na kratko.** AmneziaWG je razcep WireGuarda, ki ohrani njegovo hitrost in kriptografijo, spremeni pa oblike paketov in glave, po katerih je WireGuard lahko opaziti. Je močna možnost tam, kjer je navadni WireGuard blokiran, z enim pridržkom: ko je zakrivanje vklopljeno, ne komunicira več s standardnimi strežniki WireGuard.

## Kaj je AmneziaWG?

AmneziaWG razvija ekipa za [Amnezia VPN](https://amnezia.org/), odprtokodno aplikacijo za poganjanje lastnega strežnika VPN. [Izvedba v Go](https://github.com/amnezia-vpn/amneziawg-go) se je začela leta 2023. Vzame [WireGuard](/vpn-protocols/wireguard), ki je hiter in preprost, a ima fiksno, prepoznavno rokovanje, in doda plast, ki ga prikrije.

## Kaj spremeni?

[Dokumentacija AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) opisuje več mehanizmov, vsakega pa nadzorujejo konfiguracijski parametri:

- **Dinamične glave (H1–H4).** Standardni paketi WireGuard se začnejo s fiksno vrsto sporočila za vsako od štirih oblik paketov. AmneziaWG te vrednosti zamenja s števili, izbranimi iz nastavljenih obsegov, tako da dve različni nastavitvi nimata enakih glav in eno samo pravilo filtra ne zajame vseh.
- **Naključna dolžina paketov (S1–S4).** Pri WireGuard je začetni paket rokovanja vedno natanko 148 bajtov. AmneziaWG vsaki vrsti paketa doda naključne predpone, tako da se velikosti spreminjajo.
- **Smetni paketi (Jc, Jmin, Jmax).** Pred rokovanjem odjemalec pošlje nastavljivo število psevdonaključnih paketov naključne dolžine, ki zameglijo začetek seje tako v času kot v velikosti.
- **Zaščita glav.** Novejše različice lahko šifrirajo tudi samo polje vrste sporočila.

Pod tem kriptografija in celotna zasnova ostaneta od WireGuarda.

## Kako težko je AmneziaWG blokirati?

Odstrani preproste značilne vzorce, ki jih filtri uporabljajo proti WireGuardu: fiksne velikosti in fiksne vrednosti glav. Zato je v omrežjih, ki blokirajo VPN-je, veliko odpornejši od navadnega WireGuarda.

Še vedno teče prek UDP, zato ga bodo prizadela omrežja, ki UDP na široko dušijo ali blokirajo, njegov promet pa ne posnema nobene določene aplikacije, tako kot [VLESS-Reality](/vpn-protocols/vless-reality) posnema obisk TLS na pravo spletno mesto. Filter, ki povsem blokira neprepoznaven UDP, ga lahko še vedno ujame.

## Kdaj uporabiti AmneziaWG?

- **Kjer je WireGuard blokiran**, UDP pa še deluje, in želite hitrost, podobno WireGuardu.
- **Lastni strežniki**, z aplikacijo Amnezia VPN za njihovo nastavitev.
- Obdržite možnost na osnovi TCP, na primer VLESS-Reality, za omrežja, ki filtrirajo UDP. Naš [vodnik za Rusijo](/vpn-for-russia) pokrije, kaj tam trenutno pride skozi.

## Ali Doppler uporablja AmneziaWG?

Ne. Doppler uporablja VLESS-Reality. Glejte [zakaj VLESS](/vpn-protocols/why-vless).
