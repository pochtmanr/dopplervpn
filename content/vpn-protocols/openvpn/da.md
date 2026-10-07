> **Den korte version.** OpenVPN er veteranen blandt open source-VPN'er: fleksibel, bredt understøttet og godt forstået efter mere end to årtier. Den er også langsommere end nyere protokoller og, ifølge offentliggjort forskning, en af de nemmeste for en internetudbyder at tage fingeraftryk af.

## Hvad er OpenVPN?

OpenVPN er fri open source-VPN-software, først udgivet af James Yonan [i maj 2001](https://en.wikipedia.org/wiki/OpenVPN). I det meste af 2000'erne og 2010'erne var den standardvalget for kommercielle VPN-tjenester og fjernadgang i virksomheder, og den følger stadig med i mange routere og virksomhedsprodukter.

Den kører i brugerområdet frem for i operativsystemets kerne og bygger på OpenSSL-biblioteket og TLS-protokollen til sin nøgleudveksling. Den port, IANA har tildelt, er 1194, men OpenVPN kan køre over UDP eller TCP på næsten enhver port.

## Hvordan virker den?

OpenVPN bruger en egen protokol med to dele. En kontrolkanal bruger TLS til at godkende de to sider, som regel med certifikater, og til at blive enige om nøgler. En datakanal fører derefter din trafik, krypteret med de nøgler, inde i enten UDP- eller TCP-pakker.

Den opbygning gør OpenVPN meget konfigurerbar. Du kan vælge chiffre, godkendelsesmetoder, porte og transporter og køre den gennem proxyer. Prisen for den fleksibilitet er kompleksitet: mere kode, flere indstillinger og flere måder at ende med en svag konfiguration.

## Hvorfor bliver OpenVPN blokeret?

TLS inde i OpenVPN er ikke det samme som et HTTPS-besøg på et website. OpenVPN pakker sit TLS-handshake ind i sin egen pakkeindramning, så trafikken har en form, som almindelig webtrafik ikke har.

Forskere målte, hvor meget det betyder. Et hold fra University of Michigan og andre [byggede et fingeraftrykssystem](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) og kørte det hos en internetudbyder med omkring en million brugere. Det genkendte **over 85% af OpenVPN-flows** med meget få falske positiver, og det fangede også de fleste af de kommercielle "obfuskerede" OpenVPN-opsætninger, de testede.

Filtrering i praksis følger forskningen. I august 2023 [rapporterede](https://github.com/net4people/bbs/issues/274) brugere i Rusland, at mobiloperatører afbrød OpenVPN-forbindelser kort efter, at de var startet.

## Hvornår bør du bruge OpenVPN?

- **Kompatibilitet.** Ældre routere, virksomhedsgateways og nogle virksomhedsnetværk understøtter OpenVPN og intet nyere.
- **Netværk kun med TCP.** OpenVPN kan køre over TCP, når UDP er blokeret, hvilket [WireGuard](/vpn-protocols/wireguard) ikke kan uden hjælp.
- **Ikke på filtrerede netværk.** Hvor VPN'er blokeres, fejler OpenVPN som regel tidligt. En protokol, der efterligner almindelig webtrafik, såsom [VLESS-Reality](/vpn-protocols/vless-reality), er det bedre værktøj. Vores [censurguide](/bypass-censorship) forklarer, hvordan filtreringssystemer afgør, hvad der skal skæres fra.

## Bruger Doppler OpenVPN?

Nej. Doppler bruger VLESS-Reality på alle platforme. Guiden [hvorfor VLESS](/vpn-protocols/why-vless) forklarer, hvordan vi valgte den.
