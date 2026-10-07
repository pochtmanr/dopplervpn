> **De korte versie.** WireGuard is het snelste en eenvoudigste gangbare VPN-protocol, en op een ongefilterd netwerk is het een uitstekende keuze. Het is nooit ontworpen om te verbergen dat het een VPN is, en in Rusland, Iran en China is het een van de eerste protocollen die worden geblokkeerd.

## Wat is WireGuard?

WireGuard is een VPN-protocol dat is geschreven door Jason A. Donenfeld en voor het eerst uitkwam in 2015. Het doel was de grote, instelbare protocollen die eraan voorafgingen te vervangen door iets dat klein genoeg is om te controleren. In maart 2020 is het [opgenomen in de Linux 5.6-kernel](https://en.wikipedia.org/wiki/WireGuard), en er zijn nu officiële apps voor Windows, macOS, iOS, Android en Linux.

In plaats van beide kanten een cipher suite te laten afspreken, legt WireGuard één set moderne primitieven vast. De [protocolpagina](https://www.wireguard.com/protocol/) somt ze op: ChaCha20 met Poly1305 voor versleuteling, Curve25519 voor de sleuteluitwisseling en BLAKE2s voor hashing. Er valt niets verkeerd in te stellen, en er is geen oudere, zwakkere optie om op terug te vallen.

## Hoe werkt het?

Elk apparaat heeft een sleutelpaar, vergelijkbaar met SSH. De client en de server kennen elkaars publieke sleutels van tevoren, en de handshake is gebaseerd op het Noise-protocolframework (de protocolpagina noemt de exacte constructie, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Alle pakketten gaan over UDP](https://www.wireguard.com/protocol/), en een nieuwe sessie wordt in één heen-en-weer opgezet.

Dat ontwerp is waarom WireGuard snel aanvoelt. Er valt weinig af te spreken, op Linux draait de code in de kernel van het besturingssysteem, en wisselen tussen wifi en mobiele data gaat ongemerkt, omdat het protocol geen langdurige verbinding openhoudt.

## Waarom wordt WireGuard geblokkeerd?

Dezelfde eenvoud die WireGuard makkelijk te controleren maakt, maakt het makkelijk te herkennen. Het [whitepaper](https://www.wireguard.com/papers/wireguard.pdf) beschrijft de handshakeberichten byte voor byte, dus het eerste pakket van een client is altijd 148 bytes en het antwoord altijd 92 bytes, en elk begint met een vast veld voor het berichttype. Een systeem voor deep packet inspection (DPI) heeft maar een korte regel nodig om dat patroon op UDP te zien.

Censors doen precies dat. In augustus 2023 [meldden](https://github.com/net4people/bbs/issues/274) gebruikers in Rusland dat grote mobiele aanbieders WireGuard-sessies direct na de handshake afkapten. De versleuteling beschermde de inhoud nog steeds, maar de verbinding zelf was weg.

Dit is een ontwerpafweging, geen fout. De auteurs van WireGuard kozen een vast, minimaal protocol, en vermomming stond niet bij de doelen. Projecten zoals [AmneziaWG](/vpn-protocols/amneziawg) veranderen de vorm van de pakketten om weer enige dekking te krijgen.

## Wanneer gebruik je WireGuard?

- **Ongefilterde netwerken.** Thuis, op het werk of op reis in een land dat geen VPN's blokkeert, is WireGuard moeilijk te overtreffen in snelheid en batterijduur.
- **Zelf hosten.** Als je een eigen server draait, is WireGuard een van de makkelijkste protocollen om goed in te stellen.
- **Niet onder DPI-filtering.** Als je netwerk VPN's blokkeert, past een protocol dat is gebouwd om op gewoon webverkeer te lijken beter, zoals [VLESS-Reality](/vpn-protocols/vless-reality). Onze vergelijking van [VLESS-Reality en WireGuard](/blog/vless-reality-vs-wireguard) gaat dieper in op die afweging.

## Gebruikt Doppler WireGuard?

Nee. De apps van Doppler verbinden via VLESS-Reality, omdat Doppler is gebouwd voor netwerken waar WireGuard wordt gefilterd. De gids [waarom VLESS](/vpn-protocols/why-vless) legt de redenering uit.
