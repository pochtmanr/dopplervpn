> **Kort version.** IKEv2/IPsec är VPN:et som din telefon och din bärbara dator redan kan tala utan någon app. Det är snabbt och hanterar byte mellan Wi-Fi och mobildata väl. Det körs också på fasta, välkända portar, vilket gör det till ett av de enklaste protokollen för en censor att blockera.

## Vad är IKEv2/IPsec?

”IKEv2” är egentligen två delar som arbetar tillsammans. IPsec är sviten som krypterar och autentiserar IP-paket. IKE, Internet Key Exchange, är protokollet de två parterna använder för att autentisera varandra och komma överens om IPsec-nycklar. Version 2 av IKE standardiserades [i december 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), och den aktuella specifikationen är [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Eftersom det är en IETF-standard är IKEv2 inbyggt i iOS, macOS och Windows, och i Android sedan version 11. Många företags-VPN-gatewayer använder det.

## Hur fungerar det?

Nyckelutbytet körs över UDP, [vanligtvis på port 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). När de två parterna har kommit överens om nycklar krypterar operativsystemets IPsec-stack din trafik med Encapsulating Security Payload (ESP). När en NAT-router ligger emellan, som i nästan varje hem- och mobilnät, lindas både IKE och ESP in i UDP på port 4500.

IKEv2 har ett standardtillägg som heter [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) och låter en anslutning överleva ett byte av IP-adress. Därför är IKEv2 behagligt i telefonen: gå ur Wi-Fi-räckvidd och över till mobildata, så fortsätter tunneln i stället för att ansluta om från början.

## Varför är IKEv2 lätt att blockera?

IKEv2 försöker inte se ut som något annat. Trafiken använder välkända UDP-portar och har de vanliga formaten för IKE och ESP som vilket nätverksverktyg som helst kan tolka. Att blockera det kräver inte ens djup paketinspektion: ett filter kan spärra UDP-portarna 500 och 4500, eller känna igen IKE-utbytet direkt.

Det är en rimlig avvägning för företagsnät och resor i öppna länder, där det inte kostar något att kännas igen som en VPN. I nät som filtrerar VPN:er med avsikt är det oftast det första som slutar fungera.

## När ska du använda IKEv2?

- **Ingen app tillåten.** På en hanterad enhet där du inte kan installera program kan den inbyggda IKEv2-klienten vara det enda alternativet.
- **Mobil växling i öppna nät.** MOBIKE gör bytet smidigt när du rör dig mellan nät.
- **Inte under censur.** I filtrerade nät väljer du ett protokoll som är gjort för att smälta in, till exempel [VLESS-Reality](/vpn-protocols/vless-reality). Vår [censurguide](/bypass-censorship) förklarar hur blockering fungerar.

## Använder Doppler IKEv2?

Nej. Doppler ansluter med VLESS-Reality i sina egna appar. Se [varför VLESS](/vpn-protocols/why-vless) för skälen.
