> **En bref.** Shadowsocks est un proxy chiffré léger, créé en Chine pour traverser le Grand Pare-feu. Pendant des années, il a fonctionné en ne ressemblant à rien du tout. Depuis 2021, la recherche montre que le pare-feu bloque précisément ce type de trafic, car le trafic réel est rarement aussi aléatoire.

## Qu'est-ce que Shadowsocks ?

Shadowsocks est un protocole de proxy open source publié pour la première fois [en avril 2012](https://en.wikipedia.org/wiki/Shadowsocks). À proprement parler, ce n'est pas un VPN : c'est un proxy de type SOCKS5 avec chiffrement, et ce sont les applications qui décident quel trafic y faire passer. En pratique, la plupart des clients Shadowsocks proposent aujourd'hui un mode à l'échelle du système qui se comporte comme un VPN.

Il est populaire parce qu'il est simple et rapide. Les versions actuelles utilisent des [chiffrements AEAD](https://shadowsocks.org/doc/aead.html), qui assurent confidentialité, intégrité et authenticité en une seule étape, et l'[édition 2022](https://shadowsocks.org/doc/sip022.html) du protocole a renforcé la protection contre le rejeu.

## Comment fonctionne-t-il ?

Le client et le serveur partagent un mot de passe, converti en clé de chiffrement. Tout ce que le client envoie, y compris l'adresse du site web demandé, est chiffré dès le premier octet. Il n'y a ni poignée de main reconnaissable, ni certificat, ni en-tête en clair. Pour un observateur, une connexion Shadowsocks est un flux d'octets d'apparence aléatoire.

## Comment le Grand Pare-feu détecte-t-il Shadowsocks ?

D'abord, par sondage actif. Des chercheurs de GFW Report ont [constaté](https://gfw.report/publications/imc20/en/) que le pare-feu envoyait des dizaines de milliers de sondes vers des serveurs Shadowsocks suspects, en rejouant et en modifiant de vraies connexions pour observer la réaction du serveur.

Ensuite, à partir de novembre 2021, par une méthode plus grossière et plus large. Une [étude de USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) a montré que le pare-feu bloquait en temps réel le trafic « entièrement chiffré ». Il examine le premier paquet d'une connexion et exempte tout ce qui ressemble à un protocole connu ou contient suffisamment de texte imprimable. Une règle mesure le nombre moyen de bits à 1 par octet : les valeurs inférieures ou égales à 3,4, ou supérieures ou égales à 4,6, sont exemptées, tandis que les données d'apparence aléatoire situées entre les deux ne le sont pas. Tout ce qui reste peut être bloqué.

Les chercheurs ont aussi constaté que le pare-feu appliquait cette règle à environ 26 % des connexions, et seulement aux plages d'adresses IP de centres de données populaires, probablement pour limiter les dommages collatéraux. La leçon pour les concepteurs de protocoles était claire : avoir l'air aléatoire est en soi une empreinte.

## Quand utiliser Shadowsocks ?

- **Proxy léger et rapide** sur des réseaux qui n'inspectent pas le trafic de près.
- **Auto-hébergement** avec des outils comme Outline, qui rendent l'installation simple.
- **Avec prudence en cas de filtrage intensif.** En Chine et dans d'autres endroits qui bloquent le trafic entièrement chiffré, Shadowsocks est bien moins fiable que les protocoles qui imitent du vrai TLS, comme [VLESS-Reality](/vpn-protocols/vless-reality). Notre [histoire des protocoles de contournement de la censure](/blog/censorship-protocol-history) retrace l'évolution du domaine.

## Doppler utilise-t-il Shadowsocks ?

Non. Doppler utilise VLESS-Reality, pour les raisons exposées dans [pourquoi VLESS](/vpn-protocols/why-vless).
