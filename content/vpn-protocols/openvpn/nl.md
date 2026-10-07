> **De korte versie.** OpenVPN is de veteraan onder de opensource-VPN's: flexibel, breed ondersteund en na meer dan twee decennia goed begrepen. Het is ook trager dan nieuwere protocollen en, volgens gepubliceerd onderzoek, een van de makkelijkste voor een provider om aan de vorm te herkennen.

## Wat is OpenVPN?

OpenVPN is gratis, opensource VPN-software, voor het eerst uitgebracht door James Yonan [in mei 2001](https://en.wikipedia.org/wiki/OpenVPN). Het grootste deel van de jaren 2000 en 2010 was het de standaardkeuze voor commerciële VPN-diensten en zakelijke toegang op afstand, en het zit nog steeds in veel routers en bedrijfsproducten.

Het draait in gebruikersruimte en niet in de kernel van het besturingssysteem, en het leunt op de OpenSSL-bibliotheek en het TLS-protocol voor de sleuteluitwisseling. De door IANA toegewezen poort is 1194, al kan OpenVPN over UDP of TCP op bijna elke poort draaien.

## Hoe werkt het?

OpenVPN gebruikt een eigen protocol met twee delen. Een besturingskanaal gebruikt TLS om beide kanten te authenticeren, meestal met certificaten, en om sleutels af te spreken. Een gegevenskanaal vervoert daarna je verkeer, versleuteld met die sleutels, in UDP- of TCP-pakketten.

Die opbouw maakt OpenVPN heel instelbaar. Je kunt ciphers, authenticatiemethoden, poorten en transporten kiezen, en het via proxy's laten lopen. De prijs van die flexibiliteit is complexiteit: meer code, meer instellingen en meer manieren om op een zwakke configuratie uit te komen.

## Waarom wordt OpenVPN geblokkeerd?

TLS binnen OpenVPN is niet hetzelfde als een HTTPS-bezoek aan een website. OpenVPN wikkelt zijn TLS-handshake in een eigen pakketindeling, dus het verkeer heeft een vorm die gewoon webverkeer niet heeft.

Onderzoekers hebben gemeten hoeveel dat uitmaakt. Een team van de University of Michigan en anderen [bouwden een vingerafdruksysteem](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) en lieten het draaien bij een provider met ongeveer een miljoen gebruikers. Het herkende **meer dan 85% van de OpenVPN-stromen** met heel weinig fout-positieven, en het ving ook de meeste commerciële "vermomde" OpenVPN-opstellingen die ze testten.

Filtering in de praktijk volgt het onderzoek. In augustus 2023 [meldden](https://github.com/net4people/bbs/issues/274) gebruikers in Rusland dat mobiele aanbieders OpenVPN-verbindingen kort na de start afkapten.

## Wanneer gebruik je OpenVPN?

- **Compatibiliteit.** Oudere routers, zakelijke gateways en sommige bedrijfsnetwerken ondersteunen OpenVPN en niets nieuwers.
- **Netwerken met alleen TCP.** OpenVPN kan over TCP draaien wanneer UDP is geblokkeerd, wat [WireGuard](/vpn-protocols/wireguard) niet kan zonder hulp.
- **Niet op gefilterde netwerken.** Waar VPN's worden geblokkeerd, valt OpenVPN meestal vroeg uit. Een protocol dat gewoon webverkeer nabootst, zoals [VLESS-Reality](/vpn-protocols/vless-reality), is het betere middel. Onze [censuurgids](/bypass-censorship) legt uit hoe filtersystemen beslissen wat ze afkappen.

## Gebruikt Doppler OpenVPN?

Nee. Doppler gebruikt VLESS-Reality op elk platform. De gids [waarom VLESS](/vpn-protocols/why-vless) legt uit hoe we het hebben gekozen.
