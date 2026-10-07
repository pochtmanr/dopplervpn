> **Ve zkratce.** VMess je původní protokol projektu V2Ray. Sám šifruje své hlavičky a obvykle se balí do jiného transportu, například WebSocket přes TLS, aby vypadal jako webový provoz. Pořád funguje, ale jeho nástupci, VLESS a Trojan, dělají tutéž práci s menší režií.

## Co je VMess?

VMess je šifrovaný proxy protokol, který [projekt V2Ray](https://github.com/v2fly/v2ray-core) představil, když v roce 2015 začínal. V2Ray vyrostl v modulární platformu pro stavbu proxy: jedno jádro, mnoho protokolů a transportů a směrovací engine, který rozhoduje, který provoz kam půjde. VMess byl jeho první protokol a několik let i ten hlavní.

Stejně jako Shadowsocks je VMess technicky proxy, ne VPN, ale aplikace založené na V2Ray přes něj umí směrovat celé zařízení.

## Jak funguje?

Každý uživatel má UUID, které slouží jako jeho přihlašovací údaj. Podle [dokumentace protokolu](https://www.v2fly.org/en_US/developer/protocols/vmess.html) hlavička požadavku klienta obsahuje šifrované ověřovací ID sestavené z unixového časového razítka, náhodného čísla a kontrolního součtu, zašifrované klíčem odvozeným od ID uživatele. Server podle něj uživatele pozná a pak dešifruje zbytek hlavičky a data.

Dokumentace popisuje dva způsoby ochrany hlavičky. Moderní používá šifrování AEAD, které zaručuje, že hlavička nebyla změněna. Starší používal MD5 a AES-128-CFB a integritu hlavičky zaručit neuměl; dokumentace před ním varuje. Protože ověřovací ID obsahuje časové razítko, hodiny klienta a serveru musí být zhruba synchronní, což je častý zdroj potíží typu „prostě se to nepřipojí“.

## Jak těžké je VMess zablokovat?

Sám o sobě VMess vypadá jako náhodné bajty, a tím se dostává do stejné pozice jako [Shadowsocks](/vpn-protocols/shadowsocks): je vystavený firewallům, které blokují plně šifrovaný provoz. Proto se VMess obvykle nasazuje uvnitř WebSocket nebo gRPC přes TLS, za doménou a certifikátem, aby pozorovatel viděl něco, co vypadá jako běžné spojení HTTPS s webem.

Většinu práce se skrýváním provozu odvede tento obal a nese náklady: potřebujete doménu, certifikát a často CDN před serverem a server teď šifruje data dvakrát, jednou pro TLS a jednou pro VMess.

## VMess, VLESS, nebo Trojan?

[VLESS](/vpn-protocols/vless-reality) navrhli v projektu Xray jako lehčího nástupce: ponechává identitu založenou na UUID, ale opouští vlastní šifrování VMess a spoléhá se výhradně na vrstvu TLS, čímž se vyhne dvojitému šifrování. [Trojan](/vpn-protocols/trojan) volí podobný přístup, jen s heslem místo UUID. Podrobnosti jsou v našem srovnání [VLESS, VMess a Trojan](/blog/vless-vs-vmess-vs-trojan).

## Používá Doppler VMess?

Ne. Doppler používá VLESS s Reality. Proč, vysvětluje průvodce [proč VLESS](/vpn-protocols/why-vless).
