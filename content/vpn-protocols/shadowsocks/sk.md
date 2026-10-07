> **Stručne.** Shadowsocks je ľahké šifrované proxy, ktoré vzniklo v Číne, aby prešlo cez Veľký čínsky firewall. Roky fungovalo vďaka tomu, že nevyzeralo ako nič. Od roku 2021 výskum ukazuje, že firewall blokuje práve takúto prevádzku, pretože skutočná prevádzka býva takto náhodná len zriedka.

## Čo je Shadowsocks?

Shadowsocks je proxy protokol s otvoreným kódom, prvýkrát vydaný [v apríli 2012](https://en.wikipedia.org/wiki/Shadowsocks). Presne vzaté to nie je VPN: je to proxy v štýle SOCKS5 so šifrovaním a aplikácie rozhodujú, ktorú prevádzku cezeň pošlú. V praxi väčšina klientov Shadowsocks dnes ponúka režim pre celé zariadenie, ktorý sa správa ako VPN.

Je obľúbený, pretože je jednoduchý a rýchly. Aktuálne verzie používajú [šifry AEAD](https://shadowsocks.org/doc/aead.html), ktoré v jednom kroku zabezpečia dôvernosť, integritu a autentickosť, a [vydanie protokolu z roku 2022](https://shadowsocks.org/doc/sip022.html) sprísnilo ochranu proti opakovaniu.

## Ako funguje?

Klient a server zdieľajú heslo, z ktorého vznikne šifrovací kľúč. Všetko, čo klient odošle, vrátane adresy stránky, ktorú chce, je zašifrované od úplne prvého bajtu. Nie je rozpoznateľný handshake, certifikát ani hlavička v otvorenom texte. Pre pozorovateľa je spojenie Shadowsocks prúd bajtov, ktoré vyzerajú ako náhodné.

## Ako Veľký čínsky firewall rozpozná Shadowsocks?

Najprv aktívnym sondovaním. Výskumníci z GFW Report [zaznamenali](https://gfw.report/publications/imc20/en/), ako firewall posielal desaťtisíce sond na podozrivé servery Shadowsocks, opakoval a menil skutočné spojenia, aby videl, ako server zareaguje.

Potom, od novembra 2021, hrubším a širším spôsobom. [Štúdia USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) zistila, že firewall v reálnom čase blokuje „úplne šifrovanú“ prevádzku. Pozerá sa na prvý paket spojenia a vynechá všetko, čo vyzerá ako známy protokol alebo obsahuje dosť tlačiteľného textu. Jedno pravidlo meria priemerný počet nastavených bitov na bajt: hodnoty 3.4 a nižšie alebo 4.6 a vyššie sa vynechajú a údaje medzi nimi, ktoré vyzerajú náhodne, nie. Čo zostane, sa dá zablokovať.

Výskumníci tiež zistili, že firewall to uplatňoval asi na 26 % spojení a len na rozsahy IP populárnych dátových centier, pravdepodobne aby obmedzil vedľajšie škody. Poučenie pre autorov protokolov bolo jasné: vyzerať náhodne je samo osebe odtlačok.

## Kedy použiť Shadowsocks?

- **Ľahké, rýchle proxy** v sieťach, ktoré prevádzku neskúmajú zblízka.
- **Vlastný server** s nástrojmi ako Outline, ktoré nastavenie zjednodušujú.
- **Opatrne pri silnom filtrovaní.** V Číne a na iných miestach, ktoré blokujú úplne šifrovanú prevádzku, je Shadowsocks oveľa menej spoľahlivý ako protokoly, ktoré napodobňujú skutočné TLS, napríklad [VLESS-Reality](/vpn-protocols/vless-reality). Naša [história protokolov na obchádzanie cenzúry](/blog/censorship-protocol-history) sleduje, ako sa táto oblasť posunula.

## Používa Doppler Shadowsocks?

Nie. Doppler používa VLESS-Reality, z dôvodov v sprievodcovi [prečo VLESS](/vpn-protocols/why-vless).
