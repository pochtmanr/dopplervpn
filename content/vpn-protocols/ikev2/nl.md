> **De korte versie.** IKEv2/IPsec is de VPN die je telefoon en laptop al kunnen spreken, zonder enige app. Het is snel en gaat goed om met wisselen tussen wifi en mobiele data. Het draait ook op vaste, bekende poorten, waardoor het een van de eenvoudigste protocollen is voor een censor om te blokkeren.

## Wat is IKEv2/IPsec?

"IKEv2" is eigenlijk twee delen die samenwerken. IPsec is de suite die IP-pakketten versleutelt en authenticeert. IKE, de Internet Key Exchange, is het protocol waarmee beide kanten elkaar authenticeren en IPsec-sleutels afspreken. Versie 2 van IKE is [in december 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange) gestandaardiseerd, en de huidige specificatie is [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Omdat het een IETF-standaard is, zit IKEv2 ingebouwd in iOS, macOS en Windows, en in Android sinds versie 11. Veel zakelijke VPN-gateways gebruiken het.

## Hoe werkt het?

De sleuteluitwisseling gaat over UDP, [meestal op poort 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Zodra beide kanten het eens zijn over de sleutels, versleutelt de IPsec-stack van het besturingssysteem je verkeer met de Encapsulating Security Payload (ESP). Als er een NAT-router tussen zit, zoals op bijna elk thuis- en mobiel netwerk, worden zowel IKE als ESP ingepakt in UDP op poort 4500.

IKEv2 heeft een standaardextensie, [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), waarmee een verbinding een wijziging van het IP-adres overleeft. Daarom is IKEv2 prettig op telefoons: loop je buiten het wifibereik en schakel je over op mobiele data, dan loopt de tunnel door in plaats van opnieuw te beginnen.

## Waarom is IKEv2 makkelijk te blokkeren?

IKEv2 doet geen poging om op iets anders te lijken. Het verkeer gebruikt bekende UDP-poorten en heeft de standaardformaten van IKE en ESP, die elke netwerktool kan ontleden. Blokkeren vereist niet eens deep packet inspection: een filter kan UDP-poorten 500 en 4500 laten vallen, of de IKE-uitwisseling direct herkennen.

Dat is een redelijke afweging voor bedrijfsnetwerken en reizen in open landen, waar herkenning als VPN niets kost. Op netwerken die VPN's met opzet filteren, is het meestal het eerste dat stopt met werken.

## Wanneer gebruik je IKEv2?

- **Geen app toegestaan.** Op een beheerd apparaat waarop je geen software mag installeren, kan de ingebouwde IKEv2-client de enige optie zijn.
- **Wisselen van netwerk op open verbindingen.** MOBIKE maakt het soepel als je tussen netwerken wisselt.
- **Niet onder censuur.** Op gefilterde netwerken kies je een protocol dat is ontworpen om op te gaan in gewoon verkeer, zoals [VLESS-Reality](/vpn-protocols/vless-reality). Onze [censuurgids](/bypass-censorship) legt uit hoe blokkeren werkt.

## Gebruikt Doppler IKEv2?

Nee. Doppler verbindt met VLESS-Reality in zijn eigen apps. Zie [waarom VLESS](/vpn-protocols/why-vless) voor de redenen.
