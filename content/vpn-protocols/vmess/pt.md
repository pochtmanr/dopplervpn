> **Resumo.** O VMess é o protocolo original do projeto V2Ray. Ele criptografa os próprios cabeçalhos e costuma ser encapsulado em outro transporte, como WebSocket sobre TLS, para se parecer com tráfego web. Ainda funciona, mas seus sucessores, VLESS e Trojan, fazem o mesmo trabalho com menos sobrecarga.

## O que é o VMess?

O VMess é o protocolo de proxy criptografado que o [projeto V2Ray](https://github.com/v2fly/v2ray-core) introduziu quando começou, em 2015. O V2Ray cresceu e virou uma plataforma modular para construir proxies: um único núcleo, muitos protocolos e transportes, e um mecanismo de roteamento que decide para onde cada tráfego vai. O VMess foi seu primeiro protocolo e, por vários anos, o principal.

Assim como o Shadowsocks, o VMess é tecnicamente um proxy, e não uma VPN, mas os aplicativos baseados no V2Ray podem encaminhar todo o seu dispositivo por ele.

## Como ele funciona?

Cada usuário tem um UUID que funciona como credencial. De acordo com a [documentação do protocolo](https://www.v2fly.org/en_US/developer/protocols/vmess.html), o cabeçalho da requisição do cliente inclui um ID de autenticação criptografado, construído a partir de um timestamp Unix, um número aleatório e uma soma de verificação, criptografado com uma chave derivada do ID do usuário. O servidor o usa para reconhecer o usuário e, em seguida, descriptografa o restante do cabeçalho e os dados.

A documentação descreve duas formas de proteger o cabeçalho. A moderna usa criptografia AEAD, que garante que o cabeçalho não foi alterado. A mais antiga usava MD5 e AES-128-CFB e não conseguia garantir a integridade do cabeçalho; a documentação desaconselha seu uso. Como o ID de autenticação inclui um timestamp, os relógios do cliente e do servidor precisam estar mais ou menos sincronizados, uma fonte comum de problemas do tipo "simplesmente não conecta".

## Quão difícil é bloquear o VMess?

Sozinho, o VMess parece uma sequência de bytes aleatórios, o que o coloca na mesma situação do [Shadowsocks](/vpn-protocols/shadowsocks): exposto a firewalls que bloqueiam tráfego totalmente criptografado. É por isso que o VMess costuma ser implantado dentro de WebSocket ou gRPC sobre TLS, atrás de um domínio e de um certificado, de modo que um observador veja o que parece uma conexão HTTPS normal com um site.

Esse encapsulamento faz a maior parte do trabalho de esconder o tráfego, e traz custos: é preciso ter um domínio, um certificado e, muitas vezes, uma CDN na frente do servidor, e o servidor passa a criptografar os dados duas vezes, uma para o TLS e outra para o VMess.

## VMess, VLESS ou Trojan?

O [VLESS](/vpn-protocols/vless-reality) foi projetado pelo projeto Xray como um sucessor mais leve: mantém a identidade baseada em UUID, mas abandona a criptografia própria do VMess e depende inteiramente da camada TLS, o que evita a criptografia dupla. O [Trojan](/vpn-protocols/trojan) adota uma abordagem semelhante, com uma senha no lugar do UUID. Nossa comparação entre [VLESS, VMess e Trojan](/blog/vless-vs-vmess-vs-trojan) entra em mais detalhes.

## O Doppler usa o VMess?

Não. O Doppler usa VLESS com Reality. O guia [por que VLESS](/vpn-protocols/why-vless) explica o motivo.
