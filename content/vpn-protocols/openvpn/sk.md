> **Stručne.** OpenVPN je veterán VPN s otvoreným kódom: pružný, široko podporovaný a po viac ako dvoch desaťročiach dobre preskúmaný. Je aj pomalší ako novšie protokoly a podľa zverejneného výskumu jeden z tých, ktoré poskytovateľ internetu najľahšie spozná podľa odtlačku.

## Čo je OpenVPN?

OpenVPN je bezplatný VPN softvér s otvoreným kódom, ktorý James Yonan prvýkrát vydal [v máji 2001](https://en.wikipedia.org/wiki/OpenVPN). Po väčšinu rokov 2000 a 2010 to bola predvolená voľba komerčných VPN služieb a firemného vzdialeného prístupu a dodnes je súčasťou mnohých smerovačov a podnikových produktov.

Beží v používateľskom priestore, nie v jadre operačného systému, a pri výmene kľúčov sa opiera o knižnicu OpenSSL a protokol TLS. Port pridelený IANA je 1194, hoci OpenVPN môže bežať cez UDP alebo TCP takmer na ľubovoľnom porte.

## Ako funguje?

OpenVPN používa vlastný protokol z dvoch častí. Riadiaci kanál používa TLS na overenie oboch strán, zvyčajne certifikátmi, a na dohodnutie kľúčov. Dátový kanál potom prenáša vašu prevádzku zašifrovanú týmito kľúčmi, vnútri paketov UDP alebo TCP.

Táto stavba robí OpenVPN veľmi nastaviteľným. Dajú sa zvoliť šifry, spôsoby overenia, porty a prenosy a dá sa pustiť cez proxy. Cenou tejto pružnosti je zložitosť: viac kódu, viac nastavení a viac spôsobov, ako skončiť pri slabej konfigurácii.

## Prečo sa OpenVPN blokuje?

TLS vo vnútri OpenVPN nie je to isté ako návšteva webovej stránky cez HTTPS. OpenVPN balí svoj TLS handshake do vlastného rámcovania paketov, takže jeho prevádzka má tvar, ktorý bežná webová prevádzka nemá.

Výskumníci zmerali, ako veľmi na tom záleží. Tím z Michiganskej univerzity a ďalší [zostavili systém na rozpoznávanie odtlačkov](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) a spustili ho u poskytovateľa s približne miliónom používateľov. Rozpoznal **viac ako 85 % tokov OpenVPN** s veľmi malým počtom falošných pozitív a zachytil aj väčšinu komerčných „maskovaných“ nastavení OpenVPN, ktoré testovali.

Skutočné filtrovanie ide za výskumom. V auguste 2023 používatelia v Rusku [hlásili](https://github.com/net4people/bbs/issues/274), že mobilní operátori prerušovali spojenia OpenVPN krátko po ich začatí.

## Kedy použiť OpenVPN?

- **Kompatibilita.** Staršie smerovače, podnikové brány a niektoré firemné siete podporujú OpenVPN a nič novšie.
- **Siete len s TCP.** OpenVPN vie bežať cez TCP, keď je UDP zablokované, čo [WireGuard](/vpn-protocols/wireguard) bez pomoci nedokáže.
- **Nie vo filtrovaných sieťach.** Tam, kde sa VPN blokujú, OpenVPN zvyčajne zlyhá skoro. Lepší nástroj je protokol, ktorý napodobňuje bežnú webovú prevádzku, napríklad [VLESS-Reality](/vpn-protocols/vless-reality). Náš [sprievodca cenzúrou](/bypass-censorship) vysvetľuje, ako filtrovacie systémy rozhodujú, čo prerušiť.

## Používa Doppler OpenVPN?

Nie. Doppler používa VLESS-Reality na každej platforme. Sprievodca [prečo VLESS](/vpn-protocols/why-vless) vysvetľuje, ako sme ho zvolili.
