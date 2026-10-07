> **In breve.** Abbiamo costruito Doppler per chi si trova su reti che bloccano le VPN. Su quelle reti la domanda non è quale protocollo sia il più veloce sulla carta, ma quale sia ancora connesso domani. Abbiamo scelto VLESS con Reality perché dà a un censore il minimo da riconoscere e il minimo da bloccare, e accettiamo i compromessi che ne derivano.

## Per che cosa stavamo scegliendo?

Doppler è costruito per chi si connette da luoghi in cui le VPN vengono filtrate di proposito: Russia, Iran, Cina, parti del Golfo. Su quelle reti la cifratura è la parte facile. Ogni protocollo del nostro [confronto](/vpn-protocols) cifra bene. Ciò che li separa è se un sistema di filtraggio può capire che la connessione è una VPN, e che cosa può bloccare una volta che l'ha capito.

Abbiamo quindi giudicato ogni opzione su tre domande:

1. **Ha un'impronta fissa?** Un handshake di dimensione fissa o una porta standard si possono riconoscere con una sola regola.
2. **Che cosa succede quando un censore sonda il server?** I firewall si connettono in modo attivo ai proxy sospetti per vedere come rispondono.
3. **C'è qualcosa da mettere in una lista di blocco?** Un dominio, un certificato o un server riconoscibile è un bersaglio anche se il traffico stesso è ben nascosto.

## Perché non WireGuard, OpenVPN o IKEv2?

Tutti e tre non passano la prima domanda. I pacchetti di handshake di [WireGuard](/vpn-protocols/wireguard) sono sempre di 148 e 92 byte. [OpenVPN](/vpn-protocols/openvpn) è stato identificato in oltre l'85% dei flussi da ricercatori che lavoravano dentro un ISP reale. [IKEv2](/vpn-protocols/ikev2) gira su porte UDP standard che si possono scartare in blocco. Nell'agosto 2023 gli utenti in Russia [hanno segnalato](https://github.com/net4people/bbs/issues/274) operatori che interrompevano WireGuard e OpenVPN entro i primi pacchetti. Sono buoni protocolli per le reti aperte. Non sono stati progettati per le nostre.

## Perché non Shadowsocks o VMess?

Passano la prima domanda perché sembrano byte casuali, e quello si è rivelato un'impronta a sé. Dal novembre 2021 il Great Firewall [blocca il traffico completamente cifrato](https://gfw.report/publications/usenixsecurity23/en/) che non assomiglia ad alcun protocollo noto. [VMess](/vpn-protocols/vmess) si può avvolgere in TLS per evitarlo, ma poi gli serve un dominio, e si arriva alla terza domanda.

## Perché non Trojan?

[Trojan](/vpn-protocols/trojan) risponde bene alle prime due domande: è TLS reale, e le sonde vedono un sito web reale. Ma ogni server Trojan ha bisogno di un proprio dominio e di un proprio certificato. Quando un censore conosce quel dominio, può bloccarlo, e gestire molti domini è un inseguimento continuo.

## Che cosa fa bene VLESS-Reality

[VLESS-Reality](/vpn-protocols/vless-reality) risponde a tutte e tre:

- **Nessuna impronta fissa.** La connessione è TLS 1.3 su TCP, il traffico cifrato più comune di internet.
- **Le sonde vedono un sito web reale.** Reality inoltra chi non riesce ad autenticarsi al sito reale di cui prende in prestito l'handshake, con il certificato autentico di quel sito.
- **Niente di nostro da bloccare per nome.** Nell'handshake non ci sono un dominio o un certificato Doppler.

Gira anche su TCP, quindi continua a funzionare sulle reti che limitano o bloccano UDP, dove [Hysteria 2](/vpn-protocols/hysteria2) e [AmneziaWG](/vpn-protocols/amneziawg) faticano. E VLESS di per sé è piccolo: si affida a TLS per la cifratura invece di aggiungerne una propria, quindi non c'è una doppia cifratura.

## A che cosa abbiamo rinunciato

- **Velocità pura sui collegamenti con perdite.** TCP recupera dalla perdita di pacchetti meno fluidamente di QUIC o dell'UDP di WireGuard. Su una connessione pulita la differenza è piccola; su una scarsa può notarsi.
- **Supporto integrato nel sistema operativo.** Nessun sistema operativo include un client VLESS, quindi serve un'app. Abbiamo deciso che era accettabile e abbiamo costruito le nostre per iOS, Android, macOS e Windows.
- **Invisibilità perfetta.** Non esiste. La ricerca ha mostrato che [il TLS dentro il TLS si può identificare per impronta](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), e nel novembre 2025 alcuni ISP russi sono stati [segnalati](https://github.com/net4people/bbs/issues/546) mentre interrompevano le connessioni Reality. VLESS-Reality è un disegno per resistere alla censura, non una garanzia.

## Che cosa facciamo riguardo ai limiti

La censura cambia, quindi la scelta del protocollo non è la fine del lavoro. Regoliamo le impostazioni dei server e i siti che Reality prende in prestito man mano che il filtraggio cambia, e continuiamo a seguire le stesse ricerche e le segnalazioni della comunità citate in queste pagine. Se emerge un approccio migliore, questa pagina lo dirà.

Per la storia tecnica completa di come funziona VLESS-Reality, leggi [il tunnel VLESS-Reality](/how-it-works/vless-reality-tunnel). Per provarlo, vedi [VPN VLESS](/vless-vpn).
