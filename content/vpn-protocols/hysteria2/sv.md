> **Kort version.** Hysteria 2 är ett proxyprotokoll byggt på QUIC, transporten bakom HTTP/3. Det är utformat för hastighet på dåliga anslutningar och anslutningar med paketförlust, och för den som saknar lösenordet beter sig servern som en vanlig HTTP/3-webbplats. Den svaga punkten är att det är beroende av UDP, som vissa nät stryper eller blockerar helt.

## Vad är Hysteria 2?

Hysteria är ett projekt med öppen källkod från [apernet](https://github.com/apernet/hysteria). Version 2, ett omarbetat protokoll, släpptes i september 2023. I likhet med Shadowsocks och VLESS är det en proxy snarare än en klassisk VPN, och klienter kan dirigera en hel enhet genom det.

## Hur fungerar det?

Enligt [protokollspecifikationen](https://v2.hysteria.network/docs/developers/Protocol/) körs Hysteria 2 över QUIC enligt [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), med tillägget för opålitliga datagram för UDP-trafik. QUIC ger redan TLS 1.3-kryptering, multiplexade strömmar och snabb anslutning.

Autentiseringen är där förklädnaden kommer in. Specifikationen kräver att en Hysteria-server **måste implementera en riktig HTTP/3-server** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) och hantera förfrågningar som vilken webbserver som helst. En klient autentiserar sig med en särskild HTTP/3-förfrågan. Alla andra, vare sig en nyfiken besökare eller en aktiv sond, får vanliga webbsvar. Specifikationen anger att servern, för en tredje part utan inloggningsuppgifter, beter sig precis som en vanlig HTTP/3-webbserver.

## Varför är det snabbt?

QUIC körs över UDP och återhämtar sig från paketförlust utan att stanna varje ström på det sätt som TCP gör. Hysteria kan också använda en egen överbelastningsstyrning, inriktad på instabila länkar, så det brukar hålla hastigheten i överbelastade mobilnät, på långa sträckor och i Wi-Fi med störningar, där TCP-baserade protokoll saktar in.

## Hur svårt är det att blockera Hysteria 2?

Mot aktiv sondering står det sig väl, eftersom sonderingar ser en webbserver. Det som avslöjar det är transporten. En censor kan strypa eller blockera UDP, eller QUIC i synnerhet, utan att de flesta webbplatser slutar fungera, eftersom webbläsare faller tillbaka på HTTP/2 över TCP när HTTP/3 misslyckas. Där det händer har Hysteria 2 ingenstans att ta vägen, medan TCP-baserade protokoll som [VLESS-Reality](/vpn-protocols/vless-reality) fortsätter att fungera.

## När ska du använda Hysteria 2?

- **Länkar med paketförlust eller långa sträckor**, där dess överbelastningsstyrning och QUIC:s återhämtning från paketförlust lönar sig.
- **Nät som tillåter UDP.** Kontrollera innan du förlitar dig på det.
- Som ett andra protokoll vid sidan av ett TCP-alternativ, så att du kan byta när UDP filtreras. Vår [censurguide](/bypass-censorship) tar upp hur filter riktar in sig på transporter.

## Använder Doppler Hysteria 2?

Nej. Doppler använder VLESS-Reality över TCP, som fortsätter att fungera i nät som blockerar UDP. Se [varför VLESS](/vpn-protocols/why-vless).
