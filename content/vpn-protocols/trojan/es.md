> **Resumen.** Trojan oculta el tráfico proxy dentro de una conexión TLS real a un sitio web real que controlas. Quien se conecta sin la contraseña simplemente recibe el sitio web. Funciona bien, pero necesitas tu propio dominio y certificado, y esos se pueden encontrar y bloquear.

## ¿Qué es Trojan?

Trojan es un protocolo proxy del [proyecto trojan-gfw](https://github.com/trojan-gfw/trojan), publicado por primera vez en octubre de 2017. Su idea está en el nombre: en lugar de inventar un disfraz, se esconde dentro del tráfico cifrado más común de internet, HTTPS.

## ¿Cómo funciona?

La [descripción del protocolo](https://trojan-gfw.github.io/trojan/protocol) es breve. Un servidor Trojan escucha como un servidor HTTPS normal, con un certificado real para un dominio real. El cliente realiza un handshake TLS genuino. Después, dentro de la conexión cifrada, envía:

- el hash SHA-224 de la contraseña compartida codificado en hexadecimal, que ocupa 56 caracteres,
- un salto de línea,
- una pequeña solicitud que indica adónde debe ir el tráfico, en un formato similar a SOCKS5,
- otro salto de línea, seguido del primer fragmento de datos.

Si el hash y la solicitud son válidos, el servidor abre un túnel hacia el destino. Si algo falla, el servidor trata la conexión como «otros protocolos» y la pasa a un servidor web de respaldo, de modo que el visitante ve un sitio web corriente.

## ¿Qué tan difícil es bloquear Trojan?

Desde fuera, una conexión Trojan es una sesión TLS hacia tu dominio, con tu certificado. Las sondas activas reciben de vuelta un sitio web real. Eso hace que Trojan sea mucho más difícil de distinguir que los protocolos de aspecto aleatorio, como [Shadowsocks](/vpn-protocols/shadowsocks).

Su punto débil es el propio dominio. Cada servidor necesita un dominio y un certificado, y un censor que averigüe qué dominios pertenecen a proxies puede bloquearlos por nombre o por IP. Los investigadores también han demostrado que el TLS transportado dentro de TLS deja patrones de tiempo y tamaño que se pueden [identificar por huella](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), lo que afecta a Trojan y a diseños similares.

[VLESS-Reality](/vpn-protocols/vless-reality) elimina el problema del dominio al tomar prestado el handshake TLS de un sitio web popular que ya existe, en lugar del tuyo.

## ¿Cuándo conviene usar Trojan?

- **Cuando controlas un dominio** y quieres una configuración sencilla y bien conocida que se parezca a HTTPS.
- **En redes con filtrado moderado**, donde es improbable que tu dominio sea objetivo de bloqueo.
- Nuestra comparativa de [VLESS, VMess y Trojan](https://www.dopplervpn.org/en/blog/vless-vs-vmess-vs-trojan) te ayuda si estás eligiendo entre ellos.

## ¿Doppler usa Trojan?

No. Doppler usa VLESS-Reality, que no necesita un dominio propio. Consulta [por qué VLESS](/vpn-protocols/why-vless).
