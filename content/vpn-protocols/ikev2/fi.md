> **Lyhyesti.** IKEv2/IPsec on VPN, jota puhelimesi ja kannettavasi osaavat jo käyttää ilman sovellusta. Se on nopea ja sietää hyvin vaihtoa Wi-Fin ja mobiilidatan välillä. Se toimii myös kiinteissä, hyvin tunnetuissa porteissa, mikä tekee siitä yhden yksinkertaisimmista protokollista sensuroijan estää.

## Mikä IKEv2/IPsec on?

"IKEv2" on oikeastaan kaksi osaa, jotka toimivat yhdessä. IPsec on kokonaisuus, joka salaa ja todentaa IP-paketit. IKE, Internet Key Exchange, on protokolla, jolla osapuolet todentavat toisensa ja sopivat IPsec-avaimista. IKE:n versio 2 standardoitiin [joulukuussa 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), ja nykyinen määrittely on [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Koska se on IETF-standardi, IKEv2 on sisäänrakennettu iOS:ään, macOS:ään ja Windowsiin sekä Androidiin versiosta 11 alkaen. Monet yritysten VPN-yhdyskäytävät käyttävät sitä.

## Miten se toimii?

Avaintenvaihto kulkee UDP:llä, [yleensä portissa 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Kun osapuolet ovat sopineet avaimista, käyttöjärjestelmän IPsec-pino salaa liikenteesi ESP:llä (Encapsulating Security Payload). Kun välissä on NAT-reititin, kuten lähes jokaisessa koti- ja mobiiliverkossa, sekä IKE että ESP kääritään UDP:hen portissa 4500.

IKEv2:lla on vakiolaajennus nimeltä [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), jonka ansiosta yhteys säilyy IP-osoitteen vaihtuessa. Siksi IKEv2 on miellyttävä puhelimissa: kävele Wi-Fin kantamasta mobiilidatalle, ja tunneli jatkuu sen sijaan, että yhteys muodostettaisiin alusta.

## Miksi IKEv2 on helppo estää?

IKEv2 ei edes yritä näyttää miltään muulta. Sen liikenne käyttää hyvin tunnettuja UDP-portteja, ja sillä on vakiomuotoiset IKE- ja ESP-muodot, jotka mikä tahansa verkkotyökalu osaa jäsentää. Estäminen ei vaadi edes syvää pakettitarkastusta: suodatin voi hylätä UDP-portit 500 ja 4500 tai tunnistaa IKE-vaihdon suoraan.

Se on järkevä kompromissi yritysverkoissa ja matkustaessa avoimissa maissa, joissa VPN:ksi tunnistamisesta ei ole haittaa. Verkoissa, jotka suodattavat VPN:t tarkoituksella, se lakkaa yleensä toimimasta ensimmäisenä.

## Milloin IKEv2:ta kannattaa käyttää?

- **Kun sovellusta ei saa asentaa.** Hallitulla laitteella, johon et voi asentaa ohjelmistoa, sisäänrakennettu IKEv2-asiakas voi olla ainoa vaihtoehto.
- **Mobiiliroaming avoimissa verkoissa.** MOBIKE tekee siirtymistä verkkojen välillä sujuvia.
- **Ei sensuurin alla.** Suodatetuissa verkoissa valitse protokolla, joka on suunniteltu sulautumaan, kuten [VLESS-Reality](/vpn-protocols/vless-reality). [Sensuurioppaamme](/bypass-censorship) kertoo, miten esto toimii.

## Käyttääkö Doppler IKEv2:ta?

Ei. Doppler yhdistää VLESS-Realityllä omissa sovelluksissaan. Perustelut ovat oppaassa [Miksi VLESS](/vpn-protocols/why-vless).
