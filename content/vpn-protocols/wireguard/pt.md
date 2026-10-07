> **Resumo.** O WireGuard é o protocolo de VPN popular mais rápido e mais simples e, em uma rede sem filtragem, é uma excelente escolha. Mas ele nunca foi projetado para esconder que é uma VPN e, na Rússia, no Irã e na China, está entre os primeiros protocolos a serem bloqueados.

## O que é o WireGuard?

O WireGuard é um protocolo de VPN escrito por Jason A. Donenfeld e lançado pela primeira vez em 2015. O objetivo era substituir os protocolos grandes e configuráveis que vieram antes por algo pequeno o bastante para ser auditado. Em março de 2020, ele foi [incorporado ao kernel Linux 5.6](https://en.wikipedia.org/wiki/WireGuard), e hoje existem aplicativos oficiais para Windows, macOS, iOS, Android e Linux.

Em vez de deixar cada lado negociar um conjunto de cifras, o WireGuard fixa um único conjunto de primitivas modernas. Sua [página do protocolo](https://www.wireguard.com/protocol/) as lista: ChaCha20 com Poly1305 para criptografia, Curve25519 para troca de chaves e BLAKE2s para hash. Não há nada para configurar errado e nenhuma opção mais antiga e mais fraca à qual recorrer.

## Como ele funciona?

Cada dispositivo tem um par de chaves, como no SSH. O cliente e o servidor conhecem as chaves públicas um do outro com antecedência, e o handshake é baseado no framework de protocolos Noise (a página do protocolo cita a construção exata, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Todos os pacotes são enviados por UDP](https://www.wireguard.com/protocol/), e uma nova sessão é estabelecida em uma única ida e volta.

Esse projeto é o motivo pelo qual o WireGuard parece rápido. Há pouco a negociar, o código é executado dentro do kernel do sistema operacional no Linux, e a troca entre Wi-Fi e dados móveis é tratada de forma discreta, porque o protocolo não mantém uma conexão de longa duração aberta.

## Por que o WireGuard é bloqueado?

A mesma simplicidade que torna o WireGuard fácil de auditar o torna fácil de reconhecer. Seu [whitepaper](https://www.wireguard.com/papers/wireguard.pdf) especifica as mensagens do handshake byte a byte, de modo que o primeiro pacote de um cliente tem sempre 148 bytes e a resposta tem sempre 92 bytes, cada um começando com um campo fixo de tipo de mensagem. Um sistema de inspeção profunda de pacotes (DPI) precisa apenas de uma regra curta para identificar esse padrão em UDP.

Os censores fizeram exatamente isso. Em agosto de 2023, usuários na Rússia [relataram](https://github.com/net4people/bbs/issues/274) que as principais operadoras móveis estavam cortando sessões WireGuard logo após o handshake. A criptografia continuava protegendo o conteúdo, mas a conexão em si era perdida.

Isso é uma escolha de projeto, não um bug. Os autores do WireGuard escolheram um protocolo fixo e mínimo, e disfarce não estava entre os objetivos. Projetos como o [AmneziaWG](/vpn-protocols/amneziawg) alteram o formato dos pacotes para restaurar alguma camuflagem.

## Quando usar o WireGuard?

- **Redes sem filtragem.** Em casa, no trabalho ou em viagem a um país que não bloqueia VPNs, o WireGuard é difícil de superar em velocidade e consumo de bateria.
- **Servidor próprio.** Se você mantém o próprio servidor, o WireGuard é um dos protocolos mais fáceis de configurar corretamente.
- **Fora de redes com filtragem por DPI.** Se a sua rede bloqueia VPNs, um protocolo criado para se parecer com tráfego web comum, como o [VLESS-Reality](/vpn-protocols/vless-reality), é mais adequado. Nossa comparação entre [VLESS-Reality e WireGuard](/blog/vless-reality-vs-wireguard) trata dessa diferença com mais detalhes.

## O Doppler usa o WireGuard?

Não. Os aplicativos do Doppler se conectam por VLESS-Reality, porque o Doppler foi criado para redes em que o WireGuard é filtrado. O guia [por que VLESS](/vpn-protocols/why-vless) explica o raciocínio.
