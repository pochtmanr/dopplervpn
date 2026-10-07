> **Den korte version.** AmneziaWG er en fork af WireGuard, der beholder hastigheden og kryptografien, men ændrer de pakkeformer og headere, der gør WireGuard let at få øje på. Den er et stærkt valg, hvor almindelig WireGuard er blokeret, med én hage: den taler ikke længere med almindelige WireGuard-servere, når obfuskeringen er slået til.

## Hvad er AmneziaWG?

AmneziaWG udvikles af holdet bag [Amnezia VPN](https://amnezia.org/), en open source-app til at køre din egen VPN-server. Projektets [Go-implementering](https://github.com/amnezia-vpn/amneziawg-go) blev startet i 2023. Den tager [WireGuard](/vpn-protocols/wireguard), som er hurtig og enkel, men har et fast, genkendeligt handshake, og tilføjer et lag, der forklæder den.

## Hvad ændrer den?

[AmneziaWG-dokumentationen](https://docs.amnezia.org/documentation/amnezia-wg/) beskriver flere mekanismer, hver styret af konfigurationsparametre:

- **Dynamiske headere (H1–H4).** Almindelige WireGuard-pakker starter med en fast beskedtype for hvert af de fire pakkeformater. AmneziaWG erstatter de værdier med tal valgt fra konfigurerede intervaller, så to forskellige opsætninger ikke deler headere, og ingen enkelt filterregel matcher dem alle.
- **Tilfældig pakkelængde (S1–S4).** I WireGuard er den første handshake-pakke altid præcis 148 byte. AmneziaWG tilføjer tilfældige præfikser til hver pakketype, så størrelserne varierer.
- **Junkpakker (Jc, Jmin, Jmax).** Før handshaket sender klienten et konfigurerbart antal pseudotilfældige pakker af tilfældig længde, som slører starten af sessionen i både tid og størrelse.
- **Headerbeskyttelse.** Nyere versioner kan også kryptere selve feltet for beskedtype.

Under det er kryptografien og det samlede design stadig WireGuards.

## Hvor svær er AmneziaWG at blokere?

Den fjerner de enkle signaturer, som filtre bruger mod WireGuard: faste størrelser og faste headerværdier. Det gør den langt mere modstandsdygtig end almindelig WireGuard på netværk, der blokerer VPN'er.

Den kører stadig over UDP, så netværk, der drosler eller blokerer UDP bredt, vil påvirke den, og dens trafik efterligner ikke nogen bestemt applikation, sådan som [VLESS-Reality](/vpn-protocols/vless-reality) efterligner et TLS-besøg på et rigtigt website. Et filter, der blokerer uigenkendeligt UDP direkte, kan stadig fange den.

## Hvornår bør du bruge AmneziaWG?

- **Hvor WireGuard er blokeret**, men UDP stadig virker, og du vil have hastighed i stil med WireGuard.
- **Selvhostede servere**, med Amnezia VPN-appen til at sætte dem op.
- Behold en TCP-baseret mulighed, såsom VLESS-Reality, til netværk, der filtrerer UDP. Vores [guide til Rusland](/vpn-for-russia) gennemgår, hvad der i øjeblikket slipper igennem der.

## Bruger Doppler AmneziaWG?

Nej. Doppler bruger VLESS-Reality. Se [hvorfor VLESS](/vpn-protocols/why-vless).
