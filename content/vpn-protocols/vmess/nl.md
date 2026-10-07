> **De korte versie.** VMess is het oorspronkelijke protocol van het V2Ray-project. Het versleutelt zijn eigen headers en wordt meestal in een ander transport gewikkeld, zoals WebSocket over TLS, om op webverkeer te lijken. Het werkt nog, maar de opvolgers VLESS en Trojan doen hetzelfde werk met minder overhead.

## Wat is VMess?

VMess is het versleutelde proxyprotocol dat het [V2Ray-project](https://github.com/v2fly/v2ray-core) introduceerde toen het in 2015 begon. V2Ray groeide uit tot een modulair platform om proxy's te bouwen: één kern, veel protocollen en transporten, en een routeringsengine die beslist welk verkeer waarheen gaat. VMess was het eerste protocol en enkele jaren het belangrijkste.

Net als Shadowsocks is VMess technisch een proxy en geen VPN, maar apps op basis van V2Ray kunnen je hele apparaat erdoorheen sturen.

## Hoe werkt het?

Elke gebruiker heeft een UUID die als legitimatie dient. Volgens de [protocoldocumentatie](https://www.v2fly.org/en_US/developer/protocols/vmess.html) bevat de verzoekheader van de client een versleutelde authenticatie-ID, opgebouwd uit een Unix-tijdstempel, een willekeurig getal en een checksum, versleuteld met een sleutel die van het gebruikers-ID is afgeleid. De server gebruikt die om de gebruiker te herkennen en ontsleutelt daarna de rest van de header en de data.

De documentatie beschrijft twee manieren om de header te beschermen. De moderne gebruikt AEAD-versleuteling, die garandeert dat de header niet is gewijzigd. De oudere gebruikte MD5 en AES-128-CFB en kon de integriteit van de header niet garanderen; de documentatie raadt die af. Omdat de authenticatie-ID een tijdstempel bevat, moeten de klokken van client en server ongeveer gelijk lopen, een veelvoorkomende bron van "hij verbindt gewoon niet"-problemen.

## Hoe moeilijk is VMess te blokkeren?

Op zichzelf lijkt VMess op willekeurige bytes, en daardoor staat het in dezelfde positie als [Shadowsocks](/vpn-protocols/shadowsocks): blootgesteld aan firewalls die volledig versleuteld verkeer blokkeren. Daarom wordt VMess meestal ingezet in WebSocket of gRPC over TLS, achter een domein en een certificaat, zodat een waarnemer iets ziet dat op een normale HTTPS-verbinding met een website lijkt.

Die wikkel doet het meeste werk om het verkeer te verbergen, en brengt kosten mee: je hebt een domein, een certificaat en vaak een CDN vóór de server nodig, en de server versleutelt de data nu twee keer, een keer voor TLS en een keer voor VMess.

## VMess, VLESS of Trojan?

[VLESS](/vpn-protocols/vless-reality) is door het Xray-project ontworpen als lichtere opvolger: het houdt de identiteit op basis van een UUID, laat de eigen versleuteling van VMess vallen en leunt volledig op de TLS-laag, zodat verkeer niet twee keer wordt versleuteld. [Trojan](/vpn-protocols/trojan) volgt een vergelijkbare aanpak, met een wachtwoord in plaats van een UUID. Onze vergelijking van [VLESS, VMess en Trojan](/blog/vless-vs-vmess-vs-trojan) gaat op de details in.

## Gebruikt Doppler VMess?

Nee. Doppler gebruikt VLESS met Reality. De gids [waarom VLESS](/vpn-protocols/why-vless) legt uit waarom.
