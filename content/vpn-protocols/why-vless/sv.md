> **Kort version.** Vi byggde Doppler för människor i nät som blockerar VPN:er. I de näten är frågan inte vilket protokoll som är snabbast på papperet, utan vilket som fortfarande är anslutet i morgon. Vi valde VLESS med Reality eftersom det ger en censor minst att känna igen och minst att blockera, och vi accepterar de avvägningar som följer med det.

## Vad valde vi för?

Doppler är byggt för människor som ansluter från platser där VPN:er filtreras med avsikt: Ryssland, Iran, Kina, delar av Gulfstaterna. I de näten är kryptering den lätta delen. Vartenda protokoll i vår [jämförelse](/vpn-protocols) krypterar väl. Det som skiljer dem åt är om ett filtersystem kan se att anslutningen är en VPN, och vad det kan blockera när det väl gör det.

Därför bedömde vi varje alternativ utifrån tre frågor:

1. **Har det ett fast fingeravtryck?** En handskakning med fast storlek eller en standardport kan matchas av en enda regel.
2. **Vad händer när en censor sonderar servern?** Brandväggar ansluter aktivt till misstänkta proxyservrar för att se hur de svarar.
3. **Finns det något att sätta på en blockeringslista?** En domän, ett certifikat eller en igenkännbar server är ett mål även om själva trafiken är väl dold.

## Varför inte WireGuard, OpenVPN eller IKEv2?

Alla tre faller på den första frågan. [WireGuard](/vpn-protocols/wireguard)s handskakningspaket är alltid 148 och 92 byte. [OpenVPN](/vpn-protocols/openvpn) identifierades i över 85% av flödena av forskare som arbetade inne i en riktig internetleverantör. [IKEv2](/vpn-protocols/ikev2) körs på vanliga UDP-portar som kan spärras i ett svep. I augusti 2023 [rapporterade](https://github.com/net4people/bbs/issues/274) användare i Ryssland att operatörer bröt WireGuard och OpenVPN redan i de första paketen. Det är bra protokoll för öppna nät. De utformades inte för våra nät.

## Varför inte Shadowsocks eller VMess?

De klarar den första frågan genom att se ut som slumpmässiga byte, och det visade sig vara ett fingeravtryck i sig. Sedan november 2021 har den stora brandväggen [blockerat helt krypterad trafik](https://gfw.report/publications/usenixsecurity23/en/) som inte liknar något känt protokoll. [VMess](/vpn-protocols/vmess) kan lindas in i TLS för att undvika det, men då behövs en domän, vilket för oss till den tredje frågan.

## Varför inte Trojan?

[Trojan](/vpn-protocols/trojan) svarar väl på de två första frågorna: det är riktig TLS, och sonderingar ser en riktig webbplats. Men varje Trojan-server behöver en egen domän och ett eget certifikat. När en censor väl känner till den domänen kan den blockeras, och att driva många domäner är en ständig jakt.

## Vad VLESS-Reality gör rätt

[VLESS-Reality](/vpn-protocols/vless-reality) svarar på alla tre:

- **Inget fast fingeravtryck.** Anslutningen är TLS 1.3 över TCP, den vanligaste krypterade trafiken på internet.
- **Sonderingar ser en riktig webbplats.** Reality skickar vidare den som inte kan autentisera sig till den riktiga webbplatsen vars handskakning det lånar, med den webbplatsens äkta certifikat.
- **Inget av vårt att blockera med namn.** Det finns ingen Doppler-domän eller något Doppler-certifikat i handskakningen.

Det körs också över TCP, så det fortsätter att fungera i nät som stryper eller blockerar UDP, där [Hysteria 2](/vpn-protocols/hysteria2) och [AmneziaWG](/vpn-protocols/amneziawg) får det svårt. Och VLESS i sig är litet: det förlitar sig på TLS för kryptering i stället för att lägga till en egen, så det blir ingen dubbel kryptering.

## Vad vi avstod från

- **Rå hastighet på länkar med paketförlust.** TCP återhämtar sig från paketförlust mindre smidigt än QUIC eller WireGuards UDP. På en ren anslutning är skillnaden liten. På en dålig kan den märkas.
- **Inbyggt stöd i operativsystemet.** Inget operativsystem levereras med en VLESS-klient, så du behöver en app. Vi bedömde att det var godtagbart och byggde egna för iOS, Android, macOS och Windows.
- **Fullständig osynlighet.** Den finns inte. Forskning har visat att [TLS inuti TLS kan identifieras via fingeravtryck](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), och i november 2025 [rapporterades](https://github.com/net4people/bbs/issues/546) att vissa ryska internetleverantörer bröt Reality-anslutningar. VLESS-Reality är en konstruktion för censurmotstånd, inte en garanti.

## Vad vi gör åt gränserna

Censuren förändras, så protokollvalet är inte slutet på arbetet. Vi justerar serverinställningar och de webbplatser Reality lånar när filtreringen ändras, och vi fortsätter att följa samma forskning och gemenskapsrapporter som citeras på de här sidorna. Om ett bättre tillvägagångssätt dyker upp kommer den här sidan att säga det.

Den fullständiga tekniska beskrivningen av hur VLESS-Reality fungerar finns i [VLESS-Reality-tunneln](/how-it-works/vless-reality-tunnel). För att prova det, se [VLESS VPN](/vless-vpn).
