> **Lühidalt.** OpenVPN on avatud lähtekoodiga VPN-ide veteran: paindlik, laialt toetatud ja enam kui kahe aastakümne jooksul hästi läbi uuritud. See on ka uuemastest protokollidest aeglasem ning avaldatud uuringute järgi üks lihtsamaid, mida internetiteenuse pakkuja sõrmejälje järgi ära tunneb.

## Mis on OpenVPN?

OpenVPN on tasuta avatud lähtekoodiga VPN-tarkvara, mille James Yonan avaldas esimest korda [2001. aasta mais](https://en.wikipedia.org/wiki/OpenVPN). Suurema osa 2000. ja 2010. aastatest oli see kommerts-VPN-teenuste ja ettevõtte kaugjuurdepääsu vaikimisi valik ning see on endiselt paljudes ruuterites ja ettevõttetoodetes.

See töötab kasutajaruumis, mitte operatsioonisüsteemi tuumas, ning võtmevahetuseks toetub OpenSSL-i teegile ja TLS-protokollile. IANA määratud port on 1194, kuigi OpenVPN saab töötada UDP või TCP kaudu peaaegu igal pordil.

## Kuidas see töötab?

OpenVPN kasutab kaheosalist enda protokolli. Juhtimiskanal kasutab TLS-i, et pooled teineteist autentiksid, tavaliselt sertifikaatidega, ja lepivad võtmetes kokku. Andmekanal kannab seejärel teie liiklust, nende võtmetega krüpteeritult, kas UDP- või TCP-pakettide sees.

See ülesehitus teeb OpenVPN-i väga seadistatavaks. Saate valida šifreid, autentimismeetodeid, porte ja transporte ning lasta selle läbi puhverserverite. Paindlikkuse hind on keerukus: rohkem koodi, rohkem seadeid ja rohkem viise, kuidas jõuda nõrga konfiguratsioonini.

## Miks OpenVPN blokeeritakse?

TLS OpenVPN-i sees ei ole sama mis HTTPS-külastus veebisaidile. OpenVPN mähib oma TLS-käepigistuse enda pakettide raamistikku, nii et selle liiklusel on kuju, mida tavalisel veebiliiklusel ei ole.

Uurijad mõõtsid, kui palju see loeb. Michigani ülikooli ja teiste asutuste meeskond [ehitas sõrmejäljesüsteemi](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) ja käivitas selle internetiteenuse pakkuja sees, kellel oli umbes miljon kasutajat. See tuvastas **üle 85% OpenVPN-i voogudest** väga väheste väärpositiivsetega ning püüdis kinni ka enamiku kommertslikest „hägustatud“ OpenVPN-i seadistustest, mida nad katsetasid.

Tegelik filtreerimine järgneb uuringutele. 2023. aasta augustis [teatasid](https://github.com/net4people/bbs/issues/274) kasutajad Venemaal, et mobiilioperaatorid katkestavad OpenVPN-i ühendused varsti pärast nende algust.

## Millal OpenVPN-i kasutada?

- **Ühilduvuse pärast.** Vanemad ruuterid, ettevõtte lüüsid ja mõned kontorivõrgud toetavad OpenVPN-i ja mitte midagi uuemat.
- **Ainult TCP-ga võrkudes.** OpenVPN saab töötada TCP kaudu, kui UDP on blokeeritud, mida [WireGuard](/vpn-protocols/wireguard) ilma kõrvalise abita ei saa.
- **Mitte filtreeritud võrkudes.** Seal, kus VPN-e blokeeritakse, kipub OpenVPN varakult üles ütlema. Parem vahend on protokoll, mis jäljendab tavalist veebiliiklust, näiteks [VLESS-Reality](/vpn-protocols/vless-reality). Meie [tsensuurijuhend](/bypass-censorship) selgitab, kuidas filtreerimissüsteemid otsustavad, mida katkestada.

## Kas Doppler kasutab OpenVPN-i?

Ei. Doppler kasutab igal platvormil VLESS-Realityt. Juhend [miks VLESS](/vpn-protocols/why-vless) selgitab, kuidas me selle valisime.
