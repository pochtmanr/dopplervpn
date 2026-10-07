> **Kortversjonen.** VMess er den opprinnelige protokollen i V2Ray-prosjektet. Den krypterer sine egne headere og pakkes vanligvis inn i en annen transport, for eksempel WebSocket over TLS, for å se ut som nettrafikk. Den virker fortsatt, men etterfølgerne, VLESS og Trojan, gjør den samme jobben med mindre overhead.

## Hva er VMess?

VMess er den krypterte proxy-protokollen som [V2Ray-prosjektet](https://github.com/v2fly/v2ray-core) innførte da det startet i 2015. V2Ray vokste til en modulær plattform for å bygge proxyer: én kjerne, mange protokoller og transporter, og en rutingmotor som avgjør hvilken trafikk som går hvor. VMess var den første protokollen, og i flere år den viktigste.

Som Shadowsocks er VMess teknisk sett en proxy og ikke en VPN, men apper basert på V2Ray kan rute hele enheten din gjennom den.

## Hvordan fungerer den?

Hver bruker har en UUID som fungerer som legitimasjon. Ifølge [protokolldokumentasjonen](https://www.v2fly.org/en_US/developer/protocols/vmess.html) inneholder klientens forespørselsheader en kryptert autentiserings-ID bygget av et Unix-tidsstempel, et tilfeldig tall og en sjekksum, kryptert med en nøkkel avledet fra brukerens ID. Serveren bruker den til å kjenne igjen brukeren, og dekrypterer deretter resten av headeren og dataene.

Dokumentasjonen beskriver to måter å beskytte headeren på. Den moderne bruker AEAD-kryptering, som garanterer at headeren ikke er endret. Den eldre brukte MD5 og AES-128-CFB og kunne ikke garantere headerens integritet; dokumentasjonen advarer mot den. Fordi autentiserings-ID-en inneholder et tidsstempel, må klokken på klient og server være omtrent synkronisert, en vanlig kilde til problemer av typen «den kobler bare ikke til».

## Hvor vanskelig er det å blokkere VMess?

Alene ser VMess ut som tilfeldige byte, noe som setter den i samme situasjon som [Shadowsocks](/vpn-protocols/shadowsocks): utsatt for brannmurer som blokkerer fullstendig kryptert trafikk. Derfor rulles VMess vanligvis ut inne i WebSocket eller gRPC over TLS, bak et domene og et sertifikat, slik at en observatør ser det som ligner en vanlig HTTPS-tilkobling til et nettsted.

Det omslaget gjør det meste av jobben med å skjule trafikken, og det har en kostnad: du trenger et domene, et sertifikat og ofte et CDN foran serveren, og serveren krypterer nå data to ganger, én gang for TLS og én gang for VMess.

## VMess, VLESS eller Trojan?

[VLESS](/vpn-protocols/vless-reality) ble utformet av Xray-prosjektet som en lettere etterfølger: den beholder identiteten basert på UUID, men utelater VMess sin egen kryptering og støtter seg helt på TLS-laget, noe som unngår dobbel kryptering. [Trojan](/vpn-protocols/trojan) tar en lignende tilnærming med et passord i stedet for en UUID. Sammenligningen vår av [VLESS, VMess og Trojan](/blog/vless-vs-vmess-vs-trojan) går inn i detaljene.

## Bruker Doppler VMess?

Nei. Doppler bruker VLESS med Reality. Veiledningen [hvorfor VLESS](/vpn-protocols/why-vless) forklarer hvorfor.
