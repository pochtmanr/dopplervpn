> **De korte versie.** Hysteria 2 is een proxyprotocol gebouwd op QUIC, het transport achter HTTP/3. Het is ontworpen voor snelheid op slechte en verliesrijke verbindingen, en voor wie het wachtwoord niet heeft, gedraagt de server zich als een gewone HTTP/3-website. Het zwakke punt is dat het van UDP afhangt, en sommige netwerken knijpen UDP af of blokkeren het helemaal.

## Wat is Hysteria 2?

Hysteria is een opensourceproject van [apernet](https://github.com/apernet/hysteria); versie 2, een opnieuw ontworpen protocol, verscheen in september 2023. Net als Shadowsocks en VLESS is het een proxy en geen klassieke VPN, en clients kunnen een heel apparaat erdoorheen leiden.

## Hoe werkt het?

Volgens de [protocolspecificatie](https://v2.hysteria.network/docs/developers/Protocol/) draait Hysteria 2 over QUIC zoals vastgelegd in [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), met de extensie voor onbetrouwbare datagrammen voor UDP-verkeer. QUIC biedt al versleuteling met TLS 1.3, gemultiplexte streams en een snelle verbindingsopbouw.

Bij de authenticatie begint de vermomming. De specificatie eist dat een Hysteria-server **een echte HTTP/3-server moet implementeren** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) en verzoeken afhandelt zoals elke webserver zou doen. Een client authenticeert met een speciaal HTTP/3-verzoek; iedereen anders, of het een nieuwsgierige bezoeker is of een actieve probe, krijgt gewone webantwoorden. De specificatie stelt dat de server zich voor een derde zonder inloggegevens precies gedraagt als een standaard HTTP/3-webserver.

## Waarom is het snel?

QUIC draait over UDP en herstelt van pakketverlies zonder elke stream te laten stilvallen, zoals TCP wel doet. Hysteria kan ook eigen congestiecontrole gebruiken, gericht op instabiele verbindingen, en houdt daardoor zijn snelheid vaker vast op drukke mobiele netwerken, routes over lange afstand en wifi met storing, waar protocollen op TCP vertragen.

## Hoe moeilijk is Hysteria 2 te blokkeren?

Tegen actieve probing houdt het goed stand, want probes zien een webserver. De kwetsbaarheid zit in het transport. Een censor kan UDP afknijpen of blokkeren, of specifiek QUIC, zonder de meeste websites te breken, omdat browsers terugvallen op HTTP/2 over TCP als HTTP/3 faalt. Waar dat gebeurt, heeft Hysteria 2 geen kant op, terwijl protocollen op TCP zoals [VLESS-Reality](/vpn-protocols/vless-reality) blijven werken.

## Wanneer gebruik je Hysteria 2?

- **Verliesrijke verbindingen of lange afstanden**, waar de congestiecontrole en het verliesherstel van QUIC zich terugbetalen.
- **Netwerken die UDP toelaten.** Controleer dat voordat je erop steunt.
- Als tweede protocol naast een TCP-optie, zodat je kunt wisselen wanneer UDP wordt gefilterd. Onze [censuurgids](/bypass-censorship) beschrijft hoe filters op transporten mikken.

## Gebruikt Doppler Hysteria 2?

Nee. Doppler gebruikt VLESS-Reality over TCP, dat blijft werken op netwerken die UDP blokkeren. Zie [waarom VLESS](/vpn-protocols/why-vless).
