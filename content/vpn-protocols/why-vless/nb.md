> **Kortversjonen.** Vi bygde Doppler for folk i nettverk som blokkerer VPN-er. I de nettverkene er spørsmålet ikke hvilken protokoll som er raskest på papiret, men hvilken som fortsatt er tilkoblet i morgen. Vi valgte VLESS med Reality fordi den gir en sensor minst å kjenne igjen og minst å blokkere, og vi godtar avveiningene som følger med.

## Hva var valget til for?

Doppler er laget for folk som kobler til fra steder der VPN-er filtreres med vilje: Russland, Iran, Kina, deler av Persiabukta. I de nettverkene er kryptering den enkle delen. Hver protokoll i [sammenligningen](/vpn-protocols) vår krypterer godt. Det som skiller dem, er om et filtreringssystem kan se at tilkoblingen er en VPN, og hva det kan blokkere når det først ser det.

Derfor vurderte vi hvert alternativ ut fra tre spørsmål:

1. **Har den et fast fingeravtrykk?** Et håndtrykk med fast størrelse eller en standardport kan treffes av én enkelt regel.
2. **Hva skjer når en sensor sonderer serveren?** Brannmurer kobler seg aktivt til mistenkte proxyer for å se hvordan de svarer.
3. **Finnes det noe å sette på en blokkeringsliste?** Et domene, et sertifikat eller en gjenkjennelig server er et mål selv om selve trafikken er godt skjult.

## Hvorfor ikke WireGuard, OpenVPN eller IKEv2?

Alle tre feiler på det første spørsmålet. Håndtrykkpakkene til [WireGuard](/vpn-protocols/wireguard) er alltid 148 og 92 byte. [OpenVPN](/vpn-protocols/openvpn) ble identifisert i over 85% av flytene av forskere som arbeidet inne hos en ekte internettleverandør. [IKEv2](/vpn-protocols/ikev2) kjører på standard UDP-porter som kan forkastes i sin helhet. I august 2023 [rapporterte](https://github.com/net4people/bbs/issues/274) brukere i Russland at operatører kuttet WireGuard og OpenVPN i løpet av de første pakkene. Dette er gode protokoller for åpne nettverk. De ble ikke laget for våre.

## Hvorfor ikke Shadowsocks eller VMess?

De kommer gjennom det første spørsmålet ved å se ut som tilfeldige byte, og det viste seg å være et fingeravtrykk i seg selv. Siden november 2021 har Den store brannmuren [blokkert fullstendig kryptert trafikk](https://gfw.report/publications/usenixsecurity23/en/) som ikke ligner noen kjent protokoll. [VMess](/vpn-protocols/vmess) kan pakkes inn i TLS for å unngå det, men da trenger den et domene, og det fører oss til det tredje spørsmålet.

## Hvorfor ikke Trojan?

[Trojan](/vpn-protocols/trojan) svarer godt på de to første spørsmålene: det er ekte TLS, og sonder ser et ekte nettsted. Men hver Trojan-server trenger sitt eget domene og sertifikat. Når en sensor får vite det domenet, kan den blokkere det, og det å drive mange domener er en konstant jakt.

## Hva VLESS-Reality gjør riktig

[VLESS-Reality](/vpn-protocols/vless-reality) svarer på alle tre:

- **Ikke noe fast fingeravtrykk.** Tilkoblingen er TLS 1.3 over TCP, den vanligste krypterte trafikken på internett.
- **Sonder ser et ekte nettsted.** Reality videresender alle som ikke kan autentisere seg, til det ekte nettstedet den låner håndtrykket fra, med det nettstedets ekte sertifikat.
- **Ingenting av vårt å blokkere på navn.** Det er ikke noe Doppler-domene eller -sertifikat i håndtrykket.

Den kjører også over TCP, så den fortsetter å virke i nettverk som struper eller blokkerer UDP, der [Hysteria 2](/vpn-protocols/hysteria2) og [AmneziaWG](/vpn-protocols/amneziawg) sliter. Og VLESS selv er liten: den støtter seg på TLS til kryptering i stedet for å legge til sin egen, slik at det ikke blir dobbel kryptering.

## Hva vi ga avkall på

- **Rå hastighet på linker med pakketap.** TCP gjenoppretter etter pakketap mindre smidig enn QUIC eller WireGuards UDP. På en ren tilkobling er forskjellen liten; på en dårlig kan den merkes.
- **Innebygd støtte i operativsystemet.** Ingen operativsystem leveres med en VLESS-klient, så du trenger en app. Vi mente det var akseptabelt og bygde våre egne for iOS, Android, macOS og Windows.
- **Fullstendig usynlighet.** Den finnes ikke. Forskning har vist at [TLS inni TLS kan fingeravtrykkes](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), og i november 2025 ble noen russiske internettleverandører [rapportert](https://github.com/net4people/bbs/issues/546) å kutte Reality-tilkoblinger. VLESS-Reality er en utforming for motstand mot sensur, ikke en garanti.

## Hva vi gjør med grensene

Sensur endrer seg, så protokollvalget er ikke slutten på arbeidet. Vi justerer serverinnstillinger og nettstedene Reality låner etter hvert som filtreringen endrer seg, og vi følger med på den samme forskningen og de samme rapportene fra fellesskapet som disse sidene viser til. Hvis en bedre tilnærming dukker opp, vil denne siden si det.

For den fulle tekniske historien om hvordan VLESS-Reality virker, les [VLESS-Reality-tunnelen](/how-it-works/vless-reality-tunnel). For å prøve den, se [VLESS VPN](/vless-vpn).
