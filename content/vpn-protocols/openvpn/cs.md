> **Ve zkratce.** OpenVPN je veterán VPN s otevřeným zdrojovým kódem: pružný, široce podporovaný a po více než dvou desetiletích dobře prozkoumaný. Je také pomalejší než novější protokoly a podle publikovaného výzkumu jeden z nejsnazších na rozpoznání podle otisku na straně poskytovatele.

## Co je OpenVPN?

OpenVPN je bezplatný VPN software s otevřeným zdrojovým kódem, který James Yonan poprvé vydal [v květnu 2001](https://en.wikipedia.org/wiki/OpenVPN). Po většinu nultých a desátých let byl výchozí volbou komerčních VPN služeb a firemního vzdáleného přístupu a dodnes je v mnoha routerech a firemních produktech.

Běží v uživatelském prostoru, ne v jádře operačního systému, a při výměně klíčů se opírá o knihovnu OpenSSL a protokol TLS. Port přidělený IANA je 1194, OpenVPN ale může běžet po UDP nebo TCP téměř na libovolném portu.

## Jak funguje?

OpenVPN používá vlastní protokol se dvěma částmi. Řídicí kanál používá TLS k ověření obou stran, obvykle certifikáty, a k dohodě na klíčích. Datový kanál pak nese váš provoz, zašifrovaný těmito klíči, uvnitř paketů UDP nebo TCP.

Tato stavba dělá OpenVPN velmi nastavitelným. Lze volit šifry, metody ověření, porty a transporty a pouštět ho přes proxy. Cenou této pružnosti je složitost: více kódu, více nastavení a více způsobů, jak skončit se slabou konfigurací.

## Proč se OpenVPN blokuje?

TLS uvnitř OpenVPN není totéž co návštěva webu přes HTTPS. OpenVPN balí své navázání spojení TLS do vlastního rámování paketů, takže jeho provoz má tvar, který běžný webový provoz nemá.

Výzkumníci změřili, jak moc na tom záleží. Tým z Michiganské univerzity a dalších pracovišť [sestavil systém rozpoznávání podle otisku](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) a spustil ho uvnitř poskytovatele s přibližně milionem uživatelů. Rozpoznal **více než 85% toků OpenVPN** s velmi malým počtem falešných poplachů a zachytil i většinu komerčních „maskovaných“ konfigurací OpenVPN, které testovali.

Skutečná filtrace jde ve stopách výzkumu. V srpnu 2023 uživatelé v Rusku [hlásili](https://github.com/net4people/bbs/issues/274), že mobilní operátoři přerušují spojení OpenVPN krátce po jejich začátku.

## Kdy použít OpenVPN?

- **Kompatibilita.** Starší routery, firemní brány a některé firemní sítě podporují OpenVPN a nic novějšího.
- **Sítě jen s TCP.** OpenVPN může běžet po TCP, když je UDP blokované, což [WireGuard](/vpn-protocols/wireguard) bez pomoci neumí.
- **Ne ve filtrovaných sítích.** Tam, kde se VPN blokují, OpenVPN obvykle selže brzy. Lepším nástrojem je protokol, který napodobuje běžný webový provoz, například [VLESS-Reality](/vpn-protocols/vless-reality). Náš [průvodce cenzurou](/bypass-censorship) vysvětluje, jak filtrační systémy rozhodují, co přerušit.

## Používá Doppler OpenVPN?

Ne. Doppler používá VLESS-Reality na každé platformě. Jak jsme ho zvolili, vysvětluje průvodce [proč VLESS](/vpn-protocols/why-vless).
