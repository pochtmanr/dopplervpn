> **Den korte version.** VLESS er en minimal proxyprotokol fra Xray-projektet. Reality er det TLS-lag, der får en VLESS-forbindelse til at ligne et almindeligt TLS 1.3-besøg på et rigtigt, populært website, uden et domæne eller certifikat, der er dit eget. Sammen er de i øjeblikket den sværeste udbredte kombination for censorer at blokere. Denne side er oversigten; vores [dybdegående guide](/how-it-works/vless-reality-tunnel) har den fulde gennemgang.

## Hvad er VLESS?

VLESS blev [foreslået i juli 2020](https://github.com/v2ray/v2ray-core/issues/2636) som en lettere efterfølger til [VMess](/vpn-protocols/vmess). Dens [specifikation](https://xtls.github.io/en/development/protocols/vless.html) er bevidst lille: en protokolversion, et UUID på 16 byte, der identificerer brugeren, et valgfrit add-ons-felt og kommandoen, porten og adressen på destinationen. VLESS har ingen kryptering i sig selv. Den bygger på TLS-laget nedenunder, så trafikken ikke krypteres to gange.

VLESS er en del af [Xray-core](https://github.com/XTLS/Xray-core), projektet der udskilte sig fra V2Ray i november 2020 og nu står for udviklingen af denne protokolfamilie.

## Hvad tilføjer Reality?

Protokoller som [Trojan](/vpn-protocols/trojan) skjuler sig i TLS til dit eget domæne, og det domæne bliver det, en censor kan blokere. [Reality](https://github.com/XTLS/REALITY), udgivet i Xray-core [1.8.0 i marts 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), fjerner det.

En Reality-server viser TLS-handshaket fra et rigtigt tredjepartswebsite. For en iagttager er forbindelsen et normalt TLS 1.3-besøg på det site. En klient, der kender serverens nøgle, lukkes igennem til VLESS-tunnelen; alle andre, inklusive en censors aktive sonde, sendes videre til det rigtige website og ser dets ægte certifikat. Der er intet Doppler-domæne eller -certifikat at sætte på en blokeringsliste.

## Hvor svær er VLESS-Reality at blokere?

Det er den mest modstandsdygtige udbredte mulighed, vi kender, men den er ikke usynlig. Forskning offentliggjort i 2024 viste, at [TLS båret inde i TLS kan fingeraftrykkes](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) ud fra timing og pakkestørrelser, og i november 2025 [rapporterede](https://github.com/net4people/bbs/issues/546) brugere, at nogle russiske internetudbydere afbrød Reality-forbindelser. Udbydere svarer ved at justere serverindstillinger og de sites, de låner, og katten og musen fortsætter.

## Hvor hurtig er den?

I daglig brug er overheaden lille. VLESS-headeren sendes én gang pr. forbindelse, og XTLS Vision-flowet undgår at kryptere allerede krypteret webtrafik en gang til. Fordi den kører over TCP, kan VLESS-Reality være langsommere end UDP-protokoller som [WireGuard](/vpn-protocols/wireguard) på netværk med pakketab, men den bliver ved med at virke, hvor de er blokeret.

## Hvor kan jeg læse mere?

- [VLESS-Reality-tunnelen i dybden](/how-it-works/vless-reality-tunnel): historie, mekanisme, grænser.
- [Hvad er VLESS?](/blog/what-is-vless) og [VLESS-URI-formatet](/blog/vless-uri-format) på vores blog.
- [VLESS VPN](/vless-vpn): hvordan Doppler pakker VLESS-Reality ind i apps med ét tryk.
