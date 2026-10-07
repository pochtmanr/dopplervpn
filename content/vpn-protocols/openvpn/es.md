> **Resumen.** OpenVPN es el veterano de las VPN de código abierto: flexible, compatible casi en todas partes y bien conocido tras más de dos décadas. También es más lento que los protocolos más nuevos y, según la investigación publicada, uno de los más fáciles de identificar por huella para un ISP.

## ¿Qué es OpenVPN?

OpenVPN es un software VPN libre y de código abierto publicado por primera vez por James Yonan [en mayo de 2001](https://en.wikipedia.org/wiki/OpenVPN). Durante buena parte de los años 2000 y 2010 fue la opción predeterminada de los servicios VPN comerciales y del acceso remoto corporativo, y todavía se incluye en muchos routers y productos empresariales.

Se ejecuta en el espacio de usuario, no en el kernel del sistema operativo, y depende de la biblioteca OpenSSL y del protocolo TLS para el intercambio de claves. El puerto asignado por la IANA es el 1194, aunque OpenVPN puede funcionar sobre UDP o TCP en casi cualquier puerto.

## ¿Cómo funciona?

OpenVPN usa un protocolo propio con dos partes. Un canal de control usa TLS para autenticar a ambos extremos, normalmente con certificados, y para acordar las claves. Después, un canal de datos transporta tu tráfico, cifrado con esas claves, dentro de paquetes UDP o TCP.

Esa estructura hace que OpenVPN sea muy configurable. Puedes elegir los cifrados, los métodos de autenticación, los puertos y los transportes, y ejecutarlo a través de proxies. El precio de esa flexibilidad es la complejidad: más código, más ajustes y más maneras de acabar con una configuración débil.

## ¿Por qué se bloquea OpenVPN?

El TLS dentro de OpenVPN no es lo mismo que una visita HTTPS a un sitio web. OpenVPN envuelve su handshake TLS en su propio formato de paquetes, por lo que su tráfico tiene una forma que el tráfico web normal no tiene.

Unos investigadores midieron cuánto importa eso. Un equipo de la Universidad de Míchigan y otras instituciones [construyó un sistema de identificación por huella](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) y lo ejecutó dentro de un ISP que da servicio a cerca de un millón de usuarios. Identificó **más del 85 % de los flujos de OpenVPN** con muy pocos falsos positivos, y además detectó la mayoría de las configuraciones comerciales de OpenVPN «ofuscado» que probaron.

El filtrado en el mundo real sigue lo que muestra la investigación. En agosto de 2023, usuarios en Rusia [informaron](https://github.com/net4people/bbs/issues/274) de que los operadores móviles cortaban las conexiones de OpenVPN poco después de iniciarse.

## ¿Cuándo conviene usar OpenVPN?

- **Compatibilidad.** Los routers antiguos, las pasarelas empresariales y algunas redes corporativas admiten OpenVPN y nada más reciente.
- **Redes solo TCP.** OpenVPN puede funcionar sobre TCP cuando se bloquea UDP, algo que [WireGuard](/vpn-protocols/wireguard) no puede hacer sin ayuda.
- **No en redes filtradas.** Donde se bloquean las VPN, OpenVPN suele fallar pronto. Un protocolo que imita el tráfico web normal, como [VLESS-Reality](/vpn-protocols/vless-reality), es la mejor herramienta. Nuestra [guía sobre la censura](/bypass-censorship) explica cómo deciden los sistemas de filtrado qué cortar.

## ¿Doppler usa OpenVPN?

No. Doppler usa VLESS-Reality en todas las plataformas. La guía [por qué VLESS](/vpn-protocols/why-vless) explica cómo lo elegimos.
