> **Resumen.** Hysteria 2 es un protocolo proxy construido sobre QUIC, el transporte en el que se basa HTTP/3. Está diseñado para ofrecer velocidad en conexiones deficientes y con pérdida de paquetes, y para quien no tiene la contraseña su servidor se comporta como un sitio web HTTP/3 corriente. Su punto débil es que depende de UDP, que algunas redes limitan o bloquean por completo.

## ¿Qué es Hysteria 2?

Hysteria es un proyecto de código abierto de [apernet](https://github.com/apernet/hysteria); la versión 2, un protocolo rediseñado, se publicó en septiembre de 2023. Como Shadowsocks y VLESS, es un proxy y no una VPN clásica, y los clientes pueden enrutar todo un dispositivo a través de él.

## ¿Cómo funciona?

Según su [especificación del protocolo](https://v2.hysteria.network/docs/developers/Protocol/), Hysteria 2 funciona sobre QUIC, tal como se define en el [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), con la extensión de datagramas no fiables para el tráfico UDP. QUIC ya ofrece cifrado TLS 1.3, flujos multiplexados y un establecimiento de conexión rápido.

El disfraz entra en juego en la autenticación. La especificación exige que un servidor Hysteria **deba implementar un servidor HTTP/3 real** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) y gestionar las solicitudes como lo haría cualquier servidor web. Un cliente se autentica con una solicitud HTTP/3 especial; cualquier otro, sea un visitante curioso o una sonda activa, recibe respuestas web corrientes. La especificación afirma que, para un tercero sin credenciales, el servidor se comporta igual que un servidor web HTTP/3 estándar.

## ¿Por qué es rápido?

QUIC funciona sobre UDP y se recupera de la pérdida de paquetes sin detener todos los flujos como hace TCP. Hysteria también puede usar su propio control de congestión, pensado para enlaces inestables, de modo que tiende a mantener su velocidad en redes móviles congestionadas, rutas de larga distancia y redes Wi-Fi con interferencias, donde los protocolos basados en TCP se ralentizan.

## ¿Qué tan difícil es bloquear Hysteria 2?

Frente al sondeo activo resiste bien, ya que las sondas ven un servidor web. La exposición está en el transporte. Un censor puede limitar o bloquear UDP, o QUIC en concreto, sin romper la mayoría de los sitios web, porque los navegadores recurren a HTTP/2 sobre TCP cuando HTTP/3 falla. Donde eso ocurre, Hysteria 2 no tiene adónde ir, mientras que los protocolos basados en TCP, como [VLESS-Reality](/vpn-protocols/vless-reality), siguen funcionando.

## ¿Cuándo conviene usar Hysteria 2?

- **Enlaces con pérdida de paquetes o de larga distancia**, donde su control de congestión y la recuperación de pérdidas de QUIC dan buen resultado.
- **Redes que permiten UDP.** Compruébalo antes de depender de él.
- Como segundo protocolo junto a una opción TCP, para poder cambiar cuando se filtra UDP. Nuestra [guía sobre la censura](/bypass-censorship) explica cómo los filtros atacan los transportes.

## ¿Doppler usa Hysteria 2?

No. Doppler usa VLESS-Reality sobre TCP, que sigue funcionando en redes que bloquean UDP. Consulta [por qué VLESS](/vpn-protocols/why-vless).
