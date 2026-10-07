> **Resumo.** O Hysteria 2 é um protocolo de proxy construído sobre o QUIC, o transporte por trás do HTTP/3. Foi projetado para ter velocidade em conexões ruins e com perda de pacotes e, para quem não tem a senha, seu servidor se comporta como um site HTTP/3 comum. Seu ponto fraco é depender do UDP, que algumas redes limitam ou bloqueiam por completo.

## O que é o Hysteria 2?

O Hysteria é um projeto de código aberto da [apernet](https://github.com/apernet/hysteria); a versão 2, um protocolo reformulado, foi lançada em setembro de 2023. Como o Shadowsocks e o VLESS, é um proxy e não uma VPN clássica, e os clientes podem encaminhar todo um dispositivo por ele.

## Como ele funciona?

De acordo com sua [especificação do protocolo](https://v2.hysteria.network/docs/developers/Protocol/), o Hysteria 2 funciona sobre o QUIC, conforme definido na [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), com a extensão de datagramas não confiáveis para o tráfego UDP. O QUIC já oferece criptografia TLS 1.3, fluxos multiplexados e estabelecimento rápido de conexão.

É na autenticação que entra o disfarce. A especificação exige que um servidor Hysteria **deve implementar um servidor HTTP/3 real** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) e tratar as requisições como qualquer servidor web trataria. Um cliente se autentica com uma requisição HTTP/3 especial; qualquer outra pessoa, seja um visitante curioso ou uma sonda ativa, recebe respostas web comuns. A especificação afirma que, para um terceiro sem credenciais, o servidor se comporta exatamente como um servidor web HTTP/3 padrão.

## Por que ele é rápido?

O QUIC funciona sobre UDP e se recupera da perda de pacotes sem travar todos os fluxos, como o TCP faz. O Hysteria também pode usar seu próprio controle de congestionamento, voltado a conexões instáveis, então tende a manter a velocidade em redes móveis congestionadas, rotas de longa distância e Wi-Fi com interferência, onde os protocolos baseados em TCP ficam mais lentos.

## Quão difícil é bloquear o Hysteria 2?

Contra a sondagem ativa, ele se sai bem, já que as sondas veem um servidor web. A exposição está no transporte. Um censor pode limitar ou bloquear o UDP, ou o QUIC especificamente, sem quebrar a maioria dos sites, porque os navegadores recorrem ao HTTP/2 sobre TCP quando o HTTP/3 falha. Onde isso acontece, o Hysteria 2 não tem para onde ir, enquanto protocolos baseados em TCP, como o [VLESS-Reality](/vpn-protocols/vless-reality), continuam funcionando.

## Quando usar o Hysteria 2?

- **Conexões com perda de pacotes ou de longa distância**, em que o controle de congestionamento dele e a recuperação de perdas do QUIC compensam.
- **Redes que permitem UDP.** Verifique antes de depender dele.
- Como segundo protocolo, ao lado de uma opção TCP, para poder trocar quando o UDP é filtrado. Nosso [guia sobre censura](/bypass-censorship) explica como os filtros atingem os transportes.

## O Doppler usa o Hysteria 2?

Não. O Doppler usa VLESS-Reality sobre TCP, que continua funcionando em redes que bloqueiam o UDP. Veja [por que VLESS](/vpn-protocols/why-vless).
