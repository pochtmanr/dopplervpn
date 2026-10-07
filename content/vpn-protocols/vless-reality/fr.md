> **En bref.** VLESS est un protocole de proxy minimal issu du projet Xray. Reality est la couche TLS qui fait ressembler une connexion VLESS à une visite TLS 1.3 ordinaire vers un vrai site populaire, sans domaine ni certificat propres. Ensemble, ils constituent actuellement la combinaison grand public la plus difficile à bloquer pour les censeurs. Cette page est un résumé ; notre [guide détaillé](/how-it-works/vless-reality-tunnel) raconte toute l'histoire.

## Qu'est-ce que VLESS ?

VLESS a été [proposé en juillet 2020](https://github.com/v2ray/v2ray-core/issues/2636) comme successeur plus léger de [VMess](/vpn-protocols/vmess). Sa [spécification](https://xtls.github.io/en/development/protocols/vless.html) est volontairement réduite : une version du protocole, un UUID de 16 octets qui identifie l'utilisateur, un champ optionnel de compléments, ainsi que la commande, le port et l'adresse de la destination. VLESS n'a pas de chiffrement propre. Il s'appuie sur la couche TLS sous-jacente, de sorte que le trafic n'est pas chiffré deux fois.

VLESS fait partie de [Xray-core](https://github.com/XTLS/Xray-core), le projet issu d'une scission avec V2Ray en novembre 2020 et qui dirige désormais le développement de cette famille de protocoles.

## Qu'apporte Reality ?

Des protocoles comme [Trojan](/vpn-protocols/trojan) se cachent dans du TLS vers votre propre domaine, et ce domaine devient ce qu'un censeur peut bloquer. [Reality](https://github.com/XTLS/REALITY), publié dans Xray-core [1.8.0 en mars 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), supprime cet obstacle.

Un serveur Reality présente la poignée de main TLS d'un vrai site web tiers. Pour un observateur, la connexion est une visite TLS 1.3 normale vers ce site. Un client qui connaît la clé du serveur est dirigé vers le tunnel VLESS ; tout autre, y compris une sonde active d'un censeur, est transmis au vrai site web et voit son véritable certificat. Il n'y a aucun domaine ni certificat Doppler à inscrire sur une liste de blocage.

## VLESS-Reality est-il difficile à bloquer ?

C'est l'option grand public la plus résistante que nous connaissions, mais elle n'est pas invisible. Des recherches publiées en 2024 ont montré que [le TLS transporté dans du TLS peut être identifié par empreinte](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) grâce à sa durée et à la taille de ses paquets, et en novembre 2025 des utilisateurs ont [signalé](https://github.com/net4people/bbs/issues/546) que certains FAI russes coupaient les connexions Reality. Les fournisseurs réagissent en ajustant les paramètres des serveurs et les sites empruntés, et le jeu du chat et de la souris continue.

## Quelle est sa vitesse ?

À l'usage courant, la surcharge est faible. L'en-tête VLESS n'est envoyé qu'une fois par connexion, et le flux XTLS Vision évite de chiffrer une seconde fois du trafic web déjà chiffré. Comme il fonctionne en TCP, VLESS-Reality peut être plus lent que des protocoles UDP comme [WireGuard](/vpn-protocols/wireguard) sur des réseaux avec pertes, mais il continue de fonctionner là où ceux-ci sont bloqués.

## Où en savoir plus ?

- [Le tunnel VLESS-Reality en détail](/how-it-works/vless-reality-tunnel) : historique, mécanisme, limites.
- [Qu'est-ce que VLESS ?](/blog/what-is-vless) et [le format d'URI VLESS](/blog/vless-uri-format) sur notre blog.
- [VPN VLESS](/vless-vpn) : comment Doppler intègre VLESS-Reality dans des applications utilisables en une touche.
