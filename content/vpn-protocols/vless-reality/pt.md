> **Resumo.** O VLESS é um protocolo de proxy mínimo do projeto Xray. O Reality é a camada TLS que faz uma conexão VLESS parecer uma visita comum em TLS 1.3 a um site real e popular, sem domínio nem certificado próprios. Juntos, são hoje a combinação popular mais difícil de bloquear para os censores. Esta página é um resumo; nosso [guia detalhado](/how-it-works/vless-reality-tunnel) conta a história completa.

## O que é o VLESS?

O VLESS foi [proposto em julho de 2020](https://github.com/v2ray/v2ray-core/issues/2636) como um sucessor mais leve do [VMess](/vpn-protocols/vmess). Sua [especificação](https://xtls.github.io/en/development/protocols/vless.html) é propositalmente pequena: uma versão do protocolo, um UUID de 16 bytes que identifica o usuário, um campo opcional de extras e o comando, a porta e o endereço do destino. O VLESS não tem criptografia própria. Ele depende da camada TLS por baixo, então o tráfego não é criptografado duas vezes.

O VLESS faz parte do [Xray-core](https://github.com/XTLS/Xray-core), o projeto que se separou do V2Ray em novembro de 2020 e hoje lidera o desenvolvimento dessa família de protocolos.

## O que o Reality acrescenta?

Protocolos como o [Trojan](/vpn-protocols/trojan) se escondem dentro de TLS para o seu próprio domínio, e esse domínio passa a ser algo que um censor pode bloquear. O [Reality](https://github.com/XTLS/REALITY), lançado no Xray-core [1.8.0 em março de 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), elimina isso.

Um servidor Reality apresenta o handshake TLS de um site real de terceiros. Para um observador, a conexão é uma visita normal em TLS 1.3 a esse site. Um cliente que conhece a chave do servidor é encaminhado ao túnel VLESS; qualquer outro, inclusive a sonda ativa de um censor, é repassado ao site real e vê o certificado genuíno dele. Não há domínio nem certificado do Doppler para colocar em uma lista de bloqueio.

## Quão difícil é bloquear o VLESS-Reality?

É a opção popular mais resistente que conhecemos, mas não é invisível. Uma pesquisa publicada em 2024 mostrou que [TLS transportado dentro de TLS pode ser identificado](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) pelo tempo e pelo tamanho dos pacotes, e em novembro de 2025 usuários [relataram](https://github.com/net4people/bbs/issues/546) que alguns ISPs russos cortavam conexões Reality. Os provedores respondem ajustando as configurações dos servidores e os sites que tomam emprestados, e o jogo de gato e rato continua.

## Qual é a velocidade?

No uso diário, a sobrecarga é pequena. O cabeçalho do VLESS é enviado uma vez por conexão, e o fluxo XTLS Vision evita criptografar uma segunda vez um tráfego web que já é criptografado. Como funciona sobre TCP, o VLESS-Reality pode ser mais lento que protocolos UDP como o [WireGuard](/vpn-protocols/wireguard) em redes com perda de pacotes, mas continua funcionando onde esses são bloqueados.

## Onde posso saber mais?

- [O túnel VLESS-Reality, em detalhes](/how-it-works/vless-reality-tunnel): história, mecanismo, limites.
- [O que é o VLESS?](/blog/what-is-vless) e [o formato de URI do VLESS](/blog/vless-uri-format) no nosso blog.
- [VLESS VPN](/vless-vpn): como o Doppler empacota o VLESS-Reality em aplicativos de um toque.
