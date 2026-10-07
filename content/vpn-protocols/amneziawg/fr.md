> **En bref.** AmneziaWG est un fork de WireGuard qui conserve sa vitesse et sa cryptographie, mais modifie la forme des paquets et les en-têtes qui rendent WireGuard facile à repérer. C'est une bonne option là où WireGuard seul est bloqué, avec une réserve : une fois son obfuscation activée, il ne dialogue plus avec les serveurs WireGuard standard.

## Qu'est-ce qu'AmneziaWG ?

AmneziaWG est développé par l'équipe à l'origine d'[Amnezia VPN](https://amnezia.org/), une application open source permettant de faire tourner son propre serveur VPN. L'[implémentation en Go](https://github.com/amnezia-vpn/amneziawg-go) du projet a été lancée en 2023. Il reprend [WireGuard](/vpn-protocols/wireguard), qui est rapide et simple mais possède une poignée de main fixe et reconnaissable, et y ajoute une couche qui la déguise.

## Qu'est-ce qui change ?

La [documentation d'AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) décrit plusieurs mécanismes, chacun contrôlé par des paramètres de configuration :

- **En-têtes dynamiques (H1–H4).** Les paquets WireGuard standard commencent par un type de message fixe pour chacun de leurs quatre formats de paquet. AmneziaWG remplace ces valeurs par des nombres choisis dans des plages configurées : deux configurations différentes ne partagent donc pas leurs en-têtes et aucune règle de filtrage unique ne les reconnaît toutes.
- **Randomisation de la longueur des paquets (S1–S4).** Dans WireGuard, le paquet initial de la poignée de main fait toujours exactement 148 octets. AmneziaWG ajoute des préfixes aléatoires à chaque type de paquet pour que les tailles varient.
- **Paquets parasites (Jc, Jmin, Jmax).** Avant la poignée de main, le client envoie un nombre configurable de paquets pseudo-aléatoires de longueur aléatoire, qui brouillent le début de la session, dans le temps comme en taille.
- **Protection des en-têtes.** Les versions récentes peuvent aussi chiffrer le champ de type de message lui-même.

En dessous, la cryptographie et la conception d'ensemble restent celles de WireGuard.

## AmneziaWG est-il difficile à bloquer ?

Il supprime les signatures simples que les filtres utilisent contre WireGuard : tailles fixes et valeurs d'en-tête fixes. Il est ainsi bien plus résistant que WireGuard seul sur les réseaux qui bloquent les VPN.

Il fonctionne toujours sur UDP : les réseaux qui brident ou bloquent largement l'UDP l'affectent donc, et son trafic n'imite aucune application en particulier, contrairement à [VLESS-Reality](/vpn-protocols/vless-reality), qui imite une visite TLS vers un vrai site web. Un filtre qui bloque d'emblée l'UDP non reconnaissable pourrait encore l'attraper.

## Quand utiliser AmneziaWG ?

- **Là où WireGuard est bloqué** mais où l'UDP fonctionne encore, et si vous voulez une vitesse proche de celle de WireGuard.
- **Serveurs auto-hébergés**, en utilisant l'application Amnezia VPN pour les installer.
- Gardez une option fondée sur TCP, comme VLESS-Reality, pour les réseaux qui filtrent l'UDP. Notre [guide pour la Russie](/vpn-for-russia) explique ce qui passe actuellement là-bas.

## Doppler utilise-t-il AmneziaWG ?

Non. Doppler utilise VLESS-Reality. Voir [pourquoi VLESS](/vpn-protocols/why-vless).
