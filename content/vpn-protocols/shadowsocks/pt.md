> **Resumo.** O Shadowsocks é um proxy criptografado leve, criado na China para atravessar o Grande Firewall. Durante anos funcionou por não se parecer com nada. Desde 2021, pesquisas mostram que o firewall bloqueia exatamente esse tipo de tráfego, porque o tráfego real raramente é tão aleatório.

## O que é o Shadowsocks?

O Shadowsocks é um protocolo de proxy de código aberto, lançado pela primeira vez [em abril de 2012](https://en.wikipedia.org/wiki/Shadowsocks). A rigor, não é uma VPN: é um proxy no estilo SOCKS5 com criptografia, e os aplicativos decidem qual tráfego enviar por ele. Na prática, a maioria dos clientes de Shadowsocks hoje oferece um modo para todo o sistema que se comporta como uma VPN.

Ele é popular por ser simples e rápido. As versões atuais usam [cifras AEAD](https://shadowsocks.org/doc/aead.html), que oferecem confidencialidade, integridade e autenticidade em uma só etapa, e a [edição de 2022](https://shadowsocks.org/doc/sip022.html) do protocolo reforçou a proteção contra replay.

## Como ele funciona?

O cliente e o servidor compartilham uma senha, que é transformada em uma chave de criptografia. Tudo o que o cliente envia, incluindo o endereço do site que ele quer acessar, é criptografado desde o primeiro byte. Não há handshake reconhecível, certificado nem cabeçalho em texto simples. Para um observador, uma conexão Shadowsocks é um fluxo de bytes de aparência aleatória.

## Como o Grande Firewall detecta o Shadowsocks?

Primeiro, por sondagem ativa. Pesquisadores do GFW Report [registraram](https://gfw.report/publications/imc20/en/) o firewall enviando dezenas de milhares de sondas a servidores Shadowsocks suspeitos, reproduzindo e alterando conexões reais para ver como o servidor reagia.

Depois, a partir de novembro de 2021, por um método mais grosseiro e mais abrangente. Um [estudo do USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) constatou que o firewall bloqueia em tempo real o tráfego "totalmente criptografado". Ele examina o primeiro pacote de uma conexão e dispensa qualquer coisa que se pareça com um protocolo conhecido ou que contenha texto imprimível suficiente. Uma das regras mede o número médio de bits ativados por byte: valores iguais ou inferiores a 3,4, ou iguais ou superiores a 4,6, são dispensados, e dados de aparência aleatória entre esses limites não são. O que sobra pode ser bloqueado.

Os pesquisadores também constataram que o firewall aplicava isso a cerca de 26% das conexões, e apenas a faixas de IP de data centers populares, provavelmente para limitar danos colaterais. A lição para quem projeta protocolos foi clara: parecer aleatório é, por si só, uma impressão digital.

## Quando usar o Shadowsocks?

- **Proxy leve e rápido** em redes que não inspecionam o tráfego de perto.
- **Servidor próprio** com ferramentas como o Outline, que tornam a configuração direta.
- **Com cautela sob filtragem pesada.** Na China e em outros lugares que bloqueiam tráfego totalmente criptografado, o Shadowsocks é muito menos confiável que protocolos que imitam TLS de verdade, como o [VLESS-Reality](/vpn-protocols/vless-reality). Nossa [história dos protocolos contra a censura](/blog/censorship-protocol-history) mostra como a área evoluiu.

## O Doppler usa o Shadowsocks?

Não. O Doppler usa VLESS-Reality, pelos motivos explicados em [por que VLESS](/vpn-protocols/why-vless).
