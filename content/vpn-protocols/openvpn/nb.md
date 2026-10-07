> **Kortversjonen.** OpenVPN er veteranen blant VPN-er med åpen kildekode: fleksibel, bredt støttet og godt forstått etter mer enn to tiår. Den er også tregere enn nyere protokoller og, ifølge publisert forskning, en av de enkleste for en internettleverandør å ta fingeravtrykk av.

## Hva er OpenVPN?

OpenVPN er gratis VPN-programvare med åpen kildekode, først utgitt av James Yonan [i mai 2001](https://en.wikipedia.org/wiki/OpenVPN). Det meste av 2000- og 2010-tallet var den standardvalget for kommersielle VPN-tjenester og ekstern tilgang i bedrifter, og den følger fortsatt med i mange rutere og bedriftsprodukter.

Den kjører i brukermodus, ikke i operativsystemets kjerne, og støtter seg på OpenSSL-biblioteket og TLS-protokollen til nøkkelutvekslingen. Porten tildelt av IANA er 1194, men OpenVPN kan kjøre over UDP eller TCP på nesten hvilken som helst port.

## Hvordan fungerer den?

OpenVPN bruker en egen protokoll med to deler. En kontrollkanal bruker TLS til å autentisere de to sidene, vanligvis med sertifikater, og til å bli enige om nøkler. En datakanal fører deretter trafikken din, kryptert med de nøklene, inne i enten UDP- eller TCP-pakker.

Den oppbyggingen gjør OpenVPN svært konfigurerbar. Du kan velge chiffer, autentiseringsmetoder, porter og transporter, og kjøre den gjennom proxyer. Prisen for fleksibiliteten er kompleksitet: mer kode, flere innstillinger og flere måter å ende opp med en svak konfigurasjon på.

## Hvorfor blir OpenVPN blokkert?

TLS inne i OpenVPN er ikke det samme som et HTTPS-besøk på et nettsted. OpenVPN pakker TLS-håndtrykket sitt inn i sin egen pakkeramme, så trafikken har en form som vanlig nettrafikk ikke har.

Forskere målte hvor mye det betyr. Et team fra Universitetet i Michigan og andre [bygde et fingeravtrykkssystem](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) og kjørte det hos en internettleverandør med omtrent en million brukere. Det identifiserte **over 85% av OpenVPN-flytene** med svært få falske positive, og det fanget også de fleste kommersielle «tilslørte» OpenVPN-oppsettene de testet.

Filtrering i praksis følger forskningen. I august 2023 [rapporterte](https://github.com/net4people/bbs/issues/274) brukere i Russland at mobiloperatører kuttet OpenVPN-tilkoblinger kort tid etter at de startet.

## Når bør du bruke OpenVPN?

- **Kompatibilitet.** Eldre rutere, bedriftsgatewayer og noen bedriftsnettverk støtter OpenVPN og ingenting nyere.
- **Nettverk med bare TCP.** OpenVPN kan kjøre over TCP når UDP er blokkert, noe [WireGuard](/vpn-protocols/wireguard) ikke kan uten hjelp.
- **Ikke i filtrerte nettverk.** Der VPN-er blokkeres, pleier OpenVPN å svikte tidlig. En protokoll som etterligner vanlig nettrafikk, for eksempel [VLESS-Reality](/vpn-protocols/vless-reality), er det bedre verktøyet. [Sensurveiledningen](/bypass-censorship) vår forklarer hvordan filtreringssystemer avgjør hva de skal kutte.

## Bruker Doppler OpenVPN?

Nei. Doppler bruker VLESS-Reality på alle plattformer. Veiledningen [hvorfor VLESS](/vpn-protocols/why-vless) forklarer hvordan vi valgte den.
