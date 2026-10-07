> **Lyhyesti.** Rakensimme Dopplerin ihmisille, joiden verkoissa VPN:t estetään. Niissä verkoissa kysymys ei ole, mikä protokolla on paperilla nopein, vaan mikä on yhä yhteydessä huomenna. Valitsimme VLESS:n Realityn kanssa, koska se antaa sensuroijalle vähiten tunnistettavaa ja vähiten estettävää, ja hyväksymme siihen liittyvät kompromissit.

## Mitä varten valitsimme?

Doppler on rakennettu ihmisille, jotka yhdistävät paikoista, joissa VPN:t suodatetaan tarkoituksella: Venäjä, Iran, Kiina, osia Persianlahdesta. Niissä verkoissa salaus on helppo osa. Jokainen protokolla [vertailussamme](/vpn-protocols) salaa hyvin. Ne eroavat siinä, pystyykö suodatusjärjestelmä toteamaan, että yhteys on VPN, ja mitä se voi estää, kun se sen toteaa.

Siksi arvioimme jokaista vaihtoehtoa kolmella kysymyksellä:

1. **Onko sillä kiinteä sormenjälki?** Kiinteänkokoinen kättely tai vakioportti voidaan tunnistaa yhdellä säännöllä.
2. **Mitä tapahtuu, kun sensuroija luotaa palvelinta?** Palomuurit yhdistävät itse epäiltyihin välityspalvelimiin nähdäkseen, miten ne vastaavat.
3. **Onko jotain, jonka voi laittaa estolistalle?** Verkkotunnus, sertifikaatti tai tunnistettava palvelin on kohde, vaikka itse liikenne olisi hyvin piilossa.

## Miksi ei WireGuard, OpenVPN tai IKEv2?

Kaikki kolme epäonnistuvat ensimmäisessä kysymyksessä. [WireGuardin](/vpn-protocols/wireguard) kättelypaketit ovat aina 148 ja 92 tavua. Tutkijat, jotka työskentelivät oikean internet-palveluntarjoajan sisällä, tunnistivat [OpenVPN](/vpn-protocols/openvpn) yli 85 %:ssa virroista. [IKEv2](/vpn-protocols/ikev2) toimii vakio-UDP-porteissa, jotka voidaan hylätä kokonaan. Elokuussa 2023 käyttäjät Venäjällä [kertoivat](https://github.com/net4people/bbs/issues/274), että operaattorit katkaisivat WireGuardin ja OpenVPN:n ensimmäisten pakettien aikana. Nämä ovat hyviä protokollia avoimiin verkkoihin. Niitä ei suunniteltu meidän verkkoihimme.

## Miksi ei Shadowsocks tai VMess?

Ne läpäisevät ensimmäisen kysymyksen näyttämällä satunnaisilta tavuilta, ja se osoittautui omaksi sormenjäljekseen. Marraskuusta 2021 Suuri palomuuri on [estänyt täysin salattua liikennettä](https://gfw.report/publications/usenixsecurity23/en/), joka ei muistuta mitään tunnettua protokollaa. [VMess](/vpn-protocols/vmess) voidaan kääriä TLS:ään tämän välttämiseksi, mutta silloin se tarvitsee verkkotunnuksen, mikä tuo meidät kolmanteen kysymykseen.

## Miksi ei Trojania?

[Trojan](/vpn-protocols/trojan) vastaa kahteen ensimmäiseen kysymykseen hyvin: se on oikeaa TLS:ää, ja luotaukset näkevät oikean sivuston. Jokainen Trojan-palvelin tarvitsee kuitenkin oman verkkotunnuksensa ja sertifikaattinsa. Kun sensuroija saa tietää tuon verkkotunnuksen, se voi estää sen, ja monen verkkotunnuksen pyörittäminen on jatkuvaa takaa-ajoa.

## Mitä VLESS-Reality tekee oikein

[VLESS-Reality](/vpn-protocols/vless-reality) vastaa kaikkiin kolmeen:

- **Ei kiinteää sormenjälkeä.** Yhteys on TLS 1.3 TCP:llä, internetin yleisin salattu liikenne.
- **Luotaukset näkevät oikean sivuston.** Reality ohjaa kenet tahansa, joka ei pysty tunnistautumaan, oikealle sivustolle, jonka kättelyn se lainaa, tuon sivuston aidolla sertifikaatilla.
- **Ei mitään meidän omaamme estettäväksi nimellä.** Kättelyssä ei ole Dopplerin verkkotunnusta eikä sertifikaattia.

Se toimii myös TCP:llä, joten se jatkaa toimintaansa verkoissa, jotka hidastavat tai estävät UDP:n ja joissa [Hysteria 2](/vpn-protocols/hysteria2) ja [AmneziaWG](/vpn-protocols/amneziawg) ovat vaikeuksissa. Ja VLESS itsessään on pieni: se nojaa salauksessa TLS:ään sen sijaan, että lisäisi oman, joten kaksinkertaista salausta ei ole.

## Mistä luovuimme

- **Raaka nopeus häviöllisillä yhteyksillä.** TCP toipuu pakettien katoamisesta kömpelömmin kuin QUIC tai WireGuardin UDP. Puhtaalla yhteydellä ero on pieni; huonolla se voi olla huomattava.
- **Käyttöjärjestelmän sisäänrakennettu tuki.** Yksikään käyttöjärjestelmä ei sisällä VLESS-asiakasta, joten tarvitset sovelluksen. Päätimme, että se on hyväksyttävää, ja rakensimme omat sovelluksemme iOS:lle, Androidille, macOS:lle ja Windowsille.
- **Täydellinen näkymättömyys.** Sitä ei ole olemassa. Tutkimus on osoittanut, että [TLS TLS:n sisällä voidaan tunnistaa sormenjäljestä](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), ja marraskuussa 2025 joidenkin venäläisten internet-palveluntarjoajien [raportoitiin](https://github.com/net4people/bbs/issues/546) katkaisevan Reality-yhteyksiä. VLESS-Reality on suunniteltu sensuurinkestävyyttä varten, ei takuuksi.

## Miten käsittelemme rajoitukset

Sensuuri muuttuu, joten protokollan valinta ei ole työn loppu. Säädämme palvelinasetuksia ja sivustoja, joiden kättelyn Reality lainaa, kun suodatus muuttuu, ja seuraamme edelleen samoja tutkimuksia ja yhteisön raportteja, joihin näillä sivuilla viitataan. Jos parempi lähestymistapa ilmestyy, tämä sivu kertoo siitä.

VLESS-Realityn täysi tekninen kuvaus on oppaassa [VLESS-Reality-tunneli](/how-it-works/vless-reality-tunnel). Kokeillaksesi katso [VLESS VPN](/vless-vpn).
