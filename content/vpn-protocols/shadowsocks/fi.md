> **Lyhyesti.** Shadowsocks on kevyt salattu välityspalvelin, joka rakennettiin Kiinassa Suuren palomuurin läpäisyyn. Vuosia se toimi siksi, ettei se näyttänyt miltään. Vuodesta 2021 tutkimus osoittaa, että palomuuri on estänyt juuri tällaista liikennettä, koska oikea liikenne on harvoin noin satunnaista.

## Mikä Shadowsocks on?

Shadowsocks on avoimen lähdekoodin välitysprotokolla, joka julkaistiin ensimmäisen kerran [huhtikuussa 2012](https://en.wikipedia.org/wiki/Shadowsocks). Tarkasti ottaen se ei ole VPN: se on SOCKS5-tyylinen välityspalvelin salauksella, ja sovellukset päättävät, minkä liikenteen ne lähettävät sen kautta. Käytännössä useimmat Shadowsocks-asiakkaat tarjoavat nyt järjestelmänlaajuisen tilan, joka käyttäytyy kuin VPN.

Se on suosittu, koska se on yksinkertainen ja nopea. Nykyiset versiot käyttävät [AEAD-salaimia](https://shadowsocks.org/doc/aead.html), jotka antavat luottamuksellisuuden, eheyden ja aitouden yhdellä kertaa, ja protokollan [vuoden 2022 versio](https://shadowsocks.org/doc/sip022.html) tiukensi uudelleentoiston suojaa.

## Miten se toimii?

Asiakkaalla ja palvelimella on yhteinen salasana, josta tehdään salausavain. Kaikki, mitä asiakas lähettää, myös sen sivuston osoite, jonne se haluaa, on salattu aivan ensimmäisestä tavusta. Tunnistettavaa kättelyä, sertifikaattia tai selkotekstiotsikkoa ei ole. Tarkkailijalle Shadowsocks-yhteys on satunnaisilta näyttävien tavujen virta.

## Miten Suuri palomuuri tunnistaa Shadowsocksin?

Ensinnäkin aktiivisella luotauksella. GFW Reportin tutkijat [kirjasivat](https://gfw.report/publications/imc20/en/), miten palomuuri lähetti kymmeniä tuhansia luotauksia epäillyille Shadowsocks-palvelimille, toisti oikeita yhteyksiä ja muutti niitä nähdäkseen, miten palvelin reagoi.

Sitten, marraskuusta 2021 alkaen, karkeammalla ja laajemmalla menetelmällä. [USENIX Security 2023 -tutkimus](https://gfw.report/publications/usenixsecurity23/en/) havaitsi palomuurin estävän "täysin salattua" liikennettä reaaliajassa. Se katsoo yhteyden ensimmäistä pakettia ja vapauttaa kaiken, mikä näyttää tunnetulta protokollalta tai sisältää tarpeeksi tulostettavaa tekstiä. Yksi sääntö mittaa ykkösbittien keskimääräisen määrän tavua kohti: arvot, jotka ovat enintään 3.4 tai vähintään 4.6, vapautetaan, eikä niiden välissä olevaa satunnaiselta näyttävää dataa vapauteta. Kaikki jäljelle jäävä voidaan estää.

Tutkijat havaitsivat myös, että palomuuri sovelsi tätä noin 26 %:iin yhteyksistä ja vain suosittujen palvelinkeskusten IP-alueisiin, luultavasti rajoittaakseen oheisvahinkoja. Opetus protokollien suunnittelijoille oli selvä: satunnaiselta näyttäminen on itsessään sormenjälki.

## Milloin Shadowsocksia kannattaa käyttää?

- **Kevyeen, nopeaan välitykseen** verkoissa, jotka eivät tutki liikennettä tarkasti.
- **Omalle palvelimelle** työkaluilla kuten Outline, jotka tekevät käyttöönotosta suoraviivaista.
- **Varovasti kovan suodatuksen alla.** Kiinassa ja muualla, missä täysin salattu liikenne estetään, Shadowsocks on paljon epäluotettavampi kuin protokollat, jotka jäljittelevät oikeaa TLS:ää, kuten [VLESS-Reality](/vpn-protocols/vless-reality). [Sensuuriprotokollien historiamme](/blog/censorship-protocol-history) kertoo, miten ala eteni.

## Käyttääkö Doppler Shadowsocksia?

Ei. Doppler käyttää VLESS-Realityä syistä, jotka ovat oppaassa [Miksi VLESS](/vpn-protocols/why-vless).
