> **Kortversjonen.** WireGuard er den raskeste og enkleste av de vanlige VPN-protokollene, og i et ufiltrert nettverk er den et utmerket valg. Den ble aldri laget for å skjule at den er en VPN, og i Russland, Iran og Kina er den blant de første protokollene som blir blokkert.

## Hva er WireGuard?

WireGuard er en VPN-protokoll skrevet av Jason A. Donenfeld og utgitt første gang i 2015. Målet var å erstatte de store, konfigurerbare protokollene som kom før, med noe lite nok til å kunne revideres. I mars 2020 ble den [tatt inn i Linux-kjernen 5.6](https://en.wikipedia.org/wiki/WireGuard), og offisielle apper finnes nå for Windows, macOS, iOS, Android og Linux.

I stedet for at partene forhandler om en chiffersuite, fastsetter WireGuard ett sett med moderne primitiver. [Protokollsiden](https://www.wireguard.com/protocol/) lister dem opp: ChaCha20 med Poly1305 til kryptering, Curve25519 til nøkkelutveksling og BLAKE2s til hashing. Det er ingenting å feilkonfigurere, og ingen eldre, svakere variant å falle tilbake på.

## Hvordan fungerer den?

Hver enhet har et nøkkelpar, omtrent som i SSH. Klienten og serveren kjenner hverandres offentlige nøkler på forhånd, og håndtrykket bygger på Noise-protokollrammeverket (protokollsiden navngir den nøyaktige konstruksjonen, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Alle pakker sendes over UDP](https://www.wireguard.com/protocol/), og en ny økt settes opp i én rundtur.

Derfor oppleves WireGuard som rask. Det er lite å forhandle om, koden kjører inne i operativsystemets kjerne på Linux, og bytte mellom Wi-Fi og mobildata håndteres stille fordi protokollen ikke holder en langvarig tilkobling åpen.

## Hvorfor blir WireGuard blokkert?

Den samme enkelheten som gjør WireGuard lett å revidere, gjør den lett å kjenne igjen. [Whitepaperen](https://www.wireguard.com/papers/wireguard.pdf) spesifiserer håndtrykkmeldingene byte for byte, så den første pakken fra en klient er alltid 148 byte og svaret er alltid 92 byte. Hver av dem starter med et fast felt for meldingstype. Et system for dyp pakkeinspeksjon (DPI) trenger bare en kort regel for å se det mønsteret på UDP.

Sensorer har gjort nettopp det. I august 2023 [rapporterte](https://github.com/net4people/bbs/issues/274) brukere i Russland at store mobiloperatører kuttet WireGuard-økter rett etter håndtrykket. Krypteringen beskyttet fortsatt innholdet, men selve tilkoblingen var borte.

Dette er en avveining i utformingen, ikke en feil. Forfatterne av WireGuard valgte en fast, minimal protokoll, og forkledning var ikke blant målene. Prosjekter som [AmneziaWG](/vpn-protocols/amneziawg) endrer pakkeformene for å få tilbake noe av forkledningen.

## Når bør du bruke WireGuard?

- **Ufiltrerte nettverk.** Hjemme, på jobb eller på reise i et land som ikke blokkerer VPN-er, er WireGuard vanskelig å slå på hastighet og batteritid.
- **Egen drift.** Hvis du kjører din egen server, er WireGuard en av de enkleste protokollene å sette opp riktig.
- **Ikke under DPI-filtrering.** Hvis nettverket ditt blokkerer VPN-er, passer en protokoll som er laget for å se ut som vanlig nettrafikk, for eksempel [VLESS-Reality](/vpn-protocols/vless-reality), bedre. Sammenligningen vår av [VLESS-Reality og WireGuard](/blog/vless-reality-vs-wireguard) går nærmere inn på avveiningen.

## Bruker Doppler WireGuard?

Nei. Doppler-appene kobler til over VLESS-Reality, fordi Doppler er laget for nettverk der WireGuard filtreres. Veiledningen [hvorfor VLESS](/vpn-protocols/why-vless) forklarer begrunnelsen.
