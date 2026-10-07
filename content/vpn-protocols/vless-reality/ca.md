> **En resum.** VLESS és un protocol de proxy mínim del projecte Xray. Reality és la capa TLS que fa que una connexió VLESS sembli una visita ordinària amb TLS 1.3 a un lloc web real i popular, sense domini ni certificat propis. Junts són, ara mateix, la combinació habitual més difícil de bloquejar per als censors. Aquesta pàgina n'és el resum; la nostra [guia en profunditat](/how-it-works/vless-reality-tunnel) en té la història completa.

## Què és VLESS?

VLESS es va [proposar el juliol de 2020](https://github.com/v2ray/v2ray-core/issues/2636) com a successor més lleuger de [VMess](/vpn-protocols/vmess). La seva [especificació](https://xtls.github.io/en/development/protocols/vless.html) és deliberadament petita: una versió del protocol, un UUID de 16 bytes que identifica l'usuari, un camp opcional de complements i l'ordre, el port i l'adreça de la destinació. VLESS no té xifratge propi. Es basa en la capa TLS de sota, de manera que el trànsit no es xifra dues vegades.

VLESS forma part d'[Xray-core](https://github.com/XTLS/Xray-core), el projecte que es va separar de V2Ray el novembre de 2020 i que ara encapçala el desenvolupament d'aquesta família de protocols.

## Què hi afegeix Reality?

Protocols com [Trojan](/vpn-protocols/trojan) s'amaguen dins de TLS cap al teu propi domini, i aquest domini es converteix en el que un censor pot bloquejar. [Reality](https://github.com/XTLS/REALITY), publicat a Xray-core [1.8.0 el març de 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), ho elimina.

Un servidor Reality presenta el handshake TLS d'un lloc web real de tercers. Per a un observador, la connexió és una visita normal amb TLS 1.3 a aquest lloc. Un client que coneix la clau del servidor passa al túnel VLESS; qualsevol altre, inclosa una sonda activa d'un censor, es passa al lloc web real i en veu el certificat genuí. No hi ha cap domini ni certificat de Doppler per posar en una llista de bloqueig.

## Com és de difícil bloquejar VLESS-Reality?

És l'opció habitual més resistent que coneixem, però no és invisible. Una recerca publicada el 2024 va mostrar que [el TLS transportat dins de TLS es pot identificar per empremta](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) pel temps i la mida dels paquets, i el novembre de 2025 uns usuaris [van informar](https://github.com/net4people/bbs/issues/546) que alguns proveïdors d'internet russos tallaven connexions Reality. Els proveïdors responen ajustant la configuració dels servidors i els llocs que prenen en préstec, i el joc del gat i la rata continua.

## Com n'és de ràpid?

En l'ús quotidià, la sobrecàrrega és petita. La capçalera VLESS s'envia una vegada per connexió, i el flux XTLS Vision evita xifrar una segona vegada el trànsit web que ja està xifrat. Com que funciona sobre TCP, VLESS-Reality pot ser més lent que els protocols UDP com [WireGuard](/vpn-protocols/wireguard) en xarxes amb pèrdues, però continua funcionant allà on aquells estan bloquejats.

## On puc saber-ne més?

- [El túnel VLESS-Reality, en profunditat](/how-it-works/vless-reality-tunnel): història, mecanisme, límits.
- [Què és VLESS?](/blog/what-is-vless) i [el format d'URI VLESS](/blog/vless-uri-format) al nostre blog.
- [VLESS VPN](/vless-vpn): com Doppler empaqueta VLESS-Reality en aplicacions d'un sol toc.
