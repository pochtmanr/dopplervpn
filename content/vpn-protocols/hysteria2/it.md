> **In breve.** Hysteria 2 è un protocollo proxy costruito su QUIC, il trasporto su cui poggia HTTP/3. È pensato per la velocità su connessioni scarse e con perdite, e per chi non ha la password il suo server si comporta come un normale sito web HTTP/3. Il punto debole è che dipende da UDP, che alcune reti limitano o bloccano del tutto.

## Che cos'è Hysteria 2?

Hysteria è un progetto open source di [apernet](https://github.com/apernet/hysteria); la versione 2, un protocollo riprogettato, è stata rilasciata nel settembre 2023. Come Shadowsocks e VLESS è un proxy anziché una VPN classica, e i client possono instradare un intero dispositivo attraverso di esso.

## Come funziona?

Secondo la sua [specifica del protocollo](https://v2.hysteria.network/docs/developers/Protocol/), Hysteria 2 gira su QUIC come definito nella [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), con l'estensione per i datagrammi non affidabili destinata al traffico UDP. QUIC fornisce già la cifratura TLS 1.3, flussi multiplexati e un avvio rapido della connessione.

L'autenticazione è il punto in cui entra il mimetismo. La specifica richiede che un server Hysteria **debba implementare un vero server HTTP/3** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) e gestire le richieste come farebbe qualsiasi server web. Un client si autentica con una richiesta HTTP/3 speciale; chiunque altro, visitatore curioso o sonda attiva, riceve risposte web ordinarie. La specifica afferma che, per un terzo senza credenziali, il server si comporta proprio come un normale server web HTTP/3.

## Perché è veloce?

QUIC gira su UDP e recupera dalla perdita di pacchetti senza bloccare ogni flusso come fa TCP. Hysteria può anche usare un proprio controllo di congestione, pensato per i collegamenti instabili, quindi tende a mantenere la velocità su reti mobili congestionate, percorsi a lunga distanza e Wi-Fi con interferenze, dove i protocolli basati su TCP rallentano.

## Quanto è difficile bloccare Hysteria 2?

Contro il probing attivo regge bene, perché le sonde vedono un server web. Il punto esposto è il trasporto. Un censore può limitare o bloccare UDP, o QUIC in particolare, senza rompere la maggior parte dei siti, perché i browser ripiegano su HTTP/2 su TCP quando HTTP/3 non funziona. Dove succede, Hysteria 2 non ha un'alternativa, mentre i protocolli basati su TCP come [VLESS-Reality](/vpn-protocols/vless-reality) continuano a funzionare.

## Quando conviene usare Hysteria 2?

- **Collegamenti con perdite o a lunga distanza**, dove il suo controllo di congestione e il recupero delle perdite di QUIC si ripagano.
- **Reti che consentono UDP.** Controlla prima di farci affidamento.
- Come secondo protocollo accanto a un'opzione TCP, così puoi passare all'altro quando UDP è filtrato. La nostra [guida alla censura](/bypass-censorship) spiega come i filtri prendono di mira i trasporti.

## Doppler usa Hysteria 2?

No. Doppler usa VLESS-Reality su TCP, che continua a funzionare sulle reti che bloccano UDP. Vedi [perché VLESS](/vpn-protocols/why-vless).
