> **Resumo.** O IKEv2/IPsec é a VPN que o seu celular e o seu notebook já sabem usar sem nenhum aplicativo. É rápido e lida bem com a troca entre Wi-Fi e dados móveis. Ele também usa portas fixas e bem conhecidas, o que o torna um dos protocolos mais simples de bloquear para um censor.

## O que é o IKEv2/IPsec?

"IKEv2" são, na verdade, duas peças que trabalham juntas. O IPsec é o conjunto de protocolos que criptografa e autentica pacotes IP. O IKE, o Internet Key Exchange, é o protocolo que os dois lados usam para se autenticar mutuamente e combinar as chaves do IPsec. A versão 2 do IKE foi padronizada [em dezembro de 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), e a especificação atual é a [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Por ser um padrão do IETF, o IKEv2 é integrado ao iOS, ao macOS e ao Windows, e ao Android desde a versão 11. Muitos gateways de VPN corporativos o usam.

## Como ele funciona?

A troca de chaves ocorre por UDP, [em geral na porta 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Depois que os dois lados combinam as chaves, a pilha IPsec do sistema operacional criptografa o seu tráfego usando o Encapsulating Security Payload (ESP). Quando há um roteador NAT no caminho, como em quase toda rede doméstica e móvel, tanto o IKE quanto o ESP são encapsulados em UDP na porta 4500.

O IKEv2 tem uma extensão padrão chamada [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), que permite que uma conexão sobreviva a uma mudança de endereço IP. É por isso que o IKEv2 funciona bem em celulares: ao sair do alcance do Wi-Fi para os dados móveis, o túnel continua em vez de se reconectar do zero.

## Por que o IKEv2 é fácil de bloquear?

O IKEv2 não tenta se parecer com nada além de si mesmo. Seu tráfego usa portas UDP bem conhecidas e os formatos padrão de IKE e ESP, que qualquer ferramenta de rede consegue interpretar. Bloqueá-lo nem exige inspeção profunda de pacotes: um filtro pode descartar as portas UDP 500 e 4500, ou reconhecer diretamente a troca IKE.

É uma escolha razoável para redes corporativas e para viagens a países abertos, onde ser reconhecido como VPN não custa nada. Em redes que filtram VPNs de propósito, costuma ser a primeira coisa a deixar de funcionar.

## Quando usar o IKEv2?

- **Quando não é permitido instalar aplicativos.** Em um dispositivo gerenciado em que você não pode instalar software, o cliente IKEv2 integrado pode ser a única opção.
- **Roaming móvel em redes abertas.** O MOBIKE deixa a transição entre redes suave.
- **Sem censura.** Em redes com filtragem, escolha um protocolo projetado para se misturar ao tráfego comum, como o [VLESS-Reality](/vpn-protocols/vless-reality). Nosso [guia sobre censura](/bypass-censorship) explica como funciona o bloqueio.

## O Doppler usa o IKEv2?

Não. O Doppler se conecta com VLESS-Reality dentro dos seus próprios aplicativos. Veja [por que VLESS](/vpn-protocols/why-vless) para entender os motivos.
