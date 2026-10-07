> **Den korte version.** WireGuard er den hurtigste og enkleste udbredte VPN-protokol, og på et ufiltreret netværk er den et fremragende valg. Den er dog aldrig designet til at skjule, at den er en VPN, og i Rusland, Iran og Kina er den blandt de første protokoller, der bliver blokeret.

## Hvad er WireGuard?

WireGuard er en VPN-protokol skrevet af Jason A. Donenfeld og udgivet første gang i 2015. Målet var at erstatte de store, konfigurerbare protokoller, der kom før, med noget så lille, at det kunne gennemgås. I marts 2020 blev den [flettet ind i Linux 5.6-kernen](https://en.wikipedia.org/wiki/WireGuard), og officielle apps findes nu til Windows, macOS, iOS, Android og Linux.

I stedet for at lade hver side forhandle en krypteringspakke fastlægger WireGuard ét sæt moderne primitiver. Dens [protokolside](https://www.wireguard.com/protocol/) opregner dem: ChaCha20 med Poly1305 til kryptering, Curve25519 til nøgleudveksling og BLAKE2s til hashing. Der er intet at konfigurere forkert og ingen ældre, svagere mulighed at falde tilbage til.

## Hvordan virker den?

Hver enhed har et nøglepar, ligesom SSH. Klienten og serveren kender hinandens offentlige nøgler på forhånd, og handshaket bygger på Noise-protokolrammeværket (protokolsiden nævner den præcise konstruktion, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Alle pakker sendes over UDP](https://www.wireguard.com/protocol/), og en ny session oprettes i én tur-retur.

Det design er grunden til, at WireGuard føles hurtig. Der er lidt at forhandle, koden kører inde i operativsystemets kerne på Linux, og skift mellem Wi-Fi og mobildata klares stille, fordi protokollen ikke holder en langvarig forbindelse åben.

## Hvorfor bliver WireGuard blokeret?

Den samme enkelhed, der gør WireGuard nem at gennemgå, gør den nem at genkende. Dens [whitepaper](https://www.wireguard.com/papers/wireguard.pdf) specificerer handshake-beskederne byte for byte, så den første pakke fra en klient altid er 148 byte, og svaret altid er 92 byte, og hver begynder med et fast felt for beskedtype. Et system til dyb pakkeinspektion (DPI) behøver kun en kort regel for at se det mønster på UDP.

Censorer har gjort præcis det. I august 2023 [rapporterede](https://github.com/net4people/bbs/issues/274) brugere i Rusland, at store mobiloperatører afbrød WireGuard-sessioner lige efter handshaket. Krypteringen beskyttede stadig indholdet, men selve forbindelsen var væk.

Det er et designkompromis, ikke en fejl. WireGuards forfattere valgte en fast, minimal protokol, og forklædning stod ikke på listen over mål. Projekter som [AmneziaWG](/vpn-protocols/amneziawg) ændrer pakkeformerne for at genskabe noget dække.

## Hvornår bør du bruge WireGuard?

- **Ufiltrerede netværk.** Hjemme, på arbejde eller på rejse i et land, der ikke blokerer VPN'er, er WireGuard svær at slå på hastighed og batteritid.
- **Selvhosting.** Hvis du kører din egen server, er WireGuard en af de nemmeste protokoller at sætte korrekt op.
- **Ikke under DPI-filtrering.** Hvis dit netværk blokerer VPN'er, passer en protokol, der er bygget til at ligne almindelig webtrafik, såsom [VLESS-Reality](/vpn-protocols/vless-reality), bedre. Vores sammenligning af [VLESS-Reality og WireGuard](/blog/vless-reality-vs-wireguard) gennemgår afvejningen mere detaljeret.

## Bruger Doppler WireGuard?

Nej. Dopplers apps forbinder via VLESS-Reality, fordi Doppler er bygget til netværk, hvor WireGuard filtreres. Guiden [hvorfor VLESS](/vpn-protocols/why-vless) forklarer begrundelsen.
