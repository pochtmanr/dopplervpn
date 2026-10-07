> **Resumen.** Creamos Doppler para personas que están en redes que bloquean las VPN. En esas redes la pregunta no es qué protocolo es el más rápido sobre el papel, sino cuál sigue conectado mañana. Elegimos VLESS con Reality porque es el que menos ofrece a un censor para reconocer y para bloquear, y aceptamos las contrapartidas que conlleva.

## ¿Qué buscábamos al elegir?

Doppler está pensado para personas que se conectan desde lugares donde las VPN se filtran a propósito: Rusia, Irán, China y algunas zonas del Golfo. En esas redes, el cifrado es la parte fácil. Todos los protocolos de nuestra [comparativa](/vpn-protocols) cifran bien. Lo que los distingue es si un sistema de filtrado puede saber que la conexión es una VPN y qué puede bloquear una vez que lo sabe.

Por eso juzgamos cada opción con tres preguntas:

1. **¿Tiene una huella fija?** Un handshake de tamaño fijo o un puerto estándar se pueden detectar con una sola regla.
2. **¿Qué pasa cuando un censor sondea el servidor?** Los cortafuegos se conectan activamente a los proxies sospechosos para ver cómo responden.
3. **¿Hay algo que añadir a una lista de bloqueo?** Un dominio, un certificado o un servidor reconocible es un objetivo aunque el tráfico en sí esté bien oculto.

## ¿Por qué no WireGuard, OpenVPN o IKEv2?

Los tres fallan en la primera pregunta. Los paquetes de handshake de [WireGuard](/vpn-protocols/wireguard) siempre miden 148 y 92 bytes. [OpenVPN](/vpn-protocols/openvpn) fue identificado en más del 85 % de los flujos por investigadores que trabajaron dentro de un ISP real. [IKEv2](/vpn-protocols/ikev2) funciona en puertos UDP estándar que se pueden descartar en bloque. En agosto de 2023, usuarios en Rusia [informaron](https://github.com/net4people/bbs/issues/274) de que los operadores cortaban WireGuard y OpenVPN en los primeros paquetes. Son buenos protocolos para redes abiertas. No se diseñaron para las nuestras.

## ¿Por qué no Shadowsocks o VMess?

Superan la primera pregunta porque parecen bytes aleatorios, y eso resultó ser una huella en sí misma. Desde noviembre de 2021, el Gran Cortafuegos [bloquea el tráfico totalmente cifrado](https://gfw.report/publications/usenixsecurity23/en/) que no se parece a ningún protocolo conocido. [VMess](/vpn-protocols/vmess) se puede envolver en TLS para evitarlo, pero entonces necesita un dominio, lo que nos lleva a la tercera pregunta.

## ¿Por qué no Trojan?

[Trojan](/vpn-protocols/trojan) responde bien a las dos primeras preguntas: es TLS real, y las sondas ven un sitio web real. Pero cada servidor Trojan necesita su propio dominio y certificado. Cuando un censor descubre ese dominio, puede bloquearlo, y mantener muchos dominios es una persecución constante.

## Lo que VLESS-Reality hace bien

[VLESS-Reality](/vpn-protocols/vless-reality) responde a las tres:

- **Sin huella fija.** La conexión es TLS 1.3 sobre TCP, el tráfico cifrado más común de internet.
- **Las sondas ven un sitio web real.** Reality reenvía a quien no puede autenticarse al sitio real cuyo handshake toma prestado, con el certificado auténtico de ese sitio.
- **Nada nuestro que bloquear por nombre.** No hay ningún dominio ni certificado de Doppler en el handshake.

Además funciona sobre TCP, así que sigue funcionando en redes que limitan o bloquean UDP, donde [Hysteria 2](/vpn-protocols/hysteria2) y [AmneziaWG](/vpn-protocols/amneziawg) tienen dificultades. Y el propio VLESS es pequeño: depende de TLS para el cifrado en lugar de añadir el suyo, así que no hay doble cifrado.

## A qué renunciamos

- **Velocidad bruta en enlaces con pérdidas.** TCP se recupera de la pérdida de paquetes con menos elegancia que QUIC o el UDP de WireGuard. En una conexión limpia la diferencia es pequeña; en una mala puede notarse.
- **Compatibilidad integrada en el sistema operativo.** Ningún sistema operativo incluye un cliente VLESS, así que necesitas una app. Decidimos que era aceptable y creamos la nuestra para iOS, Android, macOS y Windows.
- **Invisibilidad perfecta.** No existe. Las investigaciones han demostrado que [el TLS dentro de TLS se puede identificar por huella](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), y en noviembre de 2025 se [informó](https://github.com/net4people/bbs/issues/546) de que algunos ISP rusos cortaban las conexiones Reality. VLESS-Reality es un diseño de resistencia a la censura, no una garantía.

## Qué hacemos ante los límites

La censura cambia, así que elegir el protocolo no es el final del trabajo. Ajustamos la configuración de los servidores y los sitios que toma prestados Reality a medida que cambia el filtrado, y seguimos de cerca las mismas investigaciones e informes de la comunidad que se citan en estas páginas. Si aparece un enfoque mejor, esta página lo dirá.

Para conocer la historia técnica completa de cómo funciona VLESS-Reality, lee [el túnel VLESS-Reality](/how-it-works/vless-reality-tunnel). Para probarlo, consulta [VLESS VPN](/vless-vpn).
