> **En bref.** Hysteria 2 est un protocole de proxy fondé sur QUIC, le transport qui sous-tend HTTP/3. Il est conçu pour la vitesse sur des connexions médiocres et avec pertes, et pour quiconque n'a pas le mot de passe, son serveur se comporte comme un site web HTTP/3 ordinaire. Son point faible est sa dépendance à l'UDP, que certains réseaux brident ou bloquent purement et simplement.

## Qu'est-ce que Hysteria 2 ?

Hysteria est un projet open source d'[apernet](https://github.com/apernet/hysteria) ; la version 2, un protocole repensé, est sortie en septembre 2023. Comme Shadowsocks et VLESS, c'est un proxy plutôt qu'un VPN classique, et les clients peuvent y faire passer tout un appareil.

## Comment fonctionne-t-il ?

D'après sa [spécification du protocole](https://v2.hysteria.network/docs/developers/Protocol/), Hysteria 2 fonctionne sur QUIC tel que défini dans la [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), avec l'extension de datagrammes non fiables pour le trafic UDP. QUIC fournit déjà le chiffrement TLS 1.3, des flux multiplexés et un établissement de connexion rapide.

C'est dans l'authentification qu'intervient le déguisement. La spécification exige qu'un serveur Hysteria **implémente un véritable serveur HTTP/3** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) et traite les requêtes comme le ferait n'importe quel serveur web. Un client s'authentifie par une requête HTTP/3 particulière ; toute autre personne, qu'il s'agisse d'un visiteur curieux ou d'une sonde active, reçoit des réponses web ordinaires. La spécification indique que, pour un tiers sans identifiants, le serveur se comporte exactement comme un serveur web HTTP/3 standard.

## Pourquoi est-il rapide ?

QUIC fonctionne sur UDP et récupère après une perte de paquets sans bloquer tous les flux comme le fait TCP. Hysteria peut aussi utiliser son propre contrôle de congestion, conçu pour les liaisons instables ; il tend donc à conserver sa vitesse sur les réseaux mobiles saturés, les liaisons longue distance et le Wi-Fi perturbé, là où les protocoles fondés sur TCP ralentissent.

## Hysteria 2 est-il difficile à bloquer ?

Face au sondage actif, il tient bien, puisque les sondes voient un serveur web. L'exposition vient du transport. Un censeur peut brider ou bloquer l'UDP, ou QUIC en particulier, sans casser la plupart des sites web, car les navigateurs se rabattent sur HTTP/2 en TCP lorsque HTTP/3 échoue. Dans ce cas, Hysteria 2 n'a nulle part où aller, alors que les protocoles fondés sur TCP, comme [VLESS-Reality](/vpn-protocols/vless-reality), continuent de fonctionner.

## Quand utiliser Hysteria 2 ?

- **Liaisons avec pertes ou longue distance**, où son contrôle de congestion et la récupération de pertes de QUIC sont payants.
- **Réseaux qui autorisent l'UDP.** Vérifiez avant de vous y fier.
- En second protocole aux côtés d'une option TCP, pour pouvoir basculer lorsque l'UDP est filtré. Notre [guide sur la censure](/bypass-censorship) explique comment les filtres ciblent les transports.

## Doppler utilise-t-il Hysteria 2 ?

Non. Doppler utilise VLESS-Reality sur TCP, qui continue de fonctionner sur les réseaux bloquant l'UDP. Voir [pourquoi VLESS](/vpn-protocols/why-vless).
