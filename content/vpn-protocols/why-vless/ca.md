> **En resum.** Vam crear Doppler per a les persones que són en xarxes que bloquegen les VPN. En aquestes xarxes la pregunta no és quin protocol és el més ràpid sobre el paper, sinó quin continua connectat demà. Vam triar VLESS amb Reality perquè deixa a un censor el mínim possible per reconèixer i el mínim possible per bloquejar, i n'acceptem els compromisos.

## Per a què triàvem?

Doppler està fet per a les persones que es connecten des de llocs on les VPN es filtren expressament: Rússia, l'Iran, la Xina, parts del Golf. En aquestes xarxes, el xifratge és la part fàcil. Cada protocol de la nostra [comparació](/vpn-protocols) xifra bé. El que els separa és si un sistema de filtratge pot saber que la connexió és una VPN, i què pot bloquejar un cop ho sap.

Per això vam jutjar cada opció amb tres preguntes:

1. **Té una empremta fixa?** Un handshake de mida fixa o un port estàndard es pot encaixar amb una sola regla.
2. **Què passa quan un censor sonda el servidor?** Els tallafocs es connecten activament als proxies sospitosos per veure com responen.
3. **Hi ha alguna cosa per posar en una llista de bloqueig?** Un domini, un certificat o un servidor reconeixible és un objectiu encara que el trànsit mateix estigui ben amagat.

## Per què no WireGuard, OpenVPN o IKEv2?

Tots tres fallen a la primera pregunta. Els paquets de handshake de [WireGuard](/vpn-protocols/wireguard) fan sempre 148 i 92 bytes. [OpenVPN](/vpn-protocols/openvpn) el van identificar en més del 85% dels fluxos uns investigadors que treballaven dins d'un proveïdor d'internet real. [IKEv2](/vpn-protocols/ikev2) funciona en ports UDP estàndard que es poden descartar en bloc. L'agost de 2023, usuaris a Rússia [van informar](https://github.com/net4people/bbs/issues/274) que els operadors tallaven WireGuard i OpenVPN als primers paquets. Són bons protocols per a xarxes obertes. No es van dissenyar per a les nostres.

## Per què no Shadowsocks o VMess?

Passen la primera pregunta perquè semblen bytes aleatoris, i això va resultar ser una empremta per si mateixa. Des del novembre de 2021, el Gran Tallafoc [bloqueja el trànsit totalment xifrat](https://gfw.report/publications/usenixsecurity23/en/) que no s'assembla a cap protocol conegut. [VMess](/vpn-protocols/vmess) es pot embolcallar en TLS per evitar-ho, però llavors necessita un domini, i això ens porta a la tercera pregunta.

## Per què no Trojan?

[Trojan](/vpn-protocols/trojan) respon bé a les dues primeres preguntes: és TLS real, i les sondes veuen un lloc web real. Però cada servidor Trojan necessita el seu propi domini i certificat. Un cop un censor aprèn aquest domini, el pot bloquejar, i mantenir molts dominis és una persecució constant.

## Què encerta VLESS-Reality

[VLESS-Reality](/vpn-protocols/vless-reality) respon a les tres:

- **Sense empremta fixa.** La connexió és TLS 1.3 sobre TCP, el trànsit xifrat més comú d'internet.
- **Les sondes veuen un lloc web real.** Reality reenvia qui no es pot autenticar al lloc real del qual agafa prestat el handshake, amb el certificat genuí d'aquest lloc.
- **Res de nostre per bloquejar pel nom.** Al handshake no hi ha cap domini ni certificat de Doppler.

A més, funciona sobre TCP, de manera que continua funcionant a les xarxes que alenteixen o bloquegen l'UDP, allà on [Hysteria 2](/vpn-protocols/hysteria2) i [AmneziaWG](/vpn-protocols/amneziawg) ho tenen difícil. I VLESS mateix és petit: es basa en TLS per al xifratge en lloc d'afegir-ne un de propi, de manera que no hi ha doble xifratge.

## A què vam renunciar

- **A la velocitat bruta en enllaços amb pèrdues.** TCP es recupera de la pèrdua de paquets amb menys gràcia que QUIC o que l'UDP de WireGuard. En una connexió neta la diferència és petita; en una de dolenta es pot notar.
- **Al suport integrat al sistema operatiu.** Cap sistema operatiu porta un client VLESS, de manera que cal una aplicació. Vam decidir que era acceptable i vam fer les nostres per a iOS, Android, macOS i Windows.
- **A la invisibilitat perfecta.** No existeix. La recerca ha mostrat que [el TLS dins de TLS es pot identificar per empremta](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), i el novembre de 2025 es [va informar](https://github.com/net4people/bbs/issues/546) que alguns proveïdors d'internet russos tallaven connexions Reality. VLESS-Reality és un disseny de resistència a la censura, no una garantia.

## Què fem amb aquests límits

La censura canvia, de manera que triar el protocol no és el final de la feina. Ajustem la configuració dels servidors i els llocs que Reality agafa en préstec a mesura que canvia el filtratge, i continuem seguint la mateixa recerca i els informes de la comunitat citats en aquestes pàgines. Si apareix un enfocament millor, aquesta pàgina ho dirà.

Per a la història tècnica completa de com funciona VLESS-Reality, llegeix [el túnel VLESS-Reality](/how-it-works/vless-reality-tunnel). Per provar-lo, mira [VLESS VPN](/vless-vpn).
