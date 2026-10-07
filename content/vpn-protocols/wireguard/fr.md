> **En bref.** WireGuard est le protocole VPN grand public le plus rapide et le plus simple, et sur un réseau non filtré c'est un excellent choix. Il n'a cependant jamais été conçu pour cacher qu'il s'agit d'un VPN, et en Russie, en Iran et en Chine il figure parmi les premiers protocoles bloqués.

## Qu'est-ce que WireGuard ?

WireGuard est un protocole VPN écrit par Jason A. Donenfeld et publié pour la première fois en 2015. Son but était de remplacer les protocoles volumineux et configurables qui l'ont précédé par quelque chose d'assez petit pour être audité. En mars 2020, il a été [intégré au noyau Linux 5.6](https://en.wikipedia.org/wiki/WireGuard), et il existe aujourd'hui des applications officielles pour Windows, macOS, iOS, Android et Linux.

Au lieu de laisser chaque partie négocier une suite de chiffrement, WireGuard impose un seul ensemble de primitives modernes. Sa [page de présentation du protocole](https://www.wireguard.com/protocol/) les énumère : ChaCha20 avec Poly1305 pour le chiffrement, Curve25519 pour l'échange de clés et BLAKE2s pour le hachage. Il n'y a rien à mal configurer et aucune option plus ancienne et plus faible vers laquelle se replier.

## Comment fonctionne-t-il ?

Chaque appareil possède une paire de clés, un peu comme avec SSH. Le client et le serveur connaissent à l'avance leurs clés publiques respectives, et la poignée de main repose sur le cadre du protocole Noise (la page du protocole indique la construction exacte, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Tous les paquets sont envoyés en UDP](https://www.wireguard.com/protocol/), et une nouvelle session s'établit en un seul aller-retour.

C'est cette conception qui rend WireGuard rapide. Il y a peu de choses à négocier, le code s'exécute dans le noyau du système d'exploitation sous Linux, et le passage du Wi-Fi aux données mobiles se fait discrètement, car le protocole ne maintient pas de connexion ouverte sur la durée.

## Pourquoi WireGuard est-il bloqué ?

La simplicité qui rend WireGuard facile à auditer le rend aussi facile à reconnaître. Son [livre blanc](https://www.wireguard.com/papers/wireguard.pdf) spécifie les messages de la poignée de main octet par octet : le premier paquet d'un client fait donc toujours 148 octets et la réponse toujours 92 octets, chacun commençant par un champ de type de message fixe. Un système d'inspection approfondie des paquets (DPI) n'a besoin que d'une courte règle pour repérer ce schéma sur UDP.

Les censeurs ont fait exactement cela. En août 2023, des utilisateurs en Russie ont [signalé](https://github.com/net4people/bbs/issues/274) que de grands opérateurs mobiles coupaient les sessions WireGuard juste après la poignée de main. Le chiffrement protégeait toujours le contenu, mais la connexion elle-même avait disparu.

Il s'agit d'un compromis de conception, pas d'un bogue. Les auteurs de WireGuard ont choisi un protocole fixe et minimal, et la dissimulation ne figurait pas parmi leurs objectifs. Des projets comme [AmneziaWG](/vpn-protocols/amneziawg) modifient la forme des paquets pour retrouver un peu de discrétion.

## Quand utiliser WireGuard ?

- **Réseaux non filtrés.** À la maison, au travail ou en voyage dans un pays qui ne bloque pas les VPN, WireGuard est difficile à battre en termes de vitesse et d'autonomie de batterie.
- **Auto-hébergement.** Si vous gérez votre propre serveur, WireGuard est l'un des protocoles les plus faciles à configurer correctement.
- **Pas de filtrage DPI.** Si votre réseau bloque les VPN, un protocole conçu pour ressembler à du trafic web ordinaire, comme [VLESS-Reality](/vpn-protocols/vless-reality), convient mieux. Notre comparaison entre [VLESS-Reality et WireGuard](/blog/vless-reality-vs-wireguard) détaille davantage ce compromis.

## Doppler utilise-t-il WireGuard ?

Non. Les applications Doppler se connectent via VLESS-Reality, car Doppler est conçu pour les réseaux où WireGuard est filtré. Le guide [pourquoi VLESS](/vpn-protocols/why-vless) explique ce choix.
