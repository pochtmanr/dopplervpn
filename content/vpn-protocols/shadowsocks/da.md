> **Den korte version.** Shadowsocks er en let krypteret proxy, der blev bygget i Kina for at komme gennem den store firewall. I årevis virkede den ved at ligne ingenting. Siden 2021 viser forskning, at firewallen har blokeret netop den slags trafik, fordi rigtig trafik sjældent er så tilfældig.

## Hvad er Shadowsocks?

Shadowsocks er en open source-proxyprotokol, først udgivet [i april 2012](https://en.wikipedia.org/wiki/Shadowsocks). Strengt taget er den ikke en VPN: det er en SOCKS5-lignende proxy med kryptering, og apps afgør, hvilken trafik der sendes igennem den. I praksis tilbyder de fleste Shadowsocks-klienter nu en systemdækkende tilstand, der opfører sig som en VPN.

Den er populær, fordi den er enkel og hurtig. De aktuelle versioner bruger [AEAD-chiffre](https://shadowsocks.org/doc/aead.html), som giver fortrolighed, integritet og ægthed i ét trin, og [2022-udgaven](https://shadowsocks.org/doc/sip022.html) af protokollen strammede beskyttelsen mod genafspilning.

## Hvordan virker den?

Klienten og serveren deler en adgangskode, som omdannes til en krypteringsnøgle. Alt, hvad klienten sender, inklusive adressen på det website, den vil nå, er krypteret fra den allerførste byte. Der er intet genkendeligt handshake, intet certifikat og ingen header i klartekst. For en iagttager er en Shadowsocks-forbindelse en strøm af byte, der ser tilfældige ud.

## Hvordan opdager den store firewall Shadowsocks?

Først gennem aktiv sondering. Forskere hos GFW Report [registrerede](https://gfw.report/publications/imc20/en/), at firewallen sendte titusindvis af sonder til mistænkte Shadowsocks-servere og genafspillede og ændrede rigtige forbindelser for at se, hvordan serveren reagerede.

Derefter, fra november 2021, gennem en grovere og bredere metode. Et [USENIX Security 2023-studie](https://gfw.report/publications/usenixsecurity23/en/) fandt, at firewallen blokerede "fuldt krypteret" trafik i realtid. Den ser på den første pakke i en forbindelse og undtager alt, der ligner en kendt protokol eller indeholder nok læsbar tekst. Én regel måler det gennemsnitlige antal satte bits pr. byte: værdier på eller under 3.4, eller på eller over 4.6, undtages, og tilfældigt udseende data derimellem er ikke undtaget. Det, der er tilbage, kan blokeres.

Forskerne fandt også, at firewallen anvendte det på omkring 26% af forbindelserne og kun på IP-områder for populære datacentre, sandsynligvis for at begrænse følgeskader. Læren for protokoldesignere var tydelig: at se tilfældig ud er i sig selv et fingeraftryk.

## Hvornår bør du bruge Shadowsocks?

- **Let, hurtig proxy** på netværk, der ikke inspicerer trafikken tæt.
- **Selvhosting** med værktøjer som Outline, som gør opsætningen ligetil.
- **Med forsigtighed under hård filtrering.** I Kina og andre steder, der blokerer fuldt krypteret trafik, er Shadowsocks langt mindre pålidelig end protokoller, der efterligner ægte TLS, såsom [VLESS-Reality](/vpn-protocols/vless-reality). Vores [historie om censurprotokoller](/blog/censorship-protocol-history) følger, hvordan feltet bevægede sig videre.

## Bruger Doppler Shadowsocks?

Nej. Doppler bruger VLESS-Reality af de grunde, der står i [hvorfor VLESS](/vpn-protocols/why-vless).
