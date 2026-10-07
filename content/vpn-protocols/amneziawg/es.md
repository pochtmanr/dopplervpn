> **Resumen.** AmneziaWG es un fork de WireGuard que conserva su velocidad y su criptografía, pero modifica las formas de los paquetes y las cabeceras que hacen que WireGuard sea fácil de detectar. Es una opción sólida donde WireGuard sin modificar está bloqueado, con una salvedad: una vez activada su ofuscación, ya no se comunica con los servidores WireGuard estándar.

## ¿Qué es AmneziaWG?

AmneziaWG lo desarrolla el equipo de [Amnezia VPN](https://amnezia.org/), una app de código abierto para ejecutar tu propio servidor VPN. La [implementación en Go](https://github.com/amnezia-vpn/amneziawg-go) del proyecto se inició en 2023. Parte de [WireGuard](/vpn-protocols/wireguard), que es rápido y sencillo pero tiene un handshake fijo y reconocible, y le añade una capa que lo disfraza.

## ¿Qué cambia?

La [documentación de AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) describe varios mecanismos, cada uno controlado por parámetros de configuración:

- **Cabeceras dinámicas (H1–H4).** Los paquetes estándar de WireGuard empiezan con un tipo de mensaje fijo para cada uno de sus cuatro formatos de paquete. AmneziaWG sustituye esos valores por números elegidos dentro de rangos configurados, de modo que dos configuraciones distintas no comparten cabeceras y ninguna regla de filtrado única las detecta todas.
- **Aleatorización de la longitud de los paquetes (S1–S4).** En WireGuard, el paquete inicial del handshake mide siempre exactamente 148 bytes. AmneziaWG añade prefijos aleatorios a cada tipo de paquete para que los tamaños varíen.
- **Paquetes basura (Jc, Jmin, Jmax).** Antes del handshake, el cliente envía una cantidad configurable de paquetes pseudoaleatorios de longitud aleatoria, que difuminan el inicio de la sesión tanto en el tiempo como en el tamaño.
- **Protección de cabeceras.** Las versiones más recientes también pueden cifrar el propio campo de tipo de mensaje.

Por debajo, la criptografía y el diseño general siguen siendo los de WireGuard.

## ¿Qué tan difícil es bloquear AmneziaWG?

Elimina las firmas simples que los filtros usan contra WireGuard: los tamaños fijos y los valores de cabecera fijos. Eso lo hace mucho más resistente que WireGuard sin modificar en redes que bloquean las VPN.

Aun así funciona sobre UDP, así que le afectan las redes que limitan o bloquean UDP de forma generalizada, y su tráfico no imita a ninguna aplicación concreta, como sí hace [VLESS-Reality](/vpn-protocols/vless-reality) al imitar una visita TLS a un sitio web real. Un filtro que bloquee directamente el UDP irreconocible aún podría detectarlo.

## ¿Cuándo conviene usar AmneziaWG?

- **Donde WireGuard está bloqueado** pero UDP sigue funcionando, y quieres una velocidad similar a la de WireGuard.
- **Servidores autoalojados**, usando la app Amnezia VPN para configurarlos.
- Conserva una opción basada en TCP, como VLESS-Reality, para las redes que filtran UDP. Nuestra [guía para Rusia](/vpn-for-russia) explica qué consigue pasar actualmente allí.

## ¿Doppler usa AmneziaWG?

No. Doppler usa VLESS-Reality. Consulta [por qué VLESS](/vpn-protocols/why-vless).
