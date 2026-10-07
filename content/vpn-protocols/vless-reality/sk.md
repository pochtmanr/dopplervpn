> **Stručne.** VLESS je minimálny proxy protokol projektu Xray. Reality je vrstva TLS, vďaka ktorej spojenie VLESS vyzerá ako bežná návšteva skutočnej, obľúbenej stránky cez TLS 1.3, bez vlastnej domény či certifikátu. Spolu sú dnes najťažšou bežnou kombináciou na zablokovanie pre cenzorov. Táto stránka je súhrn; celý príbeh má náš [podrobný sprievodca](/how-it-works/vless-reality-tunnel).

## Čo je VLESS?

VLESS bol [navrhnutý v júli 2020](https://github.com/v2ray/v2ray-core/issues/2636) ako ľahší nástupca [VMess](/vpn-protocols/vmess). Jeho [špecifikácia](https://xtls.github.io/en/development/protocols/vless.html) je zámerne malá: verzia protokolu, 16-bajtové UUID, ktoré identifikuje používateľa, voliteľné pole doplnkov a príkaz, port a adresa cieľa. VLESS nemá vlastné šifrovanie. Spolieha sa na vrstvu TLS pod ním, takže prevádzka sa nešifruje dvakrát.

VLESS je súčasťou [Xray-core](https://github.com/XTLS/Xray-core), projektu, ktorý sa v novembri 2020 oddelil od V2Ray a dnes vedie vývoj tejto rodiny protokolov.

## Čo pridáva Reality?

Protokoly ako [Trojan](/vpn-protocols/trojan) sa skrývajú vnútri TLS k vlastnej doméne a tá doména sa stáva tým, čo cenzor môže zablokovať. [Reality](https://github.com/XTLS/REALITY), vydané v Xray-core [1.8.0 v marci 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), ju odstraňuje.

Server Reality predloží TLS handshake skutočnej stránky tretej strany. Pre pozorovateľa je spojenie bežná návšteva tejto stránky cez TLS 1.3. Klient, ktorý pozná kľúč servera, prejde do tunela VLESS; všetci ostatní, vrátane aktívnej sondy cenzora, sa odovzdajú skutočnej stránke a vidia jej pravý certifikát. Nie je doména ani certifikát Doppler, ktorý by sa dal dať na zoznam blokovania.

## Ako ťažko sa VLESS-Reality blokuje?

Je to najodolnejšia bežná možnosť, akú poznáme, ale nie je neviditeľná. Výskum zverejnený v roku 2024 ukázal, že [TLS prenášané vnútri TLS sa dá rozpoznať](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) podľa časovania a veľkostí paketov, a v novembri 2025 používatelia [hlásili](https://github.com/net4people/bbs/issues/546), že niektorí ruskí poskytovatelia prerušujú spojenia Reality. Poskytovatelia VPN na to odpovedajú ladením nastavení serverov a stránok, ktoré si požičiavajú, a hra na mačku a myš pokračuje.

## Aký je rýchly?

Pri bežnom používaní je réžia malá. Hlavička VLESS sa odošle raz na spojenie a tok XTLS Vision sa vyhne druhému šifrovaniu už zašifrovanej webovej prevádzky. Pretože beží cez TCP, VLESS-Reality môže byť v sieťach so stratami pomalší ako UDP protokoly ako [WireGuard](/vpn-protocols/wireguard), ale funguje ďalej tam, kde sú tie zablokované.

## Kde sa dozviem viac?

- [Tunel VLESS-Reality podrobne](/how-it-works/vless-reality-tunnel): história, mechanizmus, limity.
- [Čo je VLESS?](/blog/what-is-vless) a [formát URI VLESS](/blog/vless-uri-format) na našom blogu.
- [VLESS VPN](/vless-vpn): ako Doppler balí VLESS-Reality do aplikácií s pripojením jedným ťuknutím.
