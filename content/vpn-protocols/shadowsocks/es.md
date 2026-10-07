> **Resumen.** Shadowsocks es un proxy cifrado y ligero que se creó en China para atravesar el Gran Cortafuegos. Durante años funcionó porque no se parecía a nada. Desde 2021, la investigación muestra que el cortafuegos bloquea precisamente ese tipo de tráfico, porque el tráfico real rara vez es tan aleatorio.

## ¿Qué es Shadowsocks?

Shadowsocks es un protocolo proxy de código abierto publicado por primera vez [en abril de 2012](https://en.wikipedia.org/wiki/Shadowsocks). En sentido estricto no es una VPN: es un proxy de tipo SOCKS5 con cifrado, y las aplicaciones deciden qué tráfico enviar a través de él. En la práctica, la mayoría de los clientes de Shadowsocks ofrecen hoy un modo para todo el sistema que se comporta como una VPN.

Es popular porque es sencillo y rápido. Las versiones actuales usan [cifrados AEAD](https://shadowsocks.org/doc/aead.html), que ofrecen confidencialidad, integridad y autenticidad en un solo paso, y la [edición de 2022](https://shadowsocks.org/doc/sip022.html) del protocolo reforzó la protección contra repetición.

## ¿Cómo funciona?

El cliente y el servidor comparten una contraseña, que se convierte en una clave de cifrado. Todo lo que envía el cliente, incluida la dirección del sitio web que quiere visitar, se cifra desde el primer byte. No hay un handshake reconocible, ni certificado, ni cabecera en texto plano. Para un observador, una conexión de Shadowsocks es un flujo de bytes de aspecto aleatorio.

## ¿Cómo detecta el Gran Cortafuegos a Shadowsocks?

En primer lugar, mediante sondeo activo. Los investigadores de GFW Report [registraron](https://gfw.report/publications/imc20/en/) que el cortafuegos enviaba decenas de miles de sondas a servidores sospechosos de ser Shadowsocks, repitiendo y alterando conexiones reales para ver cómo reaccionaba el servidor.

Después, a partir de noviembre de 2021, mediante un método más tosco y más amplio. Un [estudio de USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) descubrió que el cortafuegos bloquea en tiempo real el tráfico «totalmente cifrado». Examina el primer paquete de una conexión y exime todo lo que parezca un protocolo conocido o contenga suficiente texto imprimible. Una regla mide el número medio de bits activados por byte: los valores iguales o inferiores a 3,4, o iguales o superiores a 4,6, quedan exentos, y los datos de aspecto aleatorio que quedan en medio no. Lo que sobra puede bloquearse.

Los investigadores también comprobaron que el cortafuegos aplicaba esto a cerca del 26 % de las conexiones, y solo a los rangos de IP de centros de datos populares, probablemente para limitar los daños colaterales. La lección para quienes diseñan protocolos fue clara: parecer aleatorio es en sí mismo una huella.

## ¿Cuándo conviene usar Shadowsocks?

- **Proxy ligero y rápido** en redes que no inspeccionan el tráfico de cerca.
- **Autoalojamiento** con herramientas como Outline, que simplifican la configuración.
- **Con cautela bajo un filtrado intenso.** En China y otros lugares que bloquean el tráfico totalmente cifrado, Shadowsocks es mucho menos fiable que los protocolos que imitan TLS real, como [VLESS-Reality](/vpn-protocols/vless-reality). Nuestra [historia de los protocolos contra la censura](/blog/censorship-protocol-history) recorre cómo ha avanzado este campo.

## ¿Doppler usa Shadowsocks?

No. Doppler usa VLESS-Reality, por los motivos que se explican en [por qué VLESS](/vpn-protocols/why-vless).
