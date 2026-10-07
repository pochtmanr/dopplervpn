> **Kort version.** VMess är det ursprungliga protokollet i V2Ray-projektet. Det krypterar sina egna huvuden och lindas vanligtvis in i en annan transport, till exempel WebSocket över TLS, för att se ut som webbtrafik. Det fungerar fortfarande, men efterföljarna VLESS och Trojan gör samma arbete med mindre merkostnad.

## Vad är VMess?

VMess är det krypterade proxyprotokoll som [V2Ray-projektet](https://github.com/v2fly/v2ray-core) införde när det startade 2015. V2Ray växte till en modulär plattform för att bygga proxyservrar: en kärna, många protokoll och transporter, och en routingmotor som avgör vilken trafik som går vart. VMess var dess första protokoll och i flera år det huvudsakliga.

I likhet med Shadowsocks är VMess tekniskt en proxy snarare än en VPN, men appar byggda på V2Ray kan dirigera hela enheten genom det.

## Hur fungerar det?

Varje användare har ett UUID som fungerar som inloggningsuppgift. Enligt [protokolldokumentationen](https://www.v2fly.org/en_US/developer/protocols/vmess.html) innehåller klientens förfrågningshuvud ett krypterat autentiserings-ID byggt av en Unix-tidsstämpel, ett slumptal och en kontrollsumma, krypterat med en nyckel som härleds från användarens ID. Servern använder det för att känna igen användaren och dekrypterar sedan resten av huvudet och datan.

Dokumentationen beskriver två sätt att skydda huvudet. Det moderna använder AEAD-kryptering, som garanterar att huvudet inte har ändrats. Det äldre använde MD5 och AES-128-CFB och kunde inte garantera huvudets integritet. Dokumentationen avråder från det. Eftersom autentiserings-ID:t innehåller en tidsstämpel behöver klockorna hos klient och server vara ungefär synkade, en vanlig källa till problem av typen ”den ansluter bara inte”.

## Hur svårt är det att blockera VMess?

I sig själv ser VMess ut som slumpmässiga byte, vilket sätter det i samma läge som [Shadowsocks](/vpn-protocols/shadowsocks): utsatt för brandväggar som blockerar helt krypterad trafik. Därför används VMess vanligtvis inuti WebSocket eller gRPC över TLS, bakom en domän och ett certifikat, så att en betraktare ser något som liknar en normal HTTPS-anslutning till en webbplats.

Den omslutningen gör det mesta av arbetet med att dölja trafiken, och den har ett pris: du behöver en domän, ett certifikat och ofta ett CDN framför servern, och servern krypterar nu datan två gånger, en gång för TLS och en gång för VMess.

## VMess, VLESS eller Trojan?

[VLESS](/vpn-protocols/vless-reality) utformades av Xray-projektet som en lättare efterföljare: det behåller identiteten baserad på UUID men slopar VMess:s egen kryptering och förlitar sig helt på TLS-lagret, vilket undviker dubbel kryptering. [Trojan](/vpn-protocols/trojan) tar en liknande väg med ett lösenord i stället för ett UUID. Vår jämförelse av [VLESS, VMess och Trojan](/blog/vless-vs-vmess-vs-trojan) går in på detaljerna.

## Använder Doppler VMess?

Nej. Doppler använder VLESS med Reality. Guiden [varför VLESS](/vpn-protocols/why-vless) förklarar varför.
