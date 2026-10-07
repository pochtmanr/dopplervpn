> **En bref.** Nous avons conçu Doppler pour les personnes qui se trouvent sur des réseaux qui bloquent les VPN. Sur ces réseaux, la question n'est pas de savoir quel protocole est le plus rapide sur le papier, mais lequel sera encore connecté demain. Nous avons choisi VLESS avec Reality parce que c'est lui qui donne au censeur le moins de choses à reconnaître et le moins de choses à bloquer, et nous acceptons les compromis qui en découlent.

## Que cherchions-nous ?

Doppler est conçu pour les personnes qui se connectent depuis des endroits où les VPN sont filtrés volontairement : la Russie, l'Iran, la Chine, certaines parties du Golfe. Sur ces réseaux, le chiffrement est la partie facile. Tous les protocoles de notre [comparaison](/vpn-protocols) chiffrent bien. Ce qui les distingue, c'est de savoir si un système de filtrage peut reconnaître que la connexion est un VPN, et ce qu'il peut bloquer une fois qu'il l'a reconnue.

Nous avons donc jugé chaque option à l'aide de trois questions :

1. **A-t-il une empreinte fixe ?** Une poignée de main de taille fixe ou un port standard peut être repéré par une seule règle.
2. **Que se passe-t-il quand un censeur sonde le serveur ?** Les pare-feu se connectent activement aux proxys suspects pour voir comment ils réagissent.
3. **Y a-t-il quelque chose à inscrire sur une liste de blocage ?** Un domaine, un certificat ou un serveur reconnaissable est une cible, même si le trafic lui-même est bien dissimulé.

## Pourquoi pas WireGuard, OpenVPN ou IKEv2 ?

Tous trois échouent à la première question. Les paquets de poignée de main de [WireGuard](/vpn-protocols/wireguard) font toujours 148 et 92 octets. [OpenVPN](/vpn-protocols/openvpn) a été identifié dans plus de 85 % des flux par des chercheurs travaillant au sein d'un vrai FAI. [IKEv2](/vpn-protocols/ikev2) utilise des ports UDP standard qui peuvent être coupés en bloc. En août 2023, des utilisateurs en Russie ont [signalé](https://github.com/net4people/bbs/issues/274) que des opérateurs coupaient WireGuard et OpenVPN dès les premiers paquets. Ce sont de bons protocoles pour les réseaux ouverts. Ils n'ont pas été conçus pour les nôtres.

## Pourquoi pas Shadowsocks ou VMess ?

Ils passent la première question en ressemblant à des octets aléatoires, et cela s'est avéré être une empreinte à part entière. Depuis novembre 2021, le Grand Pare-feu [bloque le trafic entièrement chiffré](https://gfw.report/publications/usenixsecurity23/en/) qui ne ressemble à aucun protocole connu. [VMess](/vpn-protocols/vmess) peut être encapsulé dans du TLS pour l'éviter, mais il lui faut alors un domaine, ce qui nous amène à la troisième question.

## Pourquoi pas Trojan ?

[Trojan](/vpn-protocols/trojan) répond bien aux deux premières questions : c'est du vrai TLS, et les sondes voient un vrai site web. Mais chaque serveur Trojan a besoin de son propre domaine et de son propre certificat. Dès qu'un censeur connaît ce domaine, il peut le bloquer, et gérer de nombreux domaines est une course permanente.

## Ce que VLESS-Reality fait bien

[VLESS-Reality](/vpn-protocols/vless-reality) répond aux trois :

- **Pas d'empreinte fixe.** La connexion est du TLS 1.3 sur TCP, le trafic chiffré le plus courant d'internet.
- **Les sondes voient un vrai site web.** Reality transmet quiconque ne peut pas s'authentifier au vrai site dont il emprunte la poignée de main, avec le véritable certificat de ce site.
- **Rien de nous à bloquer par son nom.** Il n'y a ni domaine ni certificat Doppler dans la poignée de main.

Il fonctionne aussi sur TCP : il continue donc de marcher sur les réseaux qui brident ou bloquent l'UDP, là où [Hysteria 2](/vpn-protocols/hysteria2) et [AmneziaWG](/vpn-protocols/amneziawg) peinent. Et VLESS lui-même est minimal : il s'appuie sur TLS pour le chiffrement au lieu d'ajouter le sien, il n'y a donc pas de double chiffrement.

## Ce à quoi nous avons renoncé

- **La vitesse brute sur les liaisons avec pertes.** TCP récupère moins bien après une perte de paquets que QUIC ou l'UDP de WireGuard. Sur une bonne connexion, la différence est faible ; sur une mauvaise, elle peut se remarquer.
- **La prise en charge intégrée au système.** Aucun système d'exploitation n'est livré avec un client VLESS : il faut donc une application. Nous avons jugé cela acceptable et avons créé la nôtre pour iOS, Android, macOS et Windows.
- **L'invisibilité parfaite.** Elle n'existe pas. Des recherches ont montré que [le TLS dans du TLS peut être identifié par empreinte](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), et en novembre 2025 il a été [signalé](https://github.com/net4people/bbs/issues/546) que certains FAI russes coupaient les connexions Reality. VLESS-Reality est une conception de résistance à la censure, pas une garantie.

## Ce que nous faisons face aux limites

La censure évolue : le choix du protocole n'est donc pas la fin du travail. Nous ajustons les paramètres des serveurs et les sites qu'emprunte Reality à mesure que le filtrage change, et nous continuons de suivre les mêmes recherches et les mêmes rapports de la communauté que ceux cités sur ces pages. Si une meilleure approche apparaît, cette page le dira.

Pour toute l'histoire technique du fonctionnement de VLESS-Reality, lisez [le tunnel VLESS-Reality](/how-it-works/vless-reality-tunnel). Pour l'essayer, voir [VPN VLESS](/vless-vpn).
