> **De korte versie.** Trojan verstopt proxyverkeer in een echte TLS-verbinding met een echte website die jij beheert. Wie zonder het wachtwoord verbindt, krijgt gewoon de website. Het werkt goed, maar je hebt een eigen domein en certificaat nodig, en die kunnen worden gevonden en geblokkeerd.

## Wat is Trojan?

Trojan is een proxyprotocol van het [trojan-gfw-project](https://github.com/trojan-gfw/trojan), voor het eerst uitgebracht in oktober 2017. Het idee zit in de naam: in plaats van een vermomming te verzinnen, verstopt het zich in het meest voorkomende versleutelde verkeer op internet, HTTPS.

## Hoe werkt het?

De [protocolbeschrijving](https://trojan-gfw.github.io/trojan/protocol) is kort. Een Trojan-server luistert als een normale HTTPS-server, met een echt certificaat voor een echt domein. De client voert een echte TLS-handshake uit. Daarna stuurt hij, binnen de versleutelde verbinding:

- de hex-gecodeerde SHA-224-hash van het gedeelde wachtwoord, die 56 tekens lang is,
- een regeleinde,
- een klein verzoek dat zegt waar het verkeer naartoe moet, in een op SOCKS5 lijkend formaat,
- nog een regeleinde, gevolgd door het eerste stuk data.

Als de hash en het verzoek geldig zijn, opent de server een tunnel naar de bestemming. Als er iets niet klopt, behandelt de server de verbinding als "andere protocollen" en geeft die door aan een fallback-webserver, zodat de bezoeker een gewone website ziet.

## Hoe moeilijk is Trojan te blokkeren?

Van buiten is een Trojan-verbinding een TLS-sessie naar jouw domein, met jouw certificaat. Actieve probes krijgen een echte website terug. Dat maakt Trojan veel moeilijker uit het verkeer te pikken dan protocollen die willekeurig ogen, zoals [Shadowsocks](/vpn-protocols/shadowsocks).

Het zwakke punt is het domein zelf. Elke server heeft een domein en een certificaat nodig, en een censor die leert welke domeinen bij proxy's horen, kan ze op naam of op IP blokkeren. Onderzoekers hebben ook aangetoond dat TLS binnen TLS timing- en groottepatronen achterlaat die [aan een vingerafdruk te herkennen](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) zijn, wat Trojan en vergelijkbare ontwerpen raakt.

[VLESS-Reality](/vpn-protocols/vless-reality) haalt het domeinprobleem weg door de TLS-handshake van een bestaande, populaire website te lenen in plaats van die van jou.

## Wanneer gebruik je Trojan?

- **Als je een domein beheert** en een eenvoudige, goed begrepen opzet wilt die op HTTPS lijkt.
- **Op matig gefilterde netwerken** waar je domein waarschijnlijk geen doelwit wordt.
- Onze vergelijking van [VLESS, VMess en Trojan](/blog/vless-vs-vmess-vs-trojan) helpt als je ertussen moet kiezen.

## Gebruikt Doppler Trojan?

Nee. Doppler gebruikt VLESS-Reality, dat geen eigen domein nodig heeft. Zie [waarom VLESS](/vpn-protocols/why-vless).
