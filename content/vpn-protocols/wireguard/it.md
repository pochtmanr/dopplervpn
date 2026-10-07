> **In breve.** WireGuard è il protocollo VPN diffuso più veloce e semplice e, su una rete non filtrata, è un'ottima scelta. Tuttavia non è mai stato progettato per nascondere di essere una VPN e, in Russia, Iran e Cina, è tra i primi protocolli a essere bloccati.

## Che cos'è WireGuard?

WireGuard è un protocollo VPN scritto da Jason A. Donenfeld e rilasciato per la prima volta nel 2015. Il suo obiettivo era sostituire i protocolli grandi e configurabili che lo avevano preceduto con qualcosa di abbastanza piccolo da poter essere verificato. Nel marzo 2020 è stato [integrato nel kernel Linux 5.6](https://en.wikipedia.org/wiki/WireGuard) e oggi esistono app ufficiali per Windows, macOS, iOS, Android e Linux.

Invece di lasciare che ciascuna parte negozi una suite di cifrari, WireGuard fissa un solo insieme di primitive moderne. La sua [pagina del protocollo](https://www.wireguard.com/protocol/) le elenca: ChaCha20 con Poly1305 per la cifratura, Curve25519 per lo scambio di chiavi e BLAKE2s per l'hashing. Non c'è nulla da configurare in modo errato e nessuna opzione più vecchia e debole a cui ripiegare.

## Come funziona?

Ogni dispositivo ha una coppia di chiavi, un po' come in SSH. Client e server conoscono in anticipo le rispettive chiavi pubbliche e l'handshake si basa sul framework del protocollo Noise (la pagina del protocollo indica la costruzione esatta, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Tutti i pacchetti viaggiano su UDP](https://www.wireguard.com/protocol/) e una nuova sessione viene stabilita con un solo scambio di andata e ritorno.

È questo il motivo per cui WireGuard risulta veloce. C'è poco da negoziare, su Linux il codice gira all'interno del kernel del sistema operativo e il passaggio tra Wi-Fi e dati mobili viene gestito in modo trasparente perché il protocollo non mantiene aperta una connessione di lunga durata.

## Perché WireGuard viene bloccato?

La stessa semplicità che rende WireGuard facile da verificare lo rende anche facile da riconoscere. Il suo [whitepaper](https://www.wireguard.com/papers/wireguard.pdf) specifica i messaggi dell'handshake byte per byte: il primo pacchetto del client è sempre di 148 byte e la risposta è sempre di 92 byte, ciascuno che inizia con un campo fisso che indica il tipo di messaggio. A un sistema di deep packet inspection (DPI) basta una breve regola per individuare questo schema su UDP.

I censori hanno fatto esattamente questo. Nell'agosto 2023 gli utenti in Russia [hanno segnalato](https://github.com/net4people/bbs/issues/274) che i principali operatori mobili interrompevano le sessioni WireGuard subito dopo l'handshake. La cifratura continuava a proteggere il contenuto, ma la connessione in sé veniva meno.

Si tratta di un compromesso progettuale, non di un difetto. Gli autori di WireGuard hanno scelto un protocollo fisso e minimale, e il mimetismo non rientrava tra gli obiettivi. Progetti come [AmneziaWG](/vpn-protocols/amneziawg) modificano la forma dei pacchetti per ripristinare una certa copertura.

## Quando conviene usare WireGuard?

- **Reti non filtrate.** A casa, al lavoro o in viaggio in un paese che non blocca le VPN, WireGuard è difficile da battere per velocità e consumo della batteria.
- **Self-hosting.** Se gestisci un tuo server, WireGuard è uno dei protocolli più facili da configurare correttamente.
- **Non sotto filtraggio DPI.** Se la tua rete blocca le VPN, è più adatto un protocollo progettato per sembrare normale traffico web, come [VLESS-Reality](/vpn-protocols/vless-reality). Il nostro confronto tra [VLESS-Reality e WireGuard](/blog/vless-reality-vs-wireguard) approfondisce questo compromesso.

## Doppler usa WireGuard?

No. Le app di Doppler si connettono tramite VLESS-Reality, perché Doppler è pensato per le reti in cui WireGuard viene filtrato. La guida [perché VLESS](/vpn-protocols/why-vless) spiega il ragionamento.
