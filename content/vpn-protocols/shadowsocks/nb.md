> **Kortversjonen.** Shadowsocks er en lett kryptert proxy som ble laget i Kina for å komme gjennom Den store brannmuren. I årevis virket den ved å ikke se ut som noe i det hele tatt. Siden 2021 viser forskning at brannmuren har blokkert nettopp den typen trafikk, fordi ekte trafikk sjelden er så tilfeldig.

## Hva er Shadowsocks?

Shadowsocks er en proxy-protokoll med åpen kildekode, først utgitt [i april 2012](https://en.wikipedia.org/wiki/Shadowsocks). Strengt tatt er den ikke en VPN: den er en proxy i SOCKS5-stil med kryptering, og appene avgjør hvilken trafikk som skal sendes gjennom den. I praksis tilbyr de fleste Shadowsocks-klienter nå en systemomfattende modus som oppfører seg som en VPN.

Den er populær fordi den er enkel og rask. De aktuelle versjonene bruker [AEAD-chiffer](https://shadowsocks.org/doc/aead.html), som gir konfidensialitet, integritet og autentisitet i ett steg, og [2022-utgaven](https://shadowsocks.org/doc/sip022.html) av protokollen strammet inn replay-beskyttelsen.

## Hvordan fungerer den?

Klienten og serveren deler et passord, som gjøres om til en krypteringsnøkkel. Alt klienten sender, også adressen til nettstedet den vil ha, er kryptert fra første byte. Det finnes ikke noe gjenkjennelig håndtrykk, ikke noe sertifikat og ingen header i klartekst. For en observatør er en Shadowsocks-tilkobling en strøm av byte som ser tilfeldige ut.

## Hvordan oppdager Den store brannmuren Shadowsocks?

Først gjennom aktiv sondering. Forskere ved GFW Report [registrerte](https://gfw.report/publications/imc20/en/) at brannmuren sendte titusenvis av sonder til mistenkte Shadowsocks-servere, og spilte av og endret ekte tilkoblinger for å se hvordan serveren reagerte.

Deretter, fra november 2021, gjennom en grovere og bredere metode. En [USENIX Security 2023-studie](https://gfw.report/publications/usenixsecurity23/en/) fant at brannmuren blokkerte «fullstendig kryptert» trafikk i sanntid. Den ser på den første pakken i en tilkobling og unntar alt som ser ut som en kjent protokoll eller inneholder nok utskrivbar tekst. Én regel måler gjennomsnittlig antall satte bit per byte: verdier på eller under 3.4, eller på eller over 4.6, unntas, og data som ser tilfeldige ut imellom, gjør det ikke. Det som er igjen, kan blokkeres.

Forskerne fant også at brannmuren brukte dette på omtrent 26% av tilkoblingene, og bare på IP-områder til populære datasentre, trolig for å begrense følgeskadene. Lærdommen for de som utformer protokoller, var tydelig: å se tilfeldig ut er i seg selv et fingeravtrykk.

## Når bør du bruke Shadowsocks?

- **Lett, rask proxybruk** i nettverk som ikke inspiserer trafikken nøye.
- **Egen drift** med verktøy som Outline, som gjør oppsettet enkelt.
- **Med forsiktighet ved kraftig filtrering.** I Kina og andre steder som blokkerer fullstendig kryptert trafikk, er Shadowsocks langt mindre pålitelig enn protokoller som etterligner ekte TLS, for eksempel [VLESS-Reality](/vpn-protocols/vless-reality). [Historien vår om sensurprotokoller](/blog/censorship-protocol-history) følger hvordan feltet gikk videre.

## Bruker Doppler Shadowsocks?

Nei. Doppler bruker VLESS-Reality, av grunnene i [hvorfor VLESS](/vpn-protocols/why-vless).
