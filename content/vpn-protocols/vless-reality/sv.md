> **Kort version.** VLESS är ett minimalt proxyprotokoll från Xray-projektet. Reality är TLS-lagret som får en VLESS-anslutning att se ut som ett vanligt TLS 1.3-besök på en riktig, populär webbplats, utan egen domän eller eget certifikat. Tillsammans är de för närvarande den kombination bland vanliga protokoll som är svårast för censorer att blockera. Den här sidan är sammanfattningen. Vår [fördjupade guide](/how-it-works/vless-reality-tunnel) har hela beskrivningen.

## Vad är VLESS?

VLESS [föreslogs i juli 2020](https://github.com/v2ray/v2ray-core/issues/2636) som en lättare efterföljare till [VMess](/vpn-protocols/vmess). [Specifikationen](https://xtls.github.io/en/development/protocols/vless.html) är medvetet liten: en protokollversion, ett UUID på 16 byte som identifierar användaren, ett valfritt tilläggsfält samt kommandot, porten och adressen för destinationen. VLESS har ingen egen kryptering. Det förlitar sig på TLS-lagret under, så trafiken krypteras inte två gånger.

VLESS ingår i [Xray-core](https://github.com/XTLS/Xray-core), projektet som bröt sig ur V2Ray i november 2020 och nu leder utvecklingen av den här protokollfamiljen.

## Vad tillför Reality?

Protokoll som [Trojan](/vpn-protocols/trojan) gömmer sig inuti TLS till din egen domän, och den domänen blir det en censor kan blockera. [Reality](https://github.com/XTLS/REALITY), som släpptes i Xray-core [1.8.0 i mars 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), tar bort den.

En Reality-server visar TLS-handskakningen från en riktig tredjepartswebbplats. För en betraktare är anslutningen ett normalt TLS 1.3-besök på den webbplatsen. En klient som känner till serverns nyckel släpps igenom till VLESS-tunneln. Alla andra, inklusive en censors aktiva sond, skickas vidare till den riktiga webbplatsen och ser dess äkta certifikat. Det finns ingen Doppler-domän eller något Doppler-certifikat att sätta på en blockeringslista.

## Hur svårt är det att blockera VLESS-Reality?

Det är det mest motståndskraftiga vanliga alternativet vi känner till, men det är inte osynligt. Forskning publicerad 2024 visade att [TLS som bärs inuti TLS kan identifieras via fingeravtryck](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) utifrån tidsåtgång och paketstorlekar, och i november 2025 [rapporterade](https://github.com/net4people/bbs/issues/546) användare att vissa ryska internetleverantörer bröt Reality-anslutningar. Leverantörer svarar genom att justera serverinställningar och de webbplatser de lånar, och katt-och-råtta-leken fortsätter.

## Hur snabbt är det?

I vanligt bruk är merkostnaden liten. VLESS-headern skickas en gång per anslutning, och XTLS Vision-flödet undviker att kryptera redan krypterad webbtrafik en andra gång. Eftersom det körs över TCP kan VLESS-Reality vara långsammare än UDP-protokoll som [WireGuard](/vpn-protocols/wireguard) i nät med paketförlust, men det fortsätter att fungera där de är blockerade.

## Var kan jag läsa mer?

- [VLESS-Reality-tunneln, på djupet](/how-it-works/vless-reality-tunnel): historik, mekanism, gränser.
- [Vad är VLESS?](/blog/what-is-vless) och [URI-formatet för VLESS](/blog/vless-uri-format) på vår blogg.
- [VLESS VPN](/vless-vpn): hur Doppler paketerar VLESS-Reality i appar med ett tryck.
