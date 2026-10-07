> **Den korte version.** Hysteria 2 er en proxyprotokol bygget på QUIC, transporten bag HTTP/3. Den er designet til hastighed på dårlige forbindelser med pakketab, og for alle uden adgangskoden opfører serveren sig som et almindeligt HTTP/3-website. Det svage punkt er, at den afhænger af UDP, som nogle netværk drosler eller blokerer helt.

## Hvad er Hysteria 2?

Hysteria er et open source-projekt fra [apernet](https://github.com/apernet/hysteria); version 2, en nydesignet protokol, blev udgivet i september 2023. Ligesom Shadowsocks og VLESS er den en proxy frem for en klassisk VPN, og klienter kan sende en hel enhed igennem den.

## Hvordan virker den?

Ifølge dens [protokolspecifikation](https://v2.hysteria.network/docs/developers/Protocol/) kører Hysteria 2 over QUIC som defineret i [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), med udvidelsen til upålidelige datagrammer til UDP-trafik. QUIC giver allerede TLS 1.3-kryptering, multipleksede streams og hurtig forbindelsesoprettelse.

Godkendelsen er der, hvor forklædningen kommer ind. Specifikationen kræver, at en Hysteria-server **skal implementere en rigtig HTTP/3-server** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) og behandle forespørgsler, som enhver webserver ville. En klient godkender sig med en særlig HTTP/3-forespørgsel; alle andre, hvad enten det er en nysgerrig besøgende eller en aktiv sonde, får almindelige websvar. Specifikationen fastslår, at serveren for en tredjepart uden legitimationsoplysninger opfører sig præcis som en almindelig HTTP/3-webserver.

## Hvorfor er den hurtig?

QUIC kører over UDP og kommer sig over pakketab uden at standse hver stream, sådan som TCP gør. Hysteria kan også bruge sin egen congestionskontrol, rettet mod ustabile forbindelser, så den som regel holder hastigheden på overbelastede mobilnetværk, langdistance-ruter og Wi-Fi med interferens, hvor TCP-baserede protokoller bliver langsommere.

## Hvor svær er Hysteria 2 at blokere?

Over for aktiv sondering holder den godt stand, da sonder ser en webserver. Det udsatte punkt er transporten. En censor kan drosle eller blokere UDP, eller QUIC specifikt, uden at ødelægge de fleste websites, fordi browsere falder tilbage til HTTP/2 over TCP, når HTTP/3 fejler. Hvor det sker, har Hysteria 2 ingen steder at gå hen, mens TCP-baserede protokoller som [VLESS-Reality](/vpn-protocols/vless-reality) bliver ved med at virke.

## Hvornår bør du bruge Hysteria 2?

- **Forbindelser med pakketab eller lang afstand**, hvor dens congestionskontrol og QUICs genopretning efter tab betaler sig.
- **Netværk, der tillader UDP.** Tjek det, før du stoler på den.
- Som en anden protokol ved siden af en TCP-mulighed, så du kan skifte, når UDP filtreres. Vores [censurguide](/bypass-censorship) gennemgår, hvordan filtre rammer transporter.

## Bruger Doppler Hysteria 2?

Nej. Doppler bruger VLESS-Reality over TCP, som bliver ved med at virke på netværk, der blokerer UDP. Se [hvorfor VLESS](/vpn-protocols/why-vless).
