> **En bref.** VMess est le protocole d'origine du projet V2Ray. Il chiffre ses propres en-têtes et est généralement encapsulé dans un autre transport, comme WebSocket sur TLS, pour ressembler à du trafic web. Il fonctionne toujours, mais ses successeurs, VLESS et Trojan, font le même travail avec moins de surcharge.

## Qu'est-ce que VMess ?

VMess est le protocole de proxy chiffré introduit par le [projet V2Ray](https://github.com/v2fly/v2ray-core) à ses débuts, en 2015. V2Ray est devenu une plateforme modulaire de création de proxys : un seul noyau, de nombreux protocoles et transports, et un moteur de routage qui décide où va chaque trafic. VMess a été son premier protocole et, pendant plusieurs années, son principal.

Comme Shadowsocks, VMess est techniquement un proxy plutôt qu'un VPN, mais les applications basées sur V2Ray peuvent y faire passer tout votre appareil.

## Comment fonctionne-t-il ?

Chaque utilisateur possède un UUID qui sert d'identifiant. D'après la [documentation du protocole](https://www.v2fly.org/en_US/developer/protocols/vmess.html), l'en-tête de la requête du client contient un identifiant d'authentification chiffré, construit à partir d'un horodatage Unix, d'un nombre aléatoire et d'une somme de contrôle, et chiffré avec une clé dérivée de l'identifiant de l'utilisateur. Le serveur s'en sert pour reconnaître l'utilisateur, puis déchiffre le reste de l'en-tête et les données.

La documentation décrit deux façons de protéger l'en-tête. La version moderne utilise le chiffrement AEAD, qui garantit que l'en-tête n'a pas été altéré. L'ancienne utilisait MD5 et AES-128-CFB et ne pouvait pas garantir l'intégrité de l'en-tête ; la documentation la déconseille. Comme l'identifiant d'authentification inclut un horodatage, les horloges du client et du serveur doivent être à peu près synchronisées, ce qui est une source fréquente de problèmes du type « ça ne se connecte tout simplement pas ».

## VMess est-il difficile à bloquer ?

Seul, VMess ressemble à des octets aléatoires, ce qui le place dans la même situation que [Shadowsocks](/vpn-protocols/shadowsocks) : exposé aux pare-feu qui bloquent le trafic entièrement chiffré. C'est pourquoi VMess est généralement déployé dans du WebSocket ou du gRPC sur TLS, derrière un domaine et un certificat, de sorte qu'un observateur voie ce qui ressemble à une connexion HTTPS normale vers un site web.

Cette enveloppe fait l'essentiel du travail de dissimulation du trafic, et elle a un coût : il faut un domaine, un certificat et souvent un CDN devant le serveur, et le serveur chiffre désormais les données deux fois, une fois pour TLS et une fois pour VMess.

## VMess, VLESS ou Trojan ?

[VLESS](/vpn-protocols/vless-reality) a été conçu par le projet Xray comme un successeur plus léger : il conserve l'identité fondée sur l'UUID, mais abandonne le chiffrement propre à VMess et s'appuie entièrement sur la couche TLS, ce qui évite le double chiffrement. [Trojan](/vpn-protocols/trojan) adopte une approche similaire avec un mot de passe à la place d'un UUID. Notre comparaison de [VLESS, VMess et Trojan](/blog/vless-vs-vmess-vs-trojan) entre dans les détails.

## Doppler utilise-t-il VMess ?

Non. Doppler utilise VLESS avec Reality. Le guide [pourquoi VLESS](/vpn-protocols/why-vless) explique pourquoi.
