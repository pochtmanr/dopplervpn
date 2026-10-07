> **In breve.** OpenVPN è il veterano delle VPN open source: flessibile, molto supportato e ben compreso dopo più di vent'anni. È anche più lento dei protocolli più recenti e, secondo le ricerche pubblicate, uno dei più facili da identificare per un ISP.

## Che cos'è OpenVPN?

OpenVPN è un software VPN libero e open source, rilasciato per la prima volta da James Yonan [nel maggio 2001](https://en.wikipedia.org/wiki/OpenVPN). Per gran parte degli anni 2000 e 2010 è stata la scelta predefinita dei servizi VPN commerciali e dell'accesso remoto aziendale, e si trova ancora in molti router e prodotti aziendali.

Gira nello spazio utente anziché nel kernel del sistema operativo, e si appoggia alla libreria OpenSSL e al protocollo TLS per lo scambio di chiavi. La porta assegnata dalla IANA è la 1194, ma OpenVPN può funzionare su UDP o TCP su quasi qualsiasi porta.

## Come funziona?

OpenVPN usa un protocollo proprio, in due parti. Un canale di controllo usa TLS per autenticare le due parti, di solito con certificati, e per concordare le chiavi. Un canale dati trasporta poi il traffico, cifrato con quelle chiavi, dentro pacchetti UDP o TCP.

Questa struttura rende OpenVPN molto configurabile. Si possono scegliere cifrari, metodi di autenticazione, porte e trasporti, e farlo passare attraverso proxy. Il costo di questa flessibilità è la complessità: più codice, più impostazioni e più modi di finire con una configurazione debole.

## Perché OpenVPN viene bloccato?

Il TLS dentro OpenVPN non è la stessa cosa di una visita HTTPS a un sito web. OpenVPN avvolge l'handshake TLS nel proprio framing dei pacchetti, quindi il traffico ha una forma che il normale traffico web non ha.

I ricercatori hanno misurato quanto conta. Un gruppo dell'Università del Michigan e altri [hanno costruito un sistema di fingerprinting](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) e lo hanno fatto girare dentro un ISP che serve circa un milione di utenti. Hanno identificato **oltre l'85% dei flussi OpenVPN** con pochissimi falsi positivi, e hanno riconosciuto anche la maggior parte delle configurazioni OpenVPN commerciali "offuscate" che hanno testato.

Il filtraggio reale segue la ricerca. Nell'agosto 2023 gli utenti in Russia [hanno segnalato](https://github.com/net4people/bbs/issues/274) che gli operatori mobili interrompevano le connessioni OpenVPN poco dopo l'avvio.

## Quando conviene usare OpenVPN?

- **Compatibilità.** Router più vecchi, gateway aziendali e alcune reti aziendali supportano OpenVPN e niente di più recente.
- **Reti solo TCP.** OpenVPN può funzionare su TCP quando UDP è bloccato, cosa che [WireGuard](/vpn-protocols/wireguard) non può fare senza aiuto.
- **Non sulle reti filtrate.** Dove le VPN sono bloccate, OpenVPN tende a fallire presto. Un protocollo che imita il normale traffico web, come [VLESS-Reality](/vpn-protocols/vless-reality), è lo strumento più adatto. La nostra [guida alla censura](/bypass-censorship) spiega come i sistemi di filtraggio decidono che cosa interrompere.

## Doppler usa OpenVPN?

No. Doppler usa VLESS-Reality su ogni piattaforma. La guida [perché VLESS](/vpn-protocols/why-vless) spiega come l'abbiamo scelto.
