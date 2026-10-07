> **En resum.** Hysteria 2 és un protocol de proxy construït sobre QUIC, el transport que hi ha darrere de HTTP/3. Està pensat per a la velocitat en connexions dolentes i amb pèrdues, i per a qui no té la contrasenya el seu servidor es comporta com un lloc web HTTP/3 ordinari. El seu punt feble és que depèn d'UDP, que algunes xarxes alenteixen o bloquegen del tot.

## Què és Hysteria 2?

Hysteria és un projecte de codi obert d'[apernet](https://github.com/apernet/hysteria); la versió 2, un protocol redissenyat, es va publicar el setembre de 2023. Com Shadowsocks i VLESS, és un proxy i no una VPN clàssica, i els clients poden fer-hi passar tot un dispositiu.

## Com funciona?

Segons la seva [especificació del protocol](https://v2.hysteria.network/docs/developers/Protocol/), Hysteria 2 funciona sobre QUIC tal com el defineix [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), amb l'extensió de datagrames no fiables per al trànsit UDP. QUIC ja proporciona xifratge TLS 1.3, fluxos multiplexats i un establiment de connexió ràpid.

L'autenticació és on entra el camuflatge. L'especificació exigeix que un servidor Hysteria **implementi un servidor HTTP/3 real** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) i que tracti les peticions com ho faria qualsevol servidor web. Un client s'autentica amb una petició HTTP/3 especial; qualsevol altre, sigui un visitant curiós o una sonda activa, rep respostes web ordinàries. L'especificació diu que, per a un tercer sense credencials, el servidor es comporta igual que un servidor web HTTP/3 estàndard.

## Per què és ràpid?

QUIC funciona sobre UDP i es recupera de la pèrdua de paquets sense encallar tots els fluxos, com fa TCP. Hysteria també pot fer servir el seu propi control de congestió, pensat per a enllaços inestables, de manera que acostuma a mantenir la velocitat en xarxes mòbils congestionades, rutes de llarga distància i Wi-Fi amb interferències, allà on els protocols basats en TCP s'alenteixen.

## Com és de difícil bloquejar Hysteria 2?

Davant del sondeig actiu aguanta bé, perquè les sondes veuen un servidor web. L'exposició és el transport. Un censor pot alentir o bloquejar l'UDP, o QUIC en concret, sense trencar la majoria de llocs web, perquè els navegadors passen a HTTP/2 sobre TCP quan HTTP/3 falla. Allà on això passa, Hysteria 2 no té on anar, mentre que els protocols basats en TCP, com [VLESS-Reality](/vpn-protocols/vless-reality), continuen funcionant.

## Quan has de fer servir Hysteria 2?

- **En enllaços amb pèrdues o de llarga distància**, on el seu control de congestió i la recuperació de pèrdues de QUIC compensen.
- **En xarxes que permeten l'UDP.** Comprova-ho abans de refiar-te'n.
- Com a segon protocol al costat d'una opció TCP, per poder canviar quan es filtra l'UDP. La nostra [guia de censura](/bypass-censorship) explica com els filtres apunten als transports.

## Doppler fa servir Hysteria 2?

No. Doppler fa servir VLESS-Reality sobre TCP, que continua funcionant a les xarxes que bloquegen l'UDP. Mira [per què VLESS](/vpn-protocols/why-vless).
