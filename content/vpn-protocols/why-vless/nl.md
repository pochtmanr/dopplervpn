> **De korte versie.** We hebben Doppler gebouwd voor mensen op netwerken die VPN's blokkeren. Op die netwerken is de vraag niet welk protocol op papier het snelst is, maar welk er morgen nog verbonden is. We kozen VLESS met Reality omdat een censor er het minst aan herkent en er het minst mee kan blokkeren, en we accepteren de afwegingen die daarbij horen.

## Waarvoor kozen we?

Doppler is gebouwd voor mensen die verbinden vanuit plaatsen waar VPN's met opzet worden gefilterd: Rusland, Iran, China, delen van het Golfgebied. Op die netwerken is versleuteling het makkelijke deel. Elk protocol in onze [vergelijking](/vpn-protocols) versleutelt goed. Wat ze onderscheidt, is of een filtersysteem kan zien dat de verbinding een VPN is, en wat het kan blokkeren zodra het dat ziet.

Daarom beoordeelden we elke optie aan de hand van drie vragen:

1. **Heeft het een vaste vingerafdruk?** Een handshake met een vaste grootte of een standaardpoort is met één regel te herkennen.
2. **Wat gebeurt er als een censor de server aftast?** Firewalls maken zelf verbinding met verdachte proxy's om te zien hoe die reageren.
3. **Is er iets om op een blokkeerlijst te zetten?** Een domein, een certificaat of een herkenbare server is een doelwit, ook als het verkeer zelf goed verborgen is.

## Waarom niet WireGuard, OpenVPN of IKEv2?

Geen van de drie komt door de eerste vraag. De handshake-pakketten van [WireGuard](/vpn-protocols/wireguard) zijn altijd 148 en 92 bytes. [OpenVPN](/vpn-protocols/openvpn) werd in meer dan 85% van de stromen herkend door onderzoekers die binnen een echte provider werkten. [IKEv2](/vpn-protocols/ikev2) draait op standaard UDP-poorten die in hun geheel kunnen worden geblokkeerd. In augustus 2023 [meldden](https://github.com/net4people/bbs/issues/274) gebruikers in Rusland dat aanbieders WireGuard en OpenVPN al bij de eerste pakketten afkapten. Dit zijn goede protocollen voor open netwerken. Voor de onze zijn ze niet ontworpen.

## Waarom niet Shadowsocks of VMess?

Ze komen door de eerste vraag omdat ze op willekeurige bytes lijken, en dat bleek zelf een vingerafdruk. Sinds november 2021 heeft de Great Firewall [volledig versleuteld verkeer geblokkeerd](https://gfw.report/publications/usenixsecurity23/en/) dat op geen enkel bekend protocol lijkt. [VMess](/vpn-protocols/vmess) kan in TLS worden gewikkeld om dat te vermijden, maar dan is er een domein nodig, en dat brengt ons bij de derde vraag.

## Waarom niet Trojan?

[Trojan](/vpn-protocols/trojan) beantwoordt de eerste twee vragen goed: het is echte TLS, en probes zien een echte website. Maar elke Trojan-server heeft een eigen domein en certificaat nodig. Zodra een censor dat domein kent, kan die het blokkeren, en veel domeinen in de lucht houden is een voortdurende achtervolging.

## Wat klopt aan VLESS-Reality

[VLESS-Reality](/vpn-protocols/vless-reality) beantwoordt ze alle drie:

- **Geen vaste vingerafdruk.** De verbinding is TLS 1.3 over TCP, het meest voorkomende versleutelde verkeer op internet.
- **Probes zien een echte website.** Reality stuurt iedereen die zich niet kan authenticeren door naar de echte site waarvan het de handshake leent, met het echte certificaat van die site.
- **Niets van ons om op naam te blokkeren.** Er staat geen domein of certificaat van Doppler in de handshake.

Het draait ook over TCP, dus het blijft werken op netwerken die UDP afknijpen of blokkeren, waar [Hysteria 2](/vpn-protocols/hysteria2) en [AmneziaWG](/vpn-protocols/amneziawg) het moeilijk hebben. En VLESS zelf is klein: het leunt voor de versleuteling op TLS in plaats van een eigen laag toe te voegen, dus er is geen dubbele versleuteling.

## Wat we opgaven

- **Pure snelheid op verliesrijke verbindingen.** TCP herstelt minder soepel van pakketverlies dan QUIC of het UDP van WireGuard. Op een schone verbinding is het verschil klein; op een slechte kan het opvallen.
- **Ingebouwde ondersteuning van het besturingssysteem.** Geen enkel besturingssysteem levert een VLESS-client mee, dus je hebt een app nodig. We vonden dat aanvaardbaar en bouwden onze eigen apps voor iOS, Android, macOS en Windows.
- **Volledige onzichtbaarheid.** Die bestaat niet. Onderzoek heeft aangetoond dat [TLS binnen TLS een vingerafdruk kan krijgen](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), en in november 2025 werd van sommige Russische internetproviders [gemeld](https://github.com/net4people/bbs/issues/546) dat ze Reality-verbindingen afkapten. VLESS-Reality is een ontwerp voor censuurbestendigheid, geen garantie.

## Wat we doen aan de grenzen

Censuur verandert, dus de keuze van het protocol is niet het einde van het werk. We stellen serverinstellingen bij en de sites die Reality leent als de filtering verandert, en we blijven hetzelfde onderzoek en dezelfde meldingen uit de gemeenschap volgen die op deze pagina's worden aangehaald. Als er een betere aanpak komt, staat dat op deze pagina.

Voor het volledige technische verhaal van hoe VLESS-Reality werkt, lees [de VLESS-Reality-tunnel](/how-it-works/vless-reality-tunnel). Om het te proberen, zie [VLESS VPN](/vless-vpn).
