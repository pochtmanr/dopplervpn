> **Stručne.** AmneziaWG je odvodená verzia WireGuardu, ktorá si ponecháva jeho rýchlosť a kryptografiu, ale mení tvary paketov a hlavičky, podľa ktorých sa WireGuard ľahko spozná. Je to silná voľba tam, kde je obyčajný WireGuard zablokovaný, s jednou výhradou: so zapnutým maskovaním sa už nedohovorí so štandardnými servermi WireGuardu.

## Čo je AmneziaWG?

AmneziaWG vyvíja tím za [Amnezia VPN](https://amnezia.org/), aplikáciou s otvoreným kódom na prevádzku vlastného VPN servera. [Implementácia v Go](https://github.com/amnezia-vpn/amneziawg-go) projektu vznikla v roku 2023. Berie [WireGuard](/vpn-protocols/wireguard), ktorý je rýchly a jednoduchý, ale má pevný, rozpoznateľný handshake, a pridáva vrstvu, ktorá ho maskuje.

## Čo mení?

[Dokumentácia AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) opisuje niekoľko mechanizmov, každý riadený konfiguračnými parametrami:

- **Dynamické hlavičky (H1–H4).** Štandardné pakety WireGuard začínajú pevným typom správy pre každý zo štyroch formátov paketov. AmneziaWG tieto hodnoty nahrádza číslami zvolenými z nastavených rozsahov, takže dve rôzne nastavenia nezdieľajú hlavičky a žiadne jedno pravidlo filtra ich nezachytí všetky.
- **Náhodná dĺžka paketov (S1–S4).** Vo WireGuarde má úvodný paket handshake vždy presne 148 bajtov. AmneziaWG pridáva k jednotlivým typom paketov náhodné predpony, takže veľkosti sa menia.
- **Balastné pakety (Jc, Jmin, Jmax).** Pred handshake klient odošle nastaviteľný počet pseudonáhodných paketov náhodnej dĺžky, ktoré rozmažú začiatok relácie v čase aj vo veľkosti.
- **Ochrana hlavičiek.** Novšie verzie vedia zašifrovať aj samotné pole typu správy.

Pod tým kryptografia aj celková stavba zostávajú od WireGuardu.

## Ako ťažko sa AmneziaWG blokuje?

Odstraňuje jednoduché signatúry, ktoré filtre používajú proti WireGuardu: pevné veľkosti a pevné hodnoty hlavičiek. Preto je v sieťach, ktoré blokujú VPN, oveľa odolnejší ako obyčajný WireGuard.

Stále však beží cez UDP, takže siete, ktoré UDP plošne priškrtia alebo zablokujú, ho zasiahnu, a jeho prevádzka nenapodobňuje žiadnu konkrétnu aplikáciu tak, ako [VLESS-Reality](/vpn-protocols/vless-reality) napodobňuje návštevu skutočnej stránky cez TLS. Filter, ktorý zablokuje každý nerozpoznaný UDP, ho stále môže chytiť.

## Kedy použiť AmneziaWG?

- **Tam, kde je WireGuard zablokovaný**, ale UDP ešte funguje a chcete rýchlosť podobnú WireGuardu.
- **Vlastné servery**, nastavené aplikáciou Amnezia VPN.
- Majte po ruke možnosť na TCP, napríklad VLESS-Reality, pre siete, ktoré filtrujú UDP. Náš [sprievodca pre Rusko](/vpn-for-russia) opisuje, čo tadiaľ teraz prechádza.

## Používa Doppler AmneziaWG?

Nie. Doppler používa VLESS-Reality. Pozrite [prečo VLESS](/vpn-protocols/why-vless).
