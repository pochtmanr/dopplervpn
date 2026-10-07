> **In breve.** Shadowsocks è un proxy cifrato leggero, nato in Cina per attraversare il Great Firewall. Per anni ha funzionato sembrando proprio nulla. Dal 2021 la ricerca mostra che il firewall blocca proprio quel tipo di traffico, perché il traffico reale è raramente così casuale.

## Che cos'è Shadowsocks?

Shadowsocks è un protocollo proxy open source, rilasciato per la prima volta [nell'aprile 2012](https://en.wikipedia.org/wiki/Shadowsocks). In senso stretto non è una VPN: è un proxy in stile SOCKS5 con cifratura, e le app decidono quale traffico farvi passare. In pratica, la maggior parte dei client Shadowsocks offre oggi una modalità a livello di sistema che si comporta come una VPN.

È diffuso perché è semplice e veloce. Le versioni attuali usano [cifrari AEAD](https://shadowsocks.org/doc/aead.html), che forniscono riservatezza, integrità e autenticità in un solo passo, e l'[edizione 2022](https://shadowsocks.org/doc/sip022.html) del protocollo ha rafforzato la protezione contro i replay.

## Come funziona?

Client e server condividono una password, che viene trasformata in una chiave di cifratura. Tutto ciò che il client invia, compreso l'indirizzo del sito che vuole raggiungere, è cifrato fin dal primo byte. Non c'è un handshake riconoscibile, né un certificato, né un'intestazione in chiaro. Per un osservatore, una connessione Shadowsocks è un flusso di byte dall'aspetto casuale.

## Come fa il Great Firewall a rilevare Shadowsocks?

Prima, con il probing attivo. I ricercatori di GFW Report [hanno registrato](https://gfw.report/publications/imc20/en/) il firewall che inviava decine di migliaia di sonde a server Shadowsocks sospetti, riproducendo e alterando connessioni reali per vedere come reagiva il server.

Poi, dal novembre 2021, con un metodo più rozzo e più ampio. Uno [studio di USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) ha rilevato che il firewall blocca in tempo reale il traffico "completamente cifrato". Guarda il primo pacchetto di una connessione ed esenta tutto ciò che sembra un protocollo noto o contiene abbastanza testo stampabile. Una regola misura il numero medio di bit impostati per byte: i valori pari o inferiori a 3.4, oppure pari o superiori a 4.6, sono esenti, e i dati dall'aspetto casuale che stanno in mezzo no. Ciò che resta può essere bloccato.

I ricercatori hanno anche trovato che il firewall applicava questo a circa il 26% delle connessioni, e solo agli intervalli IP dei data center più usati, probabilmente per limitare i danni collaterali. La lezione per chi progetta protocolli era chiara: sembrare casuale è di per sé un'impronta.

## Quando conviene usare Shadowsocks?

- **Proxy leggero e veloce** su reti che non ispezionano il traffico da vicino.
- **Self-hosting** con strumenti come Outline, che rendono la configurazione semplice.
- **Con cautela sotto un filtraggio pesante.** In Cina e in altri luoghi che bloccano il traffico completamente cifrato, Shadowsocks è molto meno affidabile dei protocolli che imitano il TLS reale, come [VLESS-Reality](/vpn-protocols/vless-reality). La nostra [storia dei protocolli contro la censura](/blog/censorship-protocol-history) ripercorre come il settore sia andato avanti.

## Doppler usa Shadowsocks?

No. Doppler usa VLESS-Reality, per i motivi spiegati in [perché VLESS](/vpn-protocols/why-vless).
