> **En resum.** OpenVPN és el veterà de les VPN de codi obert: flexible, molt compatible i ben conegut després de més de dues dècades. També és més lent que els protocols més nous i, segons la recerca publicada, un dels més fàcils d'identificar per empremta per a un proveïdor d'internet.

## Què és OpenVPN?

OpenVPN és programari VPN gratuït i de codi obert, publicat per primera vegada per James Yonan [el maig de 2001](https://en.wikipedia.org/wiki/OpenVPN). Durant la major part de la dècada del 2000 i la del 2010 va ser l'opció per defecte dels serveis VPN comercials i de l'accés remot corporatiu, i encara s'inclou en molts encaminadors i productes d'empresa.

S'executa en espai d'usuari, i no al nucli del sistema operatiu, i es basa en la biblioteca OpenSSL i el protocol TLS per a l'intercanvi de claus. El port assignat per l'IANA és el 1194, tot i que OpenVPN pot funcionar per UDP o TCP en gairebé qualsevol port.

## Com funciona?

OpenVPN fa servir un protocol propi amb dues parts. Un canal de control fa servir TLS per autenticar les dues bandes, normalment amb certificats, i per acordar les claus. Després, un canal de dades transporta el teu trànsit, xifrat amb aquestes claus, dins de paquets UDP o TCP.

Aquesta estructura fa que OpenVPN sigui molt configurable. Pots triar xifrats, mètodes d'autenticació, ports i transports, i fer-lo passar per proxies. El cost d'aquesta flexibilitat és la complexitat: més codi, més paràmetres i més maneres d'acabar amb una configuració feble.

## Per què es bloqueja OpenVPN?

El TLS dins d'OpenVPN no és el mateix que una visita HTTPS a un lloc web. OpenVPN embolcalla el seu handshake TLS en el seu propi format de paquets, de manera que el seu trànsit té una forma que el trànsit web ordinari no té.

Uns investigadors van mesurar fins a quin punt això importa. Un equip de la Universitat de Michigan i d'altres [va construir un sistema d'identificació per empremta](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) i el va executar dins d'un proveïdor d'internet que dona servei a prop d'un milió d'usuaris. Va identificar **més del 85% dels fluxos d'OpenVPN** amb molt pocs falsos positius, i també va detectar la majoria de les configuracions comercials d'OpenVPN «ofuscades» que van provar.

El filtratge real segueix la recerca. L'agost de 2023, usuaris a Rússia [van informar](https://github.com/net4people/bbs/issues/274) que els operadors mòbils tallaven les connexions OpenVPN poc després que comencessin.

## Quan has de fer servir OpenVPN?

- **Compatibilitat.** Els encaminadors antics, les passarel·les d'empresa i algunes xarxes corporatives admeten OpenVPN i res de més nou.
- **Xarxes només amb TCP.** OpenVPN pot funcionar per TCP quan l'UDP està bloquejat, cosa que [WireGuard](/vpn-protocols/wireguard) no pot fer sense ajuda.
- **No en xarxes filtrades.** Allà on es bloquegen les VPN, OpenVPN acostuma a fallar aviat. Un protocol que imita el trànsit web normal, com [VLESS-Reality](/vpn-protocols/vless-reality), és l'eina més adequada. La nostra [guia de censura](/bypass-censorship) explica com els sistemes de filtratge decideixen què tallar.

## Doppler fa servir OpenVPN?

No. Doppler fa servir VLESS-Reality a totes les plataformes. La guia [per què VLESS](/vpn-protocols/why-vless) explica com el vam triar.
