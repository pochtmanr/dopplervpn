> **Resumen.** VMess es el protocolo original del proyecto V2Ray. Cifra sus propias cabeceras y suele encapsularse en otro transporte, como WebSocket sobre TLS, para parecerse al tráfico web. Todavía funciona, pero sus sucesores, VLESS y Trojan, hacen el mismo trabajo con menos sobrecarga.

## ¿Qué es VMess?

VMess es el protocolo proxy cifrado que introdujo el [proyecto V2Ray](https://github.com/v2fly/v2ray-core) cuando nació en 2015. V2Ray creció hasta convertirse en una plataforma modular para construir proxies: un solo núcleo, muchos protocolos y transportes, y un motor de enrutamiento que decide qué tráfico va adónde. VMess fue su primer protocolo y, durante varios años, el principal.

Como Shadowsocks, VMess es técnicamente un proxy y no una VPN, pero las apps basadas en V2Ray pueden enrutar todo tu dispositivo a través de él.

## ¿Cómo funciona?

Cada usuario tiene un UUID que actúa como credencial. Según la [documentación del protocolo](https://www.v2fly.org/en_US/developer/protocols/vmess.html), la cabecera de la solicitud del cliente incluye un ID de autenticación cifrado, construido a partir de una marca de tiempo Unix, un número aleatorio y una suma de verificación, y cifrado con una clave derivada del ID del usuario. El servidor lo usa para reconocer al usuario y después descifra el resto de la cabecera y los datos.

La documentación describe dos maneras de proteger la cabecera. La moderna usa cifrado AEAD, que garantiza que la cabecera no se ha alterado. La antigua usaba MD5 y AES-128-CFB y no podía garantizar la integridad de la cabecera; la documentación desaconseja su uso. Como el ID de autenticación incluye una marca de tiempo, los relojes del cliente y del servidor deben estar más o menos sincronizados, una fuente habitual de problemas del tipo «simplemente no conecta».

## ¿Qué tan difícil es bloquear VMess?

Por sí solo, VMess parece una secuencia de bytes aleatorios, lo que lo deja en la misma situación que [Shadowsocks](/vpn-protocols/shadowsocks): expuesto a los cortafuegos que bloquean el tráfico totalmente cifrado. Por eso VMess suele desplegarse dentro de WebSocket o gRPC sobre TLS, detrás de un dominio y un certificado, de modo que un observador ve lo que parece una conexión HTTPS normal a un sitio web.

Esa envoltura hace la mayor parte del trabajo de ocultar el tráfico, y tiene costes: necesitas un dominio, un certificado y a menudo una CDN delante del servidor, y además el servidor cifra los datos dos veces, una para TLS y otra para VMess.

## ¿VMess, VLESS o Trojan?

El proyecto Xray diseñó [VLESS](/vpn-protocols/vless-reality) como un sucesor más ligero: conserva la identidad basada en UUID, pero elimina el cifrado propio de VMess y depende por completo de la capa TLS, lo que evita el doble cifrado. [Trojan](/vpn-protocols/trojan) adopta un enfoque similar con una contraseña en lugar de un UUID. Nuestra comparativa de [VLESS, VMess y Trojan](https://www.dopplervpn.org/en/blog/vless-vs-vmess-vs-trojan) entra en los detalles.

## ¿Doppler usa VMess?

No. Doppler usa VLESS con Reality. La guía [por qué VLESS](/vpn-protocols/why-vless) explica el motivo.
