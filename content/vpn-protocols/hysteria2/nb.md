> **Kortversjonen.** Hysteria 2 er en proxy-protokoll bygget på QUIC, transporten bak HTTP/3. Den er laget for fart på dårlige forbindelser med pakketap, og for alle uten passordet oppfører serveren seg som et vanlig HTTP/3-nettsted. Det svake punktet er at den er avhengig av UDP, som noen nettverk struper eller blokkerer helt.

## Hva er Hysteria 2?

Hysteria er et prosjekt med åpen kildekode fra [apernet](https://github.com/apernet/hysteria); versjon 2, en omarbeidet protokoll, ble utgitt i september 2023. Som Shadowsocks og VLESS er den en proxy og ikke en klassisk VPN, og klienter kan rute en hel enhet gjennom den.

## Hvordan fungerer den?

Ifølge [protokollspesifikasjonen](https://v2.hysteria.network/docs/developers/Protocol/) kjører Hysteria 2 over QUIC slik det er definert i [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), med utvidelsen for upålitelige datagrammer for UDP-trafikk. QUIC gir allerede TLS 1.3-kryptering, multipleksede strømmer og rask oppkobling.

Autentiseringen er der forkledningen kommer inn. Spesifikasjonen krever at en Hysteria-server **må implementere en ekte HTTP/3-server** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) og håndtere forespørsler slik enhver webserver ville. En klient autentiserer seg med en spesiell HTTP/3-forespørsel; alle andre, enten en nysgjerrig besøkende eller en aktiv sonde, får vanlige websvar. Spesifikasjonen sier at for en tredjepart uten legitimasjon oppfører serveren seg akkurat som en standard HTTP/3-webserver.

## Hvorfor er den rask?

QUIC kjører over UDP og henter seg inn etter pakketap uten å stoppe hver strøm slik TCP gjør. Hysteria kan også bruke sin egen metningskontroll, rettet mot ustabile linker, så den pleier å holde farten i overbelastede mobilnett, på lange ruter og på Wi-Fi med forstyrrelser, der TCP-baserte protokoller sakker ned.

## Hvor vanskelig er det å blokkere Hysteria 2?

Mot aktiv sondering holder den stand, siden sonder ser en webserver. Eksponeringen er transporten. En sensor kan strupe eller blokkere UDP, eller QUIC spesielt, uten å ødelegge de fleste nettsteder, fordi nettlesere faller tilbake til HTTP/2 over TCP når HTTP/3 feiler. Der det skjer, har Hysteria 2 ingen vei videre, mens TCP-baserte protokoller som [VLESS-Reality](/vpn-protocols/vless-reality) fortsetter å virke.

## Når bør du bruke Hysteria 2?

- **Linker med pakketap eller lang avstand**, der metningskontrollen og gjenopprettingen etter tap i QUIC lønner seg.
- **Nettverk som tillater UDP.** Sjekk det før du stoler på den.
- Som en andre protokoll ved siden av et TCP-alternativ, slik at du kan bytte når UDP filtreres. [Sensurveiledningen](/bypass-censorship) vår tar for seg hvordan filtre retter seg mot transporter.

## Bruker Doppler Hysteria 2?

Nei. Doppler bruker VLESS-Reality over TCP, som fortsetter å virke i nettverk som blokkerer UDP. Se [hvorfor VLESS](/vpn-protocols/why-vless).
