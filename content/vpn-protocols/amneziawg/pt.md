> **Resumo.** O AmneziaWG é um fork do WireGuard que mantém sua velocidade e sua criptografia, mas altera o formato dos pacotes e os cabeçalhos que tornam o WireGuard fácil de identificar. É uma boa opção onde o WireGuard puro é bloqueado, com uma ressalva: com a ofuscação ativada, ele deixa de se comunicar com servidores WireGuard padrão.

## O que é o AmneziaWG?

O AmneziaWG é desenvolvido pela equipe por trás do [Amnezia VPN](https://amnezia.org/), um aplicativo de código aberto para manter o seu próprio servidor VPN. A [implementação em Go](https://github.com/amnezia-vpn/amneziawg-go) do projeto foi iniciada em 2023. Ele parte do [WireGuard](/vpn-protocols/wireguard), que é rápido e simples, mas tem um handshake fixo e reconhecível, e acrescenta uma camada que o disfarça.

## O que ele muda?

A [documentação do AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) descreve vários mecanismos, cada um controlado por parâmetros de configuração:

- **Cabeçalhos dinâmicos (H1–H4).** Os pacotes padrão do WireGuard começam com um tipo de mensagem fixo para cada um de seus quatro formatos de pacote. O AmneziaWG substitui esses valores por números escolhidos em intervalos configurados, de modo que duas configurações diferentes não compartilham cabeçalhos e nenhuma regra de filtro isolada corresponde a todas.
- **Aleatorização do comprimento dos pacotes (S1–S4).** No WireGuard, o pacote inicial do handshake tem sempre exatamente 148 bytes. O AmneziaWG adiciona prefixos aleatórios a cada tipo de pacote para que os tamanhos variem.
- **Pacotes de lixo (Jc, Jmin, Jmax).** Antes do handshake, o cliente envia uma quantidade configurável de pacotes pseudoaleatórios de comprimento aleatório, que borram o início da sessão tanto no tempo quanto no tamanho.
- **Proteção de cabeçalho.** As versões mais novas também podem criptografar o próprio campo de tipo de mensagem.

Por baixo, a criptografia e o projeto geral continuam sendo os do WireGuard.

## Quão difícil é bloquear o AmneziaWG?

Ele elimina as assinaturas simples que os filtros usam contra o WireGuard: tamanhos fixos e valores de cabeçalho fixos. Isso o torna muito mais resistente que o WireGuard puro em redes que bloqueiam VPNs.

Ele ainda funciona sobre UDP, então redes que limitam ou bloqueiam o UDP de forma ampla o afetam, e seu tráfego não imita nenhum aplicativo específico, como o [VLESS-Reality](/vpn-protocols/vless-reality) imita uma visita TLS a um site real. Um filtro que bloqueie diretamente UDP não reconhecível ainda poderia pegá-lo.

## Quando usar o AmneziaWG?

- **Onde o WireGuard é bloqueado**, mas o UDP ainda funciona, e você quer uma velocidade parecida com a do WireGuard.
- **Servidores próprios**, usando o aplicativo Amnezia VPN para configurá-los.
- Mantenha uma opção baseada em TCP, como o VLESS-Reality, para redes que filtram UDP. Nosso [guia para a Rússia](/vpn-for-russia) explica o que passa por lá atualmente.

## O Doppler usa o AmneziaWG?

Não. O Doppler usa VLESS-Reality. Veja [por que VLESS](/vpn-protocols/why-vless).
