> **En bref.** OpenVPN est le vétéran des VPN open source : flexible, très largement pris en charge et bien connu après plus de vingt ans d'existence. Il est aussi plus lent que les protocoles récents et, d'après la recherche publiée, l'un des plus faciles à identifier par empreinte pour un fournisseur d'accès.

## Qu'est-ce qu'OpenVPN ?

OpenVPN est un logiciel VPN libre et open source, publié pour la première fois par James Yonan [en mai 2001](https://en.wikipedia.org/wiki/OpenVPN). Pendant la majeure partie des années 2000 et 2010, il a été le choix par défaut des services VPN commerciaux et de l'accès distant en entreprise, et il est encore livré avec de nombreux routeurs et produits professionnels.

Il s'exécute en espace utilisateur plutôt que dans le noyau du système d'exploitation, et s'appuie sur la bibliothèque OpenSSL et sur le protocole TLS pour l'échange de clés. Le port attribué par l'IANA est le 1194, mais OpenVPN peut fonctionner en UDP ou en TCP sur presque n'importe quel port.

## Comment fonctionne-t-il ?

OpenVPN utilise un protocole spécifique en deux parties. Un canal de contrôle utilise TLS pour authentifier les deux parties, généralement avec des certificats, et pour convenir des clés. Un canal de données transporte ensuite votre trafic, chiffré avec ces clés, dans des paquets UDP ou TCP.

Cette structure rend OpenVPN très configurable. Vous pouvez choisir les algorithmes de chiffrement, les méthodes d'authentification, les ports et les transports, et le faire passer par des proxys. Le prix de cette flexibilité est la complexité : plus de code, plus de paramètres et plus de façons d'aboutir à une configuration faible.

## Pourquoi OpenVPN est-il bloqué ?

Le TLS d'OpenVPN n'est pas la même chose qu'une visite HTTPS sur un site web. OpenVPN enveloppe sa poignée de main TLS dans son propre format de paquets, de sorte que son trafic a une forme que le trafic web ordinaire n'a pas.

Des chercheurs ont mesuré l'importance de ce point. Une équipe de l'université du Michigan et d'autres établissements a [conçu un système d'identification par empreinte](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) et l'a fait tourner chez un fournisseur d'accès desservant environ un million d'utilisateurs. Il a identifié **plus de 85 % des flux OpenVPN** avec très peu de faux positifs, et il a aussi repéré la plupart des configurations OpenVPN « obfusquées » commerciales testées.

Le filtrage réel suit la recherche. En août 2023, des utilisateurs en Russie ont [signalé](https://github.com/net4people/bbs/issues/274) que des opérateurs mobiles coupaient les connexions OpenVPN peu après leur début.

## Quand utiliser OpenVPN ?

- **Compatibilité.** Les routeurs plus anciens, les passerelles d'entreprise et certains réseaux professionnels prennent en charge OpenVPN et rien de plus récent.
- **Réseaux TCP uniquement.** OpenVPN peut fonctionner en TCP lorsque l'UDP est bloqué, ce que [WireGuard](/vpn-protocols/wireguard) ne peut pas faire sans aide.
- **Pas sur les réseaux filtrés.** Là où les VPN sont bloqués, OpenVPN tend à échouer rapidement. Un protocole qui imite le trafic web normal, comme [VLESS-Reality](/vpn-protocols/vless-reality), est le meilleur outil. Notre [guide sur la censure](/bypass-censorship) explique comment les systèmes de filtrage décident ce qu'ils coupent.

## Doppler utilise-t-il OpenVPN ?

Non. Doppler utilise VLESS-Reality sur toutes les plateformes. Le guide [pourquoi VLESS](/vpn-protocols/why-vless) explique comment nous l'avons choisi.
