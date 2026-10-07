> **Resumen.** VLESS es un protocolo proxy mínimo del proyecto Xray. Reality es la capa TLS que hace que una conexión VLESS parezca una visita TLS 1.3 corriente a un sitio web real y popular, sin dominio ni certificado propios. Juntos son, hoy por hoy, la combinación popular más difícil de bloquear para los censores. Esta página es el resumen; nuestra [guía en profundidad](/how-it-works/vless-reality-tunnel) cuenta la historia completa.

## ¿Qué es VLESS?

VLESS se [propuso en julio de 2020](https://github.com/v2ray/v2ray-core/issues/2636) como un sucesor más ligero de [VMess](/vpn-protocols/vmess). Su [especificación](https://xtls.github.io/en/development/protocols/vless.html) es deliberadamente pequeña: una versión del protocolo, un UUID de 16 bytes que identifica al usuario, un campo opcional de complementos, y el comando, el puerto y la dirección del destino. VLESS no tiene cifrado propio. Depende de la capa TLS subyacente, por lo que el tráfico no se cifra dos veces.

VLESS forma parte de [Xray-core](https://github.com/XTLS/Xray-core), el proyecto que se separó de V2Ray en noviembre de 2020 y que ahora lidera el desarrollo de esta familia de protocolos.

## ¿Qué aporta Reality?

Protocolos como [Trojan](/vpn-protocols/trojan) se esconden dentro de TLS hacia tu propio dominio, y ese dominio se convierte en lo que un censor puede bloquear. [Reality](https://github.com/XTLS/REALITY), publicado en la [versión 1.8.0 de Xray-core en marzo de 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), lo elimina.

Un servidor Reality presenta el handshake TLS de un sitio web real de un tercero. Para un observador, la conexión es una visita normal por TLS 1.3 a ese sitio. Un cliente que conoce la clave del servidor accede al túnel VLESS; cualquier otro, incluida una sonda activa de un censor, es dirigido al sitio web real y ve su certificado auténtico. No hay ningún dominio ni certificado de Doppler que añadir a una lista de bloqueo.

## ¿Qué tan difícil es bloquear VLESS-Reality?

Es la opción popular más resistente que conocemos, pero no es invisible. Una investigación publicada en 2024 mostró que [el TLS transportado dentro de TLS se puede identificar por huella](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) a partir de sus tiempos y de los tamaños de los paquetes, y en noviembre de 2025 usuarios [informaron](https://github.com/net4people/bbs/issues/546) de que algunos ISP rusos cortaban las conexiones Reality. Los proveedores responden ajustando la configuración de los servidores y los sitios que toman prestados, y el juego del gato y el ratón continúa.

## ¿Qué tan rápido es?

En el uso cotidiano la sobrecarga es pequeña. La cabecera de VLESS se envía una vez por conexión, y el flujo XTLS Vision evita cifrar por segunda vez el tráfico web que ya está cifrado. Como funciona sobre TCP, VLESS-Reality puede ser más lento que los protocolos UDP como [WireGuard](/vpn-protocols/wireguard) en redes con pérdida de paquetes, pero sigue funcionando donde aquellos se bloquean.

## ¿Dónde puedo saber más?

- [El túnel VLESS-Reality, en profundidad](/how-it-works/vless-reality-tunnel): historia, mecanismo, límites.
- [¿Qué es VLESS?](/blog/what-is-vless) y [el formato URI de VLESS](/blog/vless-uri-format) en nuestro blog.
- [VLESS VPN](/vless-vpn): cómo Doppler convierte VLESS-Reality en apps de un solo toque.
