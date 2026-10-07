> **In breve.** AmneziaWG è un fork di WireGuard che ne conserva velocità e crittografia, ma cambia le forme dei pacchetti e le intestazioni che rendono WireGuard facile da individuare. È un'opzione solida dove il WireGuard semplice è bloccato, con un limite: con l'offuscamento attivo non parla più con i server WireGuard standard.

## Che cos'è AmneziaWG?

AmneziaWG è sviluppato dal team dietro [Amnezia VPN](https://amnezia.org/), un'app open source per gestire un proprio server VPN. L'[implementazione in Go](https://github.com/amnezia-vpn/amneziawg-go) del progetto è partita nel 2023. Prende [WireGuard](/vpn-protocols/wireguard), che è veloce e semplice ma ha un handshake fisso e riconoscibile, e aggiunge uno strato che lo maschera.

## Che cosa cambia?

La [documentazione di AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) descrive diversi meccanismi, ciascuno controllato da parametri di configurazione:

- **Intestazioni dinamiche (H1–H4).** I pacchetti standard di WireGuard iniziano con un tipo di messaggio fisso per ciascuno dei quattro formati di pacchetto. AmneziaWG sostituisce quei valori con numeri scelti da intervalli configurati, così due configurazioni diverse non condividono le intestazioni e nessuna singola regola di filtro corrisponde a tutte.
- **Randomizzazione della lunghezza dei pacchetti (S1–S4).** In WireGuard il pacchetto iniziale dell'handshake è sempre esattamente di 148 byte. AmneziaWG aggiunge prefissi casuali a ogni tipo di pacchetto, così le dimensioni variano.
- **Pacchetti spazzatura (Jc, Jmin, Jmax).** Prima dell'handshake, il client invia un numero configurabile di pacchetti pseudocasuali di lunghezza casuale, che rendono meno netto l'inizio della sessione, sia nel tempo sia nella dimensione.
- **Protezione dell'intestazione.** Le versioni più recenti possono anche cifrare il campo stesso del tipo di messaggio.

Sotto, la crittografia e il disegno complessivo restano quelli di WireGuard.

## Quanto è difficile bloccare AmneziaWG?

Elimina le firme semplici che i filtri usano contro WireGuard: dimensioni fisse e valori fissi delle intestazioni. Questo lo rende molto più resiliente del WireGuard semplice sulle reti che bloccano le VPN.

Gira ancora su UDP, quindi le reti che limitano o bloccano UDP in modo ampio lo colpiscono, e il suo traffico non imita una particolare applicazione, come fa [VLESS-Reality](/vpn-protocols/vless-reality) con una visita TLS a un sito web reale. Un filtro che blocca del tutto l'UDP non riconoscibile potrebbe ancora intercettarlo.

## Quando conviene usare AmneziaWG?

- **Dove WireGuard è bloccato** ma UDP funziona ancora, e vuoi una velocità simile a quella di WireGuard.
- **Server self-hosted**, usando l'app Amnezia VPN per configurarli.
- Tieni un'opzione basata su TCP, come VLESS-Reality, per le reti che filtrano UDP. La nostra [guida per la Russia](/vpn-for-russia) spiega che cosa passa attualmente lì.

## Doppler usa AmneziaWG?

No. Doppler usa VLESS-Reality. Vedi [perché VLESS](/vpn-protocols/why-vless).
