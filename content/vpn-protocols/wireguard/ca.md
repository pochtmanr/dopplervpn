> **En resum.** WireGuard és el protocol VPN habitual més ràpid i senzill, i en una xarxa sense filtrar és una opció excel·lent. Mai es va dissenyar per amagar que és una VPN, però, i a Rússia, l'Iran i la Xina és un dels primers protocols que es bloquegen.

## Què és WireGuard?

WireGuard és un protocol VPN escrit per Jason A. Donenfeld i publicat per primera vegada el 2015. L'objectiu era substituir els protocols grans i configurables anteriors per alguna cosa prou petita per auditar. El març de 2020 es va [incorporar al nucli Linux 5.6](https://en.wikipedia.org/wiki/WireGuard), i ara hi ha aplicacions oficials per a Windows, macOS, iOS, Android i Linux.

En lloc de deixar que cada banda negociï un conjunt de xifratge, WireGuard fixa un sol conjunt de primitives modernes. La [pàgina del protocol](https://www.wireguard.com/protocol/) les enumera: ChaCha20 amb Poly1305 per al xifratge, Curve25519 per a l'intercanvi de claus i BLAKE2s per al hash. No hi ha res que es pugui configurar malament ni cap opció més antiga i més feble a la qual tornar.

## Com funciona?

Cada dispositiu té un parell de claus, com en SSH. El client i el servidor es coneixen les claus públiques per endavant, i el handshake es basa en el marc del protocol Noise (la pàgina del protocol n'indica la construcció exacta, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Tots els paquets s'envien per UDP](https://www.wireguard.com/protocol/), i una sessió nova s'estableix en una sola anada i tornada.

Aquest disseny és el motiu pel qual WireGuard es percep ràpid. Hi ha poc a negociar, el codi s'executa dins del nucli del sistema operatiu a Linux, i el canvi entre Wi-Fi i dades mòbils es gestiona en silenci perquè el protocol no manté oberta una connexió de llarga durada.

## Per què es bloqueja WireGuard?

La mateixa simplicitat que fa WireGuard fàcil d'auditar el fa fàcil de reconèixer. El seu [llibre blanc](https://www.wireguard.com/papers/wireguard.pdf) especifica els missatges del handshake byte a byte, de manera que el primer paquet d'un client sempre fa 148 bytes i la resposta sempre en fa 92, i cadascun comença amb un camp fix de tipus de missatge. A un sistema d'inspecció profunda de paquets (DPI) només li cal una regla curta per detectar aquest patró a UDP.

Els censors ho han fet exactament així. L'agost de 2023, usuaris a Rússia [van informar](https://github.com/net4people/bbs/issues/274) que els grans operadors mòbils tallaven les sessions de WireGuard just després del handshake. El xifratge continuava protegint el contingut, però la connexió mateixa havia desaparegut.

Això és un compromís de disseny, no un error. Els autors de WireGuard van triar un protocol fix i mínim, i el camuflatge no era a la llista d'objectius. Projectes com [AmneziaWG](/vpn-protocols/amneziawg) canvien la forma dels paquets per recuperar part del camuflatge.

## Quan has de fer servir WireGuard?

- **Xarxes sense filtrar.** A casa, a la feina o de viatge en un país que no bloqueja les VPN, WireGuard és difícil de superar en velocitat i durada de la bateria.
- **Servidor propi.** Si gestiones el teu propi servidor, WireGuard és un dels protocols més fàcils de configurar correctament.
- **No sota filtratge DPI.** Si la teva xarxa bloqueja les VPN, encaixa millor un protocol fet per semblar trànsit web ordinari, com [VLESS-Reality](/vpn-protocols/vless-reality). La nostra comparació de [VLESS-Reality i WireGuard](/blog/vless-reality-vs-wireguard) explica el compromís amb més detall.

## Doppler fa servir WireGuard?

No. Les aplicacions de Doppler es connecten per VLESS-Reality, perquè Doppler està fet per a xarxes on es filtra WireGuard. La guia [per què VLESS](/vpn-protocols/why-vless) n'explica el raonament.
