> **En resum.** Trojan amaga el trànsit de proxy dins d'una connexió TLS real amb un lloc web real que controles. Qui es connecta sense la contrasenya simplement rep el lloc web. Funciona bé, però et cal un domini i un certificat propis, i es poden trobar i bloquejar.

## Què és Trojan?

Trojan és un protocol de proxy del [projecte trojan-gfw](https://github.com/trojan-gfw/trojan), publicat per primera vegada l'octubre de 2017. La idea és al nom: en lloc d'inventar un camuflatge, s'amaga dins del trànsit xifrat més comú d'internet, el HTTPS.

## Com funciona?

La [descripció del protocol](https://trojan-gfw.github.io/trojan/protocol) és curta. Un servidor Trojan escolta com un servidor HTTPS normal, amb un certificat real per a un domini real. El client fa un handshake TLS genuí. Després, dins de la connexió xifrada, envia:

- el hash SHA-224 de la contrasenya compartida, codificat en hexadecimal, que fa 56 caràcters,
- un salt de línia,
- una petició petita que diu on ha d'anar el trànsit, en un format semblant a SOCKS5,
- un altre salt de línia, seguit del primer tros de dades.

Si el hash i la petició són vàlids, el servidor obre un túnel cap a la destinació. Si alguna cosa no quadra, el servidor tracta la connexió com a «altres protocols» i la passa a un servidor web de reserva, de manera que el visitant veu un lloc web ordinari.

## Com és de difícil bloquejar Trojan?

Des de fora, una connexió Trojan és una sessió TLS amb el teu domini, amb el teu certificat. Les sondes actives reben un lloc web real. Això fa que Trojan sigui molt més difícil d'aïllar que els protocols que semblen aleatoris, com [Shadowsocks](/vpn-protocols/shadowsocks).

El seu punt feble és el domini mateix. Cada servidor necessita un domini i un certificat, i un censor que aprèn quins dominis pertanyen a proxies els pot bloquejar pel nom o per IP. La recerca també ha mostrat que el TLS transportat dins de TLS deixa patrons de temps i de mida que es poden [identificar per empremta](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), cosa que afecta Trojan i dissenys semblants.

[VLESS-Reality](/vpn-protocols/vless-reality) elimina el problema del domini: agafa prestat el handshake TLS d'un lloc web existent i popular, en lloc del teu.

## Quan has de fer servir Trojan?

- **Quan controles un domini** i vols una configuració senzilla i ben entesa que sembla HTTPS.
- **En xarxes amb un filtratge moderat**, on és poc probable que el teu domini sigui un objectiu.
- La nostra comparació de [VLESS, VMess i Trojan](/blog/vless-vs-vmess-vs-trojan) ajuda si tries entre ells.

## Doppler fa servir Trojan?

No. Doppler fa servir VLESS-Reality, que no necessita un domini propi. Mira [per què VLESS](/vpn-protocols/why-vless).
