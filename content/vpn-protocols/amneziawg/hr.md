> **Ukratko.** AmneziaWG je izvedenica WireGuarda koja zadržava njegovu brzinu i kriptografiju, ali mijenja oblike paketa i zaglavlja po kojima je WireGuard lako uočiti. To je snažna mogućnost ondje gdje je obični WireGuard blokiran, uz jednu ogradu: kad je prikrivanje uključeno, više ne komunicira sa standardnim poslužiteljima WireGuarda.

## Što je AmneziaWG?

AmneziaWG razvija tim iza [Amnezia VPN-a](https://amnezia.org/), aplikacije otvorenog koda za pokretanje vlastitog VPN poslužitelja. [Implementacija u Gou](https://github.com/amnezia-vpn/amneziawg-go) projekta pokrenuta je 2023. Uzima [WireGuard](/vpn-protocols/wireguard), koji je brz i jednostavan, ali ima fiksno, prepoznatljivo rukovanje, i dodaje sloj koji ga prikriva.

## Što mijenja?

[Dokumentacija AmneziaWG-a](https://docs.amnezia.org/documentation/amnezia-wg/) opisuje nekoliko mehanizama, a svakim upravljaju konfiguracijski parametri:

- **Dinamička zaglavlja (H1–H4).** Standardni paketi WireGuarda počinju fiksnom vrstom poruke za svaki od četiri formata paketa. AmneziaWG te vrijednosti zamjenjuje brojevima odabranima iz podešenih raspona, pa dvije različite postavke ne dijele zaglavlja i jedno pravilo filtra ne pokriva ih sve.
- **Nasumična duljina paketa (S1–S4).** U WireGuardu je početni paket rukovanja uvijek točno 148 bajtova. AmneziaWG svakoj vrsti paketa dodaje nasumične prefikse, pa se veličine mijenjaju.
- **Otpadni paketi (Jc, Jmin, Jmax).** Prije rukovanja klijent šalje podesiv broj pseudoslučajnih paketa nasumične duljine, koji zamagljuju početak sesije i po vremenu i po veličini.
- **Zaštita zaglavlja.** Novije inačice mogu šifrirati i samo polje vrste poruke.

Ispod toga kriptografija i ukupni nacrt ostaju WireGuardovi.

## Koliko je AmneziaWG teško blokirati?

Uklanja jednostavne potpise koje filtri koriste protiv WireGuarda: fiksne veličine i fiksne vrijednosti zaglavlja. Zato je na mrežama koje blokiraju VPN-ove znatno otporniji od običnog WireGuarda.

I dalje radi preko UDP-a, pa će na njega utjecati mreže koje široko usporavaju ili blokiraju UDP, a njegov promet ne oponaša neku određenu aplikaciju onako kako [VLESS-Reality](/vpn-protocols/vless-reality) oponaša TLS posjet pravom web-mjestu. Filtar koji izravno blokira neprepoznatljiv UDP i dalje ga može uhvatiti.

## Kada koristiti AmneziaWG?

- **Ondje gdje je WireGuard blokiran**, ali UDP još radi, a želite brzinu nalik na WireGuard.
- **Poslužitelji koje sami vodite**, uz aplikaciju Amnezia VPN za njihovo postavljanje.
- Držite mogućnost na TCP-u, poput VLESS-Reality, za mreže koje filtriraju UDP. Naš [vodič za Rusiju](/vpn-for-russia) opisuje što tamo trenutačno prolazi.

## Koristi li Doppler AmneziaWG?

Ne. Doppler koristi VLESS-Reality. Pogledajte [zašto VLESS](/vpn-protocols/why-vless).
