> **En resum.** Shadowsocks és un proxy xifrat i lleuger, creat a la Xina per travessar el Gran Tallafoc. Durant anys va funcionar perquè no s'assemblava a res. Des del 2021, la recerca mostra que el tallafoc bloqueja exactament aquest tipus de trànsit, perquè el trànsit real rarament és tan aleatori.

## Què és Shadowsocks?

Shadowsocks és un protocol de proxy de codi obert, publicat per primera vegada [l'abril de 2012](https://en.wikipedia.org/wiki/Shadowsocks). En sentit estricte no és una VPN: és un proxy a l'estil SOCKS5 amb xifratge, i les aplicacions decideixen quin trànsit hi envien. A la pràctica, la majoria de clients Shadowsocks ofereixen ara un mode per a tot el sistema que es comporta com una VPN.

És popular perquè és senzill i ràpid. Les versions actuals fan servir [xifrats AEAD](https://shadowsocks.org/doc/aead.html), que donen confidencialitat, integritat i autenticitat en un sol pas, i l'[edició del 2022](https://shadowsocks.org/doc/sip022.html) del protocol va reforçar la protecció contra la repetició.

## Com funciona?

El client i el servidor comparteixen una contrasenya, que es converteix en una clau de xifratge. Tot el que envia el client, inclosa l'adreça del lloc web que vol, està xifrat des del primer byte. No hi ha un handshake reconeixible, ni un certificat, ni una capçalera en clar. Per a un observador, una connexió Shadowsocks és un flux de bytes d'aspecte aleatori.

## Com detecta el Gran Tallafoc Shadowsocks?

Primer, amb sondeig actiu. Investigadors de GFW Report [van registrar](https://gfw.report/publications/imc20/en/) el tallafoc enviant desenes de milers de sondes a servidors Shadowsocks sospitosos, reproduint i alterant connexions reals per veure com reaccionava el servidor.

Després, a partir del novembre de 2021, amb un mètode més groller i més ampli. Un [estudi de l'USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) va trobar que el tallafoc bloqueja en temps real el trànsit «totalment xifrat». Mira el primer paquet d'una connexió i deixa passar tot el que sembla un protocol conegut o conté prou text imprimible. Una regla mesura el nombre mitjà de bits a 1 per byte: els valors iguals o inferiors a 3.4, o iguals o superiors a 4.6, queden exempts, i les dades d'aspecte aleatori que queden al mig, no. El que queda es pot bloquejar.

Els investigadors també van trobar que el tallafoc ho aplicava a prop del 26% de les connexions, i només a rangs d'IP de centres de dades populars, probablement per limitar els danys col·laterals. La lliçó per a qui dissenya protocols va ser clara: semblar aleatori ja és una empremta.

## Quan has de fer servir Shadowsocks?

- **Per a un proxy lleuger i ràpid** en xarxes que no inspeccionen el trànsit de prop.
- **Per a un servidor propi**, amb eines com Outline, que fan que la configuració sigui senzilla.
- **Amb cura sota un filtratge intens.** A la Xina i en altres llocs que bloquegen el trànsit totalment xifrat, Shadowsocks és molt menys fiable que els protocols que imiten TLS real, com [VLESS-Reality](/vpn-protocols/vless-reality). La nostra [història dels protocols de censura](/blog/censorship-protocol-history) explica com ha evolucionat aquest camp.

## Doppler fa servir Shadowsocks?

No. Doppler fa servir VLESS-Reality, pels motius que explica [per què VLESS](/vpn-protocols/why-vless).
