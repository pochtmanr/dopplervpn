> **Ve zkratce.** Shadowsocks je lehká šifrovaná proxy, která vznikla v Číně, aby prošla Velkým čínským firewallem. Roky fungovala tím, že nevypadala jako nic. Od roku 2021 výzkum ukazuje, že firewall blokuje právě takový provoz, protože skutečný provoz tak náhodný bývá málokdy.

## Co je Shadowsocks?

Shadowsocks je proxy protokol s otevřeným zdrojovým kódem, poprvé vydaný [v dubnu 2012](https://en.wikipedia.org/wiki/Shadowsocks). Přísně vzato to není VPN: je to proxy ve stylu SOCKS5 se šifrováním a aplikace samy rozhodují, který provoz přes něj pošlou. V praxi většina klientů Shadowsocks dnes nabízí režim pro celé zařízení, který se chová jako VPN.

Je oblíbená, protože je jednoduchá a rychlá. Aktuální verze používají [šifry AEAD](https://shadowsocks.org/doc/aead.html), které v jednom kroku zajišťují důvěrnost, integritu a autentičnost, a [vydání protokolu z roku 2022](https://shadowsocks.org/doc/sip022.html) zpřísnilo ochranu proti opakování.

## Jak funguje?

Klient a server sdílejí heslo, ze kterého se odvodí šifrovací klíč. Vše, co klient odešle, včetně adresy webu, který chce, je zašifrované od prvního bajtu. Není tu rozpoznatelné navázání spojení, certifikát ani hlavička v otevřeném textu. Pro pozorovatele je spojení Shadowsocks proud bajtů, které vypadají jako náhodné.

## Jak Velký čínský firewall rozpoznává Shadowsocks?

Nejprve aktivním sondováním. Výzkumníci z GFW Report [zaznamenali](https://gfw.report/publications/imc20/en/), jak firewall posílal desítky tisíc sond na podezřelé servery Shadowsocks, přehrával a měnil skutečná spojení a sledoval, jak server zareaguje.

Potom, od listopadu 2021, hrubší a širší metodou. [Studie z USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) zjistila, že firewall v reálném čase blokuje „plně šifrovaný“ provoz. Dívá se na první paket spojení a vynechá vše, co vypadá jako známý protokol nebo obsahuje dost tisknutelného textu. Jedno pravidlo měří průměrný počet nastavených bitů na bajt: hodnoty 3.4 a nižší, nebo 4.6 a vyšší, se vynechají a data mezi nimi, která vypadají náhodně, ne. Co zbude, lze zablokovat.

Výzkumníci také zjistili, že firewall to uplatňoval asi na 26% spojení a jen na rozsahy IP oblíbených datových center, pravděpodobně aby omezil vedlejší škody. Poučení pro autory protokolů bylo jasné: vypadat náhodně je samo o sobě otisk.

## Kdy použít Shadowsocks?

- **Lehké, rychlé proxy** v sítích, které provoz nezkoumají zblízka.
- **Vlastní server** s nástroji jako Outline, které nastavení zjednodušují.
- **Opatrně při silné filtraci.** V Číně a na dalších místech, která blokují plně šifrovaný provoz, je Shadowsocks mnohem méně spolehlivý než protokoly, které napodobují skutečné TLS, například [VLESS-Reality](/vpn-protocols/vless-reality). Náš text [historie protokolů proti cenzuře](/blog/censorship-protocol-history) sleduje, jak se obor posunul dál.

## Používá Doppler Shadowsocks?

Ne. Doppler používá VLESS-Reality, z důvodů v průvodci [proč VLESS](/vpn-protocols/why-vless).
