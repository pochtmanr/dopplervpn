> **De korte versie.** VLESS is een minimaal proxyprotocol van het Xray-project. Reality is de TLS-laag die een VLESS-verbinding laat lijken op een gewoon bezoek via TLS 1.3 aan een echte, populaire website, zonder eigen domein of certificaat. Samen zijn ze nu de moeilijkste gangbare combinatie voor censors om te blokkeren. Deze pagina is de samenvatting; onze [uitgebreide gids](/how-it-works/vless-reality-tunnel) heeft het volledige verhaal.

## Wat is VLESS?

VLESS is [in juli 2020 voorgesteld](https://github.com/v2ray/v2ray-core/issues/2636) als lichtere opvolger van [VMess](/vpn-protocols/vmess). De [specificatie](https://xtls.github.io/en/development/protocols/vless.html) is bewust klein: een protocolversie, een UUID van 16 bytes die de gebruiker identificeert, een optioneel add-ons-veld, en het commando, de poort en het adres van de bestemming. VLESS heeft geen eigen versleuteling. Het leunt op de TLS-laag eronder, zodat verkeer niet twee keer wordt versleuteld.

VLESS hoort bij [Xray-core](https://github.com/XTLS/Xray-core), het project dat zich in november 2020 van V2Ray afsplitste en nu de ontwikkeling van deze protocolfamilie leidt.

## Wat voegt Reality toe?

Protocollen zoals [Trojan](/vpn-protocols/trojan) verstoppen zich in TLS naar je eigen domein, en dat domein wordt wat een censor kan blokkeren. [Reality](https://github.com/XTLS/REALITY), uitgebracht in Xray-core [1.8.0 in maart 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), haalt dat weg.

Een Reality-server presenteert de TLS-handshake van een echte website van een derde. Voor een waarnemer is de verbinding een normaal bezoek via TLS 1.3 aan die site. Een client die de sleutel van de server kent, wordt doorgelaten naar de VLESS-tunnel; iedereen anders, ook een actieve probe van een censor, wordt doorgestuurd naar de echte website en ziet het echte certificaat daarvan. Er is geen domein of certificaat van Doppler om op een blokkeerlijst te zetten.

## Hoe moeilijk is VLESS-Reality te blokkeren?

Het is de meest weerbare gangbare optie die we kennen, maar het is niet onzichtbaar. Onderzoek uit 2024 toonde aan dat [TLS binnen TLS een vingerafdruk kan krijgen](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) door timing en pakketgroottes, en in november 2025 [meldden](https://github.com/net4people/bbs/issues/546) gebruikers dat sommige Russische internetproviders Reality-verbindingen afkapten. Aanbieders reageren door de serverinstellingen en de sites die ze lenen bij te stellen, en het kat-en-muisspel gaat door.

## Hoe snel is het?

In dagelijks gebruik is de overhead klein. De VLESS-header wordt één keer per verbinding verstuurd, en de XTLS Vision-flow voorkomt dat al versleuteld webverkeer een tweede keer wordt versleuteld. Omdat het over TCP draait, kan VLESS-Reality op verliesrijke netwerken trager zijn dan UDP-protocollen zoals [WireGuard](/vpn-protocols/wireguard), maar het blijft werken waar die worden geblokkeerd.

## Waar kan ik meer lezen?

- [De VLESS-Reality-tunnel, in detail](/how-it-works/vless-reality-tunnel): geschiedenis, mechanisme, grenzen.
- [Wat is VLESS?](/blog/what-is-vless) en [het VLESS-URI-formaat](/blog/vless-uri-format) op onze blog.
- [VLESS VPN](/vless-vpn): hoe Doppler VLESS-Reality verpakt in apps die met één tik verbinden.
