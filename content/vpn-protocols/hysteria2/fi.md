> **Lyhyesti.** Hysteria 2 on välitysprotokolla, joka on rakennettu QUIC:n varaan, HTTP/3:n taustalla olevaan kuljetukseen. Se on suunniteltu nopeaksi huonoissa ja häviöllisissä yhteyksissä, ja kenelle tahansa ilman salasanaa sen palvelin käyttäytyy kuin tavallinen HTTP/3-sivusto. Heikko kohta on se, että se riippuu UDP:stä, jota jotkin verkot hidastavat tai estävät kokonaan.

## Mikä Hysteria 2 on?

Hysteria on avoimen lähdekoodin projekti [apernetilta](https://github.com/apernet/hysteria); versio 2, uudelleen suunniteltu protokolla, julkaistiin syyskuussa 2023. Kuten Shadowsocks ja VLESS, se on välityspalvelin eikä klassinen VPN, ja asiakkaat voivat ohjata koko laitteen sen kautta.

## Miten se toimii?

[Protokollamäärittelynsä](https://v2.hysteria.network/docs/developers/Protocol/) mukaan Hysteria 2 toimii QUIC:n päällä siten kuin [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000) sen määrittelee, epäluotettavien datagrammien laajennuksella UDP-liikennettä varten. QUIC tarjoaa jo TLS 1.3 -salauksen, multipleksoidut virrat ja nopean yhteyden muodostuksen.

Naamiointi alkaa todennuksesta. Määrittely vaatii, että Hysteria-palvelimen **täytyy toteuttaa oikea HTTP/3-palvelin** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) ja käsitellä pyyntöjä niin kuin mikä tahansa verkkopalvelin. Asiakas todentaa erityisellä HTTP/3-pyynnöllä; kaikki muut, utelias kävijä tai aktiivinen luotaus, saavat tavallisia verkkovastauksia. Määrittely toteaa, että kolmannelle osapuolelle ilman tunnuksia palvelin käyttäytyy aivan kuin tavallinen HTTP/3-verkkopalvelin.

## Miksi se on nopea?

QUIC toimii UDP:llä ja toipuu pakettien katoamisesta pysäyttämättä jokaista virtaa niin kuin TCP tekee. Hysteria voi myös käyttää omaa ruuhkanhallintaansa, joka on suunnattu epävakaille yhteyksille, joten se pitää nopeutensa yleensä ruuhkaisissa mobiiliverkoissa, pitkillä reiteillä ja häiriöisessä Wi-Fissä, jossa TCP-pohjaiset protokollat hidastuvat.

## Kuinka vaikea Hysteria 2 on estää?

Aktiivista luotausta vastaan se kestää hyvin, sillä luotaukset näkevät verkkopalvelimen. Altistus on kuljetus. Sensuroija voi hidastaa tai estää UDP:n tai erityisesti QUIC:n rikkomatta useimpia sivustoja, koska selaimet siirtyvät HTTP/2:een TCP:llä, kun HTTP/3 epäonnistuu. Siellä, missä näin käy, Hysteria 2:lla ei ole minne mennä, kun taas TCP-pohjaiset protokollat kuten [VLESS-Reality](/vpn-protocols/vless-reality) jatkavat toimintaansa.

## Milloin Hysteria 2:ta kannattaa käyttää?

- **Häviöllisillä tai pitkillä yhteyksillä**, joissa sen ruuhkanhallinta ja QUIC:n katoamisen korjaus kannattavat.
- **Verkoissa, jotka sallivat UDP:n.** Tarkista tämä, ennen kuin luotat siihen.
- Toisena protokollana TCP-vaihtoehdon rinnalla, jotta voit vaihtaa, kun UDP suodatetaan. [Sensuurioppaamme](/bypass-censorship) kertoo, miten suodattimet kohdistuvat kuljetuksiin.

## Käyttääkö Doppler Hysteria 2:ta?

Ei. Doppler käyttää VLESS-Realityä TCP:llä, joka jatkaa toimintaansa verkoissa, jotka estävät UDP:n. Katso [Miksi VLESS](/vpn-protocols/why-vless).
