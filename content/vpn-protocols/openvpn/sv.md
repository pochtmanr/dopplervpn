> **Kort version.** OpenVPN är veteranen bland VPN:er med öppen källkod: flexibelt, med brett stöd och väl förstått efter mer än två decennier. Det är också långsammare än nyare protokoll och, enligt publicerad forskning, ett av de lättaste för en internetleverantör att känna igen via fingeravtryck.

## Vad är OpenVPN?

OpenVPN är fri VPN-programvara med öppen källkod, först släppt av James Yonan [i maj 2001](https://en.wikipedia.org/wiki/OpenVPN). Under större delen av 2000-talet och 2010-talet var det standardvalet för kommersiella VPN-tjänster och företags fjärråtkomst, och det levereras fortfarande i många routrar och företagsprodukter.

Det körs i användarutrymmet i stället för i operativsystemets kärna, och det förlitar sig på biblioteket OpenSSL och protokollet TLS för sitt nyckelutbyte. Porten som IANA har tilldelat är 1194, men OpenVPN kan köras över UDP eller TCP på nästan vilken port som helst.

## Hur fungerar det?

OpenVPN använder ett eget protokoll med två delar. En kontrollkanal använder TLS för att autentisera de två parterna, vanligtvis med certifikat, och för att komma överens om nycklar. En datakanal bär sedan din trafik, krypterad med de nycklarna, inuti antingen UDP- eller TCP-paket.

Den strukturen gör OpenVPN mycket konfigurerbart. Du kan välja chiffer, autentiseringsmetoder, portar och transporter, och köra det genom proxyservrar. Priset för den flexibiliteten är komplexitet: mer kod, fler inställningar och fler sätt att hamna i en svag konfiguration.

## Varför blockeras OpenVPN?

TLS inuti OpenVPN är inte samma sak som ett HTTPS-besök på en webbplats. OpenVPN lindar in sin TLS-handskakning i en egen paketinramning, så trafiken har en form som vanlig webbtrafik inte har.

Forskare har mätt hur mycket det spelar roll. Ett team från University of Michigan och andra [byggde ett system för fingeravtryck](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) och körde det inne i en internetleverantör med ungefär en miljon användare. Det identifierade **över 85% av OpenVPN-flödena** med mycket få falska positiva, och det fångade också de flesta kommersiella ”obfuskerade” OpenVPN-upplägg som de testade.

Filtreringen i praktiken följer forskningen. I augusti 2023 [rapporterade](https://github.com/net4people/bbs/issues/274) användare i Ryssland att mobiloperatörer bröt OpenVPN-anslutningar kort efter att de startat.

## När ska du använda OpenVPN?

- **Kompatibilitet.** Äldre routrar, företagsgatewayer och vissa företagsnät stöder OpenVPN och inget nyare.
- **Nät med enbart TCP.** OpenVPN kan köras över TCP när UDP är blockerat, vilket [WireGuard](/vpn-protocols/wireguard) inte kan utan hjälp.
- **Inte i filtrerade nät.** Där VPN:er blockeras brukar OpenVPN sluta fungera tidigt. Ett protokoll som imiterar vanlig webbtrafik, till exempel [VLESS-Reality](/vpn-protocols/vless-reality), är det bättre verktyget. Vår [censurguide](/bypass-censorship) förklarar hur filtersystem avgör vad som ska brytas.

## Använder Doppler OpenVPN?

Nej. Doppler använder VLESS-Reality på varje plattform. Guiden [varför VLESS](/vpn-protocols/why-vless) förklarar hur vi valde det.
