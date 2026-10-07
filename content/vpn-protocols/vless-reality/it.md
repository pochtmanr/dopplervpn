> **In breve.** VLESS è un protocollo proxy minimale del progetto Xray. Reality è il livello TLS che fa sembrare una connessione VLESS una normale visita TLS 1.3 a un sito web reale e popolare, senza un dominio o un certificato tuoi. Insieme sono oggi la combinazione diffusa più difficile da bloccare per i censori. Questa pagina è il riassunto; la nostra [guida approfondita](/how-it-works/vless-reality-tunnel) ha il racconto completo.

## Che cos'è VLESS?

VLESS è stato [proposto nel luglio 2020](https://github.com/v2ray/v2ray-core/issues/2636) come successore più leggero di [VMess](/vpn-protocols/vmess). La sua [specifica](https://xtls.github.io/en/development/protocols/vless.html) è volutamente piccola: una versione del protocollo, un UUID di 16 byte che identifica l'utente, un campo add-on facoltativo, e il comando, la porta e l'indirizzo della destinazione. VLESS non ha una cifratura propria. Si affida al livello TLS sottostante, così il traffico non viene cifrato due volte.

VLESS fa parte di [Xray-core](https://github.com/XTLS/Xray-core), il progetto che si è separato da V2Ray nel novembre 2020 e che oggi guida lo sviluppo di questa famiglia di protocolli.

## Che cosa aggiunge Reality?

Protocolli come [Trojan](/vpn-protocols/trojan) si nascondono dentro il TLS verso il proprio dominio, e quel dominio diventa ciò che un censore può bloccare. [Reality](https://github.com/XTLS/REALITY), rilasciato in Xray-core [1.8.0 nel marzo 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), lo elimina.

Un server Reality presenta l'handshake TLS di un sito web reale di terze parti. Per un osservatore, la connessione è una normale visita TLS 1.3 a quel sito. Un client che conosce la chiave del server viene fatto passare al tunnel VLESS; chiunque altro, compresa una sonda attiva del censore, viene passato al sito web reale e ne vede il certificato autentico. Non c'è un dominio o un certificato Doppler da mettere in una lista di blocco.

## Quanto è difficile bloccare VLESS-Reality?

È l'opzione diffusa più resiliente che conosciamo, ma non è invisibile. Una ricerca pubblicata nel 2024 ha mostrato che [il TLS trasportato dentro il TLS si può identificare per impronta](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) in base a tempi e dimensioni dei pacchetti, e nel novembre 2025 gli utenti [hanno segnalato](https://github.com/net4people/bbs/issues/546) che alcuni ISP russi interrompevano le connessioni Reality. I provider rispondono regolando le impostazioni dei server e i siti che prendono in prestito, e il gioco del gatto col topo continua.

## Quanto è veloce?

Nell'uso quotidiano l'overhead è piccolo. L'intestazione VLESS viene inviata una volta per connessione, e il flusso XTLS Vision evita di cifrare una seconda volta il traffico web già cifrato. Poiché gira su TCP, VLESS-Reality può essere più lento dei protocolli UDP come [WireGuard](/vpn-protocols/wireguard) sulle reti con perdite, ma continua a funzionare dove quelli sono bloccati.

## Dove posso saperne di più?

- [Il tunnel VLESS-Reality, in profondità](/how-it-works/vless-reality-tunnel): storia, meccanismo, limiti.
- [Che cos'è VLESS?](/blog/what-is-vless) e [il formato URI di VLESS](/blog/vless-uri-format) sul nostro blog.
- [VPN VLESS](/vless-vpn): come Doppler confeziona VLESS-Reality in app a un tocco.
