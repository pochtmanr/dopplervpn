> **Resumen.** IKEv2/IPsec es la VPN que tu teléfono y tu portátil ya saben usar sin ninguna app. Es rápida y gestiona bien el cambio entre Wi-Fi y datos móviles. También funciona en puertos fijos y muy conocidos, lo que la convierte en uno de los protocolos más sencillos de bloquear para un censor.

## ¿Qué es IKEv2/IPsec?

«IKEv2» son en realidad dos piezas que trabajan juntas. IPsec es el conjunto de protocolos que cifra y autentica los paquetes IP. IKE, el Internet Key Exchange, es el protocolo que usan ambos extremos para autenticarse mutuamente y acordar las claves de IPsec. La versión 2 de IKE se estandarizó [en diciembre de 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), y la especificación vigente es el [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Al ser un estándar de la IETF, IKEv2 está integrado en iOS, macOS y Windows, y en Android desde la versión 11. Muchas pasarelas VPN corporativas lo usan.

## ¿Cómo funciona?

El intercambio de claves se realiza por UDP, [normalmente en el puerto 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Una vez que ambos extremos acuerdan las claves, la pila IPsec del sistema operativo cifra tu tráfico mediante el Encapsulating Security Payload (ESP). Cuando hay un router NAT de por medio, como en casi todas las redes domésticas y móviles, tanto IKE como ESP se encapsulan en UDP en el puerto 4500.

IKEv2 tiene una extensión estándar llamada [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) que permite que una conexión sobreviva a un cambio de dirección IP. Por eso IKEv2 resulta agradable en los teléfonos: si sales del alcance del Wi-Fi y pasas a datos móviles, el túnel continúa en lugar de reconectarse desde cero.

## ¿Por qué es fácil bloquear IKEv2?

IKEv2 no intenta parecerse a nada más. Su tráfico usa puertos UDP muy conocidos y tiene los formatos estándar de IKE y ESP que cualquier herramienta de red puede analizar. Bloquearlo ni siquiera requiere inspección profunda de paquetes: un filtro puede descartar los puertos UDP 500 y 4500, o reconocer directamente el intercambio IKE.

Es una decisión razonable para redes corporativas y para viajar por países abiertos, donde que te reconozcan como VPN no cuesta nada. En las redes que filtran las VPN a propósito, suele ser lo primero que deja de funcionar.

## ¿Cuándo conviene usar IKEv2?

- **Sin permiso para instalar apps.** En un dispositivo gestionado donde no puedes instalar software, el cliente IKEv2 integrado puede ser la única opción.
- **Itinerancia móvil en redes abiertas.** MOBIKE hace que el cambio entre redes sea fluido.
- **No bajo censura.** En redes filtradas, elige un protocolo diseñado para pasar desapercibido, como [VLESS-Reality](/vpn-protocols/vless-reality). Nuestra [guía sobre la censura](/bypass-censorship) explica cómo funciona el bloqueo.

## ¿Doppler usa IKEv2?

No. Doppler se conecta con VLESS-Reality dentro de sus propias apps. Consulta [por qué VLESS](/vpn-protocols/why-vless) para conocer los motivos.
