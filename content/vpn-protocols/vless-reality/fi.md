> **Lyhyesti.** VLESS on minimaalinen välitysprotokolla Xray-projektista. Reality on TLS-kerros, joka saa VLESS-yhteyden näyttämään tavalliselta TLS 1.3 -käynniltä oikealle, suositulle sivustolle, ilman omaa verkkotunnusta tai sertifikaattia. Yhdessä ne ovat tällä hetkellä sensuroijille vaikein estettävä valtavirran yhdistelmä. Tämä sivu on tiivistelmä; [perusteellisessa oppaassamme](/how-it-works/vless-reality-tunnel) on koko tarina.

## Mikä VLESS on?

VLESS [ehdotettiin heinäkuussa 2020](https://github.com/v2ray/v2ray-core/issues/2636) kevyemmäksi seuraajaksi [VMessille](/vpn-protocols/vmess). Sen [määrittely](https://xtls.github.io/en/development/protocols/vless.html) on tarkoituksella pieni: protokollaversio, 16 tavun UUID, joka tunnistaa käyttäjän, valinnainen lisäkenttä sekä kohteen komento, portti ja osoite. VLESS:llä ei ole omaa salausta. Se nojaa alla olevaan TLS-kerrokseen, joten liikennettä ei salata kahdesti.

VLESS on osa [Xray-corea](https://github.com/XTLS/Xray-core), projektia, joka erosi V2Raysta marraskuussa 2020 ja johtaa nyt tämän protokollaperheen kehitystä.

## Mitä Reality lisää?

Protokollat kuten [Trojan](/vpn-protocols/trojan) piiloutuvat TLS:n sisään omaan verkkotunnukseesi, ja siitä verkkotunnuksesta tulee se, minkä sensuroija voi estää. [Reality](https://github.com/XTLS/REALITY), joka julkaistiin Xray-coressa [1.8.0 maaliskuussa 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), poistaa oman verkkotunnuksen.

Reality-palvelin esittää oikean kolmannen osapuolen sivuston TLS-kättelyn. Tarkkailijalle yhteys on tavallinen TLS 1.3 -käynti tuolle sivustolle. Asiakas, joka tuntee palvelimen avaimen, päästetään VLESS-tunneliin; kaikki muut, myös sensuroijan aktiivinen luotaus, ohjataan oikealle sivustolle ja näkevät sen aidon sertifikaatin. Estolistalle ei ole Dopplerin verkkotunnusta eikä sertifikaattia.

## Kuinka vaikea VLESS-Reality on estää?

Se on kestävin valtavirran vaihtoehto, jonka tiedämme, mutta se ei ole näkymätön. Vuonna 2024 julkaistu tutkimus osoitti, että [TLS TLS:n sisällä voidaan tunnistaa sormenjäljestä](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) ajoituksen ja pakettikokojen perusteella, ja marraskuussa 2025 käyttäjät [kertoivat](https://github.com/net4people/bbs/issues/546), että jotkin venäläiset internet-palveluntarjoajat katkaisivat Reality-yhteyksiä. Palveluntarjoajat vastaavat säätämällä palvelinasetuksia ja sivustoja, joita ne lainaavat, ja kissa ja hiiri -leikki jatkuu.

## Kuinka nopea se on?

Arkikäytössä yleiskustannus on pieni. VLESS-otsikko lähetetään kerran yhteyttä kohti, ja XTLS Vision -vuo välttää jo salatun verkkoliikenteen salaamisen toisen kerran. Koska se toimii TCP:llä, VLESS-Reality voi olla hitaampi kuin UDP-protokollat kuten [WireGuard](/vpn-protocols/wireguard) häviöllisissä verkoissa, mutta se jatkaa toimintaansa siellä, missä nuo estetään.

## Mistä voin lukea lisää?

- [VLESS-Reality-tunneli perusteellisesti](/how-it-works/vless-reality-tunnel): historia, mekanismi, rajoitukset.
- [Mikä on VLESS?](/blog/what-is-vless) ja [VLESS-URI-muoto](/blog/vless-uri-format) blogissamme.
- [VLESS VPN](/vless-vpn): miten Doppler paketoi VLESS-Realityn yhden napautuksen sovelluksiksi.
