> **Den korte version.** VMess er den oprindelige protokol i V2Ray-projektet. Den krypterer sine egne headere og pakkes som regel ind i en anden transport, for eksempel WebSocket over TLS, så den ligner webtrafik. Den virker stadig, men efterfølgerne VLESS og Trojan løser den samme opgave med mindre overhead.

## Hvad er VMess?

VMess er den krypterede proxyprotokol, som [V2Ray-projektet](https://github.com/v2fly/v2ray-core) introducerede, da det startede i 2015. V2Ray voksede til en modulær platform til at bygge proxyer: én kerne, mange protokoller og transporter og en routingmotor, der afgør, hvilken trafik der går hvorhen. VMess var dens første protokol og i flere år den vigtigste.

Ligesom Shadowsocks er VMess teknisk set en proxy frem for en VPN, men apps baseret på V2Ray kan sende hele enheden igennem den.

## Hvordan virker den?

Hver bruger har et UUID, der fungerer som legitimationsoplysning. Ifølge [protokoldokumentationen](https://www.v2fly.org/en_US/developer/protocols/vmess.html) indeholder klientens forespørgselsheader et krypteret godkendelses-id bygget af et Unix-tidsstempel, et tilfældigt tal og en kontrolsum, krypteret med en nøgle udledt af brugerens id. Serveren bruger det til at genkende brugeren og dekrypterer derefter resten af headeren og dataene.

Dokumentationen beskriver to måder at beskytte headeren på. Den moderne bruger AEAD-kryptering, som garanterer, at headeren ikke er ændret. Den ældre brugte MD5 og AES-128-CFB og kunne ikke garantere headerens integritet; dokumentationen advarer mod den. Fordi godkendelses-id'et indeholder et tidsstempel, skal klientens og serverens ure være nogenlunde synkroniserede, en almindelig kilde til problemer af typen "den vil bare ikke oprette forbindelse".

## Hvor svær er VMess at blokere?

I sig selv ligner VMess tilfældige byte, hvilket stiller den det samme sted som [Shadowsocks](/vpn-protocols/shadowsocks): udsat for firewalls, der blokerer fuldt krypteret trafik. Derfor udrulles VMess som regel inde i WebSocket eller gRPC over TLS, bag et domæne og et certifikat, så en iagttager ser noget, der ligner en normal HTTPS-forbindelse til et website.

Den indpakning gør det meste af arbejdet med at skjule trafikken, og den har omkostninger: du skal bruge et domæne, et certifikat og ofte et CDN foran serveren, og serveren krypterer nu data to gange, én gang for TLS og én gang for VMess.

## VMess, VLESS eller Trojan?

[VLESS](/vpn-protocols/vless-reality) blev designet af Xray-projektet som en lettere efterfølger: den beholder identiteten baseret på UUID, men dropper VMess' egen kryptering og bygger helt på TLS-laget, hvilket undgår dobbelt kryptering. [Trojan](/vpn-protocols/trojan) bruger en lignende tilgang med en adgangskode i stedet for et UUID. Vores sammenligning af [VLESS, VMess og Trojan](/blog/vless-vs-vmess-vs-trojan) går i detaljer.

## Bruger Doppler VMess?

Nej. Doppler bruger VLESS med Reality. Guiden [hvorfor VLESS](/vpn-protocols/why-vless) forklarer hvorfor.
