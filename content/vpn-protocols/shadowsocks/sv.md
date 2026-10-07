> **Kort version.** Shadowsocks är en krypterad lättviktsproxy som byggdes i Kina för att ta sig förbi den stora brandväggen. I åratal fungerade den genom att inte se ut som något alls. Sedan 2021 visar forskning att brandväggen blockerar just den sortens trafik, eftersom riktig trafik sällan är så slumpmässig.

## Vad är Shadowsocks?

Shadowsocks är ett proxyprotokoll med öppen källkod, först släppt [i april 2012](https://en.wikipedia.org/wiki/Shadowsocks). Strikt talat är det inte en VPN: det är en SOCKS5-liknande proxy med kryptering, och apparna avgör vilken trafik som ska skickas genom den. I praktiken erbjuder de flesta Shadowsocks-klienter nu ett systemomfattande läge som beter sig som en VPN.

Det är populärt eftersom det är enkelt och snabbt. De aktuella versionerna använder [AEAD-chiffer](https://shadowsocks.org/doc/aead.html), som ger konfidentialitet, integritet och autenticitet i ett steg, och [2022 års utgåva](https://shadowsocks.org/doc/sip022.html) av protokollet skärpte återuppspelningsskyddet.

## Hur fungerar det?

Klienten och servern delar ett lösenord, som görs om till en krypteringsnyckel. Allt klienten skickar, inklusive adressen till webbplatsen den vill nå, är krypterat från allra första byten. Det finns ingen igenkännbar handskakning, inget certifikat och inget huvud i klartext. För en betraktare är en Shadowsocks-anslutning en ström av byte som ser slumpmässiga ut.

## Hur upptäcker den stora brandväggen Shadowsocks?

Först genom aktiv sondering. Forskare vid GFW Report [dokumenterade](https://gfw.report/publications/imc20/en/) att brandväggen skickade tiotusentals sonder till misstänkta Shadowsocks-servrar och spelade upp och ändrade riktiga anslutningar för att se hur servern reagerade.

Sedan, från november 2021, genom en grövre och bredare metod. En [studie från USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) fann att brandväggen blockerar ”helt krypterad” trafik i realtid. Den tittar på det första paketet i en anslutning och undantar allt som ser ut som ett känt protokoll eller innehåller tillräckligt med läsbar text. En regel mäter det genomsnittliga antalet satta bitar per byte: värden på 3.4 eller lägre, eller på 4.6 eller högre, undantas, och data däremellan som ser slumpmässiga ut undantas inte. Det som blir kvar kan blockeras.

Forskarna fann också att brandväggen tillämpade detta på cirka 26% av anslutningarna, och bara på IP-intervall hos populära datacenter, troligen för att begränsa oavsiktlig påverkan. Lärdomen för den som utformar protokoll var tydlig: att se slumpmässig ut är i sig ett fingeravtryck.

## När ska du använda Shadowsocks?

- **Lätt, snabb proxy** i nät som inte inspekterar trafiken noga.
- **Egen server** med verktyg som Outline, som gör installationen okomplicerad.
- **Med försiktighet under hård filtrering.** I Kina och på andra platser som blockerar helt krypterad trafik är Shadowsocks betydligt mindre tillförlitligt än protokoll som imiterar riktig TLS, till exempel [VLESS-Reality](/vpn-protocols/vless-reality). Vår [historik över censurprotokoll](/blog/censorship-protocol-history) beskriver hur området gick vidare.

## Använder Doppler Shadowsocks?

Nej. Doppler använder VLESS-Reality, av de skäl som står i [varför VLESS](/vpn-protocols/why-vless).
