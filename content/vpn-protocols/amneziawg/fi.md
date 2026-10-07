> **Lyhyesti.** AmneziaWG on WireGuardin haarautuma, joka säilyttää sen nopeuden ja kryptografian mutta muuttaa pakettien muodot ja otsikot, joiden vuoksi WireGuard on helppo huomata. Se on vahva vaihtoehto siellä, missä pelkkä WireGuard on estetty, yhdellä varauksella: häivytyksen ollessa päällä se ei enää keskustele tavallisten WireGuard-palvelinten kanssa.

## Mikä AmneziaWG on?

AmneziaWG:tä kehittää [Amnezia VPN](https://amnezia.org/) -sovelluksen takana oleva tiimi. Amnezia VPN on avoimen lähdekoodin sovellus oman VPN-palvelimen pyörittämiseen. Projektin [Go-toteutus](https://github.com/amnezia-vpn/amneziawg-go) aloitettiin vuonna 2023. Se ottaa [WireGuardin](/vpn-protocols/wireguard), joka on nopea ja yksinkertainen mutta jolla on kiinteä, tunnistettava kättely, ja lisää kerroksen, joka naamioi sen.

## Mitä se muuttaa?

[AmneziaWG-dokumentaatio](https://docs.amnezia.org/documentation/amnezia-wg/) kuvaa useita mekanismeja, joista kutakin ohjataan kokoonpanoparametreilla:

- **Dynaamiset otsikot (H1–H4).** Tavalliset WireGuard-paketit alkavat kiinteällä viestityypillä kullekin sen neljästä pakettimuodosta. AmneziaWG korvaa nämä arvot luvuilla, jotka valitaan määritetyistä alueista, joten kahdella eri kokoonpanolla ei ole yhteisiä otsikoita eikä yksi suodatinsääntö osu niihin kaikkiin.
- **Paketin pituuden satunnaistaminen (S1–S4).** WireGuardissa kättelyn alkupaketti on aina tasan 148 tavua. AmneziaWG lisää jokaiseen pakettityyppiin satunnaisia etuliitteitä, jotta koot vaihtelevat.
- **Roskapaketit (Jc, Jmin, Jmax).** Ennen kättelyä asiakas lähettää määritettävän määrän satunnaisen pituisia pseudosatunnaisia paketteja, jotka hämärtävät istunnon alun sekä ajassa että koossa.
- **Otsikon suojaus.** Uudemmat versiot voivat myös salata itse viestityypin kentän.

Alla kryptografia ja kokonaisrakenne pysyvät WireGuardin.

## Kuinka vaikea AmneziaWG on estää?

Se poistaa yksinkertaiset tunnisteet, joita suodattimet käyttävät WireGuardia vastaan: kiinteät koot ja kiinteät otsikkoarvot. Siksi se on paljon kestävämpi kuin pelkkä WireGuard verkoissa, jotka estävät VPN:t.

Se toimii yhä UDP:llä, joten verkot, jotka hidastavat tai estävät UDP:n laajasti, vaikuttavat siihen, eikä sen liikenne jäljittele mitään tiettyä sovellusta niin kuin [VLESS-Reality](/vpn-protocols/vless-reality) jäljittelee TLS-käyntiä oikealle sivustolle. Suodatin, joka estää tunnistamattoman UDP:n suoraan, voi yhä saada sen kiinni.

## Milloin AmneziaWG:tä kannattaa käyttää?

- **Siellä, missä WireGuard on estetty**, mutta UDP yhä toimii ja haluat WireGuardin kaltaisen nopeuden.
- **Itse ylläpidetyillä palvelimilla**, jotka Amnezia VPN -sovellus auttaa ottamaan käyttöön.
- Pidä TCP-pohjainen vaihtoehto, kuten VLESS-Reality, verkkoja varten, jotka suodattavat UDP:n. [Oppaamme Venäjälle](/vpn-for-russia) kertoo, mikä siellä tällä hetkellä menee läpi.

## Käyttääkö Doppler AmneziaWG:tä?

Ei. Doppler käyttää VLESS-Realityä. Katso [Miksi VLESS](/vpn-protocols/why-vless).
