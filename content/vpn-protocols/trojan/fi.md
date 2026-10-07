> **Lyhyesti.** Trojan piilottaa välitysliikenteen oikean TLS-yhteyden sisään oikealle sivustolle, jota hallitset. Kuka tahansa, joka yhdistää ilman salasanaa, saa vain sivuston. Se toimii hyvin, mutta tarvitset oman verkkotunnuksen ja sertifikaatin, ja ne voidaan löytää ja estää.

## Mikä Trojan on?

Trojan on välitysprotokolla [trojan-gfw-projektista](https://github.com/trojan-gfw/trojan), ja se julkaistiin ensimmäisen kerran lokakuussa 2017. Idea on nimessä: sen sijaan, että se keksisi naamioinnin, se piiloutuu internetin yleisimmän salatun liikenteen, HTTPS:n, sisään.

## Miten se toimii?

[Protokollakuvaus](https://trojan-gfw.github.io/trojan/protocol) on lyhyt. Trojan-palvelin kuuntelee kuin tavallinen HTTPS-palvelin, oikealla sertifikaatilla oikealle verkkotunnukselle. Asiakas tekee aidon TLS-kättelyn. Sitten se lähettää salatun yhteyden sisällä:

- yhteisen salasanan heksakoodatun SHA-224-tiivisteen, joka on 56 merkkiä,
- rivinvaihdon,
- pienen pyynnön siitä, minne liikenteen pitäisi mennä, SOCKS5:n kaltaisessa muodossa,
- toisen rivinvaihdon ja sen jälkeen ensimmäisen dataosuuden.

Jos tiiviste ja pyyntö ovat kelvollisia, palvelin avaa tunnelin kohteeseen. Jos jokin on pielessä, palvelin käsittelee yhteyden "muina protokollina" ja välittää sen varaverkkopalvelimelle, joten kävijä näkee tavallisen sivuston.

## Kuinka vaikea Trojan on estää?

Ulkoa päin Trojan-yhteys on TLS-istunto verkkotunnukseesi, sertifikaatillasi. Aktiiviset luotaukset saavat vastaukseksi oikean sivuston. Siksi Trojania on paljon vaikeampi erottaa kuin protokollia, jotka näyttävät satunnaisilta, kuten [Shadowsocks](/vpn-protocols/shadowsocks).

Sen heikko kohta on itse verkkotunnus. Jokainen palvelin tarvitsee verkkotunnuksen ja sertifikaatin, ja sensuroija, joka saa selville, mitkä verkkotunnukset kuuluvat välityspalvelimille, voi estää ne nimen tai IP:n perusteella. Tutkijat ovat myös osoittaneet, että TLS TLS:n sisällä jättää ajoitus- ja kokokuvioita, joista sen voi [tunnistaa sormenjäljestä](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), ja tämä koskee Trojania ja samankaltaisia ratkaisuja.

[VLESS-Reality](/vpn-protocols/vless-reality) poistaa verkkotunnusongelman lainaamalla olemassa olevan, suositun sivuston TLS-kättelyä oman sijaan.

## Milloin Trojania kannattaa käyttää?

- **Kun hallitset verkkotunnusta** ja haluat yksinkertaisen, hyvin ymmärretyn kokoonpanon, joka näyttää HTTPS:ltä.
- **Kohtalaisesti suodatetuissa verkoissa**, joissa verkkotunnuksesi ei todennäköisesti ole kohde.
- Vertailumme [VLESS, VMess ja Trojan](/blog/vless-vs-vmess-vs-trojan) auttaa, jos valitset niiden välillä.

## Käyttääkö Doppler Trojania?

Ei. Doppler käyttää VLESS-Realityä, joka ei tarvitse omaa verkkotunnusta. Katso [Miksi VLESS](/vpn-protocols/why-vless).
