> **Resumo.** O Trojan esconde o tráfego de proxy dentro de uma conexão TLS real com um site real que você controla. Quem se conecta sem a senha simplesmente recebe o site. Funciona bem, mas você precisa de um domínio e de um certificado próprios, e eles podem ser descobertos e bloqueados.

## O que é o Trojan?

O Trojan é um protocolo de proxy do [projeto trojan-gfw](https://github.com/trojan-gfw/trojan), lançado pela primeira vez em outubro de 2017. A ideia está no nome: em vez de inventar um disfarce, ele se esconde no tráfego criptografado mais comum da internet, o HTTPS.

## Como ele funciona?

A [descrição do protocolo](https://trojan-gfw.github.io/trojan/protocol) é curta. Um servidor Trojan escuta como um servidor HTTPS comum, com um certificado real para um domínio real. O cliente realiza um handshake TLS genuíno. Depois, dentro da conexão criptografada, ele envia:

- o hash SHA-224 da senha compartilhada, codificado em hexadecimal, com 56 caracteres,
- uma quebra de linha,
- uma pequena requisição indicando para onde o tráfego deve ir, em um formato semelhante ao SOCKS5,
- outra quebra de linha, seguida do primeiro bloco de dados.

Se o hash e a requisição forem válidos, o servidor abre um túnel até o destino. Se algo estiver errado, o servidor trata a conexão como "outros protocolos" e a repassa a um servidor web de fallback, de modo que o visitante vê um site comum.

## Quão difícil é bloquear o Trojan?

Vista de fora, uma conexão Trojan é uma sessão TLS com o seu domínio, usando o seu certificado. As sondas ativas recebem de volta um site real. Isso torna o Trojan muito mais difícil de isolar do que protocolos de aparência aleatória, como o [Shadowsocks](/vpn-protocols/shadowsocks).

O ponto fraco é o próprio domínio. Todo servidor precisa de um domínio e de um certificado, e um censor que descobre quais domínios pertencem a proxies pode bloqueá-los pelo nome ou pelo IP. Pesquisadores também mostraram que TLS transportado dentro de TLS deixa padrões de tempo e de tamanho que podem ser [identificados](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), o que afeta o Trojan e projetos semelhantes.

O [VLESS-Reality](/vpn-protocols/vless-reality) elimina o problema do domínio ao tomar emprestado o handshake TLS de um site existente e popular, em vez do seu próprio.

## Quando usar o Trojan?

- **Quando você controla um domínio** e quer uma configuração simples e bem conhecida que se pareça com HTTPS.
- **Em redes com filtragem moderada**, em que é improvável que o seu domínio seja alvo.
- Nossa comparação entre [VLESS, VMess e Trojan](/blog/vless-vs-vmess-vs-trojan) ajuda se você está escolhendo entre eles.

## O Doppler usa o Trojan?

Não. O Doppler usa VLESS-Reality, que não precisa de um domínio próprio. Veja [por que VLESS](/vpn-protocols/why-vless).
