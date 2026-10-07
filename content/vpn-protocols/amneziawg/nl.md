> **De korte versie.** AmneziaWG is een fork van WireGuard die de snelheid en de cryptografie behoudt, maar de pakketvormen en headers verandert die WireGuard makkelijk te herkennen maken. Het is een sterke optie waar gewoon WireGuard wordt geblokkeerd, met één voorbehoud: zodra de vermomming aan staat, praat het niet meer met standaard WireGuard-servers.

## Wat is AmneziaWG?

AmneziaWG wordt ontwikkeld door het team achter [Amnezia VPN](https://amnezia.org/), een opensource-app om je eigen VPN-server te draaien. De [Go-implementatie](https://github.com/amnezia-vpn/amneziawg-go) van het project is in 2023 begonnen. Het neemt [WireGuard](/vpn-protocols/wireguard), dat snel en eenvoudig is maar een vaste, herkenbare handshake heeft, en voegt een laag toe die het vermomt.

## Wat verandert het?

De [documentatie van AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) beschrijft verschillende mechanismen, elk gestuurd door configuratieparameters:

- **Dynamische headers (H1–H4).** Standaardpakketten van WireGuard beginnen met een vast berichttype voor elk van de vier pakketformaten. AmneziaWG vervangt die waarden door getallen uit ingestelde bereiken, zodat twee verschillende configuraties geen headers delen en geen enkele filterregel ze allemaal treft.
- **Willekeurige pakketlengte (S1–S4).** Bij WireGuard is het eerste handshake-pakket altijd precies 148 bytes. AmneziaWG voegt willekeurige voorvoegsels toe aan elk pakkettype, zodat de groottes variëren.
- **Junkpakketten (Jc, Jmin, Jmax).** Vóór de handshake stuurt de client een instelbaar aantal pseudowillekeurige pakketten van willekeurige lengte, die het begin van de sessie vervagen in tijd en in grootte.
- **Headerbescherming.** Nieuwere versies kunnen ook het veld van het berichttype zelf versleutelen.

Daaronder blijven de cryptografie en het ontwerp als geheel die van WireGuard.

## Hoe moeilijk is AmneziaWG te blokkeren?

Het haalt de eenvoudige signaturen weg die filters tegen WireGuard gebruiken: vaste groottes en vaste headerwaarden. Dat maakt het veel weerbaarder dan gewoon WireGuard op netwerken die VPN's blokkeren.

Het draait nog steeds over UDP, dus netwerken die UDP breed afknijpen of blokkeren, raken het ook, en het verkeer bootst geen bepaalde toepassing na, zoals [VLESS-Reality](/vpn-protocols/vless-reality) een TLS-bezoek aan een echte website nabootst. Een filter dat onherkenbaar UDP zonder meer blokkeert, kan het nog steeds vangen.

## Wanneer gebruik je AmneziaWG?

- **Waar WireGuard is geblokkeerd** maar UDP nog werkt, en je een snelheid zoals bij WireGuard wilt.
- **Zelf gehoste servers**, met de app Amnezia VPN om ze in te stellen.
- Houd een optie op TCP aan, zoals VLESS-Reality, voor netwerken die UDP filteren. Onze [gids voor Rusland](/vpn-for-russia) beschrijft wat daar nu doorheen komt.

## Gebruikt Doppler AmneziaWG?

Nee. Doppler gebruikt VLESS-Reality. Zie [waarom VLESS](/vpn-protocols/why-vless).
