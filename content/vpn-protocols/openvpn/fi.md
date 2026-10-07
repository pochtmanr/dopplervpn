> **Lyhyesti.** OpenVPN on avoimen lähdekoodin VPN:ien veteraani: joustava, laajasti tuettu ja hyvin ymmärretty yli kahden vuosikymmenen jälkeen. Se on myös hitaampi kuin uudemmat protokollat ja julkaistun tutkimuksen mukaan yksi helpoimmista internet-palveluntarjoajan sormenjäljitunnistettavaksi.

## Mikä OpenVPN on?

OpenVPN on ilmainen, avoimen lähdekoodin VPN-ohjelmisto, jonka James Yonan julkaisi ensimmäisen kerran [toukokuussa 2001](https://en.wikipedia.org/wiki/OpenVPN). Suurimman osan 2000-lukua ja 2010-lukua se oli kaupallisten VPN-palvelujen ja yritysten etäkäytön oletusvalinta, ja se on yhä mukana monissa reitittimissä ja yritystuotteissa.

Se toimii käyttäjätilassa eikä käyttöjärjestelmän ytimessä, ja avaintenvaihdossa se nojaa OpenSSL-kirjastoon ja TLS-protokollaan. IANA:n osoittama portti on 1194, mutta OpenVPN voi toimia UDP:llä tai TCP:llä lähes missä tahansa portissa.

## Miten se toimii?

OpenVPN käyttää omaa protokollaa, jossa on kaksi osaa. Ohjauskanava käyttää TLS:ää todentaakseen osapuolet, yleensä sertifikaateilla, ja sopiakseen avaimista. Datakanava kuljettaa sitten liikenteesi näillä avaimilla salattuna joko UDP- tai TCP-pakettien sisällä.

Tämä rakenne tekee OpenVPN:stä hyvin säädettävän. Voit valita salaimet, todennusmenetelmät, portit ja kuljetukset ja ajaa sen välityspalvelinten kautta. Joustavuuden hinta on monimutkaisuus: enemmän koodia, enemmän asetuksia ja enemmän tapoja päätyä heikkoon kokoonpanoon.

## Miksi OpenVPN estetään?

TLS OpenVPN:n sisällä ei ole sama asia kuin HTTPS-käynti sivustolla. OpenVPN käärii TLS-kättelynsä omaan paketinkehystykseensä, joten sen liikenteellä on muoto, jota tavallisella verkkoliikenteellä ei ole.

Tutkijat mittasivat, kuinka paljon tällä on merkitystä. Michiganin yliopiston ja muiden tutkijoiden ryhmä [rakensi sormenjälkijärjestelmän](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) ja ajoi sitä internet-palveluntarjoajan sisällä, jolla oli noin miljoona käyttäjää. Se tunnisti **yli 85 % OpenVPN-virroista** hyvin vähäisellä määrällä vääriä positiivisia ja sai kiinni myös useimmat testaamistaan kaupallisista "häivytetyistä" OpenVPN-kokoonpanoista.

Todellinen suodatus seuraa tutkimusta. Elokuussa 2023 käyttäjät Venäjällä [kertoivat](https://github.com/net4people/bbs/issues/274), että mobiilioperaattorit katkaisivat OpenVPN-yhteydet pian niiden alkamisen jälkeen.

## Milloin OpenVPN:ää kannattaa käyttää?

- **Yhteensopivuus.** Vanhemmat reitittimet, yritysten yhdyskäytävät ja jotkin yritysverkot tukevat OpenVPN:ää eikä mitään uudempaa.
- **Vain TCP:tä käyttävät verkot.** OpenVPN voi toimia TCP:llä, kun UDP on estetty, mitä [WireGuard](/vpn-protocols/wireguard) ei voi tehdä ilman apua.
- **Ei suodatetuissa verkoissa.** Siellä, missä VPN:t estetään, OpenVPN pettää yleensä aikaisin. Parempi työkalu on protokolla, joka jäljittelee tavallista verkkoliikennettä, kuten [VLESS-Reality](/vpn-protocols/vless-reality). [Sensuurioppaamme](/bypass-censorship) kertoo, miten suodatusjärjestelmät päättävät, mitä katkaistaan.

## Käyttääkö Doppler OpenVPN:ää?

Ei. Doppler käyttää VLESS-Realityä jokaisella alustalla. [Miksi VLESS](/vpn-protocols/why-vless) -opas kertoo, miten valitsimme sen.
