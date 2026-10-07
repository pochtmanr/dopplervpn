> **En bref.** Trojan cache le trafic du proxy dans une vraie connexion TLS vers un vrai site web que vous contrôlez. Quiconque se connecte sans le mot de passe obtient simplement le site web. Il fonctionne bien, mais il faut votre propre domaine et votre propre certificat, qui peuvent être repérés et bloqués.

## Qu'est-ce que Trojan ?

Trojan est un protocole de proxy issu du [projet trojan-gfw](https://github.com/trojan-gfw/trojan), publié pour la première fois en octobre 2017. Son principe est dans son nom : au lieu d'inventer un déguisement, il se cache dans le trafic chiffré le plus courant d'internet, le HTTPS.

## Comment fonctionne-t-il ?

La [description du protocole](https://trojan-gfw.github.io/trojan/protocol) est courte. Un serveur Trojan écoute comme un serveur HTTPS normal, avec un vrai certificat pour un vrai domaine. Le client effectue une véritable poignée de main TLS. Ensuite, à l'intérieur de la connexion chiffrée, il envoie :

- le hachage SHA-224 du mot de passe partagé, encodé en hexadécimal, soit 56 caractères,
- un saut de ligne,
- une petite requête indiquant où le trafic doit aller, dans un format proche de SOCKS5,
- un autre saut de ligne, suivi des premières données.

Si le hachage et la requête sont valides, le serveur ouvre un tunnel vers la destination. Si quelque chose ne va pas, le serveur traite la connexion comme « d'autres protocoles » et la transmet à un serveur web de secours : le visiteur voit alors un site web ordinaire.

## Trojan est-il difficile à bloquer ?

Vu de l'extérieur, une connexion Trojan est une session TLS vers votre domaine, avec votre certificat. Les sondes actives reçoivent en retour un vrai site web. Trojan est ainsi bien plus difficile à isoler que les protocoles d'apparence aléatoire, comme [Shadowsocks](/vpn-protocols/shadowsocks).

Son point faible est le domaine lui-même. Chaque serveur a besoin d'un domaine et d'un certificat, et un censeur qui découvre quels domaines appartiennent à des proxys peut les bloquer par leur nom ou par leur adresse IP. Des chercheurs ont aussi montré que du TLS transporté dans du TLS laisse des schémas de durée et de taille qui peuvent être [identifiés par empreinte](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), ce qui concerne Trojan et les conceptions similaires.

[VLESS-Reality](/vpn-protocols/vless-reality) supprime le problème du domaine en empruntant la poignée de main TLS d'un site existant et populaire, au lieu de celle de votre propre site.

## Quand utiliser Trojan ?

- **Quand vous contrôlez un domaine** et voulez une configuration simple et bien connue qui ressemble à du HTTPS.
- **Sur des réseaux modérément filtrés** où votre domaine a peu de chances d'être ciblé.
- Notre comparaison de [VLESS, VMess et Trojan](/blog/vless-vs-vmess-vs-trojan) vous aide si vous hésitez entre eux.

## Doppler utilise-t-il Trojan ?

Non. Doppler utilise VLESS-Reality, qui n'a besoin d'aucun domaine propre. Voir [pourquoi VLESS](/vpn-protocols/why-vless).
