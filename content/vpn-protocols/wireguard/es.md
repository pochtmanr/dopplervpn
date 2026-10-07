> **Resumen.** WireGuard es el protocolo VPN popular más rápido y sencillo, y en una red sin filtrado es una excelente opción. Sin embargo, nunca se diseñó para ocultar que es una VPN, y en Rusia, Irán y China es uno de los primeros protocolos que se bloquean.

## ¿Qué es WireGuard?

WireGuard es un protocolo VPN escrito por Jason A. Donenfeld y publicado por primera vez en 2015. Su objetivo era sustituir a los protocolos grandes y configurables que lo precedieron por algo lo bastante pequeño como para poder auditarse. En marzo de 2020 se [incorporó al kernel de Linux 5.6](https://en.wikipedia.org/wiki/WireGuard), y hoy existen aplicaciones oficiales para Windows, macOS, iOS, Android y Linux.

En lugar de dejar que cada parte negocie un conjunto de cifrados, WireGuard fija un único conjunto de primitivas modernas. Su [página del protocolo](https://www.wireguard.com/protocol/) las enumera: ChaCha20 con Poly1305 para el cifrado, Curve25519 para el intercambio de claves y BLAKE2s para el hash. No hay nada que configurar mal ni una opción más antigua y débil a la que recurrir.

## ¿Cómo funciona?

Cada dispositivo tiene un par de claves, como en SSH. El cliente y el servidor conocen de antemano las claves públicas del otro, y el handshake se basa en el framework de protocolos Noise (la página del protocolo indica la construcción exacta, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Todos los paquetes se envían por UDP](https://www.wireguard.com/protocol/), y una sesión nueva se establece en un único viaje de ida y vuelta.

Por ese diseño WireGuard se siente rápido. Hay poco que negociar, el código se ejecuta dentro del kernel del sistema operativo en Linux, y el cambio entre Wi-Fi y datos móviles se gestiona sin que se note, porque el protocolo no mantiene abierta una conexión de larga duración.

## ¿Por qué se bloquea WireGuard?

La misma sencillez que facilita auditar WireGuard lo hace fácil de reconocer. Su [whitepaper](https://www.wireguard.com/papers/wireguard.pdf) especifica los mensajes del handshake byte a byte, de modo que el primer paquete de un cliente siempre tiene 148 bytes y la respuesta siempre tiene 92 bytes, y cada uno empieza con un campo fijo de tipo de mensaje. A un sistema de inspección profunda de paquetes (DPI) le basta una regla corta para detectar ese patrón en UDP.

Los censores han hecho exactamente eso. En agosto de 2023, usuarios en Rusia [informaron](https://github.com/net4people/bbs/issues/274) de que los principales operadores móviles cortaban las sesiones de WireGuard justo después del handshake. El cifrado seguía protegiendo el contenido, pero la conexión en sí desaparecía.

Se trata de una decisión de diseño, no de un fallo. Los autores de WireGuard eligieron un protocolo fijo y mínimo, y el disfraz no figuraba entre sus objetivos. Proyectos como [AmneziaWG](/vpn-protocols/amneziawg) modifican la forma de los paquetes para recuperar algo de camuflaje.

## ¿Cuándo conviene usar WireGuard?

- **Redes sin filtrado.** En casa, en el trabajo o de viaje en un país que no bloquea las VPN, WireGuard es difícil de superar en velocidad y consumo de batería.
- **Autoalojamiento.** Si gestionas tu propio servidor, WireGuard es uno de los protocolos más fáciles de configurar correctamente.
- **No bajo filtrado DPI.** Si tu red bloquea las VPN, encaja mejor un protocolo diseñado para parecerse al tráfico web normal, como [VLESS-Reality](/vpn-protocols/vless-reality). Nuestra comparativa de [VLESS-Reality y WireGuard](/blog/vless-reality-vs-wireguard) trata esta disyuntiva con más detalle.

## ¿Doppler usa WireGuard?

No. Las aplicaciones de Doppler se conectan mediante VLESS-Reality, porque Doppler está pensado para redes donde WireGuard se filtra. La guía [por qué VLESS](/vpn-protocols/why-vless) explica el razonamiento.
