> **Resumo.** Criamos o Doppler para pessoas em redes que bloqueiam VPNs. Nessas redes, a pergunta não é qual protocolo é mais rápido no papel, mas qual ainda estará conectado amanhã. Escolhemos o VLESS com Reality porque ele dá ao censor o mínimo para reconhecer e o mínimo para bloquear, e aceitamos as concessões que isso traz.

## O que estávamos buscando?

O Doppler é feito para pessoas que se conectam de lugares onde as VPNs são filtradas de propósito: Rússia, Irã, China, partes do Golfo. Nessas redes, a criptografia é a parte fácil. Todos os protocolos da nossa [comparação](/vpn-protocols) criptografam bem. O que os diferencia é se um sistema de filtragem consegue perceber que a conexão é uma VPN e o que ele consegue bloquear depois disso.

Por isso avaliamos cada opção com três perguntas:

1. **Ele tem uma impressão digital fixa?** Um handshake de tamanho fixo ou uma porta padrão pode ser identificado por uma única regra.
2. **O que acontece quando um censor sonda o servidor?** Os firewalls se conectam ativamente a proxies suspeitos para ver como eles respondem.
3. **Há algo para colocar em uma lista de bloqueio?** Um domínio, um certificado ou um servidor reconhecível é um alvo, mesmo que o tráfego em si esteja bem escondido.

## Por que não WireGuard, OpenVPN ou IKEv2?

Os três falham na primeira pergunta. Os pacotes de handshake do [WireGuard](/vpn-protocols/wireguard) têm sempre 148 e 92 bytes. O [OpenVPN](/vpn-protocols/openvpn) foi identificado em mais de 85% dos fluxos por pesquisadores que trabalhavam dentro de um ISP real. O [IKEv2](/vpn-protocols/ikev2) usa portas UDP padrão que podem ser descartadas em bloco. Em agosto de 2023, usuários na Rússia [relataram](https://github.com/net4people/bbs/issues/274) operadoras cortando WireGuard e OpenVPN nos primeiros pacotes. São bons protocolos para redes abertas. Não foram projetados para as nossas.

## Por que não Shadowsocks ou VMess?

Eles passam na primeira pergunta por parecerem bytes aleatórios, e isso se revelou uma impressão digital por si só. Desde novembro de 2021, o Grande Firewall [bloqueia tráfego totalmente criptografado](https://gfw.report/publications/usenixsecurity23/en/) que não se parece com nenhum protocolo conhecido. O [VMess](/vpn-protocols/vmess) pode ser encapsulado em TLS para evitar isso, mas então precisa de um domínio, o que nos leva à terceira pergunta.

## Por que não Trojan?

O [Trojan](/vpn-protocols/trojan) responde bem às duas primeiras perguntas: é TLS de verdade, e as sondas veem um site real. Mas todo servidor Trojan precisa do próprio domínio e certificado. Quando um censor descobre esse domínio, pode bloqueá-lo, e manter muitos domínios é uma perseguição constante.

## O que o VLESS-Reality acerta

O [VLESS-Reality](/vpn-protocols/vless-reality) responde às três:

- **Sem impressão digital fixa.** A conexão é TLS 1.3 sobre TCP, o tráfego criptografado mais comum da internet.
- **As sondas veem um site real.** O Reality encaminha quem não consegue se autenticar para o site real cujo handshake ele toma emprestado, com o certificado genuíno desse site.
- **Nada nosso para bloquear pelo nome.** Não há domínio nem certificado do Doppler no handshake.

Ele também funciona sobre TCP, então continua funcionando em redes que limitam ou bloqueiam o UDP, onde o [Hysteria 2](/vpn-protocols/hysteria2) e o [AmneziaWG](/vpn-protocols/amneziawg) têm dificuldade. E o próprio VLESS é pequeno: depende do TLS para a criptografia em vez de acrescentar a sua, então não há criptografia dupla.

## O que abrimos mão

- **Velocidade bruta em conexões com perda de pacotes.** O TCP se recupera da perda de pacotes com menos eficiência que o QUIC ou o UDP do WireGuard. Em uma conexão boa, a diferença é pequena; em uma ruim, pode ser perceptível.
- **Suporte nativo do sistema operacional.** Nenhum sistema operacional traz um cliente VLESS, então é preciso um aplicativo. Decidimos que isso era aceitável e criamos o nosso para iOS, Android, macOS e Windows.
- **Invisibilidade perfeita.** Ela não existe. Pesquisas mostraram que [TLS dentro de TLS pode ser identificado](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), e em novembro de 2025 houve [relatos](https://github.com/net4people/bbs/issues/546) de que alguns ISPs russos cortavam conexões Reality. O VLESS-Reality é um projeto de resistência à censura, não uma garantia.

## O que fazemos diante dos limites

A censura muda, então a escolha do protocolo não é o fim do trabalho. Ajustamos as configurações dos servidores e os sites que o Reality toma emprestados conforme a filtragem muda, e continuamos acompanhando as mesmas pesquisas e os mesmos relatos da comunidade citados nestas páginas. Se surgir uma abordagem melhor, esta página dirá isso.

Para a história técnica completa de como o VLESS-Reality funciona, leia [o túnel VLESS-Reality](/how-it-works/vless-reality-tunnel). Para experimentá-lo, veja [VLESS VPN](/vless-vpn).
