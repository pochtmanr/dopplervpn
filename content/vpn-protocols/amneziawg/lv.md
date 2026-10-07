> **Īsumā.** AmneziaWG ir WireGuard atzars, kas saglabā tā ātrumu un kriptogrāfiju, bet maina pakešu formas un galvenes, pēc kurām WireGuard ir viegli pamanīt. Tā ir stipra iespēja tur, kur parastais WireGuard ir bloķēts, ar vienu atrunu: kad maskēšanās ir ieslēgta, tas vairs nesarunājas ar standarta WireGuard serveriem.

## Kas ir AmneziaWG?

AmneziaWG izstrādā komanda aiz [Amnezia VPN](https://amnezia.org/), atvērtā koda lietotnes sava VPN servera darbināšanai. Projekta [Go realizācija](https://github.com/amnezia-vpn/amneziawg-go) tika sākta 2023. gadā. Tā ņem [WireGuard](/vpn-protocols/wireguard), kas ir ātrs un vienkāršs, bet ar fiksētu, atpazīstamu rokasspiedienu, un pievieno slāni, kas to maskē.

## Ko tas maina?

[AmneziaWG dokumentācija](https://docs.amnezia.org/documentation/amnezia-wg/) apraksta vairākus mehānismus, katru no kuriem vada konfigurācijas parametri:

- **Dinamiskās galvenes (H1–H4).** Standarta WireGuard paketes sākas ar fiksētu ziņojuma tipu katram no četriem pakešu formātiem. AmneziaWG aizstāj šīs vērtības ar skaitļiem no konfigurētiem diapazoniem, tāpēc diviem dažādiem iestatījumiem galvenes nesakrīt un viens filtra noteikums tās visas neaptver.
- **Pakešu garuma nejaušināšana (S1–S4).** WireGuard sākotnējā rokasspiediena pakete vienmēr ir tieši 148 baiti. AmneziaWG katram pakešu tipam pievieno nejaušus prefiksus, lai izmēri mainītos.
- **Miskastes paketes (Jc, Jmin, Jmax).** Pirms rokasspiediena klients nosūta konfigurējamu skaitu pseidogadījuma pakešu ar nejaušu garumu, kas izpludina sesijas sākumu gan laikā, gan izmērā.
- **Galveņu aizsardzība.** Jaunākas versijas var šifrēt arī pašu ziņojuma tipa lauku.

Pamatos kriptogrāfija un kopējais risinājums paliek WireGuard.

## Cik grūti ir bloķēt AmneziaWG?

Tas noņem vienkāršās signatūras, ko filtri izmanto pret WireGuard: fiksētus izmērus un fiksētas galveņu vērtības. Tas padara to daudz noturīgāku par parasto WireGuard tīklos, kas bloķē VPN.

Tas joprojām darbojas pa UDP, tāpēc tīkli, kas plaši ierobežo vai bloķē UDP, to ietekmēs, un tā datplūsma neatdarina nevienu konkrētu lietotni tā, kā [VLESS-Reality](/vpn-protocols/vless-reality) atdarina TLS apmeklējumu īstā vietnē. Filtrs, kas bloķē neatpazīstamu UDP pavisam, joprojām varētu to noķert.

## Kad lietot AmneziaWG?

- **Tur, kur WireGuard ir bloķēts**, bet UDP joprojām darbojas, un vēlaties WireGuard līdzīgu ātrumu.
- **Pašam saviem serveriem**, izmantojot Amnezia VPN lietotni, lai tos iestatītu.
- Paturiet uz TCP balstītu variantu, piemēram, VLESS-Reality, tīkliem, kas filtrē UDP. Mūsu [ceļvedis Krievijai](/vpn-for-russia) aptver, kas tur šobrīd izkļūst cauri.

## Vai Doppler izmanto AmneziaWG?

Nē. Doppler izmanto VLESS-Reality. Skatiet [kāpēc VLESS](/vpn-protocols/why-vless).
