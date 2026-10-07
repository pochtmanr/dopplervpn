> **Resumo.** O OpenVPN é o veterano das VPNs de código aberto: flexível, amplamente compatível e bem compreendido após mais de duas décadas. Também é mais lento que os protocolos mais novos e, segundo pesquisas publicadas, um dos mais fáceis de identificar por uma operadora de internet (ISP).

## O que é o OpenVPN?

O OpenVPN é um software de VPN gratuito e de código aberto, lançado pela primeira vez por James Yonan [em maio de 2001](https://en.wikipedia.org/wiki/OpenVPN). Durante a maior parte das décadas de 2000 e 2010, foi a escolha padrão dos serviços comerciais de VPN e do acesso remoto corporativo, e ainda vem em muitos roteadores e produtos empresariais.

Ele é executado no espaço do usuário, e não no kernel do sistema operacional, e depende da biblioteca OpenSSL e do protocolo TLS para a troca de chaves. A porta atribuída pela IANA é a 1194, embora o OpenVPN possa funcionar por UDP ou TCP em quase qualquer porta.

## Como ele funciona?

O OpenVPN usa um protocolo próprio com duas partes. Um canal de controle usa TLS para autenticar os dois lados, em geral com certificados, e para combinar as chaves. Em seguida, um canal de dados transporta o seu tráfego, criptografado com essas chaves, dentro de pacotes UDP ou TCP.

Essa estrutura torna o OpenVPN muito configurável. É possível escolher cifras, métodos de autenticação, portas e transportes, e usá-lo por meio de proxies. O custo dessa flexibilidade é a complexidade: mais código, mais opções e mais maneiras de acabar com uma configuração fraca.

## Por que o OpenVPN é bloqueado?

O TLS dentro do OpenVPN não é o mesmo que uma visita HTTPS a um site. O OpenVPN envolve o handshake TLS em seu próprio enquadramento de pacotes, então o tráfego tem um formato que o tráfego web comum não tem.

Pesquisadores mediram o quanto isso importa. Uma equipe da Universidade de Michigan e de outras instituições [construiu um sistema de identificação](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) e o executou dentro de um ISP que atende cerca de um milhão de usuários. Ele identificou **mais de 85% dos fluxos de OpenVPN** com pouquíssimos falsos positivos, e também detectou a maioria das configurações comerciais de OpenVPN "ofuscado" que eles testaram.

A filtragem no mundo real segue a pesquisa. Em agosto de 2023, usuários na Rússia [relataram](https://github.com/net4people/bbs/issues/274) que operadoras móveis cortavam conexões OpenVPN pouco depois de elas começarem.

## Quando usar o OpenVPN?

- **Compatibilidade.** Roteadores mais antigos, gateways corporativos e algumas redes empresariais são compatíveis com o OpenVPN e com nada mais novo.
- **Redes somente TCP.** O OpenVPN pode funcionar por TCP quando o UDP está bloqueado, algo que o [WireGuard](/vpn-protocols/wireguard) não consegue fazer sem ajuda.
- **Fora de redes com filtragem.** Onde as VPNs são bloqueadas, o OpenVPN tende a falhar logo no início. Um protocolo que imita o tráfego web normal, como o [VLESS-Reality](/vpn-protocols/vless-reality), é a ferramenta mais adequada. Nosso [guia sobre censura](/bypass-censorship) explica como os sistemas de filtragem decidem o que cortar.

## O Doppler usa o OpenVPN?

Não. O Doppler usa VLESS-Reality em todas as plataformas. O guia [por que VLESS](/vpn-protocols/why-vless) explica como o escolhemos.
