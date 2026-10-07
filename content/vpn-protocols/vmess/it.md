> **In breve.** VMess è il protocollo originale del progetto V2Ray. Cifra le proprie intestazioni e di solito è avvolto in un altro trasporto, come WebSocket su TLS, per sembrare traffico web. Funziona ancora, ma i suoi successori, VLESS e Trojan, fanno lo stesso lavoro con meno overhead.

## Che cos'è VMess?

VMess è il protocollo proxy cifrato che il [progetto V2Ray](https://github.com/v2fly/v2ray-core) ha introdotto quando è partito nel 2015. V2Ray è cresciuto fino a diventare una piattaforma modulare per costruire proxy: un nucleo, molti protocolli e trasporti, e un motore di routing che decide quale traffico va dove. VMess è stato il suo primo protocollo e, per diversi anni, quello principale.

Come Shadowsocks, VMess è tecnicamente un proxy e non una VPN, ma le app basate su V2Ray possono instradare l'intero dispositivo attraverso di esso.

## Come funziona?

Ogni utente ha un UUID che funge da credenziale. Secondo la [documentazione del protocollo](https://www.v2fly.org/en_US/developer/protocols/vmess.html), l'intestazione della richiesta del client include un ID di autenticazione cifrato, costruito da un timestamp Unix, un numero casuale e un checksum, cifrato con una chiave derivata dall'ID dell'utente. Il server lo usa per riconoscere l'utente, poi decifra il resto dell'intestazione e i dati.

La documentazione descrive due modi di proteggere l'intestazione. Quello moderno usa la cifratura AEAD, che garantisce che l'intestazione non sia stata alterata. Quello più vecchio usava MD5 e AES-128-CFB e non poteva garantire l'integrità dell'intestazione; la documentazione lo sconsiglia. Poiché l'ID di autenticazione include un timestamp, gli orologi di client e server devono essere all'incirca sincronizzati: è una causa frequente dei problemi del tipo "proprio non si connette".

## Quanto è difficile bloccare VMess?

Da solo, VMess sembra byte casuali, e questo lo mette nella stessa posizione di [Shadowsocks](/vpn-protocols/shadowsocks): esposto ai firewall che bloccano il traffico completamente cifrato. Per questo VMess di solito si usa dentro WebSocket o gRPC su TLS, dietro un dominio e un certificato, così un osservatore vede ciò che sembra una normale connessione HTTPS verso un sito web.

Quell'involucro fa gran parte del lavoro di nascondere il traffico, e ha un costo: servono un dominio, un certificato e spesso una CDN davanti al server, e il server ora cifra i dati due volte, una volta per TLS e una volta per VMess.

## VMess, VLESS o Trojan?

[VLESS](/vpn-protocols/vless-reality) è stato progettato dal progetto Xray come successore più leggero: mantiene l'identità basata su UUID ma abbandona la cifratura propria di VMess e si affida interamente al livello TLS, il che evita la doppia cifratura. [Trojan](/vpn-protocols/trojan) segue un approccio simile, con una password al posto di un UUID. Il nostro confronto tra [VLESS, VMess e Trojan](/blog/vless-vs-vmess-vs-trojan) entra nei dettagli.

## Doppler usa VMess?

No. Doppler usa VLESS con Reality. La guida [perché VLESS](/vpn-protocols/why-vless) spiega il perché.
