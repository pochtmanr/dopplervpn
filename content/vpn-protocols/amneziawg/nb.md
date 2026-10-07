> **Kortversjonen.** AmneziaWG er en fork av WireGuard som beholder hastigheten og kryptografien, men endrer pakkeformene og headerne som gjør WireGuard lett å oppdage. Den er et sterkt alternativ der vanlig WireGuard er blokkert, med ett forbehold: den snakker ikke lenger med standard WireGuard-servere når tilsløringen er på.

## Hva er AmneziaWG?

AmneziaWG utvikles av teamet bak [Amnezia VPN](https://amnezia.org/), en app med åpen kildekode for å kjøre din egen VPN-server. Prosjektets [Go-implementasjon](https://github.com/amnezia-vpn/amneziawg-go) ble startet i 2023. Den tar [WireGuard](/vpn-protocols/wireguard), som er rask og enkel, men har et fast, gjenkjennelig håndtrykk, og legger på et lag som forkler det.

## Hva endrer den?

[AmneziaWG-dokumentasjonen](https://docs.amnezia.org/documentation/amnezia-wg/) beskriver flere mekanismer, hver styrt av konfigurasjonsparametere:

- **Dynamiske headere (H1–H4).** Standard WireGuard-pakker starter med en fast meldingstype for hvert av de fire pakkeformatene. AmneziaWG erstatter de verdiene med tall valgt fra konfigurerte områder, slik at to ulike oppsett ikke deler headere og ingen enkelt filterregel treffer alle.
- **Tilfeldig pakkelengde (S1–S4).** I WireGuard er den første håndtrykkpakken alltid nøyaktig 148 byte. AmneziaWG legger tilfeldige prefikser til hver pakketype, slik at størrelsene varierer.
- **Søppelpakker (Jc, Jmin, Jmax).** Før håndtrykket sender klienten et konfigurerbart antall pseudoslumpmessige pakker med tilfeldig lengde, som gjør starten på økten utydelig både i tid og størrelse.
- **Headerbeskyttelse.** Nyere versjoner kan også kryptere selve feltet for meldingstype.

Under er kryptografien og den overordnede utformingen fortsatt WireGuards.

## Hvor vanskelig er det å blokkere AmneziaWG?

Den fjerner de enkle signaturene filtrene bruker mot WireGuard: faste størrelser og faste headerverdier. Det gjør den langt mer motstandsdyktig enn vanlig WireGuard i nettverk som blokkerer VPN-er.

Den kjører fortsatt over UDP, så nettverk som struper eller blokkerer UDP bredt, vil påvirke den, og trafikken etterligner ikke noe bestemt program slik [VLESS-Reality](/vpn-protocols/vless-reality) etterligner et TLS-besøk til et ekte nettsted. Et filter som blokkerer ugjenkjennelig UDP rett ut, kan fortsatt fange den.

## Når bør du bruke AmneziaWG?

- **Der WireGuard er blokkert**, men UDP fortsatt virker, og du vil ha hastighet som WireGuard.
- **Egendrevne servere**, satt opp med Amnezia VPN-appen.
- Behold et TCP-basert alternativ, for eksempel VLESS-Reality, for nettverk som filtrerer UDP. [Veiledningen vår for Russland](/vpn-for-russia) tar for seg hva som kommer gjennom der nå.

## Bruker Doppler AmneziaWG?

Nei. Doppler bruker VLESS-Reality. Se [hvorfor VLESS](/vpn-protocols/why-vless).
