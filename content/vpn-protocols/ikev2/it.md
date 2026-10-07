> **In breve.** IKEv2/IPsec è la VPN che il tuo telefono e il tuo portatile sanno già parlare, senza alcuna app. È veloce e gestisce bene il passaggio tra Wi-Fi e dati mobili. Gira anche su porte fisse e ben note, e questo la rende uno dei protocolli più semplici da bloccare per un censore.

## Che cos'è IKEv2/IPsec?

"IKEv2" è in realtà due pezzi che lavorano insieme. IPsec è la suite che cifra e autentica i pacchetti IP. IKE, l'Internet Key Exchange, è il protocollo con cui le due parti si autenticano a vicenda e concordano le chiavi IPsec. La versione 2 di IKE è stata standardizzata [nel dicembre 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), e la specifica attuale è la [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Poiché è uno standard IETF, IKEv2 è integrato in iOS, macOS e Windows, e in Android dalla versione 11. Molti gateway VPN aziendali lo usano.

## Come funziona?

Lo scambio di chiavi avviene su UDP, [di solito sulla porta 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Una volta che le due parti concordano le chiavi, lo stack IPsec del sistema operativo cifra il traffico con l'Encapsulating Security Payload (ESP). Quando c'è di mezzo un router NAT, come su quasi ogni rete domestica e mobile, sia IKE sia ESP vengono avvolti in UDP sulla porta 4500.

IKEv2 ha un'estensione standard chiamata [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) che permette a una connessione di sopravvivere a un cambio di indirizzo IP. Per questo IKEv2 è comodo sui telefoni: esci dalla portata del Wi-Fi e passi ai dati mobili, e il tunnel prosegue invece di riconnettersi da zero.

## Perché IKEv2 è facile da bloccare?

IKEv2 non cerca di sembrare qualcos'altro. Il suo traffico usa porte UDP ben note e ha i formati standard di IKE ed ESP, che qualsiasi strumento di rete può analizzare. Bloccarlo non richiede nemmeno la deep packet inspection: un filtro può scartare le porte UDP 500 e 4500, oppure riconoscere direttamente lo scambio IKE.

È un compromesso ragionevole per le reti aziendali e per i viaggi in paesi aperti, dove essere riconosciuti come una VPN non costa nulla. Sulle reti che filtrano le VPN di proposito, di solito è la prima cosa che smette di funzionare.

## Quando conviene usare IKEv2?

- **Nessuna app consentita.** Su un dispositivo gestito dove non puoi installare software, il client IKEv2 integrato può essere l'unica opzione.
- **Roaming mobile su reti aperte.** MOBIKE rende fluido il passaggio da una rete all'altra.
- **Non sotto censura.** Sulle reti filtrate, scegli un protocollo progettato per mimetizzarsi, come [VLESS-Reality](/vpn-protocols/vless-reality). La nostra [guida alla censura](/bypass-censorship) spiega come funziona il blocco.

## Doppler usa IKEv2?

No. Doppler si connette con VLESS-Reality dentro le proprie app. Vedi [perché VLESS](/vpn-protocols/why-vless) per i motivi.
