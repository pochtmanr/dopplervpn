> **In breve.** Trojan nasconde il traffico proxy dentro una connessione TLS reale verso un sito web reale che controlli. Chi si connette senza la password ottiene semplicemente il sito. Funziona bene, ma servono un dominio e un certificato tuoi, e quelli si possono trovare e bloccare.

## Che cos'è Trojan?

Trojan è un protocollo proxy del [progetto trojan-gfw](https://github.com/trojan-gfw/trojan), rilasciato per la prima volta nell'ottobre 2017. L'idea è nel nome: invece di inventare un travestimento, si nasconde dentro il traffico cifrato più comune di internet, HTTPS.

## Come funziona?

La [descrizione del protocollo](https://trojan-gfw.github.io/trojan/protocol) è breve. Un server Trojan ascolta come un normale server HTTPS, con un certificato reale per un dominio reale. Il client esegue un vero handshake TLS. Poi, dentro la connessione cifrata, invia:

- l'hash SHA-224 della password condivisa, codificato in esadecimale, che è di 56 caratteri,
- un a capo,
- una piccola richiesta che dice dove deve andare il traffico, in un formato simile a SOCKS5,
- un altro a capo, seguito dal primo pezzo di dati.

Se l'hash e la richiesta sono validi, il server apre un tunnel verso la destinazione. Se qualcosa non va, il server tratta la connessione come "altri protocolli" e la passa a un server web di ripiego, così il visitatore vede un sito ordinario.

## Quanto è difficile bloccare Trojan?

Dall'esterno, una connessione Trojan è una sessione TLS verso il tuo dominio, con il tuo certificato. Le sonde attive ricevono in risposta un sito web reale. Questo rende Trojan molto più difficile da isolare rispetto ai protocolli che sembrano casuali, come [Shadowsocks](/vpn-protocols/shadowsocks).

Il punto debole è il dominio stesso. Ogni server ha bisogno di un dominio e di un certificato, e un censore che scopre quali domini appartengono a dei proxy può bloccarli per nome o per IP. I ricercatori hanno anche mostrato che il TLS trasportato dentro il TLS lascia schemi di tempi e di dimensioni che si possono [identificare per impronta](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), e questo riguarda Trojan e progetti simili.

[VLESS-Reality](/vpn-protocols/vless-reality) elimina il problema del dominio prendendo in prestito l'handshake TLS di un sito web esistente e popolare, invece del tuo.

## Quando conviene usare Trojan?

- **Quando controlli un dominio** e vuoi una configurazione semplice e ben compresa che sembri HTTPS.
- **Su reti filtrate in modo moderato**, dove è poco probabile che il tuo dominio venga preso di mira.
- Il nostro confronto tra [VLESS, VMess e Trojan](/blog/vless-vs-vmess-vs-trojan) aiuta se stai scegliendo tra loro.

## Doppler usa Trojan?

No. Doppler usa VLESS-Reality, che non ha bisogno di un dominio proprio. Vedi [perché VLESS](/vpn-protocols/why-vless).
