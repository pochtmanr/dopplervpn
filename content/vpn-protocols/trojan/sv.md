> **Kort version.** Trojan döljer proxytrafik inuti en riktig TLS-anslutning till en riktig webbplats som du kontrollerar. Den som ansluter utan lösenordet får helt enkelt webbplatsen. Det fungerar väl, men du behöver en egen domän och ett eget certifikat, och de kan hittas och blockeras.

## Vad är Trojan?

Trojan är ett proxyprotokoll från [trojan-gfw-projektet](https://github.com/trojan-gfw/trojan), först släppt i oktober 2017. Idén ligger i namnet: i stället för att uppfinna en förklädnad gömmer det sig inuti den vanligaste krypterade trafiken på internet, HTTPS.

## Hur fungerar det?

[Protokollbeskrivningen](https://trojan-gfw.github.io/trojan/protocol) är kort. En Trojan-server lyssnar som en normal HTTPS-server, med ett riktigt certifikat för en riktig domän. Klienten genomför en äkta TLS-handskakning. Sedan, inuti den krypterade anslutningen, skickar den:

- den hexkodade SHA-224-hashen av det delade lösenordet, som är 56 tecken,
- en radbrytning,
- en liten förfrågan om vart trafiken ska, i ett SOCKS5-liknande format,
- ytterligare en radbrytning, följd av den första delen av datan.

Om hashen och förfrågan är giltiga öppnar servern en tunnel till destinationen. Om något är fel behandlar servern anslutningen som ”andra protokoll” och skickar den vidare till en reservwebbserver, så besökaren ser en vanlig webbplats.

## Hur svårt är det att blockera Trojan?

Utifrån är en Trojan-anslutning en TLS-session till din domän, med ditt certifikat. Aktiva sonderingar får en riktig webbplats tillbaka. Det gör Trojan mycket svårare att peka ut än protokoll som ser slumpmässiga ut, till exempel [Shadowsocks](/vpn-protocols/shadowsocks).

Den svaga punkten är själva domänen. Varje server behöver en domän och ett certifikat, och en censor som får veta vilka domäner som tillhör proxyservrar kan blockera dem med namn eller IP. Forskare har också visat att TLS som bärs inuti TLS lämnar tids- och storleksmönster som kan [identifieras via fingeravtryck](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), vilket drabbar Trojan och liknande konstruktioner.

[VLESS-Reality](/vpn-protocols/vless-reality) tar bort domänproblemet genom att låna TLS-handskakningen från en befintlig, populär webbplats i stället för din egen.

## När ska du använda Trojan?

- **När du kontrollerar en domän** och vill ha en enkel, väl förstådd konfiguration som ser ut som HTTPS.
- **I måttligt filtrerade nät** där din domän troligen inte blir ett mål.
- Vår jämförelse av [VLESS, VMess och Trojan](/blog/vless-vs-vmess-vs-trojan) hjälper om du väljer mellan dem.

## Använder Doppler Trojan?

Nej. Doppler använder VLESS-Reality, som inte behöver en egen domän. Se [varför VLESS](/vpn-protocols/why-vless).
